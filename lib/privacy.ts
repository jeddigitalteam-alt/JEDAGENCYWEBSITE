/**
 * Privacy Policy, as data — the same shape as `lib/terms.ts`, so amending a
 * section is a change to this file alone.
 *
 * Written against what the site actually does, and nothing it does not:
 *
 *   - the enquiry fields are the ones declared in `public/__forms.html`, which
 *     Netlify Forms processes;
 *   - analytics is the single GA4 tag in `app/layout.tsx`, behind the Consent
 *     Mode defaults in `lib/consent.ts`;
 *   - fonts are self-hosted through `next/font`, so no font request reaches a
 *     third party and none is listed here.
 *
 * No company number, ICO registration or street address appears, because none
 * exists anywhere in the project. Add them here if Puzzle supplies them.
 *
 * Inline tokens, replaced at render time by `app/privacy/page.tsx`:
 *   `{EMAIL}`            a `mailto:` link built from `SITE.email`
 *   `{COOKIE_SETTINGS}`  a button that reopens the consent panel
 *   `[label](href)`      a link — internal paths use next/link
 */

import type { TermsBlock, TermsSection } from "./terms";

export type PrivacyBlock = TermsBlock;
export type PrivacySection = TermsSection;

/** Shown under the heading. Change it whenever the policy changes. */
export const PRIVACY_UPDATED = "14 September 2026";

