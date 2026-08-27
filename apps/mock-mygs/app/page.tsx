"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const benefits = [
  { title: "Badge Tracker", desc: "Track your badge progress and achievements", icon: "🏅" },
  { title: "Troop Finder", desc: "Connect with troops in your area", icon: "🗺️" },
  { title: "Event Calendar", desc: "Discover camps, workshops, and meetups", icon: "📅" },
  { title: "Resource Library", desc: "Access guides, handbooks, and activities", icon: "📚" },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero */}
      <section className="bg-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to myGS</h1>
          <p className="text-lg text-blue-200 mb-8">
            Your Girl Scout membership hub. Manage your profile, track badges,
            and stay connected with your troop.
          </p>
          {!session?.user && (
            <Link
              href="/signin"
              className="inline-block px-6 py-3 bg-amber-400 text-blue-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
            >
              Sign In to myGS
            </Link>
          )}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Member Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-4"
            >
              <div className="text-4xl">{b.icon}</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{b.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
        <p>CIAM Broker PoC — Mock myGS Application</p>
        <p className="mt-1">This is not a real member portal. Built for identity broker evaluation.</p>
      </footer>
    </div>
  );
}
