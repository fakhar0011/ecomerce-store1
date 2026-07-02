"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useAuthSelector } from "@/store/hooks";
import {
  GET_USER_NOTIFICATIONS,
  UserNotificationsResponse,
} from "@/graphql/queries";
import { MARK_USER_NOTIFICATION_READ } from "@/graphql/mutations";
import {
  ORDER_NOTIFICATION_SUBSCRIPTION,
  OrderNotificationSubscriptionData,
} from "@/graphql/subscriptions";
import { toast } from "react-toastify";

export default function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthSelector();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery<UserNotificationsResponse>(
    GET_USER_NOTIFICATIONS,
    {
      skip: !isAuthenticated,
      fetchPolicy: "network-only",
    },
  );

  useSubscription(ORDER_NOTIFICATION_SUBSCRIPTION, {
    skip: !isAuthenticated || !user?.id,
    variables: { userId: user?.id },
    onData: ({ data }) => {
      const subscriptionData =
        data as unknown as OrderNotificationSubscriptionData;
      const notif = subscriptionData?.orderNotification;
      if (notif) {
        toast.info(`${notif.title}: ${notif.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        refetch();
      }
    },
  });

  const [markRead] = useMutation(MARK_USER_NOTIFICATION_READ);

  const notifications = data?.getUserNotifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      try {
        await markRead({ variables: { id: notif._id } });
        refetch();
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }
    if (notif.orderId) {
      // router.push(`/orders/${notif.orderId}`);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      try {
        await markRead({ variables: { id: n._id } });
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }
    refetch();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 transition"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 
                     w-[calc(100vw-1rem)] max-w-[360px] sm:w-80 
                     bg-white rounded-lg shadow-xl border border-gray-200 z-50 
                     max-h-[80vh] overflow-y-auto
                     left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0"
        >
          {/* Sticky Header */}
          <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition ${
                    !notif.read ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">
                      {notif.type === "success"
                        ? "✅"
                        : notif.type === "error"
                          ? "❌"
                          : "ℹ️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words leading-tight">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString("en-PK", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
