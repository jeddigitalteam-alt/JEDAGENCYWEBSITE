"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SERVICES, estimateScope } from "@/lib/services";
import { SITE } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Derived from the live service list, so a service added or removed in
   lib/services.ts changes these options and nothing has to be remembered here.
   "Motion or video" was hardcoded in this array and outlived the service it
   named by several passes — which is the argument for deriving it. */
const PROJECT_TYPES = [...SERVICES.map((s) => s.name), "Something else"];

/** Where Netlify's crawler found the form definitions. See public/__forms.html. */
const NETLIFY_ENDPOINT = "/__forms.html";

/** The two forms this component can submit as. */
const FORM_CONTACT = "puzzle-contact";
const FORM_SCOPE = "puzzle-scope-enquiry";
const TIMELINES = [
  "As soon as possible",
  "Next quarter",
  "In 6 months",
  "Just exploring",
];

/* Every step index, the progress readout, the dots and the next/back buttons
   all derive from this array, so a stage is added or removed here and nowhere
   else. We do not ask about budget. */
const STEPS = ["Project", "Timeline", "Details"] as const;

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  /**
   * One or more services. Multi-select: a project is rarely one discipline,
   * and the scope board next door has always let people pick several — this
   * step used to hold a single string, which quietly dropped everything after
   * the first when a scope arrived from there.
   */
  projectTypes: string[];
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  /**
   * Netlify's honeypot. `company` used to play this role and is now a field
   * people actually fill in, so the trap moved to the name Netlify expects.
   */
  botField: string;
}

