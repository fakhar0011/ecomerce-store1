"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS, ProductsResponse } from "@/graphql/queries";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function HomePage() {
  const { data, loading } = useQuery<ProductsResponse>(GET_PRODUCTS);

  const products = data?.products || [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-indigo-400">MyStore</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Best products at best prices — electronics, fashion!
        </p>
        <Link
          href="/products"
          className="bg-indigo-500 hover:bg-indigo-600 text-white 
                     px-8 py-3 rounded-xl text-lg font-medium transition"
        >
          Shop Now →
        </Link>
      </section>

      {/* ✅ Auto-Sliding Products Carousel (Left to Right) */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🔥 Trending Products
          </h2>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                stopOnLastSlide: false,
                pauseOnMouseEnter: true,
              }}
              speed={2800}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="w-full"
            >
              {products.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link href={`/products?id=${product._id}`}>
                    {" "}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="h-48 w-full overflow-hidden bg-gray-50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize mt-1">
                          {product.category}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          Rs {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "🚚",
              title: "Fast Delivery",
              desc: "Delivery within 20 minutes",
            },
            {
              icon: "🔒",
              title: "Secure Payment",
              desc: "100% safe & secure checkout",
            },
            { icon: "↩️", title: "Easy Returns", desc: "Free return policy" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-2xl 
                         p-6 text-center hover:shadow-md transition"
            >
              <span className="text-4xl">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
