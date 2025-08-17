import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next-dev',
  eslint: {
    // Do not fail builds on ESLint errors in CI/deploy. We still lint locally.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionally allow builds to proceed even with type errors from third-party fallbacks.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Avoid requiring node-canvas when bundling client code
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
    }
    return config
  },
};

export default nextConfig;
