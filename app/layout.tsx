import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
// Generated from the files actually present in public/fonts/gilroy/ — see
// scripts/gen-gilroy-css.mjs.
import "./gilroy.css";
import { IntroProvider } from "@/components/motion/intro-context";
import IntroLoader from "@/components/brand/IntroLoader";
import RouteTransition from "@/components/motion/RouteTransition";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollToTop from "@/components/motion/ScrollToTop";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import Cursor from "@/components/chrome/Cursor";
import CommandPalette from "@/components/chrome/CommandPalette";

/* Display — high contrast, and its italic has real calligraphic slope, which
   is what makes roman/italic mixing legible inside one headline at 11vw. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/* Body — geometric grotesque, variable, holds tight leading at large sizes. */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

/* Utility — the LEVANT micro-type voice: labels, counters, metadata. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE = "https://puzzle.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Puzzle — design studio, Hampshire",
    template: "%s — Puzzle",
  },
  description:
    "Puzzle is a Hampshire design studio. We build brand identities, websites and digital products that fit together.",
  openGraph: {
    type: "website",
    siteName: "Puzzle",
    locale: "en_GB",
    url: SITE,
    title: "Puzzle — design studio, Hampshire",
    description:
      "Puzzle is a Hampshire design studio. We build brand identities, websites and digital products that fit together.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

/**
 * Declares the document dark to the browser itself.
 *
 * The frames before the HTML is parsed are painted with the browser's default
 * canvas, which is white — so a fresh load flashed white before anything of
 * ours existed to colour it. `color-scheme: dark` makes that default canvas
 * dark, which is the only thing that reaches a frame that early; an inline
 * style cannot, because the <html> tag has not been read yet.
 *
 * Document-level only. The `[data-invert]` light sections set their own
 * `color-scheme: light` and are unaffected.
 */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0f0f12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geist.variable} ${plexMono.variable} h-full antialiased`}
      /* Inline, because an attribute style is in effect the instant the tag is
         parsed, whereas --surface only exists once the stylesheet has loaded.
         Without it the very first painted frame is the browser default white,
         which reads as a flash before the dark loader appears. Same value as
         --ink / --surface. */
      style={{ backgroundColor: "#0f0f12" }}
    >
      <body className="flex min-h-full flex-col bg-surface text-content">
        {/* Runs while the document is still parsing — the only moment early
            enough to stop the browser restoring a previous scroll offset on
            reload or history navigation. Doing this in an effect is too late:
            React has not mounted yet when the restore happens, so the page
            visibly lands mid-article and has to be corrected afterwards. */}
        {/* Also decides the intro before the first paint. The loader markup is
            server-rendered so it covers the page from frame one; a visitor who
            has already seen it this session gets it removed here, while the
            document is still parsing, so it never becomes visible for them. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}" +
              "try{if(sessionStorage.getItem('puzzle:intro-seen')==='1')document.documentElement.setAttribute('data-intro-seen','1')}catch(e){}",
          }}
        />
        <IntroProvider>
          <a href="#main" className="skip-link mono">
            Skip to content
          </a>
          <SmoothScroll />
          <ScrollToTop />
          <IntroLoader />
          <RouteTransition />
          <Cursor />
          <CommandPalette />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </IntroProvider>
      </body>
    </html>
  );
}
