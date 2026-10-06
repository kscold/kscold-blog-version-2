import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { appendLog, lineReader, toManifest, toPublicSession } from './format.mjs';
import { createSessionId, isSessionId } from './ids.mjs';
import {
  collectFailureScreenshot,
  listScreenshots,
  listSessionIds,
  pruneSessions,
  readManifest,
  removeSession,
  screenshotDir,
  sessionDir,
  writeManifest,
} from './store.mjs';

const KILL_GRACE_MS = 5_000;

/** 요청을 받아들일 수 없는 이유를 HTTP 상태와 함께 전한다. */
export class SessionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * 테스트 실행 한 번을 세션으로 관리한다. 한 번에 하나만 돌리고, 끝난 결과는 폴더에 남겨 다시 보여준다.
 * 프로세스 실행과 보관소는 주입받아 테스트에서 바꿔 끼운다.
 */
export class SessionManager {
  #current = null;

  constructor({ config, suites, spawnProcess, buildRun, mirror, now = () => new Date() }) {
    Object.assign(this, { config, suites, spawnProcess, buildRun, mirror, now });
    this.root = config.artifactRoot;
  }

  async start(suiteId) {
    const suite = this.suites[suiteId];
    if (!suite) throw new SessionError(400, '알 수 없는 테스트 묶음입니다.');
    if (this.#current?.status === 'running') {
      throw new SessionError(409, '이미 실행 중인 테스트가 있습니다.');
    }
    const startedAt = this.now();
    const session = {
      id: createSessionId(suite.id, startedAt.getTime()),
      suiteId: suite.id,
      suiteLabel: suite.label,
      status: 'running',
      startedAt: startedAt.toISOString(),
      endedAt: null,
      exitCode: null,
      logs: [],
      child: null,
    };
    // 폴더를 만드는 동안 들어온 다른 시작 요청이 끼어들지 못하게, 기다리기 전에 먼저 자리를 잡는다.
    this.#current = session;
    this.#log(session, `실행 시작 · ${suite.label} (${this.config.baseUrl})`);
    try {
      await fs.mkdir(screenshotDir(this.root, session.id), { recursive: true });
      this.#launch(session, suite);
    } catch (error) {
      await this.#finish(session, 1, `테스트를 시작하지 못했습니다: ${error.message}`);
      return;
    }
    await this.#persist(session);
  }

  stop() {
    const session = this.#current;
    if (session?.status !== 'running' || !session.child) return false;
    this.#terminate(session, '관리자가 실행을 중지했습니다.');
    return true;
  }

  async remove(sessionId) {
    if (!isSessionId(sessionId)) throw new SessionError(400, '세션 ID가 올바르지 않습니다.');
    if (this.#current?.id === sessionId && this.#current.status === 'running') {
      throw new SessionError(409, '실행 중인 QA 세션은 먼저 중지해야 합니다.');
    }
    try {
      await this.mirror.remove(sessionId);
    } catch {
      throw new SessionError(
        502,
        'MinIO에 보관된 결과를 지우지 못했습니다. 잠시 뒤 다시 시도해 주세요.'
      );
    }
    await removeSession(this.root, sessionId);
    if (this.#current?.id === sessionId) this.#current = null;
  }

  /** 화면에 보여줄 최근 세션. 실행 중이면 지금까지의 로그와 스크린샷을 그대로 담는다. */
  async snapshot() {
    const session = this.#current ?? (await this.#latestStored());
    return session ? toPublicSession(session, await listScreenshots(this.root, session.id)) : null;
  }

  /** 러너가 내려갈 때 돌고 있던 테스트를 함께 정리한다. */
  shutdown() {
    this.#current?.child?.kill('SIGTERM');
  }

  #log(session, text) {
    appendLog(session.logs, text, this.now());
  }

