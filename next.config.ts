import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev overlay badge sits bottom-left, exactly where the loader's mono
  // counter lives — it obscures it in dev and in captured frames.
  devIndicators: false,
};

export default nextConfig;
