"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAppDispatch,
  useCartSelector,
  useAuthSelector,
} from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import { logoutService } from "@/lib/auth.service";
import NotificationBell from "@/components/NotificationBell"; // ← import

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useAppDispatch();

  const { items } = useCartSelector();
  const { isAuthenticated, isAdmin, user } = useAuthSelector();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logoutService(); // clears token from localStorage
    } catch (_) {
    } finally {
      dispatch(clearUser()); // clears Redux state
      router.push("/login");
    }
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 text-white px-6 py-4
        transition-all duration-300 ease-in-out
        ${
          scrolled ? "bg-gray-950 shadow-xl py-3" : "bg-gray-900 shadow-lg py-4"
        }
      `}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-400
                     hover:text-indigo-300 transition-colors duration-200"
        >
          🛍️ MyStore
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className="hover:text-indigo-400 transition-colors duration-200
                       relative after:absolute after:bottom-0 after:left-0
                       after:w-0 after:h-0.5 after:bg-indigo-400
                       after:transition-all after:duration-300
                       hover:after:w-full"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="hover:text-indigo-400 transition-colors duration-200
                       relative after:absolute after:bottom-0 after:left-0
                       after:w-0 after:h-0.5 after:bg-indigo-400
                       after:transition-all after:duration-300
                       hover:after:w-full"
          >
            Products
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative hover:text-indigo-400
                       transition-transform duration-200
                       hover:scale-110 active:scale-95"
          >
            🛒
            {items.length > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-indigo-500
                           text-white text-xs w-5 h-5 rounded-full
                           flex items-center justify-center font-bold
                           animate-bounce"
              >
                {items.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {/* Role Badge */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium
                  transition-all duration-200
                  ${
                    isAdmin
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
              >
                {isAdmin ? "⚙️ Admin" : "👤 User"}
              </span>

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="hover:text-indigo-400 transition-colors
                               duration-200 text-sm"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="hover:text-indigo-400 transition-colors
                               duration-200 text-sm"
                  >
                    📦 Orders
                  </Link>
                </>
              )}

              <Link
                href="/orders"
                className="hover:text-indigo-400 transition-colors
                           duration-200 text-sm"
              >
                My Orders
              </Link>

              <span className="text-gray-400 text-sm">Hi, {user?.name}</span>

              {/* 🔔 Notification Bell */}
              <NotificationBell />

              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 px-4 py-2
                           rounded-lg text-sm transition-all duration-200
                           hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-indigo-400 transition-colors
                           duration-200 text-sm"
              >
                Login
              </Link>
              {/* <Link
                href="/signup"
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2
                           rounded-lg text-sm transition-all duration-200
                           hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link> */}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl
                     transition-transform duration-200
                     hover:scale-110 active:scale-95"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`block transition-all duration-300
              ${menuOpen ? "rotate-180 opacity-100" : "rotate-0 opacity-100"}`}
          >
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden overflow-hidden
          transition-all duration-300 ease-in-out
          ${
            menuOpen
              ? "max-h-screen opacity-100 mt-4"
              : "max-h-0 opacity-0 mt-0"
          }
        `}
      >
        <div className="flex flex-col gap-4 px-4 pb-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-400 transition-colors duration-200
                       hover:translate-x-1 transform"
          >
            Home
          </Link>

          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-400 transition-colors duration-200
                       hover:translate-x-1 transform"
          >
            Products
          </Link>

          {/* Mobile Cart */}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="hover:text-indigo-400 transition-colors duration-200
                       flex items-center gap-2 hover:translate-x-1 transform"
          >
            🛒 Cart
            {items.length > 0 && (
              <span
                className="bg-indigo-500 text-white text-xs
                           px-2 py-0.5 rounded-full"
              >
                {items.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {/* Mobile Role Badge */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium w-fit
                  ${
                    isAdmin
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
              >
                {isAdmin ? "⚙️ Admin" : "👤 User"}
              </span>

              {/* Mobile Admin Links */}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-indigo-400 transition-colors
                               duration-200 hover:translate-x-1 transform"
                  >
                    ⚙️ Admin Panel
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-indigo-400 transition-colors
                               duration-200 hover:translate-x-1 transform"
                  >
                    📦 Orders
                  </Link>
                </>
              )}

              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="hover:text-indigo-400 transition-colors
                           duration-200 hover:translate-x-1 transform"
              >
                My Orders
              </Link>

              <span className="text-gray-400 text-sm">Hi, {user?.name}</span>

              {/* 🔔 Mobile Notification Bell */}
              <NotificationBell />

              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 px-4 py-2
                           rounded-lg text-sm transition-all duration-200
                           hover:scale-105 active:scale-95 text-left w-fit"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="hover:text-indigo-400 transition-colors
                           duration-200 hover:translate-x-1 transform"
              >
                Login
              </Link>
              {/* <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2
                           rounded-lg text-sm transition-all duration-200
                           hover:scale-105 active:scale-95 w-fit"
              >
                Sign Up
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
