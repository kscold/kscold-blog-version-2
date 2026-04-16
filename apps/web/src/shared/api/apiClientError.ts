import axios from 'axios';

export interface ApiClientError extends Error {
  status?: number;
  errorCode?: string;
  cause?: unknown;
}

export function toApiClientError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('요청을 처리하는 중 오류가 발생했습니다.');
  }

  const payload = error.response?.data as { message?: string; errorCode?: string } | undefined;
  const message =
    payload?.message
    || (error.response?.status === 405 ? '지원하지 않는 요청 방식입니다.' : undefined)
    || error.message
    || '요청을 처리하는 중 오류가 발생했습니다.';

  const normalizedError = new Error(message) as ApiClientError;
  normalizedError.name = 'ApiClientError';
  normalizedError.status = error.response?.status;
  normalizedError.errorCode = payload?.errorCode;
  normalizedError.cause = error;

  return normalizedError;
}
