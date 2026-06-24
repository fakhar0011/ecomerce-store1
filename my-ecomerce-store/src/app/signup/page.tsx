"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { useMutation } from "@apollo/client/react";
import { SIGNUP, SignupResponse } from "@/graphql/mutations";
import { toast } from "react-toastify";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "user";
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [signup] = useMutation<SignupResponse>(SIGNUP);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { role: "user" },
  });

  const password = watch("password");
  const selectedRole = watch("role");

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setApiError("");

    try {
      const result = await signup({
        variables: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      });

      const { token, user } = result.data!.signup;
      localStorage.setItem("token", token);
      dispatch(
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "user" | "admin",
        }),
      );

      toast.success(`🎉 Welcome ${data.name}! Your account is ready.`);
      router.push("/products");
    } catch (err: any) {
      setApiError(
        err.graphQLErrors?.[0]?.message ||
          err.message ||
          "Something went wrong!",
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
          <p className="text-gray-500 mt-2">Create a new account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h1>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              ❌ {apiError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="full name"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
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
                className={`w-full border rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
                    message: "Must contain uppercase, lowercase, and a number",
                  },
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match!",
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Account Type
              </label>
              <select
                {...register("role")}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="user">👤 General User</option>
                <option value="admin">⚙️ Admin</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {selectedRole === "admin"
                  ? "⚙️ Admin — Products add, edit, delete"
                  : "👤 General User — Products see && buy"}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-sm transition mt-2
                ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-700 text-white"
                }`}
            >
              {loading ? "⏳ Creating account..." : "Sign Up →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Account already exists?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
