"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { useMutation } from "@apollo/client/react";
import { LOGIN, LoginResponse } from "@/graphql/mutations";

interface LoginForm {
  email: string;
  password: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMsg = searchParams.get("success");
  const dispatch = useAppDispatch();

  const [login] = useMutation<LoginResponse>(LOGIN);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setApiError("");

    try {
      const result = await login({
        variables: { email: data.email, password: data.password },
      });

      const { token, user } = result.data!.login;
      localStorage.setItem("token", token);
      dispatch(
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "user" | "admin",
        }),
      );
      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setApiError(
        err.graphQLErrors?.[0]?.message ||
          err.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            🛍️ MyStore
          </Link>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
              ✅ {successMsg}
            </div>
          )}

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
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="Your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.password
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
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
              {loading ? "⏳ Logging in..." : "Login →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Account not found?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
