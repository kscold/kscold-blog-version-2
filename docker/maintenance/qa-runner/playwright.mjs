import { createRequire } from 'node:module';
import { join } from 'node:path';

// 단계별 진행을 한 줄씩 내보내는 전용 리포터. 프로젝트 폴더 기준 경로다.
const REPORTER = 'e2e/support/qaRunReporter.ts';
// 테스트 프로세스에는 실행에 필요한 값만 넘긴다. 러너가 가진 보관소 접속 정보는 물려주지 않는다.
const INHERITED = ['HOME', 'PATH', 'TMPDIR', 'USER', 'LOGNAME', 'LANG', 'PLAYWRIGHT_BROWSERS_PATH'];

/** 프로젝트 폴더에서 보이는 Playwright 실행 파일을 Node의 모듈 탐색 규칙으로 찾는다. */
export function resolvePlaywrightCli(webDir) {
  return createRequire(join(webDir, 'package.json')).resolve('@playwright/test/cli');
}

/**
 * 한 번의 실행에 쓸 명령을 만든다.
 * 예약 작업 환경에는 PATH가 거의 비어 있어, 셸이나 패키지 매니저를 거치지 않고 node로 실행 파일을 직접 띄운다.
 */
export function buildRun({
  config,
  suite,
  sessionRoot,
  env = process.env,
  resolveCli = resolvePlaywrightCli,
}) {
  const inherited = Object.fromEntries(
    INHERITED.filter(name => env[name]).map(name => [name, env[name]])
  );
  return {
    command: process.execPath,
    args: [
      resolveCli(config.webDir),
      'test',
      suite.spec,
      `--reporter=${join(config.webDir, REPORTER)}`,
      '--retries=0',
      '--workers=1',
      `--output=${join(sessionRoot, 'playwright-output')}`,
    ],
    options: {
      cwd: config.webDir,
      env: {
        ...inherited,
        PLAYWRIGHT_BASE_URL: config.baseUrl,
        QA_SCREENSHOT_DIR: join(sessionRoot, 'screenshots'),
        FORCE_COLOR: '0',
      },
    },
  };
}
