import { createSign } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// 서비스 계정 키와 GA4 속성 번호를 두는 곳. Git에서 제외되고 배포 파일에만 들어간다.
// next.config의 outputFileTracingIncludes로 standalone 빌드에도 함께 복사된다.
export const SEARCH_INSIGHTS_DIR = path.resolve(
  process.cwd(),
  process.env.SEARCH_INSIGHTS_DIR || 'private/search-insights'
);

// seo-watch가 매일 남기는 색인 현황. 배포 때 지워지지 않도록 앱 폴더 밖(/app/frontend/data)에 둔다.
export const SEARCH_INSIGHTS_STATE_DIR = path.resolve(
  process.cwd(),
  process.env.SEARCH_INSIGHTS_STATE_DIR || '../../data/search-insights'
);

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

export interface GoogleClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, body: unknown): Promise<T>;
}

export async function readJsonFile<T>(
  name: string,
  directory = SEARCH_INSIGHTS_DIR
): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(directory, name), 'utf8')) as T;
  } catch {
    return null;
  }
}

/** 서비스 계정 키로 서명한 JWT를 액세스 토큰으로 바꾼다. 외부 라이브러리 없이 RS256으로 직접 서명한다. */
async function createAccessToken(account: ServiceAccount) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const issuedAt = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: account.client_email,
    scope: SCOPES.join(' '),
    aud: account.token_uri,
    iat: issuedAt,
    exp: issuedAt + 3600,
  })}`;
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(account.private_key)
    .toString('base64url');
  const response = await fetch(account.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`구글 토큰 발급 실패 (HTTP ${response.status})`);
  return ((await response.json()) as { access_token: string }).access_token;
}

/** 키가 없으면(로컬·CI) null. 관리자 확인 뒤에만 부른다. */
export async function createGoogleClient(): Promise<GoogleClient | null> {
  const account = await readJsonFile<ServiceAccount>('service-account.json');
  if (!account) return null;
  const token = await createAccessToken(account);
  const call = async <T>(url: string, init: RequestInit = {}) => {
    const response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
    return (await response.json()) as T;
  };
  return {
    get: url => call(url),
    post: (url, body) => call(url, { method: 'POST', body: JSON.stringify(body) }),
  };
}
