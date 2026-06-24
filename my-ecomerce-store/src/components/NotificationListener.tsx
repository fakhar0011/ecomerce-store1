"use client";

import { useEffect } from "react";
import { useSubscription } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuthSelector } from "@/store/hooks";
import {
  addNotification,
  setNotifications,
} from "@/store/slices/notificationSlice";
import { toast } from "react-toastify";

/* ---------------- GraphQL Subscription ---------------- */
const ORDER_NOTIFICATION_SUB = gql`
  subscription {
    orderNotification {
      title
      message
      type
      orderId
    }
  }
`;

/* ---------------- TypeScript Types ---------------- */
type OrderNotificationData = {
  orderNotification: {
    title: string;
    message: string;
    type: "error" | "success" | "info";
    orderId: string;
  };
};

/* ---------------- LocalStorage Helpers ---------------- */
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

/* ---------------- Component ---------------- */
export default function NotificationListener() {
  const { isAuthenticated } = useAuthSelector();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  /* Load saved notifications once */
  useEffect(() => {
    const stored = loadFromLocalStorage();
    if (stored.length > 0) {
      dispatch(setNotifications(stored));
    }
  }, [dispatch]);

  /* Save to localStorage whenever Redux updates */
  useEffect(() => {
    saveToLocalStorage(notifications);
  }, [notifications]);

  /* Apollo Subscription */
  const { data } = useSubscription<OrderNotificationData>(
    ORDER_NOTIFICATION_SUB,
    {
      skip: !isAuthenticated,
    },
  );

  /* Handle incoming notifications */
  useEffect(() => {
    if (data?.orderNotification) {
      // Destructure and assert type
      const { title, message, type, orderId } = data.orderNotification;

      console.log("🔔 New order notification:", data);

      // ✅ Cast type to the union expected by addNotification
      const notificationType = type as "error" | "success" | "info";

      if (type === "success") toast.success(message);
      else if (type === "error") toast.error(message);
      else toast.info(message);

      dispatch(
        addNotification({
          title: title || "Notification",
          message,
          type: notificationType, // ✅ now matches the expected union
          orderId,
        }),
      );
    }
  }, [data, dispatch]);

  return null;
}
