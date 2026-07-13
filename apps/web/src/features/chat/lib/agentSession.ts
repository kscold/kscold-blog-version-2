export const AGENT_SESSION_STORAGE_KEY = 'kscold-agent-chat-session-id';

export const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getOrCreateAgentSessionId = () => {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  const savedSessionId = window.localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
  if (savedSessionId) {
    return savedSessionId;
  }

  const nextSessionId = createSessionId();
  window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
};