  async #persist(session) {
    const names = await listScreenshots(this.root, session.id);
    await writeManifest(this.root, toManifest(session, names, this.now().toISOString()));
  }

  #launch(session, suite) {
    const sessionRoot = sessionDir(this.root, session.id);
    const run = this.buildRun({ config: this.config, suite, sessionRoot });
    const child = this.spawnProcess(run.command, run.args, run.options);
    session.child = child;
    session.timeout = setTimeout(
      () => this.#terminate(session, '제한 시간을 넘겨 실행을 중단했습니다.'),
      this.config.runTimeoutMs
    );
    child.stdout.on(
      'data',
      lineReader(line => this.#log(session, line))
    );
    child.stderr.on(
      'data',
      lineReader(line => this.#log(session, line))
    );
    child.once('error', error => {
      void this.#finish(session, 1, `테스트를 시작하지 못했습니다: ${error.message}`);
    });
    child.once('close', code => void this.#finish(session, code ?? 1));
  }

  #terminate(session, reason) {
    if (!session.child || session.terminating) return;
    session.terminating = true;
    this.#log(session, reason);
    session.child.kill('SIGTERM');
    session.killTimer = setTimeout(() => session.child?.kill('SIGKILL'), KILL_GRACE_MS);
    session.killTimer.unref?.();
  }

  async #finish(session, exitCode, note) {
    if (session.finished) return;
    session.finished = true;
    clearTimeout(session.timeout);
    clearTimeout(session.killTimer);
    session.child = null;
    if (note) this.#log(session, note);
    const outputDir = join(sessionDir(this.root, session.id), 'playwright-output');
    const captured = await collectFailureScreenshot(this.root, session.id, outputDir).catch(
      () => false
    );
    if (captured) this.#log(session, '실패한 순간의 화면을 스크린샷으로 남겼습니다.');

    session.exitCode = exitCode;
    session.endedAt = this.now().toISOString();
    session.status = exitCode === 0 ? 'completed' : 'failed';
    this.#log(
      session,
      exitCode === 0 ? '실행 완료 · 통과' : `실행 종료 · 실패 (종료 코드 ${exitCode})`
    );
    await this.#archive(session);
  }

  /** 결과를 폴더에 적고, 보관소가 켜져 있으면 한 벌 올린다. 보관에 실패해도 실행 결과는 그대로 남긴다. */
  async #archive(session) {
    try {
      await this.#persist(session);
      if (this.mirror.enabled) await this.#mirrorSession(session);
      await pruneSessions(this.root, this.config.keepSessions);
    } catch (error) {
      this.#log(session, `결과 보관 중 문제가 생겼습니다: ${error.message}`);
      await this.#persist(session).catch(() => {});
    }
  }

  async #mirrorSession(session) {
    const names = await listScreenshots(this.root, session.id);
    const screenshots = names.map(name => ({
      relativePath: `screenshots/${name}`,
      path: join(screenshotDir(this.root, session.id), name),
    }));
    await this.mirror.upload(session.id, screenshots);
    this.#log(session, `스크린샷 ${names.length}장을 MinIO에 보관했습니다.`);
    // 보관 완료 기록까지 담긴 최종본을 올리려고, 기록을 다시 쓴 뒤에 올린다.
    await this.#persist(session);
    const manifestPath = join(sessionDir(this.root, session.id), 'manifest.json');
    await this.mirror.upload(session.id, [{ relativePath: 'manifest.json', path: manifestPath }]);
  }

  /** 러너가 실행 도중 꺼졌다 켜지면 끝나지 않은 기록이 남는다. 계속 도는 것처럼 보이지 않게 중단으로 닫는다. */
  async #closeInterrupted(manifest) {
    const logs = [...manifest.logs];
    appendLog(logs, '러너가 다시 시작되어 실행이 중단되었습니다.', this.now());
    const closed = {
      ...manifest,
      status: 'failed',
      endedAt: manifest.storedAt ?? this.now().toISOString(),
      exitCode: manifest.exitCode ?? 1,
      logs,
    };
    await writeManifest(this.root, closed);
    return closed;
  }

  async #latestStored() {
    for (const sessionId of await listSessionIds(this.root)) {
      const manifest = await readManifest(this.root, sessionId);
      if (manifest)
        return manifest.status === 'running' ? this.#closeInterrupted(manifest) : manifest;
    }
    return null;
  }
}
