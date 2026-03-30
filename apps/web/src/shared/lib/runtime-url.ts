const LOCAL_API_URL = 'http://localhost:8081/api';
const LOCAL_WS_URL = 'ws://localhost:8081/ws/chat';

export function resolveApiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || LOCAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`;
}

export function resolveChatWsUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_WS_URL || LOCAL_WS_URL;
  }
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/chat`;
}
