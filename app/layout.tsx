import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geist.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-content">
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
