import { create } from 'zustand';
import type { Notification } from '@/types/factor';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  sendLoading: boolean;
  fetchNotifications: () => Promise<void>;
  sendNotification: (data: {
    factorId: string;
    factorName: string;
    researcher: string;
    researcherEmail: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
  }) => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  loading: false,
  sendLoading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/notifications');
      const data: Notification[] = await res.json();
      set({ notifications: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  sendNotification: async (data) => {
    set({ sendLoading: true });
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Refresh list
        const listRes = await fetch('/api/notifications');
        const list: Notification[] = await listRes.json();
        set({ notifications: list, sendLoading: false });
        return true;
      }
      set({ sendLoading: false });
      return false;
    } catch {
      set({ sendLoading: false });
      return false;
    }
  },
}));
