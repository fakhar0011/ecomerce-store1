import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["ik.imagekit.io"],
  },
};

export default nextConfig;
