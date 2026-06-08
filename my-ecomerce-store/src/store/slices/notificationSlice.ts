// store/slices/notificationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  read: boolean;
  createdAt: string;
  orderId?: string;
  dbId?: string;
}

interface NotificationState {
  items: NotificationItem[];
}

const initialState: NotificationState = { items: [] };

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.items = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<NotificationItem, "id" | "createdAt" | "read">
      >,
    ) => {
      const { orderId, dbId } = action.payload;
      const alreadyExists = state.items.some(
        (n) => (orderId && n.orderId === orderId) || (dbId && n.dbId === dbId),
      );
      if (alreadyExists) return;

      const newNotif: NotificationItem = {
        id: generateUniqueId(),
        read: false,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.items.unshift(newNotif);
      if (state.items.length > 50) state.items.pop();
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => (n.read = true));
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
