import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { ARTICLES } from "@/lib/articles";
import { WORK, hasCaseStudy } from "@/lib/work";

/**
 * The sitemap, at /sitemap.xml.
 *
 * Next builds the XML from what this returns, so there is no file in `public/`
 * to keep in step with the routes — a service added to `SERVICES` or a piece
 * added to `ARTICLES` appears here on the next build, and one removed stops
 * being advertised. That is the whole reason for generating it rather than
 * writing it by hand.
 *
 * Every URL is built from `SITE_URL`, so the sitemap cannot advertise a
 * different origin from the canonicals.
 *
 * Two things are deliberately NOT here:
 *
 *   - `/work/[slug]` for a project without a written case study. Those pages
 *     `notFound()` — `generateStaticParams` filters on `hasCaseStudy` — so
 *     listing them all would hand Google a set of 404s. The filter below is
 *     the same one, imported rather than reimplemented.
 *   - The redirects in `next.config.ts` (the old `/industries` routes, the
 *     `/services/web-design` aliases, `/services/motion-video`). A sitemap
 *     should list destinations, not the redirects that reach them.
 *
 * `public/__forms.html` is not a route and never appears. Neither does
 * `not-found`, which sets `robots: { index: false }` for itself.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /* One timestamp for everything without a real date of its own, so a rebuild
     does not claim every page changed at slightly different moments. */
  const now = new Date();

  /**
   * Priority is a hint about relative importance within this site — it does
   * not affect ranking. The homepage leads; the pages someone converts on
   * (services, contact, work) come next; the index pages that exist to point
   * at other pages sit below the pages they point at.
   */
  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: "/", changeFrequency: "monthly", priority: 1 },
      { url: "/services", changeFrequency: "monthly", priority: 0.9 },
      { url: "/work", changeFrequency: "monthly", priority: 0.9 },
      { url: "/contact", changeFrequency: "yearly", priority: 0.8 },
      { url: "/about", changeFrequency: "monthly", priority: 0.8 },
      { url: "/markets", changeFrequency: "monthly", priority: 0.7 },
      { url: "/articles", changeFrequency: "weekly", priority: 0.6 },
      { url: "/labs", changeFrequency: "monthly", priority: 0.5 },
      /* Listed so it is indexable and discoverable, but last: it is a page
         people are sent to rather than one they search for. */
      { url: "/terms", changeFrequency: "yearly", priority: 0.3 },
    ] as const
  ).map((r) => ({ ...r, url: `${SITE_URL}${r.url}`, lastModified: now }));

  const services: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  /* Articles carry their own publication date, so these get a real
     `lastModified` rather than the build time. */
  const articles: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.datetime),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const work: MetadataRoute.Sitemap = WORK.filter(hasCaseStudy).map((w) => ({
    url: `${SITE_URL}/work/${w.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...services, ...articles, ...work];
}
