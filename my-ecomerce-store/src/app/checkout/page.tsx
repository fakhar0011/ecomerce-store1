"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  useAppDispatch,
  useCartSelector,
  useAuthSelector,
} from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER, CreateOrderResponse } from "@/graphql/mutations";
import { GET_PRODUCTS, ProductsResponse } from "@/graphql/queries";
import { toast } from "react-toastify";

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useCartSelector();
  const { isAuthenticated } = useAuthSelector();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // ✅ GraphQL Mutation with cache update
  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER, {
    update: (cache, { data }) => {
      if (!data?.createOrder || orderItems.length === 0) return;

      // ✅ Cache se purani products list lo
      const existingData = cache.readQuery<ProductsResponse>({
        query: GET_PRODUCTS,
      });

      if (!existingData) return;

      // ✅ Stock update karo
      const updatedProducts = existingData.products.map((product) => {
        const orderedItem = orderItems.find(
          (item) => item.productId === product._id,
        );
        if (orderedItem) {
          return {
            ...product,
            stock: Math.max(0, product.stock - orderedItem.quantity),
          };
        }
        return product;
      });

      // ✅ Cache update karo
      cache.writeQuery({
        query: GET_PRODUCTS,
        data: {
          products: updatedProducts,
        },
      });

      console.log("✅ Cache updated with new stock values");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingForm>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
    if (items.length === 0) {
      router.replace("/products");
    }
    // ✅ orderItems ko state mein store karo taake update function mein access ho
    setOrderItems(
      items.map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image || "",
      })),
    );
  }, [isAuthenticated, items, router]);

  if (!isAuthenticated) return null;

  const onSubmit = async (data: ShippingForm) => {
    setLoading(true);
    setApiError("");

    try {
      const result = await createOrder({
        variables: {
          items: orderItems,
          shippingAddress: {
            fullName: data.fullName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
          },
        },
      });

      if (result.data?.createOrder) {
        dispatch(clearCart());
        toast.success("✅ Order placed successfully!");
        router.push(
          `/orders?success=Order placed! ID: ${result.data.createOrder._id}`,
        );
      } else {
        throw new Error("Order failed");
      }
    } catch (err: any) {
      const message =
        err.graphQLErrors?.[0]?.message || err.message || "Order failed";
      setApiError(message);
      toast.error("❌ Order failed!");
    } finally {
      setLoading(false);
    }
  };

  // ... JSX same rahega
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Fill your shipping details</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Shipping Address
              </h2>

              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                  ❌ {apiError}
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Minimum 2 characters" },
                    })}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      errors.fullName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: "Must be 10-11 digits",
                      },
                    })}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      errors.phone
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Address *
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main St, Apartment 4B"
                    {...register("address", {
                      required: "Address is required",
                      minLength: { value: 5, message: "Minimum 5 characters" },
                    })}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      errors.address
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="Lahore"
                      {...register("city", { required: "City is required" })}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.city
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      placeholder="54000"
                      {...register("postalCode", {
                        required: "Postal code is required",
                        pattern: {
                          value: /^[0-9]{5}$/,
                          message: "Must be 5 digits",
                        },
                      })}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.postalCode
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition mt-2 ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-700 text-white"
                  }`}
                >
                  {loading
                    ? "⏳ Placing order..."
                    : `Place Order → Rs ${totalAmount.toLocaleString()}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="flex flex-col gap-3 mb-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🛍️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Rs {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs {totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/cart"
                className="w-full mt-4 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center"
              >
                ← Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
