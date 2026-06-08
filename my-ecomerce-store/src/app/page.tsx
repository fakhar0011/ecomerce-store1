import Link from "next/link";

export default function HomePage() {
  return (
    <>

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

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "🚚", title: "Fast Delivery", desc: "Delivery with in 20 minutes" },
              { icon: "🔒", title: "Secure Payment", desc: "100% safe & secure checkout" },
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

        {/* CTA Section */}
        <section className="bg-indigo-500 text-white py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-indigo-100 mb-8">
           Browse All Products
          </p>
          <Link
            href="/products"
            className="bg-white text-indigo-600 hover:bg-gray-100 
                       px-8 py-3 rounded-xl font-medium transition"
          >
            Browse Products →
          </Link>
        </section>

      </main>
    </>
  );
}