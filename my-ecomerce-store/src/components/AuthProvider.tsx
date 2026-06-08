"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { getMeService } from "@/lib/auth.service";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(clearUser());
        setIsLoading(false);
        return;
      }

      try {
        const response = await getMeService();
        if (response.success && response.user) {
          dispatch(setUser(response.user));
        } else {
          localStorage.removeItem("token");
          dispatch(clearUser());
        }
      } catch (error) {
        localStorage.removeItem("token");
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
