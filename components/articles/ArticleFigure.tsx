import Image from "next/image";
import type { ArticleImage } from "@/lib/articles";

/**
 * A picture inside a piece — the hero under the title, or the figure set into
 * the body.
 *
 * Intrinsic sizing, not a fixed frame: `width`/`height` come from the file, so
 * the box is reserved at the source's own ratio and nothing is cropped or
 * stretched whatever shape the artwork happens to be. The body figures are not
 * all 3:2 — one of them is square — and forcing them into the card's ratio
 * would cut the content out of the image rather than fit it.
 *
 * Deliberately not a client component. The article page is static, the
 * pictures do not animate, and adding an entrance here would mean shipping the
 * body of every piece through the client boundary for a fade.
 */
export function ArticleFigure({
  image,
  priority = false,
  className = "",
}: {
  image: ArticleImage;
  /** The hero is above the fold on every article and should not lazy-load. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        /* Capped at the measure the article body runs to, so the browser never
           reaches for a source wider than the column can show. */
        sizes="(min-width: 768px) 42rem, 100vw"
        className="h-auto w-full rounded-xl"
      />
    </figure>
  );
}

export default ArticleFigure;