export function ContactForm() {
  const reduced = useReducedMotion();
  const searchParams = useSearchParams();

  // Scope handed over from the services board.
  const scopeSlugs = useMemo(
    () => (searchParams.get("scope") ?? "").split(",").filter(Boolean),
    [searchParams],
  );
  const scopeNames = SERVICES.filter((s) => scopeSlugs.includes(s.slug)).map(
    (s) => s.name,
  );
  /* Recomputed here rather than read from the query string. The board puts
     `weeks` in the URL, but recalculating from the slugs means the figure in
     the enquiry can never disagree with the one on the board — and cannot be
     edited by changing the address bar. */
  const estimate = useMemo(() => estimateScope(scopeSlugs), [scopeSlugs]);
  const scopeWeeks = estimate.mid ? String(estimate.mid) : "";
  const scopeRange = estimate.label;

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  /* A scope in the query string is what makes this a scope enquiry — the same
     visible form, submitted under the other name, so Netlify shows the two
     apart without a second copy of the UI existing anywhere. */
  const isScopeEnquiry = scopeNames.length > 0;
  const formName = isScopeEnquiry ? FORM_SCOPE : FORM_CONTACT;

  const [form, setForm] = useState<FormState>({
    /* Every service the board sent, not `scopeNames[0]`. A scope of three
       arrived here and became one. */
    projectTypes: scopeNames,
    timeline: scopeWeeks ? "As soon as possible" : "",
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    message: scopeNames.length
      ? `Scope built on the site: ${scopeNames.join(", ")}.` +
        (scopeRange !== "—" ? ` Estimated delivery ${scopeRange}.` : "") +
        "\n\n"
      : "",
    botField: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* Add or remove one service, leaving the rest alone. Selections live in
     `form`, which outlives the step, so going back and forward keeps them. */
  const toggleProjectType = (option: string) =>
    setForm((f) => ({
      ...f,
      projectTypes: f.projectTypes.includes(option)
        ? f.projectTypes.filter((p) => p !== option)
        : [...f.projectTypes, option],
    }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const detailsValid =
    form.firstName.trim().length > 1 &&
    form.lastName.trim().length > 0 &&
    emailValid &&
    form.message.trim().length > 9;

  const canAdvance = [
    form.projectTypes.length > 0,
    Boolean(form.timeline),
    detailsValid,
  ][step];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!detailsValid) return;
    // Guard rather than rely on the disabled attribute: a double-click can land
    // a second submit before React has re-rendered the button.
    if (status === "submitting") return;

    // Honeypot: a real user never fills a field they cannot see. Silently
    // succeed rather than telling a bot what tripped it.
    if (form.botField) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    /* Netlify wants URL-encoded form data, not JSON, and it wants `form-name`
       in the body — that is how it decides which of the two declared forms a
       submission belongs to. `URLSearchParams` does the encoding, including
       the newlines in the message and the commas in the scope. */
    const who = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");
    const payload: Record<string, string> = {
      "form-name": formName,
      /* Netlify uses a `subject` field to title the notification email. Company
         where there is one, person where there is not, so the inbox is
         readable without opening anything. */
      subject: `New Puzzle ${isScopeEnquiry ? "scope enquiry" : "enquiry"} — ${
        form.company.trim() || who || "no name given"
      }`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      /* Joined into the one `projectType` field Netlify already declares in
         public/__forms.html — a field submitted but not declared there is
         dropped silently, so this stays a single readable string rather than
         becoming a second field nobody registered. */
      projectType: form.projectTypes.join(", "),
      timeline: form.timeline,
      message: form.message.trim(),
    };
    if (isScopeEnquiry) {
      // Readable service names, never slugs — this is what a person reads in
      // the Netlify dashboard.
      payload.scope = scopeNames.join(", ");
      /* Two fields on purpose. `estimatedWeeks` stays a single integer so the
         existing Netlify column keeps working and nothing already submitted
         becomes unreadable; `estimatedRange` is the honest window, which is
         what a person actually reads in the dashboard. */
      payload.estimatedWeeks = scopeWeeks ?? "";
      payload.estimatedRange = scopeRange;
    }

    try {
      const res = await fetch(NETLIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }
      setErrorMessage(
        `The form returned ${res.status}. Your enquiry was not sent.`,
      );
      setStatus("error");
    } catch {
      setErrorMessage(
        "We couldn't reach the form. Check your connection and try again.",
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-blue/40 bg-ink-raised p-8 md:p-10">
        <p className="mono text-blue">
          {isScopeEnquiry ? "Scope sent" : "Enquiry sent"}
        </p>
        <h2 className="display mt-4 text-step-3">
          {isScopeEnquiry ? (
            <>
              We’ve got your scope. <em>We’ll take a look and come back to you</em>
            </>
          ) : (
            <>
              We’ve got it. <em>We’ll take a look and come back to you</em>
            </>
          )}
        </h2>
        {/* No promised turnaround — nothing on this site commits to one. */}
        <p className="mt-4 max-w-[52ch] text-step--1 text-content-dim">
          If you need to add anything, reply to{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-blue underline underline-offset-4"
          >
            {SITE.email}
          </a>
          .
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
              hint="Pick as many as apply."
              options={PROJECT_TYPES}
              selected={(o) => form.projectTypes.includes(o)}
              onSelect={toggleProjectType}
            />
          ) : null}
          {step === 1 ? (
            <Choices
              legend="When do you need it?"
              options={TIMELINES}
              selected={(o) => form.timeline === o}
              onSelect={(v) => set("timeline", v)}
            />
          ) : null}
          {step === 2 ? (
            <fieldset className="grid gap-5">
              <legend className="display text-step-2">
                Who are we talking to?
              </legend>

              {/* Two across from `sm`. The single name field became two, and
                  company and phone are new — six stacked inputs would have made
                  this step twice as long as the two before it. Same Field
                  component, same styling. */}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First name"
                  id="firstName"
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  error={
                    touched && form.firstName.trim().length < 2
                      ? "Enter your first name so we know who to reply to."
                      : null
                  }
                />
                <Field
                  label="Last name"
                  id="lastName"
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  error={
                    touched && form.lastName.trim().length < 1
                      ? "And your last name."
                      : null
                  }
                />
              </div>

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

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Company (optional)"
                  id="company"
                  value={form.company}
                  onChange={(v) => set("company", v)}
                />
                <Field
                  label="Phone (optional)"
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                />
              </div>

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

              {/* Netlify's honeypot — hidden from people, not from bots.
                  Named `bot-field` to match `data-netlify-honeypot` in
                  public/__forms.html; the two must agree.

                  It used to be named `company`, which was fine while company
                  was not a real field. It is one now, so leaving the trap on
                  that name would have meant every visitor who filled in their
                  company tripped the honeypot and had their enquiry silently
                  dropped. Off-screen rather than `display:none`, so a bot that
                  fills every input still trips it. */}
              <div aria-hidden="true" className="absolute -left-[9999px]">
                <label htmlFor="bot-field">Do not fill this in</label>
                <input
                  id="bot-field"
                  name="bot-field"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.botField}
                  onChange={(e) => set("botField", e.target.value)}
                />
              </div>
            </fieldset>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* No "not configured" banner. There is no key to set any more: the form
          posts to Netlify, which processes it in the deployed environment.
          Under plain `npm run dev` nothing is listening behind /__forms.html,
          so a submission lands in the error state below — honest locally, and
          never seen by a visitor on the deployed site. `netlify dev` runs the
          handler locally if you want to exercise it end to end. */}

      {status === "error" && errorMessage ? (
        <div role="alert" className="rounded-lg border border-coral/50 p-5">
          <p className="mono text-coral">Not sent</p>
          <p className="mt-2 max-w-[56ch] text-step--1 text-content-dim">
            Something went wrong sending your enquiry. Please try again, or
            email us at{" "}
            {/* From the central config — nothing here knows the address. */}
            <a
              href={`mailto:${SITE.email}`}
              className="text-blue underline underline-offset-4"
            >
              {SITE.email}
            </a>
            .
          </p>
          {/* The technical detail second, and quieter — useful to us, not to
              the person trying to get in touch. */}
          {errorMessage ? (
            <p className="mono mt-3 text-content-dim">{errorMessage}</p>
          ) : null}
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
            disabled={status === "submitting"}
            className="mono rounded-full bg-blue px-6 py-3 text-ink transition-colors enabled:hover:bg-blue-lift enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink-raised disabled:text-content-dim"
          >
            {status === "submitting"
              ? "Sending…"
              : isScopeEnquiry
                ? "Send my scope"
                : "Send enquiry"}
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * A row of toggle buttons.
 *
 * Selection is expressed as a predicate rather than a value so one component
 * serves both the single-choice step (timeline) and the multi-choice one
 * (services) with ONE set of classes — the selected treatment cannot drift
 * between the two, which is what a second copy of this would have risked.
 * `aria-pressed` was already the right semantics for both.
 */
function Choices({
  legend,
  hint,
  options,
  selected,
  onSelect,
}: {
  legend: string;
  hint?: string;
  options: string[];
  selected: (option: string) => boolean;
  onSelect: (option: string) => void;
}) {
  return (
    <fieldset>
      <legend className="display text-step-2">{legend}</legend>
      {hint ? (
        <p className="mt-2 text-step--1 text-content-dim">{hint}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {options.map((o) => {
          const on = selected(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onSelect(o)}
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
