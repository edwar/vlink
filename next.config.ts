import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  transpilePackages: ["react-markdown", "remark-gfm", "property-information", "space-separated-tokens", "comma-separated-tokens"],
};

export default nextConfig;
