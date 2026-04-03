type TokenListener = (token: string | null) => void;
type ClearListener = () => void;

const tokenListeners = new Set<TokenListener>();
const clearListeners = new Set<ClearListener>();

interface SubscribeOptions {
  onTokenChange?: TokenListener;
  onSessionCleared?: ClearListener;
}

export function subscribeAuthSessionBridge(options: SubscribeOptions) {
  const { onTokenChange, onSessionCleared } = options;

  if (onTokenChange) {
    tokenListeners.add(onTokenChange);
  }

  if (onSessionCleared) {
    clearListeners.add(onSessionCleared);
  }

  return () => {
    if (onTokenChange) {
      tokenListeners.delete(onTokenChange);
    }

    if (onSessionCleared) {
      clearListeners.delete(onSessionCleared);
    }
  };
}

export function notifyAuthTokenChanged(token: string | null) {
  tokenListeners.forEach(listener => listener(token));
}

export function notifyAuthSessionCleared() {
  clearListeners.forEach(listener => listener());
}
