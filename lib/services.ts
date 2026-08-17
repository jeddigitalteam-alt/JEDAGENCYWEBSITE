export interface Phase {
  name: string;
  weeks: number;
}

/**
 * One panel of a showcase grid.
 *
 * `src` is a plain lowercase public path. The four files here arrived in
 * `public/work/Puzzle logo&images/` and are served from a copy rather than from
 * where they landed: a literal `&` in a directory name survives `next dev` and
 * fails outright in a production build — 404 on the raw file, and 400 from the
 * image optimiser, which reports the source as "not a valid image". That is the
 * same trap the article artwork hit, and the same answer.
 */
export type ShowcaseMedia =
  | {
      kind: "image";
      src: string;
      alt: string;
      /** The file's own, so the optimiser can pick a source width sensibly. */
      width: number;
      height: number;
      /**
       * Where to take the square crop from, as `object-position`. Only worth
       * setting on a landscape source whose subject is not in the middle —
       * centre is right for most of them, and a value here is a claim that it
       * is not.
       */
      position?: string;
    }
  | {
      kind: "video";
      src: string;
      /**
       * What the clip shows. A <video> has no alt attribute, so this is
       * announced as the element's label instead.
       */
      label: string;
    };

/**
 * A statement, and the argument set in the column beside it.
 *
 * The unit the editorial run on a service page is built from — one is the top
 * half of the showcase, and the rest follow it down the page. Rendered by
 * `ServiceChapter`.
 */
export interface Chapter {
  /** The mono label above it. Omitted where the chapter follows another. */
  eyebrow?: string;
  /** Roman + italic, the site's heading signature. Set at section-heading size. */
  statement: { roman: string; italic: string };
  /** Two to four paragraphs, set in the column beside the statement. */
  body: string[];
}

/**
 * A statement, a short argument beside it, and the work that proves it.
 *
 * Optional and per-service: only the pages with real media to show carry one,
 * and a service without it renders exactly as it did before.
 */
export interface Showcase {
  /** Roman + italic, the site's heading signature. Set at section-heading size. */
  statement: { roman: string; italic: string };
  /** Two or three paragraphs, set in the column beside the statement. */
  body: string[];
  /** Four panels, read left to right then top to bottom. */
  media: ShowcaseMedia[];
  /**
   * Tile ratio for this grid, as a Tailwind aspect class. Square when omitted.
   *
   * Set it where a whole set is landscape: a 1.25:1 source in a square tile
   * loses a fifth of its width to `object-cover`, which reads as the picture
   * being cut off at the edges even though the grid fits its container exactly.
   */
  ratio?: string;
}

export interface Service {
  slug: string;
  name: string;
  /** Nav + card one-liner. Says what you get, not how much we care. */
  summary: string;
  /** Longer intro on the service page. */
  intro: string;
  deliverables: string[];
  phases: Phase[];
  /** Roman/italic split for the service page headline. */
  headline: { roman: string; italic: string };
  /**
   * The editorial block on the service page: a statement, the approach beside
   * it, and a grid of the work. Where a service has one, it carries the
   * argument the hero paragraph used to make — so that paragraph is not
   * rendered as well, and the page opens on the headline alone.
   */
  showcase?: Showcase;
  /**
   * The rest of the editorial run, after the showcase.
   *
   * A service with real ground to cover gets two or three of these between the
   * showcase and the deliverables, so the argument is made in prose rather than
   * as a checklist with the interesting parts left as bullet points. A service
   * without them renders exactly as it did before.
   */
  chapters?: Chapter[];
  /**
   * A coverflow of images set between two chapters, as a visual break.
   *
   * Data rather than a slug special case in the page: `afterChapter` is the
   * index of the chapter it follows, so moving it is a number here and the
   * template stays general. Images only — the component's caption, pagination
   * and navigation are all switched off where it is used, so there is nothing
   * to write for it beyond alt text.
   */
  carousel?: {
    afterChapter: number;
    /** Names the region for assistive tech. Never shown. */
    label: string;
    slides: { src: string; alt: string }[];
  };
  /**
   * Search title and description, where the nav one-liner is not the right
   * thing to hand a search engine. `name` and `summary` are written for a
   * dropdown — short, and assuming you already know it is a design studio —
   * so the pages people actually search for by name say so here instead. The
   * visible copy is never written for this; it is only the metadata.
   */
  metaTitle?: string;
  metaDescription?: string;
  /**
   * Render the page on paper rather than ink.
   *
   * Nothing is restyled to achieve it: `[data-invert]` reassigns the semantic
   * token layer, and every utility already reads from that layer, so the whole
   * page flips on one attribute. What it does need is for the two places that
   * name a raw colour — the phase tiles and the small blue markers — to pick
   * the surface-appropriate value, and for the header sitting over the page to
   * know which surface it is on.
   */
  paper?: boolean;
}

