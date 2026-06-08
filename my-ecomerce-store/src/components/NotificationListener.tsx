"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useAuthSelector } from "@/store/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addNotification,
  setNotifications,
} from "@/store/slices/notificationSlice";
import { toast } from "react-toastify";

const loadFromLocalStorage = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("notifications");
  return stored ? JSON.parse(stored) : [];
};

const saveToLocalStorage = (notifications: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "notifications",
    JSON.stringify(notifications.slice(0, 50)),
  );
};

export default function NotificationListener() {
  const { isAuthenticated } = useAuthSelector();
  const { isConnected, on, off } = useSocket();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage();
    if (stored.length > 0) {
      dispatch(setNotifications(stored));
    }
  }, [dispatch]);

  // Save to localStorage whenever Redux notifications change
  useEffect(() => {
    saveToLocalStorage(notifications);
  }, [notifications]);

  // Socket event handler – only when socket is connected and user authenticated
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const handler = (data: any) => {
      console.log("🔔 New order notification received:", data); // 👈 important log

      if (data.type === "success") toast.success(data.message);
      else if (data.type === "error") toast.error(data.message);
      else toast.info(data.message);

      dispatch(
        addNotification({
          title: data.title || "Notification",
          message: data.message,
          type: data.type,
          orderId: data.orderId,
          // 👇 Add dbId if it's from offline fetch (already handled in AdminNotificationFetcher)
        }),
      );
    };

    on("order-status", handler);
    return () => off("order-status", handler);
  }, [isAuthenticated, isConnected, on, off, dispatch]);

  return null;
}
