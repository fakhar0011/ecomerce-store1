// lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Custom config type for tracking retry attempts (optional)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // agar cookies use kar rahe ho (optional)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Request Interceptor – Token Attach Karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Client-side pe hi token lo (SSR mein localStorage available nahi)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error.message);
    return Promise.reject(error);
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Response Interceptor – Handle Errors & Token Expiry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
api.interceptors.response.use(
  (response) => response, // successful response
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Agar 401 (Unauthorized) aur request retry nahi hui pehle se
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Client-side pe hi cleanup karo
      if (typeof window !== "undefined") {
        // Token remove karo
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // agar user bhi store kiya ho

        // Redirect to login page (avoid infinite redirects)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Optionally: Handle network errors
    if (error.message === "Network Error") {
      console.error("Network error – please check your internet connection");
    }

    return Promise.reject(error);
  },
);

export default api;
