import { createHash } from 'node:crypto';

const CACHE_MS = 30_000;
const CACHE_LIMIT = 50;
const TIMEOUT_MS = 5_000;

const digest = token => createHash('sha256').update(token).digest('hex');

function bearerToken(header) {
  return /^Bearer\s+(\S+)$/i.exec(header || '')?.[1] ?? null;
}

const denied = (status, message) => ({ ok: false, status, message });

/**
 * 요청에 실린 토큰이 실제 관리자 것인지 블로그 백엔드에 물어 확인한다.
 * 화면 서버는 토큰의 모양만 보고 넘기므로, 서명까지 검증하는 백엔드의 답을 받은 요청만 통과시킨다.
 * 상태 조회가 몇 초마다 들어와, 통과한 토큰은 잠깐 기억해 매번 묻지 않는다.
 */
export function createAdminVerifier({ authUrl, fetcher = fetch, now = Date.now }) {
  const verifiedUntil = new Map();

  async function ask(token) {
    let response;
    try {
      response = await fetcher(authUrl, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return denied(503, '관리자 확인 서버에 연결하지 못했습니다.');
    }
    if (response.status === 401 || response.status === 403) {
      return denied(401, '관리자 로그인이 만료되었습니다. 다시 로그인해 주세요.');
    }
    if (!response.ok) return denied(503, '관리자 확인 서버가 정상 응답하지 않았습니다.');
    const body = await response.json().catch(() => null);
    return body?.data?.role === 'ADMIN'
      ? { ok: true }
      : denied(403, '관리자만 사용할 수 있습니다.');
  }

  return async function verifyAdmin(authorizationHeader) {
    const token = bearerToken(authorizationHeader);
    if (!token) return denied(401, '관리자 로그인이 필요합니다.');
    const key = digest(token);
    if ((verifiedUntil.get(key) ?? 0) > now()) return { ok: true };
    const result = await ask(token);
    if (result.ok) {
      if (verifiedUntil.size >= CACHE_LIMIT) verifiedUntil.clear();
      verifiedUntil.set(key, now() + CACHE_MS);
    }
    return result;
  };
}
