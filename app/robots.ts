import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt, at /robots.txt.
 *
 * The whole public site is crawlable. The only disallow is `/__forms.html`,
 * which is not a page at all: it is the static form definition Netlify parses
 * to register `puzzle-contact` and `puzzle-scope-enquiry`, and it renders as a
 * blank document with hidden inputs. Nothing links to it, but it sits in
 * `public/` and would be an indexable dead end if a crawler found it.
 *
 * The sitemap and host are absolute, which the format requires, and both come
 * from `SITE_URL` so they cannot drift from the canonicals.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/__forms.html"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
