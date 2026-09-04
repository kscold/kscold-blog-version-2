export const AGENT_SESSION_STORAGE_KEY = 'kscold-agent-chat-session-id';
export const AGENT_SESSION_ID_MAX_LENGTH = 80;

export const isValidAgentSessionId = (
  value: string | null | undefined
): value is string => Boolean(value && value.length <= AGENT_SESSION_ID_MAX_LENGTH);

export const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const resetAgentSessionId = () => {
  const nextSessionId = createSessionId();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, nextSessionId);
  }
  return nextSessionId;
};

export const getOrCreateAgentSessionId = () => {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  const savedSessionId = window.localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
  if (isValidAgentSessionId(savedSessionId)) {
    return savedSessionId;
  }

  return resetAgentSessionId();
};
