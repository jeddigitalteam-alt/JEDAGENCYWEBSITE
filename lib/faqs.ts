/**
 * FAQ content, per page.
 *
 * One place for all of it so the accordion stays a presentation component and
 * the writing lives with the rest of the site's copy. Keyed by service slug,
 * plus `about` for the About page.
 *
 * These are written to answer questions people actually type, which is the only
 * SEO worth having here — the visible text and the `FAQPage` structured data
 * are generated from the same array, so there is nothing in the schema that a
 * reader cannot also see on the page. Every answer is two to four sentences;
 * anything longer belongs in the chapters above it.
 *
 * Nothing here claims a timescale, a price, a client count or a result the rest
 * of the site cannot support. Where the honest answer is "it depends on scope",
 * that is what it says.
 */
export interface Faq {
  q: string;
  a: string;
}

export const ABOUT_FAQS: Faq[] = [
  {
    q: "What does Puzzle do?",
    a: "We are an independent UK creative and digital agency working across brand identity, web design and development, UX and UI design, digital product design and AI design. Most projects use two or three of those together rather than one in isolation. The common thread is that the work is judged by whether it does the job it was made for.",
  },
  {
    q: "Why work with a newly founded agency?",
    a: "Because our reputation is being built right now, on this work. A newer studio has no back catalogue to coast on and no incentive to hand your project to whoever is free — which tends to mean more attention, more directness, and more interest in whether the thing actually worked after launch.",
  },
  {
    q: "Where is Puzzle based?",
    a: "Hampshire, in the UK. We work with clients across the country and remotely, and we are happy to meet in person where it genuinely helps — usually at the start, when the brief is still being shaped.",
  },
  {
    q: "What types of businesses do you work with?",
    a: "Businesses with something real to build and a reason to care how it performs, rather than a particular size or sector. Our published work spans ecommerce, B2B machinery and made-to-measure manufacturing. What matters more than the industry is whether design genuinely changes whether people understand you, trust you or come back.",
  },
  {
    q: "Can Puzzle work alongside our existing team?",
    a: "Yes, and it is often the better arrangement. We work with in-house marketing, product and development teams as the discipline they are missing rather than a replacement for the ones they have. That means sitting close enough to understand how your team actually works while staying outside it enough to ask useful questions.",
  },
  {
    q: "How does a project with Puzzle start?",
    a: "With a conversation about the problem rather than the deliverable. We would rather spend the first week making the brief sharper than the last month building the wrong thing well. If you already know the shape of the work, the scope builder on the services page is a quicker way in.",
  },
  {
    q: "Do you offer ongoing design support?",
    a: "Yes — a retainer is a fixed number of days a month pointed at whatever is most useful, across any of our disciplines. It suits teams with a steady stream of work rather than one defined project. If you need one website and then nothing for a year, a project is the honest answer and costs less.",
  },
];