export const SERVICES: Service[] = [
  {
    slug: "brand-identity",
    name: "Brand identity",
    summary: "Naming, marks, type, and the rules that keep them intact.",
    intro:
      "Most identities fail in month seven, not week one — when someone needs a slide template at 11pm and the rules do not cover it. We build identities that survive being used by people who were not in the room.",
    deliverables: [
      "Positioning and messaging framework",
      "Wordmark, monogram and lockups",
      "Type system and scale",
      "Colour system with contrast ratios documented",
      "Usage rules and a working template set",
    ],
    phases: [
      { name: "Audit and positioning", weeks: 2 },
      { name: "Territories", weeks: 2 },
      { name: "Refinement", weeks: 2 },
      { name: "System and rules", weeks: 2 },
    ],
    headline: { roman: "An identity that", italic: "holds up unattended" },
  },
  /**
   * Web design and web development were two services and are now one.
   *
   * They were never two jobs — they were one problem answered twice, once on a
   * canvas and once in a repository, and splitting them across two pages sold
   * the seam rather than the absence of one. The showcase, its four panels and
   * the paper surface are exactly as they were; the argument around them was
   * rewritten to say what the merge means, and the deliverables and phases are
   * the two lists reconciled into one run of work.
   *
   * Both old slugs 308 to this one — see `next.config.ts`.
   */
  {
    slug: "web-design-development",
    name: "Web design & development",
    summary:
      "Sites designed against real content, and built by the people who designed them.",
    /* Not rendered on this page — the showcase below carries this argument at
       length, and printing both would say the same thing twice within one
       screen. Kept as the service's canonical one-liner. */
    intro:
      "We design in the browser early, because a layout that only works at 1440px with perfect copy is not a design — it is a picture of one.",
    metaTitle: "Web design & development agency",
    metaDescription:
      "Website design and development from a Hampshire studio: responsive web design, custom Next.js builds, CMS integration and performance work — designed and built by one team.",
    deliverables: [
      "Sitemap, content model and structure",
      "Full design system, drawn at three breakpoints",
      "Next.js App Router build",
      "CMS integration and editor training",
      "Performance budget, enforced in CI",
      "Deployment, analytics and a runbook",
    ],
    phases: [
      { name: "Structure", weeks: 1 },
      { name: "Art direction", weeks: 2 },
      { name: "Page design", weeks: 3 },
      { name: "Build", weeks: 3 },
      { name: "Integration", weeks: 2 },
      { name: "Launch", weeks: 1 },
    ],
    headline: {
      roman: "Designed to look right,",
      italic: "built to work properly",
    },
    paper: true,
    showcase: {
      statement: {
        roman: "A site has to look like you and still be",
        italic: "fast, clear and worth the visit",
      },
      body: [
        "We design against your real content, at real widths, in the browser early. A layout that only holds at 1440px with copy nobody has written yet is not a design — it is a picture of one.",
        "Structure comes first: what the site is for, what someone needs to do on it, and the shape the content actually arrives in. Art direction goes on top of something that already works, so the visual design has something to be right about.",
        "Then the same people build it. Design and development are not two jobs passed between rooms — they are one problem answered twice, and the handover document is where the answer usually goes missing.",
      ],
      media: [
        {
          kind: "image",
          src: "/work/web-design/south-downs.png",
          alt: "South Downs Plant & Machinery — the machine search on a phone, beside the dark enquiry dashboard",
          width: 1391,
          height: 1131,
        },
        {
          kind: "image",
          src: "/work/web-design/levant-tee.png",
          alt: "LEVANT — the 001 tee product page open on a phone against an orange set",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/web-design/bespoke-garden-decor.png",
          alt: "Bespoke Garden Decor — the products page, its handcrafted range laid out in a three-column grid",
          width: 2000,
          height: 2000,
        },
        {
          kind: "video",
          src: "/work/web-design/levant.mp4",
          label:
            "LEVANT — the 001 tee page in motion on a phone, against a coral set",
        },
      ],
    },
    chapters: [
      {
        eyebrow: "Design",
        statement: {
          roman: "Structure first, then",
          italic: "something to look at",
        },
        body: [
          "Before a page is drawn we settle what the site is for: the two or three things people actually arrive to do, and everything else that is only there because a competitor has one. Most slow sites are slow because of what they contain, not how they were built.",
          "Type, hierarchy and spacing are decided as a system rather than page by page. That is what keeps page forty looking like page one, and it is the difference between a design and a set of screens that happen to share a colour.",
          "Responsive is not the desktop layout at a smaller size. A narrow screen changes what belongs at the top, what can fold away and what a thumb can reach — so it gets designed, not derived. We draw at three widths and check on real devices, because a browser window dragged narrow is not a phone.",
        ],
      },
      {
        eyebrow: "Build",
        statement: {
          roman: "Built by the people",
          italic: "who drew it",
        },
        body: [
          "The build is where design quality is usually lost: spacing rounds off, motion gets approximated, and the state nobody drew is invented on the spot by whoever hit it first. One team designing and building removes the translation step where all of that happens.",
          "Speed is a design decision, not a phase at the end. Image weight, font loading and what runs on the main thread are settled while the pages are still being drawn, then held to a budget in CI — so the site is still quick a year after the launch it was measured at.",
          "Where you need to change things yourself, we build the parts that should change and leave the rest alone. A content model that cannot break the layout is worth considerably more than an editor that lets anyone move anything anywhere.",
          "Motion earns its place by explaining something — where you are, what just happened, what is about to. And nothing ships until the responsive behaviour, the links, the keyboard path and the numbers have been checked on real devices. A site is finished when it has been tested, not when it has been uploaded.",
        ],
      },
    ],
  },
  {
    slug: "ux-ui-design",
    name: "UX & UI design",
    summary:
      "Interfaces built around the decisions people actually have to make.",
    intro:
      "Good interfaces feel obvious. That is not luck — it is what is left after the decisions nobody needed have been taken out.",
    metaTitle: "UX & UI design agency",
    metaDescription:
      "User experience and user interface design from a Hampshire studio: journey mapping, information architecture, wireframes, prototypes and design systems for teams across the UK.",
    deliverables: [
      "Journey maps, with the decision points marked",
      "Information architecture and naming",
      "Wireframes at three breakpoints",
      "Interactive prototype of the flows that matter",
      "Interface design and component library",
      "Design system with every state documented",
    ],
    phases: [
      { name: "Journeys and audit", weeks: 2 },
      { name: "Architecture and wireframes", weeks: 2 },
      { name: "Interface design", weeks: 3 },
      { name: "Prototype and iterate", weeks: 2 },
    ],
    headline: {
      roman: "Interfaces people",
      italic: "don’t have to think about",
    },
    paper: true,
    showcase: {
      statement: {
        roman: "Good interfaces should",
        italic: "feel obvious",
      },
      body: [
        "Obvious is the hardest thing to design. It is what is left once the decisions a person never needed to make have been removed — and every one of those was put there by someone reasonable, for a reason that made sense at the time.",
        "So we start with what someone is trying to get done, not with screens. Where they arrive from, what they are deciding, where they stall, and the point at which they give up and phone you instead. That last one is usually the most useful thing anyone says all week.",
        "Structure is settled before anything is styled: hierarchy, sequence, what belongs on one screen and what does not. Visual design is a great deal easier when it has something correct to be applied to.",
      ],
      media: [
        {
          kind: "image",
          src: "/work/ux-ui-design/levant-product.png",
          alt: "LEVANT — the 001 product page on two phones, one showing size and quantity controls, the other the product gallery",
          width: 2000,
          height: 2000,
        },
        /* The last three were 1.25:1, and a 1.25:1 picture in a square tile
           gives up a fifth of its width — the "cut off at the right" this grid
           kept being accused of, which was never the container. These are the
           same three subjects recomposed square at the source, so `object-cover`
           now has nothing to crop and no panel needs a `position` to steer it.
           The fix is the artwork, which is the right place for it.

           Two of them are trimmed rather than the raw 2000px files, and both
           trims are in the pixels, not in CSS — a scale-and-nudge would have had
           to hold at every tile size, and resamples the picture to hide a defect
           that can simply be cut off. Originals are kept in the staging folder,
           so either can be re-cut from source. See NOTES.md. */
        {
          kind: "image",
          /* 26.png carried a 1px dark line baked into its last column and last
             row — mean luminance 2 against an interior of 245, which read as an
             unintended border down the right and along the bottom. Nothing in
             CSS: no border, no shadow, no background. Cropped to 1997 square,
             three pixels clear of it and of any antialiasing. */
          src: "/work/ux-ui-design/loading-options-spec.png",
          alt: "South Downs Plant & Machinery — the loading options screen held on a phone, beside its spacing specification with every gap annotated",
          width: 1997,
          height: 1997,
        },
        {
          kind: "image",
          /* 24.png sat on a white canvas — 24px of it on the left, 32px on the
             right and bottom — so the black and yellow artwork rendered visibly
             inset while the other three reached their edges. The trim takes the
             canvas and the artwork's own corner radius with it (a ~68px radius
             on the left corners would otherwise leave white slivers inside the
             tile's own rounded-xl), leaving solid colour on all four edges:
             corners now read 25 / 157 / 26 / 158, and zero border pixels are
             white. About 1.8% comes off each side, nowhere near the phone or
             the wording. */
          src: "/work/ux-ui-design/enquiry-sheet.png",
          alt: "South Downs Plant & Machinery — the “looking for something specific” enquiry sheet on a phone, beside its title card",
          width: 1872,
          height: 1872,
        },
        {
          kind: "image",
          src: "/work/ux-ui-design/machine-search.png",
          alt: "South Downs Plant & Machinery — the machine search on a phone, against the enquiry dashboard and interface library behind it",
          width: 2000,
          height: 2000,
        },
      ],
    },
    chapters: [
      {
        eyebrow: "Structure and interface",
        statement: {
          roman: "Hierarchy before",
          italic: "decoration",
        },
        body: [
          "Information architecture is the part nobody asks for and everybody feels. What sits at the top level, what is one tap down, and whether things are named in your customer's words or your org chart's. Get that wrong and no amount of visual polish rescues it.",
          "Wireframes exist to be argued with. They are deliberately unfinished so the conversation stays on sequence, priority and what a screen is actually for — rather than on a shade of blue applied to something that has not been agreed yet.",
          "The interface then goes on top of a structure that already works, and it should look like you rather than like the defaults of whatever it was built in. Distinctive and obvious are not opposites; most templates manage neither.",
        ],
      },
      {
        eyebrow: "Behaviour",
        statement: {
          roman: "Important interactions have to be",
          italic: "used, not imagined",
        },
        body: [
          "Anything with real behaviour — a multi-step form, a filter, a search that returns nothing — gets prototyped and put in front of someone before it is built. A flow can read perfectly on a wall and fall apart on the second tap.",
          "Mobile is not a smaller desktop. What can be hovered, how much fits before a decision drops below the fold, whether a control belongs at the top of the screen or under a thumb — all of that changes with the screen, so all of it gets designed for the screen.",
          "What survives becomes a system: named components, defined states, and rules for the cases nobody has drawn yet. That is what stops an interface drifting the moment the product grows past the screens we made.",
          "And we show work early, in whatever state it is genuinely in. Feedback on something unfinished is useful. Approval of something finished is a signature.",
        ],
      },
    ],
  },
  /**
   * The third page to carry the full editorial run — showcase, chapters, paper
   * — and it earns it for the same reason the web and UX pages do: the argument
   * is about the order the work happens in, which is prose, not a bullet list.
   *
   * Its grid is the first with a moving panel outside the web page. Nothing had
   * to be built for that: `ShowcaseMedia` has carried a `video` kind since the
   * merged web page needed one, so the mapping below is data like the rest.
   */
  {
    slug: "digital-product-design",
    name: "Digital product design",
    summary: "Interfaces for products people use every day, not once.",
    /* Not rendered on this page — the showcase carries this argument at length,
       and printing the short version above it says the same thing twice before
       the reader has scrolled. Kept as the service's canonical one-liner. */
    intro:
      "Product work rewards restraint. The tenth screen matters more than the first, and the empty state matters more than either.",
    metaTitle: "Digital product design agency",
    metaDescription:
      "Digital product and app design from a Hampshire studio: product structure, user journeys, interactive prototypes and design systems built to stay clear as the product grows.",
    deliverables: [
      "Product structure and information architecture",
      "Flow mapping and job stories",
      "Interactive prototype, built with real content",
      "Interface design across the full breakpoint range",
      "Component library with empty, loading and error states",
      "Accessibility annotations and build handover",
    ],
    phases: [
      { name: "Discovery", weeks: 2 },
      { name: "Flows and prototype", weeks: 3 },
      { name: "Interface design", weeks: 3 },
      { name: "Library", weeks: 2 },
    ],
    headline: { roman: "Complex underneath.", italic: "Obvious on the surface" },
    paper: true,
    showcase: {
      statement: {
        roman: "If people have to work it out,",
        italic: "the product has not finished the job",
      },
      body: [
        "Every product is complicated somewhere. The question is who carries that complexity — the person using it, or the people who designed it. Our job is to move the weight off the screen and into the structure behind it.",
        "Most of that work is decisions rather than drawing: what belongs on this screen, what belongs on the next one, what the sensible default is, and what happens when somebody gets it wrong. Settle those and the interface has very little left to do.",
        "Which is why the visual layer comes last here. A product that looks resolved and still makes people stop and think has solved the wrong problem in the right typeface.",
      ],
      /* Every source is 1:1 — the three stills are 2000², 2000² and 1254², and
         the clip is 952² — so the square tile takes nothing off any of them and
         no panel needs a `position`. That is deliberate rather than lucky: the
         two grids that had to be argued with both had landscape sources in a
         square box, which is what "cut off at the edges" looks like when the
         grid fits its container exactly. */
      media: [
        {
          kind: "image",
          src: "/work/digital-product-design/journal-laptop.png",
          alt: "Bespoke Garden Decor — a journal article on choosing timber, open on a laptop above a full-width photograph",
          width: 2000,
          height: 2000,
        },
        {
          kind: "video",
          src: "/work/digital-product-design/interface-motion.mp4",
          label:
            "Bespoke Garden Decor — the homepage held behind sunlit foliage moving in the breeze",
        },
        {
          kind: "image",
          src: "/work/digital-product-design/garden-decor-phone.png",
          alt: "Bespoke Garden Decor — the homepage on a phone, its quote and services actions set over a finished pergola",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/digital-product-design/south-downs-export.png",
          alt: "South Downs Plant & Machinery — the export enquiry steps on a phone, beside the company mark over a working excavator",
          width: 1254,
          height: 1254,
        },
      ],
    },
    chapters: [
      {
        eyebrow: "Structure",
        statement: { roman: "Structure before", italic: "polish" },
        body: [
          "Requirements arrive as a list. Products are not a list — they are a sequence of decisions somebody makes under time pressure, usually while doing something else. The first job is turning one into the other.",
          "So the thing gets mapped before it gets drawn: what the product is for, what a person is actually trying to finish, and the order those steps happen in rather than the order the spreadsheet had them. Hierarchy falls out of that. What deserves the top of the screen is whatever the next decision needs.",
          "Skipping this is what produces products that look considered and feel exhausting. A confused structure can be styled indefinitely and never improve, because the surface was never the problem.",
        ],
      },
      {
        eyebrow: "Journeys",
        statement: {
          roman: "Every interaction should",
          italic: "answer a question",
        },
        body: [
          "People arrive at a screen with a question — where am I, did that work, what happens if I press this, how much longer. An interface earns its place by answering the one being asked at that moment and staying quiet about the rest.",
          "That makes feedback part of the design rather than a later ticket. Loading, saving, empty, partial, expired, failed: people spend real time in those states, and leaving them to be handled during the build is how a confident product turns confusing at exactly the wrong moment.",
          "Friction is worth spending deliberately. A few steps should be slow — deleting something permanent, spending money. Most should not, and the ones people repeat every day deserve the most attention and usually get the least.",
        ],
      },
      {
        eyebrow: "Prototyping",
        statement: {
          roman: "Prototype before the",
          italic: "expensive decisions",
        },
        body: [
          "A flow that reads well as a diagram can still be wrong to use. The cheapest place to find that out is something clickable, not something built.",
          "So it goes in front of people early, with real content, real lengths and real edge cases, at the widths it will be used at. Placeholder copy hides every problem worth finding: names run longer than the box, lists are emptier than the mockup, and the interesting screens turn out to be the ones nobody designed.",
          "What comes back changes the design while changing it is still cheap. That is the whole argument for it — after the build starts, the same finding costs a fortnight and an awkward conversation.",
        ],
      },
      {
        eyebrow: "Systems",
        statement: {
          roman: "A product is never",
          italic: "finished in one pass",
        },
        body: [
          "Products keep going. Features arrive, teams change, and the design has to survive people who were not in the room when it was made. That is a systems problem rather than a screens problem.",
          "So what gets handed over is components with their states defined, spacing and type that hold at every width, and rules specific enough to actually follow. Brand character lives inside that rather than on top of it: a product can be distinctly yours and still behave the way people expect, and where those two genuinely conflict, usability wins.",
          "It stays honest by staying close to the build — the same components, in the browser, at real widths. The gap between the design file and the shipped product is where most of the quality is usually lost.",
        ],
      },
    ],
  },
  {
    slug: "motion-video",
    name: "Motion and video",
    summary: "Motion with a reason, cut to the length it earns.",
    intro:
      "Motion should explain something or acknowledge something. If it does neither, it is a loading delay with ambition.",
    deliverables: [
      "Motion principles and timing scale",
      "Launch film or product demo",
      "Social cutdowns",
      "Lottie or code-based UI motion",
      "Sound design",
    ],
    phases: [
      { name: "Concept and script", weeks: 1 },
      { name: "Storyboard", weeks: 1 },
      { name: "Production", weeks: 2 },
      { name: "Edit and grade", weeks: 2 },
    ],
    headline: { roman: "Motion that", italic: "means something" },
  },
  /**
   * Two subjects on one page, deliberately: using AI in the creative process,
   * and designing the products that use it. They are the same argument seen
   * from either end — a model produces more than it judges, so the judgement
   * has to come from somewhere, whether that is a designer choosing between
   * fifteen directions or an interface telling someone when not to trust an
   * answer.
   *
   * The panels are generated studies, described as such in their alt text.
   * They are exploration, which is what the page is about; they are not client
   * work and must not be captioned as though they were.
   */
  {
    slug: "ai-design",
    name: "AI design",
    summary:
      "Exploring more directions with AI — and interfaces for models that get it wrong.",
    /* Not rendered on this page — the showcase carries the argument. Kept as
       the service's canonical one-liner. */
    intro:
      "The hard part of AI design is not the chat box. It is designing for confidence, correction and refusal — so people can tell when to trust the output.",
    metaTitle: "AI design agency",
    metaDescription:
      "AI product and interface design from a Hampshire studio: generative exploration in the creative process, AI UX, and interfaces built for systems whose output is not always right.",
    deliverables: [
      "Concept exploration at volume, then a shortlist",
      "Interaction model for uncertainty",
      "Prompt and result interface patterns",
      "Streaming, retry and correction states",
      "Evaluation surface for the team",
      "Guidance on disclosure",
    ],
    phases: [
      { name: "Capability mapping", weeks: 2 },
      { name: "Interaction model", weeks: 2 },
      { name: "Interface design", weeks: 3 },
      { name: "Testing with real output", weeks: 2 },
    ],
    headline: {
      roman: "AI changes the speed.",
      italic: "Taste decides the direction",
    },
    paper: true,
    showcase: {
      statement: {
        roman: "More possibilities.",
        italic: "Better judgement still wins",
      },
      body: [
        "We use AI to explore faster, prototype earlier and push ideas further than a schedule would otherwise allow — without handing the creative decisions over to it.",
        "What has actually changed is the cost of trying something. A direction that used to take a day to visualise takes an hour, so it gets visualised instead of being described in a meeting and quietly dropped.",
        "What has not changed is that somebody still has to decide which of them is any good. That part has not been automated, and working as though it has is how studios end up shipping things that are technically fine and completely forgettable.",
      ],
      /* Every source here is 1.25:1 or wider. In a square tile that is a fifth
         of the width gone, taken off both edges — which is what "cut off at the
         right" looks like when the grid itself fits its container exactly. At
         5:4 the two figure studies fit to the pixel, and the crop that remains
         falls on the two abstracts, where there is no subject to lose. */
      ratio: "aspect-[5/4]",
      media: [
        {
          kind: "image",
          src: "/work/ai-design/generative-lattice.png",
          alt: "Generated study — a honeycomb lattice of overlapping cells, shading from deep violet through coral into orange",
          width: 1254,
          height: 1254,
        },
        {
          kind: "image",
          src: "/work/ai-design/expedition.png",
          alt: "Generated study — a lone figure in an exposure suit walking through dust towards a distant industrial city",
          width: 1402,
          height: 1122,
        },
        {
          kind: "image",
          src: "/work/ai-design/silhouette.png",
          alt: "Generated study — a figure pressed against red backlit glass, one hand raised, the silhouette diffused",
          width: 1403,
          height: 1121,
        },
        {
          kind: "image",
          src: "/work/ai-design/voxel-field.png",
          alt: "Generated study — a dark field of small tiles rolling in waves, catching a single cold highlight",
          width: 1535,
          height: 1024,
        },
      ],
    },
    /* Sits after chapter 1 — between "Speed without judgement is just more
       noise" and "If the product thinks, the interface has to explain" — where
       the page wants a pause between two dense arguments. Image-only: no
       caption, no dots, no arrows, no heading.

       The same four studies as the grid above, which is what was asked for and
       is all the AI page has. They read differently here: square-cropped,
       raked back in 3D and moving, against a static 5:4 grid two screens up. */
    carousel: {
      afterChapter: 1,
      label: "Generated studies from the studio's own exploration",
      slides: [
        {
          src: "/work/ai-design/expedition.png",
          alt: "Generated study — a lone figure in an exposure suit walking through dust towards a distant industrial city",
        },
        {
          src: "/work/ai-design/generative-lattice.png",
          alt: "Generated study — a honeycomb lattice of overlapping cells, shading from deep violet through coral into orange",
        },
        {
          src: "/work/ai-design/silhouette.png",
          alt: "Generated study — a figure pressed against red backlit glass, one hand raised, the silhouette diffused",
        },
        {
          src: "/work/ai-design/voxel-field.png",
          alt: "Generated study — a dark field of small tiles rolling in waves, catching a single cold highlight",
        },
      ],
    },
    chapters: [
      {
        eyebrow: "Exploration",
        statement: {
          roman: "More directions before",
          italic: "committing to one",
        },
        body: [
          "The constraint early on was never imagination. It was how many ideas you could afford to make visible before the budget said choose — concepts, moodboards, visual directions, layout studies and image treatments all cost roughly the same amount of time each.",
          "They no longer do. So the shortlist gets wider before it gets narrower: more directions drawn, more layouts tried at real proportions, more alternatives put up next to each other where they can be compared rather than imagined.",
          "The work is still made properly once a direction is chosen. What changes is that the choice is made against fifteen options instead of three, and the ones that were only ever somebody's first instinct get found out early, while changing course is still cheap.",
        ],
      },
      {
        eyebrow: "Judgement",
        statement: {
          roman: "Speed without judgement is",
          italic: "just more noise",
        },
        body: [
          "A model will return two hundred variations in an afternoon and hold no opinion about any of them. Volume is the easy half. The useful half is deciding what is relevant, what actually sounds like the brand, what is distinctive rather than merely competent, and what to throw away.",
          "Most of what comes back is average by construction — it is drawn from everything, so it lands in the middle of everything. Average is the one thing a brand cannot afford, and recognising it takes someone who has formed a view about what good looks like.",
          "So the ratio matters more than the volume. Generating is cheap now; editing, refining and knowing when to stop are not, and that is where the design work has moved.",
        ],
      },
      {
        eyebrow: "Designing AI products",
        statement: {
          roman: "If the product thinks,",
          italic: "the interface has to explain",
        },
        body: [
          "An interface over a model is a different problem from an interface over a database. The output is not deterministic — the same input can give a different answer twice — so a design that quietly assumes correctness will mislead people confidently.",
          "That puts the weight on a few things. Showing what the system can and cannot do, before somebody asks it for something it will fail at. Showing that it is working, rather than leaving a silence. And making the result correctable, because the answer to a wrong output is an edit, not an apology.",
          "Confidence has to be legible too. People need enough signal to decide whether to trust an answer or check it, and a system that never admits doubt teaches people to trust everything or nothing. None of this is exotic: it is clarity, feedback and control, applied to something that is sometimes wrong.",
        ],
      },
      {
        eyebrow: "Workflow",
        statement: {
          roman: "Useful where it",
          italic: "removes repetition",
        },
        body: [
          "The honest test is whether a step got better, not whether AI touched it. It earns its place on the repetitive parts: first-pass variations, carrying a system across formats, organising research into something readable, drafting copy a person then rewrites, standing a prototype up quickly enough to be worth testing.",
          "It earns nothing by being added to a stage that already worked. Pushed into every step because it is fashionable, it slows the work down and adds a review cycle for output nobody asked for.",
          "So it goes where it removes friction and stays out of where the thinking happens. That is a judgement per project rather than a policy, and it is worth revisiting as the tools change — which they do, faster than any policy would survive.",
        ],
      },
    ],
  },
  {
    slug: "retainer",
    name: "Retainer",
    summary: "A standing arrangement for teams who keep shipping.",
    intro:
      "A fixed number of days a month, spent on whatever is most useful. No scoping ceremony for every small piece of work.",
    deliverables: [
      "Named team and fixed monthly days",
      "Shared board and weekly call",
      "Design system upkeep",
      "Quarterly review",
      "First refusal on your calendar",
    ],
    phases: [
      { name: "Onboarding", weeks: 1 },
      { name: "Rolling delivery", weeks: 4 },
    ],
    headline: { roman: "Standing capacity,", italic: "no ceremony" },
  },
];

