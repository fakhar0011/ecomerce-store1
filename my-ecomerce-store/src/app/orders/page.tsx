"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthSelector } from "@/store/hooks";
import { useQuery } from "@apollo/client/react";
import { GET_MY_ORDERS, MyOrdersResponse } from "@/graphql/queries";

interface Order {
  _id: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMsg = searchParams.get("success");
  const { isAuthenticated } = useAuthSelector();

  // ✅ GraphQL Query
  const { loading, error, data } = useQuery<MyOrdersResponse>(GET_MY_ORDERS, {
    skip: !isAuthenticated,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const orders: Order[] = data?.orders || [];
  const queryError = error?.message || "";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">View your order history</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
            ✅ {successMsg}
          </div>
        )}

        {queryError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            ❌ {queryError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl font-medium text-gray-600">No orders yet</p>
            <p className="text-gray-400 mt-2 mb-8">
              Start shopping to place your first order
            </p>
            <Link
              href="/products"
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition"
            >
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm font-medium">
                      {order._id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-sm font-medium">
                      {order.createdAt
                        ? new Date(Number(order.createdAt)).toLocaleDateString(
                            "en-PK",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      Rs {order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × Rs{" "}
                          {item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-400">
                      + {order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
