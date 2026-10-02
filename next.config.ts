import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://study-together-be.onrender.com/:path*",
      },
    ];
  },
};
export default nextConfig;
