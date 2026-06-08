"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FilterType } from "@/types";
import {
  useAppDispatch,
  useProductSelector,
  useCartSelector,
} from "@/store/hooks";
import { fetchProducts } from "@/store/slices/productSlice";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error, selectedFilter } = useProductSelector();
  const cartState = useCartSelector() as any;
  const totalItems =
    cartState.totalItems ??
    cartState.cartItems?.reduce(
      (count: number, item: { quantity?: number }) =>
        count + (item.quantity ?? 1),
      0,
    ) ??
    0;

  useEffect(() => {
    dispatch(fetchProducts("all"));
  }, [dispatch]);

  const filters: FilterType[] = [
    "all",
    "electronics",
    "fashion",
    "clothing",
    "accessories",
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-10 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Our <span className="text-indigo-400">Products</span>
        </h1>
        <p className="text-gray-400">Best products at best prices</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => dispatch(fetchProducts(cat))}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition
                  ${
                    selectedFilter === cat
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 bg-gray-900 text-white
                       px-4 py-2 rounded-xl hover:bg-gray-700 transition"
          >
            <span>🛒</span>
            <span className="text-sm font-medium">{totalItems} items</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl font-medium text-gray-500">
              This category is empty. Try another one or check back later!
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {products.length} products found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
