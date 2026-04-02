export type ViewerRole = 'ADMIN' | 'USER' | null;

export interface InitialViewer {
  isAuthenticated: boolean;
  role: ViewerRole;
}

export const ANONYMOUS_VIEWER: InitialViewer = {
  isAuthenticated: false,
  role: null,
};

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');

    return Buffer.from(normalized, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const headerText = decodeBase64Url(parts[0]);
  const payloadText = decodeBase64Url(parts[1]);
  if (!headerText || !payloadText) return null;

  try {
    return {
      header: JSON.parse(headerText),
      payload: JSON.parse(payloadText),
    };
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now();
}

export function resolveInitialViewer(token?: string | null): InitialViewer {
  if (!token) return ANONYMOUS_VIEWER;

  const parsed = parseJwt(token);
  if (!parsed) return ANONYMOUS_VIEWER;

  const { header, payload } = parsed;
  const role = payload.role;

  if (
    header.alg !== 'HS256' ||
    payload.type !== 'access' ||
    isExpired(payload) ||
    (role !== 'ADMIN' && role !== 'USER')
  ) {
    return ANONYMOUS_VIEWER;
  }

  return {
    isAuthenticated: true,
    role,
  };
}
