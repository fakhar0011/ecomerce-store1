import { NotificationItem } from "@/store/slices/notificationSlice";

const STORAGE_KEY = "notifications";

export const loadNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveNotifications = (notifications: NotificationItem[]) => {
  if (typeof window === "undefined") return;
  // Keep only last 50 for storage efficiency
  const toStore = notifications.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
};
