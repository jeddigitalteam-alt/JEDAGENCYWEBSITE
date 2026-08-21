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
      /**
       * Web design and web development merged into one service, so both of
       * their URLs now point at it rather than one surviving and one 404ing.
       *
       * `/services/web-design` is redirected as well as `/services/web-development`
       * — the merged slug is a new one, so the design page's own URL would
       * otherwise break too, and it is the one of the pair with inbound links
       * worth keeping. Permanent, because the merge is not provisional: the two
       * were never separable work.
       */
      {
        source: "/services/web-design",
        destination: "/services/web-design-development",
        permanent: true,
      },
      {
        source: "/services/web-development",
        destination: "/services/web-design-development",
        permanent: true,
      },
      /**
       * Motion and video is no longer a service. There is no successor page to
       * send it to — unlike the web merge, this was not two things becoming
       * one — so it lands on the services index, which is the nearest honest
       * answer to "what do you actually offer". Permanent, for the same reason
       * the entry was deleted rather than hidden.
       */
      {
        source: "/services/motion-video",
        destination: "/services",
        permanent: true,
      },
      /**
       * Industries — an index plus nine sector pages — is now one editorial
       * page at /markets. Every one of those URLs has existed publicly, so all
       * ten redirect rather than 404: the index, and `:slug` catching the nine
       * beneath it. They all land on the same page because the sectors are no
       * longer separate destinations; sending each to an anchor would promise a
       * section that may not correspond to the old page.
       */
      { source: "/industries", destination: "/markets", permanent: true },
      { source: "/industries/:slug", destination: "/markets", permanent: true },
    ];
  },
};

export default nextConfig;
