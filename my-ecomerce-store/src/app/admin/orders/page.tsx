"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ORDERS, OrdersResponse } from "@/graphql/queries";
import {
  UPDATE_ORDER_STATUS,
  UpdateOrderStatusResponse,
} from "@/graphql/mutations";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-300",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
};

const allowedTransitions: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const statusButtons: Record<string, { label: string; color: string }> = {
  processing: {
    label: "⚙️ Mark Processing",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  shipped: {
    label: "🚚 Mark Shipped",
    color: "bg-indigo-500 hover:bg-indigo-600 text-white",
  },
  delivered: {
    label: "✅ Mark Delivered",
    color: "bg-green-500 hover:bg-green-600 text-white",
  },
  cancelled: {
    label: "❌ Cancel Order",
    color: "bg-red-500 hover:bg-red-600 text-white",
  },
};

export default function AdminOrdersPage() {
  const { isAdmin, isAuthenticated } = useAuthSelector();
  const router = useRouter();

  // ✅ GraphQL Query for orders
  const {
    loading,
    error: queryError,
    data,
    refetch,
  } = useQuery<OrdersResponse>(GET_ORDERS, {
    skip: !isAuthenticated || !isAdmin,
  });

  // ✅ GraphQL Mutation for updating order status
  const [updateOrderStatus] =
    useMutation<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS);

  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (!isAdmin) router.push("/products");
  }, [isAuthenticated, isAdmin, router]);

  // ✅ Update local state when GraphQL data arrives
  useEffect(() => {
    if (data?.orders) {
      setOrders(data.orders as Order[]);
    }
  }, [data]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus({
        variables: { id: orderId, status: newStatus },
      });
      toast.success(`✅ Order status updated to ${newStatus}`);
      refetch(); // ✅ Refresh list
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (!isAuthenticated || !isAdmin) return null;

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orders Management
            </h1>
            <p className="text-gray-500 mt-1">{filteredOrders.length} orders</p>
          </div>
          <Link
            href="/admin"
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
          >
            ← Admin Panel
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            "all",
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                filterStatus === s
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s === "all" ? "All" : getStatusConfig(s).label}
            </button>
          ))}
        </div>

        {/* GraphQL Error */}
        {queryError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6">
            ❌ {queryError.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-200 h-48 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl font-medium text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const config = getStatusConfig(order.status);
              return (
                <div
                  key={order._id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="px-6 py-4 border-b flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Order ID</p>
                      <p className="text-sm font-mono font-medium">
                        #{order._id.slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-sm font-bold">
                        Rs {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div className="px-6 py-4 border-b space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center text-lg">
                              🛍️
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Rs {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Shipping Address
                      </p>
                      <p className="text-sm">
                        {order.shippingAddress.fullName} •{" "}
                        {order.shippingAddress.phone}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city} -{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {allowedTransitions[order.status]?.map((next) => (
                        <button
                          key={next}
                          onClick={() => updateStatus(order._id, next)}
                          disabled={updatingId === order._id}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50 ${statusButtons[next]?.color}`}
                        >
                          {updatingId === order._id
                            ? "⏳ Updating..."
                            : statusButtons[next]?.label}
                        </button>
                      ))}
                      {allowedTransitions[order.status]?.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          No actions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
