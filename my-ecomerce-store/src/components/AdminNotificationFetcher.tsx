"use client";

import { useEffect } from "react";
import { useAuthSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { useQuery } from "@apollo/client/react";
import {
  GET_ADMIN_NOTIFICATIONS,
  AdminNotificationsResponse,
} from "@/graphql/queries";

export default function AdminNotificationFetcher() {
  const { isAdmin, isAuthenticated } = useAuthSelector();
  const dispatch = useAppDispatch();

  // Query admin notifications – only when admin is logged in
  const { data, error, startPolling, stopPolling } =
    useQuery<AdminNotificationsResponse>(GET_ADMIN_NOTIFICATIONS, {
      skip: !isAuthenticated || !isAdmin,
      fetchPolicy: "network-only", // always fetch fresh from server
    });

  // Poll every 30 seconds for new notifications while admin is active
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      startPolling(30000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isAuthenticated, isAdmin, startPolling, stopPolling]);

  // Dispatch notifications to Redux when data arrives
  useEffect(() => {
    if (data?.adminNotifications?.length) {
      data.adminNotifications.forEach((notif) => {
        dispatch(
          addNotification({
            title: "📦 New Order",
            message: notif.message,
            type: "info",
            orderId: notif.orderId,
            dbId: notif._id,
          }),
        );
      });
    }
  }, [data, dispatch]);

  if (error) {
    console.error("Failed to fetch admin notifications (GraphQL):", error);
  }

  return null;
}
