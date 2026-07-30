"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const PROJECT_TYPES = [
  "Brand identity",
  "Website",
  "Digital product",
  "Motion or video",
  "Retainer",
  "Something else",
];
const BUDGETS = [
  "Under £25k",
  "£25k – £50k",
  "£50k – £100k",
  "£100k+",
  "Not sure yet",
];
const TIMELINES = [
  "As soon as possible",
  "Next quarter",
  "In 6 months",
  "Just exploring",
];

const STEPS = ["Project", "Budget", "Timeline", "Details"] as const;

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  projectType: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  message: string;
  company: string; // honeypot
}

export function ContactForm() {
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  const configured = Boolean(formspreeId);

  // Scope handed over from the services board.
  const scopeSlugs = useMemo(
    () => (searchParams.get("scope") ?? "").split(",").filter(Boolean),
    [searchParams],
  );
  const scopeWeeks = searchParams.get("weeks");
  const scopeNames = SERVICES.filter((s) => scopeSlugs.includes(s.slug)).map(
    (s) => s.name,
  );

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState<FormState>({
    projectType: scopeNames[0] ?? "",
    budget: "",
    timeline: scopeWeeks ? "As soon as possible" : "",
    name: "",
    email: "",
    message: scopeNames.length
      ? `Scope built on the site: ${scopeNames.join(", ")}.` +
        (scopeWeeks ? ` Indicative timeline ${scopeWeeks} weeks.` : "") +
        "\n\n"
      : "",
    company: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const detailsValid =
    form.name.trim().length > 1 && emailValid && form.message.trim().length > 9;

  const canAdvance = [
    Boolean(form.projectType),
    Boolean(form.budget),
    Boolean(form.timeline),
    detailsValid,
  ][step];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!detailsValid || !configured) return;

    // Honeypot: a real user never fills a field they cannot see. Silently
    // succeed rather than telling a bot what tripped it.
    if (form.company) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          projectType: form.projectType,
          budget: form.budget,
          timeline: form.timeline,
          scope: scopeNames.join(", ") || "—",
          estimatedWeeks: scopeWeeks ?? "—",
        }),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      const data = await res.json().catch(() => null);
      setErrorMessage(
        data?.errors?.[0]?.message ??
          `The form service returned ${res.status}. Your message was not sent.`,
      );
      setStatus("error");
    } catch {
      setErrorMessage(
        "We couldn't reach the form service. Check your connection and try again.",
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-blue/40 bg-ink-raised p-8 md:p-10">
        <p className="mono text-blue">Sent</p>
        <h2 className="display mt-4 text-step-3">
          That’s with us. <em>We’ll reply within two working days</em>
        </h2>
        <p className="mt-4 max-w-[52ch] text-step--1 text-content-dim">
          If it’s urgent, email {SITE.email} directly and put “urgent” in the
          subject line — that one we watch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      {/* interlocking progress bar */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="mono text-content-dim">
            Step {String(step + 1).padStart(2, "0")} /{" "}
            {String(STEPS.length).padStart(2, "0")} — {STEPS[step]}
          </p>
          {scopeNames.length ? (
            <p className="mono text-blue">
              Scope loaded — {scopeNames.length} services
            </p>
          ) : null}
        </div>
        <ol className="mt-3 flex gap-1.5">
          {STEPS.map((label, i) => (
            <li key={label} className="relative flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-blue" : "bg-rule"
                }`}
              />
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-blue" : "bg-rule"
                  }`}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {step === 0 ? (
            <Choices
              legend="What kind of project is it?"
              options={PROJECT_TYPES}
              value={form.projectType}
              onChange={(v) => set("projectType", v)}
            />
          ) : null}
          {step === 1 ? (
            <Choices
              legend="Roughly what budget?"
              hint="A range is fine. It tells us what shape of team to propose."
              options={BUDGETS}
              value={form.budget}
              onChange={(v) => set("budget", v)}
            />
          ) : null}
          {step === 2 ? (
            <Choices
              legend="When do you need it?"
              options={TIMELINES}
              value={form.timeline}
              onChange={(v) => set("timeline", v)}
            />
          ) : null}
          {step === 3 ? (
            <fieldset className="grid gap-5">
              <legend className="display text-step-2">
                Who are we talking to?
              </legend>

              <Field
                label="Name"
                id="name"
                value={form.name}
                onChange={(v) => set("name", v)}
                error={
                  touched && form.name.trim().length < 2
                    ? "Enter your name so we know who to reply to."
                    : null
                }
              />
              <Field
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                error={
                  touched && !emailValid
                    ? "That doesn't look like an email address — check for a typo."
                    : null
                }
              />

              <div className="grid gap-2">
                <label htmlFor="message" className="mono text-content-dim">
                  What are you trying to do?
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className="rounded-lg border border-rule bg-ink-raised px-4 py-3 text-step-0 outline-none transition-colors focus:border-blue"
                />
                {touched && form.message.trim().length < 10 ? (
                  <p className="mono text-coral">
                    A sentence or two is enough — we just need somewhere to start.
                  </p>
                ) : null}
              </div>

              {/* honeypot — hidden from people, not from bots */}
              <div aria-hidden="true" className="absolute -left-[9999px]">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
            </fieldset>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* not-configured state — never pretend to send */}
      {!configured ? (
        <div className="rounded-lg border border-coral/50 bg-ink-raised p-5">
          <p className="mono text-coral">Form not configured</p>
          <p className="mt-2 max-w-[56ch] text-step--1 text-content-dim">
            <code className="mono">NEXT_PUBLIC_FORMSPREE_ID</code> isn’t set, so
            this form can’t deliver anything and submitting is disabled. Add it
            to <code className="mono">.env.local</code> — see{" "}
            <code className="mono">.env.example</code>. In the meantime, email{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-blue underline underline-offset-4"
            >
              {SITE.email}
            </a>
            .
          </p>
        </div>
      ) : null}

      {status === "error" && errorMessage ? (
        <div role="alert" className="rounded-lg border border-coral/50 p-5">
          <p className="mono text-coral">Not sent</p>
          <p className="mt-2 text-step--1 text-content-dim">{errorMessage}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="mono rounded-full border border-rule px-5 py-3 transition-colors hover:border-blue hover:text-blue"
          >
            Back
          </button>
        ) : null}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="mono rounded-full border border-rule px-6 py-3 transition-colors enabled:hover:border-blue enabled:hover:text-blue disabled:opacity-40"
          >
            {canAdvance ? "Next" : `Choose a ${STEPS[step].toLowerCase()}`}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!configured || status === "submitting"}
            className="mono rounded-full bg-coral px-6 py-3 text-ink transition-colors enabled:hover:bg-paper disabled:cursor-not-allowed disabled:bg-ink-raised disabled:text-content-dim"
          >
            {status === "submitting"
              ? "Sending…"
              : configured
                ? "Send it"
                : "Sending unavailable"}
          </button>
        )}
      </div>
    </form>
  );
}

function Choices({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="display text-step-2">{legend}</legend>
      {hint ? (
        <p className="mt-2 text-step--1 text-content-dim">{hint}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={on}
              className={`mono rounded-full border px-5 py-3 transition-colors ${
                on
                  ? "border-blue text-blue"
                  : "border-rule text-content-dim hover:border-blue hover:text-blue"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string | null;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="mono text-content-dim">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-lg border bg-ink-raised px-4 py-3 text-step-0 outline-none transition-colors focus:border-blue ${
          error ? "border-coral" : "border-rule"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mono text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ContactForm;
