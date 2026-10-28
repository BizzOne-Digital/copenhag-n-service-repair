import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    localPatterns: [
      { pathname: "/images/brand/copenhagen-logo.png" },
      { pathname: "/images/generated/**" },
      { pathname: "/api/uploads/**" },
      { pathname: "/placeholder.svg" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
