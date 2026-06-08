import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ReduxProvider from "@/store/provider";
import AuthProvider from "@/components/AuthProvider";
import { ToastContainer } from "react-toastify";
import NotificationListener from "@/components/NotificationListener";
import AdminNotificationFetcher from "@/components/AdminNotificationFetcher"; // ✅ import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyStore — E-Commerce",
  description: "Best online shopping store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ReduxProvider>
          <AuthProvider>
            <AdminNotificationFetcher />{" "}
            {/* ← fetches pending admin notifications from DB */}
            <Navbar />
            {children}
            <NotificationListener />
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick={true}
              pauseOnHover={false}
              draggable={true}
              theme="light"
            />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
