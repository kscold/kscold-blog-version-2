type ClearListener = () => void;

const clearListeners = new Set<ClearListener>();

interface SubscribeOptions {
  onSessionCleared?: ClearListener;
}

export function subscribeAuthSessionBridge(options: SubscribeOptions) {
  const { onSessionCleared } = options;

  if (onSessionCleared) {
    clearListeners.add(onSessionCleared);
  }

  return () => {
    if (onSessionCleared) {
      clearListeners.delete(onSessionCleared);
    }
  };
}

export function notifyAuthSessionCleared() {
  clearListeners.forEach(listener => listener());
}
