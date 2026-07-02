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
  const { items } = useCartSelector();
  const router = useRouter();

  const cartItem = items.find((item) => item.product._id === product._id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock === 0;
  const isStockFull = cartQuantity >= product.stock;

  const handleAddToCart = (): void => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isStockFull) {
      toast.warning(`⚠️ Sorry! just ${product.stock} left!`);
      return;
    }

    dispatch(addToCart(product));
    setAdded(true);
    toast.success(`🛒 ${product.name} has been added to the cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  let buttonText = "Add to Cart";
  let isDisabled = false;
  let buttonVariant = "";

  if (added) {
    buttonText = "✓ Added";
    buttonVariant = "added";
  } else if (isOutOfStock) {
    buttonText = "Out of Stock";
    isDisabled = true;
    buttonVariant = "disabled";
  } else if (isStockFull) {
    buttonText = `Max Limit (${product.stock})`;
    isDisabled = true;
    buttonVariant = "disabled";
  } else if (!isAuthenticated) {
    buttonText = "Login to Buy";
    buttonVariant = "login";
  }

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
        <p className="font-semibold text-gray-900 text-base leading-tight">
          {product.name}
        </p>

        <p className="text-xs text-gray-400 capitalize tracking-wide">
          {product.category}
        </p>

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

        <p className="text-xl font-bold text-gray-900">
          Rs {product.price.toLocaleString()}
        </p>

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
                ? `Max limit reached (${product.stock})`
                : `${product.stock} in stock`}
          </p>
        </div>

        {/* ✅ Smooth Shine Button */}
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`shine-btn w-full mt-2 ${
            buttonVariant === "disabled" ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{
            backgroundColor:
              buttonVariant === "added"
                ? "#66af81"
                : buttonVariant === "login"
                  ? "#7572af"
                  : buttonVariant === "disabled"
                    ? "#d1d5db"
                    : "rgb(86, 125, 150)",
            color: buttonVariant === "disabled" ? "#9ca3af" : "white",
            border:
              buttonVariant === "disabled"
                ? "3px solid #e5e7eb"
                : "3px solid #ffffff4d",
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {buttonText}
            {buttonVariant === "login"}
            {buttonVariant === "added"}
          </span>
        </button>

        <style jsx>{`
          .shine-btn {
            position: relative;
            transition: all 0.3s ease-in-out;
            box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
            padding-block: 0.5rem;
            padding-inline: 1.25rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: bold;
            outline: none;
            overflow: hidden;
            font-size: 15px;
            cursor: pointer;
          }

          .shine-btn:not(:disabled):hover {
            transform: scale(1.05);
            border-color: #fff9;
          }

          .shine-btn::before {
            content: "";
            position: absolute;
            width: 100px;
            height: 100%;
            background-image: linear-gradient(
              120deg,
              rgba(255, 255, 255, 0) 30%,
              rgba(255, 255, 255, 0.8),
              rgba(255, 255, 255, 0) 70%
            );
            top: 0;
            left: -100px;
            opacity: 0.6;
            transition: left 0.8s ease-in-out;
          }

          .shine-btn:not(:disabled):hover::before {
            left: 150%;
          }
        `}</style>
      </div>
    </div>
  );
}
