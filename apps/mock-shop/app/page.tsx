"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const products = [
  { name: "Cookie Starter Kit", price: "$24.99", img: "🍪" },
  { name: "Trefoil Badge Sash", price: "$18.50", img: "🎗️" },
  { name: "Camp Essentials Pack", price: "$42.00", img: "🏕️" },
  { name: "S'mores Deluxe Box", price: "$15.99", img: "🔥" },
  { name: "Outdoor Adventure Guide", price: "$12.00", img: "🧭" },
  { name: "Troop Leader Handbook", price: "$29.99", img: "📘" },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to GS Shop</h1>
          <p className="text-lg text-green-100 mb-8">
            Your one-stop shop for Girl Scout gear, cookies, and outdoor essentials.
          </p>
          {!session?.user && (
            <button
              onClick={() => signIn("broker", { callbackUrl: "/" }, { kc_idp_hint: "gigya-b2c" })}
              className="inline-block px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
            >
              Sign In to Shop
            </button>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-4">{product.img}</div>
              <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
              <p className="text-green-700 font-bold mt-2">{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
        <p>CIAM Broker PoC — Mock Shop Application</p>
        <p className="mt-1">This is not a real store. Built for identity broker evaluation.</p>
      </footer>
    </div>
  );
}
