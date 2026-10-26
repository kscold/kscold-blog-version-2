export const AGENT_SESSION_STORAGE_KEY = 'kscold-agent-chat-session-id';
export const AGENT_SESSION_ID_MAX_LENGTH = 80;
let memorySessionId: string | undefined;

export const isValidAgentSessionId = (
  value: string | null | undefined
): value is string => typeof value === 'string' &&
  value.length <= AGENT_SESSION_ID_MAX_LENGTH && /^[A-Za-z0-9._:-]+$/.test(value);

export const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const rememberAgentSessionId = (sessionId: string) => {
  if (!isValidAgentSessionId(sessionId)) return;
  if (typeof window !== 'undefined') {
    memorySessionId = sessionId;
    try {
      window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, sessionId);
    } catch {
      // 저장소가 차단되어도 현재 탭에서는 같은 대화를 이어간다.
    }
  }
};

export const resetAgentSessionId = () => {
  const nextSessionId = createSessionId();
  rememberAgentSessionId(nextSessionId);
  return nextSessionId;
};

export const getOrCreateAgentSessionId = () => {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  if (isValidAgentSessionId(memorySessionId)) return memorySessionId;
  try {
    const savedSessionId = window.localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
    if (isValidAgentSessionId(savedSessionId)) {
      memorySessionId = savedSessionId;
      return savedSessionId;
    }
  } catch {
    // 브라우저의 저장소 설정은 대화 전송을 막지 않는다.
  }

  return resetAgentSessionId();
};
