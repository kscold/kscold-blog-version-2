import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertState {
  alerts: AlertItem[];
  showAlert: (type: AlertType, message: string) => void;
  dismissAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(set => ({
  alerts: [],
  showAlert: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set(state => ({ alerts: [...state.alerts, { id, type, message }] }));
    setTimeout(() => {
      set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
    }, 3500);
  },
  dismissAlert: id =>
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
}));

export function useAlert() {
  const { showAlert } = useAlertStore();
  return {
    success: (message: string) => showAlert('success', message),
    error: (message: string) => showAlert('error', message),
    warning: (message: string) => showAlert('warning', message),
    info: (message: string) => showAlert('info', message),
  };
}
