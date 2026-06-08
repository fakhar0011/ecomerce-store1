"use client";
import { useEffect, useState } from "react";
import { useAuthSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { getAdminNotifications } from "@/lib/admin.service";

export default function AdminNotificationFetcher() {
  const { isAdmin, isAuthenticated } = useAuthSelector();
  const dispatch = useAppDispatch();
  const [token, setToken] = useState<string | null>(null);

  // Watch localStorage token changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    // Initial read
    setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Only fetch when admin is authenticated, token exists, and we have not fetched for this token
    if (!isAuthenticated || !isAdmin || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await getAdminNotifications();
        if (res.success && res.data.length) {
          res.data.forEach((notif: any) => {
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
      } catch (err) {
        console.error("Failed to fetch admin notifications", err);
      }
    };

    fetchNotifications();
  }, [token, isAuthenticated, isAdmin, dispatch]); // 👈 re‑runs when token changes (after login)

  return null;
}
