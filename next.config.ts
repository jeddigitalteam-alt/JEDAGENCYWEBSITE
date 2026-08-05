import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev overlay badge sits bottom-left, exactly where the loader's mono
  // counter lives — it obscures it in dev and in captured frames.
  devIndicators: false,

  /**
   * /how-we-work was merged into /work, beneath the project examples. A
   * permanent redirect rather than a kept page, so the process content lives at
   * exactly one URL and inbound links land on the section itself. The fragment
   * survives because it is resolved by the browser after the 308, not by us.
   */
  async redirects() {
    return [
      {
        source: "/how-we-work",
        destination: "/work#how-we-work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