export const PRIVACY: PrivacySection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    blocks: [
      {
        kind: "p",
        text: "This policy explains how Puzzle Studios (‘Puzzle’, ‘we’, ‘us’ and ‘our’) collects and uses personal information when you visit puzzlestudios.co.uk or get in touch with us. We are a design studio based in Hampshire, United Kingdom, and we are responsible for the personal information described here.",
      },
      {
        kind: "p",
        text: "If you have any questions about this policy or how we handle your information, email us at {EMAIL}.",
      },
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    blocks: [
      {
        kind: "p",
        text: "When you send an enquiry through our contact form or the project scope builder, we collect the details you choose to give us. Depending on the form, that can include:",
      },
      {
        kind: "list",
        items: [
          "Your first and last name",
          "Your email address",
          "Your phone number",
          "Your company or organisation",
          "The type of project and the timeline you have in mind",
          "Your message, and anything else you tell us about your project",
          "The services you selected in the scope builder, and the estimated duration and budget range it produced",
        ],
      },
      {
        kind: "p",
        text: "If you contact us directly by email, phone or WhatsApp, we receive whatever you send us through that channel, along with your contact details.",
      },
      {
        kind: "p",
        text: "When you visit the site, our hosting provider automatically processes technical information such as your IP address, browser type and the pages requested. This is needed to deliver the website to you and keep it secure.",
      },
      {
        kind: "p",
        text: "If, and only if, you accept analytics cookies, Google Analytics collects information about how you use the site. This is explained in full below.",
      },
    ],
  },
  {
    id: "why-we-collect-it",
    heading: "Why we collect it",
    blocks: [
      {
        kind: "p",
        text: "We only use your information for the purposes it was given, and we rely on the following lawful bases under UK data protection law:",
      },
      {
        kind: "list",
        items: [
          "To reply to your enquiry, discuss your project and prepare a quotation — because you have asked us to take these steps before potentially entering into a contract, and because it is in our legitimate interests to respond to people who contact us.",
          "To deliver a project if you become a client — to perform our contract with you, under our [Terms & Conditions](/terms).",
          "To keep records we are required to keep, such as invoices — to comply with our legal obligations.",
          "To operate the website securely and prevent abuse, including spam form submissions — in our legitimate interests.",
          "To understand how the website is used and improve it with Google Analytics — only with your consent.",
        ],
      },
      {
        kind: "p",
        text: "We do not sell your personal information, and we will not add you to a marketing mailing list because you sent an enquiry.",
      },
    ],
  },
  {
    id: "how-enquiries-are-handled",
    heading: "How enquiries are handled",
    blocks: [
      {
        kind: "p",
        text: "Our website is hosted by Netlify, and the contact and scope enquiry forms are processed by Netlify Forms. When you submit a form, Netlify stores the submission and forwards it to our enquiries inbox. Form submissions are filtered for spam before they reach us.",
      },
      {
        kind: "p",
        text: "Your enquiry is read by the Puzzle team and used to reply to you, answer your questions and, where you ask for one, put together a quotation. If we go on to work together, we use the information to manage the project and invoice for it.",
      },
    ],
  },
  {
    id: "google-analytics",
    heading: "Google Analytics",
    blocks: [
      {
        kind: "p",
        text: "We use Google Analytics 4, provided by Google, to understand how visitors use our website — for example, which pages are visited, how long people stay, how they arrived at the site, the type of device and browser used, and approximate location at country or city level. This helps us see what is useful and improve the site.",
      },
      {
        kind: "p",
        text: "We use this information in aggregate. We do not use Google Analytics to identify individual visitors, and Google Analytics 4 does not log or store IP addresses. Google Signals is turned off, so your analytics data is not linked to your Google account, and user-provided data collection is turned off, so we do not send Google information such as email addresses or phone numbers. We do not use Google Ads tracking, and analytics data is not used to show you adverts.",
      },
      {
        kind: "p",
        text: "You can read more about how Google uses information from sites that use its services at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).",
      },
    ],
  },
  {
    id: "google-consent-mode",
    heading: "Google Consent Mode",
    blocks: [
      {
        kind: "p",
        text: "Our website uses Google Consent Mode (version 2) to make sure Google’s tag respects your choice. Before Google Analytics processes anything, every consent type is set to ‘denied’:",
      },
      {
        kind: "list",
        items: [
          "analytics_storage — denied until you accept analytics cookies",
          "ad_storage — always denied",
          "ad_user_data — always denied",
          "ad_personalization — always denied",
        ],
      },
      {
        kind: "p",
        text: "If you choose ‘Accept analytics’, only analytics_storage changes to ‘granted’. The three advertising settings remain denied whatever you choose, because this website does not use Google Ads or any other advertising tracking.",
      },
      {
        kind: "p",
        text: "While analytics_storage is denied, no Google Analytics cookies are set and no identifiers are stored on your device. Google’s tag may still send limited, cookieless signals — such as the fact that a page was loaded — which do not identify you and cannot be linked across visits.",
      },
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and similar storage",
    blocks: [
      {
        kind: "p",
        text: "We keep the storage we use on your device to a minimum. Analytics cookies are optional and are only set after you accept them.",
      },
      {
        kind: "list",
        items: [
          "puzzle:consent (browser local storage, strictly necessary) — remembers whether you accepted or rejected analytics cookies, so we do not ask on every page. It stays until you change your choice or clear your browser storage.",
          "puzzle:intro-seen (browser session storage, strictly necessary) — remembers that the opening animation has already played during your visit. It is deleted when you close the tab.",
          "_ga (Google Analytics cookie, optional) — distinguishes one visitor from another. Set only if you accept analytics cookies, and expires after up to 2 years.",
          "_ga_HZ6V0BP7HR (Google Analytics cookie, optional) — keeps track of your session. Set only if you accept analytics cookies, and expires after up to 2 years.",
        ],
      },
      {
        kind: "p",
        text: "We do not use advertising, social media tracking or cross-site profiling cookies.",
      },
    ],
  },
  {
    id: "changing-your-cookie-choice",
    heading: "Changing your cookie choice",
    blocks: [
      {
        kind: "p",
        text: "You can change or withdraw your consent at any time. Use {COOKIE_SETTINGS} — also available at the bottom of every page — and choose ‘Reject optional cookies’ or ‘Accept analytics’.",
      },
      {
        kind: "p",
        text: "If you withdraw consent, analytics_storage is set back to denied straight away and the Google Analytics cookies this site set on your device are removed. Withdrawing consent does not affect any analytics collected before you changed your mind.",
      },
      {
        kind: "p",
        text: "You can also block or delete cookies through your browser settings, or install Google’s opt-out browser add-on from [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout).",
      },
    ],
  },
  {
    id: "sharing-your-information",
    heading: "Who we share information with",
    blocks: [
      {
        kind: "p",
        text: "We only share personal information with service providers who help us run the website and our business, and only as far as they need it:",
      },
      {
        kind: "list",
        items: [
          "Netlify — website hosting and processing of enquiry form submissions.",
          "Google — website analytics, only if you accept analytics cookies.",
          "Our email provider — to receive and reply to enquiries.",
          "WhatsApp (Meta) — only if you choose to contact us through WhatsApp.",
        ],
      },
      {
        kind: "p",
        text: "We may also disclose information where the law requires us to. We never sell or rent personal information.",
      },
    ],
  },
  {
    id: "international-transfers",
    heading: "International transfers",
    blocks: [
      {
        kind: "p",
        text: "Some of our service providers, including Netlify and Google, may process information outside the United Kingdom, including in the United States. Where that happens, the transfer is protected by safeguards recognised under UK data protection law, such as the UK Extension to the EU–US Data Privacy Framework or the UK International Data Transfer Addendum to standard contractual clauses.",
      },
    ],
  },
  {
    id: "how-long-we-keep-it",
    heading: "How long we keep information",
    blocks: [
      {
        kind: "p",
        text: "We keep personal information only for as long as is reasonably necessary for the purposes we collected it for, including meeting any legal, accounting or reporting requirements. When deciding how long to keep information, we consider what it is, why we hold it, whether we still need it, and any legal obligations that apply.",
      },
      {
        kind: "list",
        items: [
          "Enquiries — we keep your enquiry and our correspondence for as long as we need them to respond to you, discuss your project and follow up on it. When they are no longer needed, we delete them.",
          "Client and project records — we keep these while we are working together and afterwards for as long as is reasonably necessary. Some business and transaction records, such as invoices and payment records, may need to be kept for longer to meet legal, tax or accounting obligations.",
          "Google Analytics event data — kept for 2 months, after which Google deletes it automatically.",
          "Google Analytics user data — data associated with the analytics cookie identifier is kept for 14 months. If you visit the site again during that time, the 14-month period restarts from your latest activity. After that, Google deletes it automatically. Aggregated reports that do not identify you, such as total monthly page views, are not affected by these periods.",
          "Your cookie choice — until you change it or clear your browser storage.",
        ],
      },
      {
        kind: "p",
        text: "You can ask us to delete your information at any time by emailing {EMAIL}. We will do so unless we need to keep it for one of the reasons above.",
      },
    ],
  },
  {
    id: "your-rights",
    heading: "Your data protection rights",
    blocks: [
      {
        kind: "p",
        text: "Under UK data protection law, including the UK GDPR and the Data Protection Act 2018, you have the right to:",
      },
      {
        kind: "list",
        items: [
          "Access — ask for a copy of the personal information we hold about you.",
          "Rectification — ask us to correct information that is inaccurate or incomplete.",
          "Erasure — ask us to delete your information.",
          "Restriction — ask us to limit how we use your information.",
          "Objection — object to us using your information where we rely on legitimate interests.",
          "Portability — ask for information you gave us in a portable format, or for it to be sent to another organisation.",
          "Withdraw consent — where we rely on your consent, such as for analytics cookies, withdraw it at any time.",
        ],
      },
      {
        kind: "p",
        text: "To exercise any of these rights, email {EMAIL}. We may need to confirm your identity before acting on a request. There is normally no charge, and we will respond within one month.",
      },
      {
        kind: "note",
        text: "If you are unhappy with how we have handled your information, you have the right to complain to the Information Commissioner’s Office (ICO), the UK’s data protection regulator, at [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint/) or on 0303 123 1113. We would appreciate the chance to put things right first, so please contact us before going to the ICO.",
      },
    ],
  },
  {
    id: "changes-to-this-policy",
    heading: "Changes to this policy",
    blocks: [
      {
        kind: "p",
        text: "We may update this policy from time to time, for example if the way our website works changes. The latest version will always be on this page, with the date it was last updated shown at the top.",
      },
    ],
  },
  {
    id: "contact-us",
    heading: "Contact us",
    blocks: [
      {
        kind: "p",
        text: "For any question or request about privacy or your personal information, contact Puzzle Studios at {EMAIL}.",
      },
    ],
  },
];
