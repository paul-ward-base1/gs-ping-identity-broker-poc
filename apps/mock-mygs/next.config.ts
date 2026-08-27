import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ciam-poc/auth", "@ciam-poc/ui"],
  serverExternalPackages: ["ioredis"],
  devIndicators: false,
};

export default nextConfig;