/** Keyed by service slug. Every active service has its own set. */
export const SERVICE_FAQS: Record<string, Faq[]> = {
  "web-design-development": [
    {
      q: "What does a web design project include?",
      a: "Structure and content planning, art direction, page design across the full breakpoint range, the build itself, integration and launch. The published phase breakdown on this page shows how a typical engagement is shaped. Design and development are one piece of work here rather than two handovers.",
    },
    {
      q: "Do you design and develop websites, or just design them?",
      a: "Both, and the same people do both. That removes the handover document, which is where most of the detail in a design usually goes missing. It also means what gets designed is something we already know how to build.",
    },
    {
      q: "Will our website work properly on mobile?",
      a: "Yes. We design against real content at real widths rather than designing a desktop layout and squeezing it afterwards. A layout that only holds at 1440px with copy nobody has written yet is a picture of a design rather than a design.",
    },
    {
      q: "Can you redesign an existing website?",
      a: "Yes, and it is a common starting point. We would begin by working out which parts are genuinely underperforming and which are simply out of fashion, because those are not the same problem. Sometimes the answer is a rebuild and sometimes it is a much smaller intervention.",
    },
    {
      q: "Do you build SEO-friendly websites?",
      a: "We build on clean semantic structure, sensible heading hierarchy, fast page loads, real metadata and accessible markup, which is the technical foundation search engines reward. We are not an SEO agency and will not promise rankings. What we will do is make sure the build is not the thing holding you back.",
    },
    {
      q: "Can you support the website after launch?",
      a: "Yes, either as an agreed period of support or through a retainer if the work continues. The interesting problems usually arrive once real people are using the thing, which is exactly when most engagements end.",
    },
    {
      q: "How long does a website project take?",
      a: "It depends on scope — the number of templates, how much content exists already, and how many people need to approve things. The phase breakdown published on this page is a realistic shape for a project of that size, and we will give you a specific schedule once we know what is actually involved.",
    },
  ],
  "ux-ui-design": [
    {
      q: "What is UX and UI design?",
      a: "UX design is the structure: what the product is for, what someone is trying to finish, and the order those steps actually happen in. UI design is the surface that makes that structure legible — hierarchy, type, spacing, states and behaviour. They are two halves of the same job and we do not separate them.",
    },
    {
      q: "What is the difference between UX and UI?",
      a: "UX decides what should be on the screen and why; UI decides how it reads and behaves. A product can have handsome UI and still be exhausting to use if the structure underneath it is wrong. You can style a confused structure indefinitely and never fix it.",
    },
    {
      q: "Can Puzzle improve an existing product?",
      a: "Yes. That usually starts with an audit of the journeys that matter most and where people are dropping out of them. Targeted work on a few high-traffic flows often changes more than a full redesign, and costs considerably less.",
    },
    {
      q: "Do you create prototypes?",
      a: "Yes. A flow that reads well as a diagram can still be wrong to use, and the cheapest place to find that out is something clickable rather than something built. Prototypes go in front of people with real content and real edge cases, at the widths they will actually be used at.",
    },
    {
      q: "Do you create design systems?",
      a: "Yes — components with their states defined, spacing and type that hold at every width, and rules specific enough to actually follow. The point is that the design survives people who were not in the room when it was made.",
    },
    {
      q: "Can you work with our developers?",
      a: "Yes. We hand over components with their states, behaviour and breakpoints specified, and we stay close enough during the build to answer the questions that always come up. Where you would rather we built it too, we can.",
    },
    {
      q: "How do you test design decisions?",
      a: "By putting the real thing in front of people early — real content, real lengths, real edge cases — rather than relying on opinion in a review meeting. Placeholder copy hides every problem worth finding. What comes back changes the design while changing it is still cheap.",
    },
  ],
  "digital-product-design": [
    {
      q: "What is digital product design?",
      a: "Designing something people use repeatedly rather than visit once — an app, a dashboard, a tool, a platform. It covers product structure, user journeys, interface design, feedback states and the system that keeps it consistent as it grows. The tenth screen matters more than the first.",
    },
    {
      q: "Can you design an MVP?",
      a: "Yes, and the useful discipline there is deciding what genuinely has to exist in version one. We would rather help you ship a smaller thing that works properly than a larger thing that is half-finished everywhere. Prototyping before the expensive decisions is the point.",
    },
    {
      q: "Can you improve an existing digital product?",
      a: "Yes. Products accumulate decisions, and after a few years the structure often no longer matches what people actually do with it. We start by mapping the real journeys and the points where they break down, then work on the ones that matter most.",
    },
    {
      q: "Do you prototype before development starts?",
      a: "Yes — built with real content, at real widths, and put in front of people before the build starts. After development begins, the same finding costs a fortnight and an awkward conversation.",
    },
    {
      q: "Can you work with our product or development team?",
      a: "Yes. We work alongside in-house product and engineering teams regularly, usually as the design capability they do not have permanently on staff. Staying close to the build is how the quality survives the gap between the design file and the shipped product.",
    },
    {
      q: "Do you build design systems?",
      a: "Yes — a component library with empty, loading and error states defined, plus the spacing and type rules that keep it coherent. Products keep going, and the design has to survive features arriving and teams changing.",
    },
    {
      q: "What happens before visual design begins?",
      a: "Discovery and structure. What the product is for, what a person is actually trying to finish, and the order those steps genuinely happen in — then hierarchy falls out of that. Skipping it produces products that look considered and feel exhausting.",
    },
  ],
  "brand-identity": [
    {
      q: "What does a brand identity project include?",
      a: "Positioning and messaging, the wordmark and its lockups, a type system, a colour system with contrast documented, and the usage rules and templates that keep it intact. The published phase breakdown on this page shows how the work is shaped. The deliverable is a system, not a logo file.",
    },
    {
      q: "Is brand identity more than a logo?",
      a: "Considerably. The mark matters, but what decides whether an identity holds together is everything around it — the type, the spacing, the colour rules and the templates somebody reaches for at eleven at night. Most identities fail in month seven, not week one.",
    },
    {
      q: "Can Puzzle refresh an existing identity?",
      a: "Yes. Sometimes the mark is fine and the system around it never existed, in which case a refresh is mostly a matter of building the rules that were missing. We would work out which of the two problems you actually have before proposing to redraw anything.",
    },
    {
      q: "Do you create brand guidelines?",
      a: "Yes, written to be used rather than admired. Not a hundred pages nobody opens — the decisions that come up every week, answered clearly enough that a new person makes the right one without having to ask.",
    },
    {
      q: "Can the identity extend into websites and digital products?",
      a: "Yes, and it should. Because we also design and build websites and products, the identity gets tested against real screens rather than only against print mockups. That tends to catch the things that look fine in a presentation and fall apart in an interface.",
    },
    {
      q: "How do you decide on a visual direction?",
      a: "By narrowing rather than guessing. Audit and positioning first, then a small number of genuinely different territories, then refinement of the one that fits — so the choice is made against real alternatives instead of a single option presented as inevitable.",
    },
    {
      q: "Can you help launch the new identity?",
      a: "Yes. Rollout is usually where identities are won or lost, so we plan for the applications that matter most to you and provide the templates your team will use straight away.",
    },
  ],
  "ai-design": [
    {
      q: "What is AI design?",
      a: "Two related things: using AI within the creative process to explore more directions faster, and designing the products and interfaces that sit on top of AI models. Both appear on this page because they are the same argument from either end — a model produces more than it judges.",
    },
    {
      q: "How does Puzzle use AI in the creative process?",
      a: "To make more ideas visible before committing to one. A direction that used to take a day to visualise takes an hour, so it gets visualised instead of described in a meeting and quietly dropped. The shortlist gets wider before it gets narrower.",
    },
    {
      q: "Does AI replace the designer?",
      a: "No. A model will return two hundred variations in an afternoon and hold no opinion about any of them. Deciding what is relevant, what sounds like the brand and what to throw away is the part that has not been automated, and it is where the design work has moved.",
    },
    {
      q: "Can AI-generated work still feel distinctive?",
      a: "Only with editing. Most of what a model returns is average by construction — it is drawn from everything, so it lands in the middle of everything. Average is the one thing a brand cannot afford, so the ratio of generating to selecting matters more than the volume.",
    },
    {
      q: "How do you maintain creative quality when using AI?",
      a: "By treating generation as the cheap half and judgement as the expensive one. Work is still made properly once a direction is chosen; what changes is that the choice is made against fifteen options instead of three. Anything that only ever looked like somebody's first instinct gets found out early.",
    },
    {
      q: "Where can AI accelerate a design project?",
      a: "On the repetitive parts — first-pass variations, carrying a system across formats, organising research into something readable, standing up a prototype quickly enough to be worth testing. It earns nothing by being added to a stage that already worked.",
    },
    {
      q: "Can AI be built into digital product experiences?",
      a: "Yes, and it is a different design problem from a conventional interface. Output is not deterministic, so the design has to show what the system can and cannot do, show that it is working, make results correctable, and make confidence legible. A system that never admits doubt teaches people to trust everything or nothing.",
    },
  ],
  retainer: [
    {
      q: "What is a design retainer?",
      a: "A standing arrangement: a fixed number of days a month with the same team, pointed at whatever is most useful. It removes the scoping round in front of every small piece of work, and it keeps the context that a project relationship throws away at the end.",
    },
    {
      q: "Who is a Puzzle retainer best suited to?",
      a: "Teams with a steady stream of design work rather than one defined thing — an in-house marketing or product team that needs capacity it does not have, or a business changing quickly enough that the work never really stops. It also suits anyone tired of sourcing and briefing somebody new every quarter.",
    },
    {
      q: "What kind of work can be included?",
      a: "Anything across our disciplines: brand, web design and development, UX and UI, digital product design, AI design and campaign work. Requirements rarely stay in one place for long, and the arrangement is designed to follow them.",
    },
    {
      q: "How is a retainer different from a fixed project?",
      a: "A project starts by explaining everything and ends when the deliverable ships. A retainer starts where the last conversation finished, so each brief begins further along than the one before it. The trade is that a retainer only pays for itself where the context has something to accumulate into.",
    },
    {
      q: "Can priorities change during the retainer?",
      a: "Yes — that is most of the point. The days get pointed wherever they are most useful that month, decided between us rather than fixed in advance. Every quarter we look back at what those days actually bought and change where they go if the answer is unconvincing.",
    },
    {
      q: "Can Puzzle work with our internal team?",
      a: "Yes. The useful position is close enough to the business to know how it really works, and far enough outside it to still notice what everybody internal has stopped seeing. In practice that means being on the board and in the standing call, and still asking why a thing is being done at all.",
    },
    {
      q: "How do we know whether a retainer is right for us?",
      a: "If the next brief is already forming while the current one is being signed off, that is the signal. If you need one identity or one site and then nothing for eighteen months, a project is the honest answer and costs less. Tell us what the year looks like and we will say which shape fits.",
    },
  ],
};
