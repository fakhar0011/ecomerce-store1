"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useAppDispatch,
  useCartSelector,
  useAuthSelector,
} from "@/store/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/store/slices/cartSlice";
import { toast } from "react-toastify";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items } = useCartSelector();
  const router = useRouter();
  const { isAuthenticated } = useAuthSelector();

  const totalItems = items.length;

  const totalAmount = useMemo(() => {
    let amount = 0;
    items.forEach((item) => {
      amount += item.product.price * item.quantity;
    });
    return amount;
  }, [items]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // ← Yeh fix — login nahi toh kuch mat dikhao
  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
            <p className="text-gray-500 mt-1">{totalItems} items</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                dispatch(clearCart());
                toast.error("🗑️ Cart has been cleared!");
              }}
              className="text-sm text-red-500 border border-red-300
                         px-4 py-2 rounded-xl hover:bg-red-50 transition"
            >
              🗑️ Clear Cart
            </button>
          )}
        </div>

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl font-medium text-gray-600">Cart is empty!</p>
            <p className="text-gray-400 mt-2 mb-8">
              No products added to the cart yet
            </p>
            <Link
              href="/products"
              className="bg-gray-900 text-white px-8 py-3
                         rounded-xl font-medium hover:bg-gray-700 transition"
            >
              Products Show →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white border border-gray-200 rounded-2xl
                             p-4 flex gap-4 items-center"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center
                                      justify-center text-3xl"
                      >
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.product.category}
                    </p>
                    <p className="text-base font-bold text-gray-900 mt-1">
                      Rs {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        dispatch(
                          updateQuantity({
                            productId: item.product._id,
                            quantity: item.quantity - 1,
                          }),
                        );
                        if (item.quantity - 1 < 1) {
                          toast.error(
                            `❌ ${item.product.name} has been removed from the cart!`,
                          );
                        } else {
                          toast.info(`🔄 Quantity updated!`);
                        }
                      }}
                      className="w-8 h-8 rounded-lg border border-gray-300
                                 flex items-center justify-center
                                 hover:bg-gray-100 transition font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        dispatch(
                          updateQuantity({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          }),
                        );
                        toast.info(`🔄 Quantity updated!`);
                      }}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 rounded-lg border border-gray-300
                                 flex items-center justify-center
                                 hover:bg-gray-100 transition font-medium
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      Rs {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => {
                        dispatch(removeFromCart(item.product._id));
                        toast.error(
                          `❌ ${item.product.name} has removed from the cart!`,
                        );
                      }}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-80">
              <div
                className="bg-white border border-gray-200 rounded-2xl
                              p-6 sticky top-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-2 mb-4">
                  {items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span className="truncate flex-1 mr-2">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        Rs{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white
                             py-3 rounded-xl font-medium text-sm transition
                             flex items-center justify-center gap-2"
                >
                  Checkout → Rs {totalAmount.toLocaleString()}
                </Link>

                <Link
                  href="/products"
                  className="w-full mt-3 border border-gray-300 text-gray-600
                             py-3 rounded-xl font-medium text-sm transition
                             hover:bg-gray-50 flex items-center justify-center"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
