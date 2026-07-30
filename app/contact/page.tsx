import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE } from "@/lib/site";
import { Eyebrow } from "@/components/ui/primitives";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us what you're trying to do. Puzzle is a design studio in London — we reply within two working days.",
};

export default function ContactPage() {
  return (
    <section className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <Eyebrow>Contact</Eyebrow>
      <h1 className="display mt-4 max-w-[18ch] text-step-5">
        Tell us what you’re <em>trying to do</em>
      </h1>
      <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
        Four short steps. We read everything and reply within two working days,
        including the ones we’re not right for.
      </p>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Suspense
          fallback={
            <p className="mono text-content-dim">Loading the form…</p>
          }
        >
          <ContactForm />
        </Suspense>

        <aside className="grid content-start gap-8">
          <div className="rounded-xl border border-rule p-6">
            <Eyebrow as="h2">Direct</Eyebrow>
            <a
              href={`mailto:${SITE.email}`}
              className="display mt-3 block text-step-2 transition-colors hover:text-blue"
            >
              {SITE.email}
            </a>
          </div>

          <div className="rounded-xl border border-rule p-6">
            <Eyebrow as="h2">Studio</Eyebrow>
            <address className="mt-3 not-italic leading-relaxed text-content-dim">
              {SITE.address.map((line) => (
                <span key={line} className="block text-step--1">
                  {line}
                </span>
              ))}
            </address>
            <p className="mono mt-4 text-content-dim">
              {SITE.latitude} — nearest tube, Old Street
            </p>
            <a
              href="https://www.openstreetmap.org/?mlat=51.5074&mlon=-0.0878#map=16/51.5074/-0.0878"
              target="_blank"
              rel="noreferrer noopener"
              className="mono mt-4 inline-flex rounded-full border border-rule px-4 py-2 transition-colors hover:border-blue hover:text-blue"
            >
              Open in maps
            </a>
          </div>

          <div className="rounded-xl border border-rule p-6">
            <Eyebrow as="h2">Not a fit?</Eyebrow>
            <p className="mt-3 text-step--1 text-content-dim">
              If we’re wrong for the work, we’ll say so and point you at someone
              who isn’t. That reply usually comes faster.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
