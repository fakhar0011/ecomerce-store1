"use client";

import { useState } from "react";
import { Product } from "@/types";
import {
  useAppDispatch,
  useAuthSelector,
  useCartSelector,
} from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuthSelector();
  const { items } = useCartSelector(); // ← Cart items lo
  const router = useRouter();

  // ← Cart mein is product ki current quantity
  const cartItem = items.find((item) => item.product._id === product._id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // ← Kya stock khatam ho gaya?
  const isOutOfStock = product.stock === 0;
  const isStockFull = cartQuantity >= product.stock;
  // cartQuantity >= stock → aur add nahi ho sakta

  const handleAddToCart = (): void => {
    // Login check
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // ← Stock limit check
    if (isStockFull) {
      toast.warning(
        `⚠️ Sorry! just ${product.stock} left!`,
      );
      return;
    }

    dispatch(addToCart(product));
    setAdded(true);
    toast.success(`🛒 ${product.name} has been added to the cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden
                    hover:shadow-lg transition-shadow duration-300"
    >
      {/* Product Image */}
      <div className="h-52 w-full overflow-hidden relative bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105
                       transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🛍️</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 right-3 text-xs font-medium
                           px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full"
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col gap-2">
        {/* Name */}
        <p className="font-semibold text-gray-900 text-base leading-tight">
          {product.name}
        </p>

        {/* Category */}
        <p className="text-xs text-gray-400 capitalize tracking-wide">
          {product.category}
        </p>

        {/* Rating */}
        {product.rating && product.rating > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(product.rating!)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
        ) : null}

        {/* Price */}
        <p className="text-xl font-bold text-gray-900">
          Rs {product.price.toLocaleString()}
        </p>

        {/* Stock */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isOutOfStock ? "bg-red-400" : "bg-green-500"
            }`}
          />
          <p
            className={`text-xs font-medium ${
              isOutOfStock ? "text-red-500" : "text-green-600"
            }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : isStockFull
                ? `Max limit reached (${product.stock})` // ← Limit reach ho gayi
                : `${product.stock} in stock`}
          </p>
        </div>

        {/* {cartQuantity > 0 && (
          <p className="text-xs text-indigo-600 font-medium">
            🛒 {cartQuantity} already in cart
          </p>
        )} */}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isStockFull}
          className={`mt-2 w-full py-2.5 rounded-xl text-sm font-medium
            transition duration-200 ${
              added
                ? "bg-green-600 text-white scale-95"
                : isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isStockFull
                    ? "bg-orange-100 text-orange-500 cursor-not-allowed"
                    : "border border-gray-300 hover:bg-gray-900 hover:text-white active:scale-95"
            }`}
        >
          {added
            ? "✓ Added to Cart"
            : isOutOfStock
              ? "Out of Stock"
              : isStockFull
                ? `Max Limit (${product.stock})` // ← Button text change
                : !isAuthenticated
                  ? "Login to Buy"
                  : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