export function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Is this route rendered on paper?
 *
 * The header is fixed over the page and lives outside it in the root layout, so
 * it cannot inherit the surface from the page it is sitting on — it has to ask.
 * Asked from `usePathname()`, which is resolved during SSR as well as on the
 * client, so the header renders in the right colours on the first paint rather
 * than flipping after hydration.
 */
export function isPaperRoute(pathname: string): boolean {
  const slug = /^\/services\/([^/]+)\/?$/.exec(pathname)?.[1];
  return slug ? getService(slug)?.paper === true : false;
}

/**
 * Scope estimate for the builder. Phases from separate services overlap in
 * practice, so total weeks are not a plain sum: each additional service adds a
 * diminishing amount of calendar time. Kept here so the board and the contact
 * form agree on the number.
 */
export function estimateScope(slugs: string[]) {
  const chosen = SERVICES.filter((s) => slugs.includes(s.slug));
  if (!chosen.length) return { weeks: 0, phases: [] as Phase[], services: chosen };

  const sorted = [...chosen].sort(
    (a, b) => sumWeeks(b.phases) - sumWeeks(a.phases),
  );
  const weeks = sorted.reduce((total, service, i) => {
    const own = sumWeeks(service.phases);
    // First service runs at full length; each subsequent one overlaps ~40%.
    return total + (i === 0 ? own : Math.round(own * 0.6));
  }, 0);

  const phases = dedupePhases(sorted.flatMap((s) => s.phases));
  return { weeks, phases, services: sorted };
}

function sumWeeks(phases: Phase[]) {
  return phases.reduce((n, p) => n + p.weeks, 0);
}

function dedupePhases(phases: Phase[]) {
  const seen = new Map<string, Phase>();
  for (const p of phases) {
    const existing = seen.get(p.name);
    if (!existing || p.weeks > existing.weeks) seen.set(p.name, p);
  }
  return [...seen.values()];
}
