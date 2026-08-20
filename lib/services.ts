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
   * A typographic ribbon travelling between two chapters.
   *
   * Same shape as `carousel` and for the same reason: `afterChapter` is the
   * index it follows, so only the service that declares one renders one, and
   * the template never learns which page it is on.
   */
  marquee?: {
    afterChapter: number;
    /** Set alternately roman and italic, in the display face. */
    words: string[];
  };
  /**
   * A second showcase grid, later in the editorial run.
   *
   * `showcase.media` is the first one and sits under the opening statement;
   * this is the same `ShowcaseGrid` dropped in after a chapter, for a page with
   * enough ground to cover that one grid at the top would be the only pictures
   * in a long read. Third field to take `afterChapter`, alongside `carousel`
   * and `marquee`, and it works the same way.
   */
  grid2?: {
    afterChapter: number;
    media: ShowcaseMedia[];
    ratio?: string;
  };
  /**
   * A quiet WhatsApp strip after this chapter index.
   *
   * Separate from `ctaStrip` so the two never land together: the blue strip is
   * the section-sized ask, this is a single line. Renders nothing at all until
   * a WhatsApp number is configured — see `CONTACT_CHANNELS`.
   */
  whatsappAfterChapter?: number;
  /**
   * A blue CTA band partway down the editorial run.
   *
   * Fifth field to take `afterChapter`, and it works like the rest. Only on
   * the pages with a long enough stretch of consecutive prose to want breaking
   * up — a strip on a two-screen page is an interruption, not pacing.
   */
  ctaStrip?: {
    afterChapter: number;
    statement: { roman: string; italic?: string };
    /** One plain sentence under the statement. */
    body?: string;
    label: string;
    secondary?: { label: string; href: string };
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
    /* Paper, like every other page carrying a showcase. Not decoration: the
       grid's gutters are the page showing through rather than a drawn divider,
       so the white cross between the four tiles only exists on a light surface.
       On ink this same grid reads as four tiles separated by dark, which is a
       different thing entirely. */
    paper: true,
    showcase: {
      statement: {
        roman: "The mark is the start of it,",
        italic: "not the job",
      },
      body: [
        "An identity is a system rather than a picture. The mark matters, but what decides whether it holds together is everything around it — the type, the spacing, the colour rules, and the templates somebody reaches for at eleven at night.",
        "So the parts that get used most are the parts we design hardest, and what is allowed gets written down. Not a hundred pages nobody opens: the decisions that actually come up every week, answered clearly enough that a new person makes the right one without having to ask.",
        "The test is never the launch. It is month seven, when the people who commissioned it have moved on and the brand is being applied by someone who was never in the room.",
      ],
      /* Three of the four sources are 1.25:1 and the fourth is the clip. At 5:4
         the stills fit to the pixel and the crop that remains falls on the
         video, where a moving background has nothing to lose — the same call
         the AI page's grid makes. */
      ratio: "aspect-[5/4]",
      media: [
        {
          kind: "image",
          src: "/work/brand-identity/puzzle-stationery.png",
          alt: "Puzzle — business cards and a brand box in blue and white, the puzzle-piece mark repeating across the set",
          width: 1402,
          height: 1122,
        },
        {
          kind: "video",
          src: "/work/brand-identity/levant-campaign-film.mp4",
          label:
            "LEVANT — the drop 001 campaign film, the wordmark and headline set over footage from the court",
        },
        {
          kind: "image",
          src: "/work/brand-identity/levant-poster.png",
          alt: "LEVANT — a bus shelter poster at dusk, the wordmark over a sunset court",
          width: 1397,
          height: 1126,
        },
        {
          kind: "image",
          src: "/work/brand-identity/bespoke-type-specimen.png",
          alt: "Bespoke Garden Decor — the brand typeface shown as a specimen beside the logotype and its weights",
          width: 1402,
          height: 1122,
        },
      ],
    },
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
    /* Between Design and Build — the one seam on this page, and the point the
       argument has just finished making. */
    whatsappAfterChapter: 1,
    ctaStrip: {
      afterChapter: 0,
      statement: {
        roman: "Want to book an",
        italic: "intro meeting with us?",
      },
      body: "Have a website in mind, or just want to talk an idea through? Tell us where you're at and we'll take it from there.",
      label: "Book an intro",
      secondary: { label: "Build a scope", href: "/services#scope" },
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
    /* Halfway down four consecutive chapters — after Journeys, before
       Prototyping, which is the middle of the run. */
    whatsappAfterChapter: 3,
    ctaStrip: {
      afterChapter: 1,
      statement: {
        roman: "Got something complicated",
        italic: "to make feel simple?",
      },
      body: "Book an intro and talk it through, or send us a scope if you already know the shape of it.",
      label: "Book an intro",
      secondary: { label: "Build a scope", href: "/services#scope" },
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
  /* Motion and video was removed as a service. Everything that listed it —
     the header dropdown, the mobile nav, the footer, the services index, the
     homepage cards, the scope builder, the contact form and
     `generateStaticParams` — reads this array, so deleting the entry was the
     whole change. `/services/motion-video` 308s to `/services`; see
     `next.config.ts`. The motion work itself has not gone anywhere: the moving
     panels on the web and product pages are still there. */
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
    /* Between Exploration and Judgement. The verbs the page argues about, in
       the order the work actually happens — and it ends on "judge", which is
       the word the chapter underneath it opens on. */
    marquee: {
      afterChapter: 0,
      words: [
        "Generate",
        "Explore",
        "Iterate",
        "Refine",
        "Question",
        "Select",
        "Design",
        "Judge",
      ],
    },
    /* No CTA strip on this page: four chapters with a carousel and a marquee
       already in among them is enough punctuation. */
    /* Sits after chapter 1 — between "Speed without judgement is just more
       noise" and "If the product thinks, the interface has to explain" — where
       the page wants a pause between two dense arguments. Image-only: no
       caption, no dots, no arrows, no heading.

       Seven studies of its own, separate from the four in the grid above — at
       seven the fold keeps three cards either side of the centre visible
       instead of one, which is what the effect wants.

       Copied out of the `&` staging folder into `carousel/` on the way in, per
       the convention the rest of the site follows: a literal `&` in an asset
       path passes `next dev` and 404s in a production build. */
    carousel: {
      afterChapter: 1,
      label: "Generated studies from the studio's own exploration",
      slides: [
        {
          src: "/work/ai-design/carousel/iridescent-film.png",
          alt: "Generated study — a macro of oil and bubbles on water, refracting magenta, amber and cyan against black",
        },
        {
          src: "/work/ai-design/carousel/glass-nave.png",
          alt: "Generated study — a vast glass and gold nave receding to a lit vertical seam, a single figure at the centre",
        },
        {
          src: "/work/ai-design/carousel/salvage-walker.png",
          alt: "Generated study — a vast four-legged machine built from salvaged plate, one lit eye, standing in rain over flooded ground",
        },
        {
          src: "/work/ai-design/carousel/filigree-cathedral.png",
          alt: "Generated study — a white filigree cathedral of woven tracery and statuary against a bright blue sky",
        },
        {
          src: "/work/ai-design/carousel/particle-portrait.png",
          alt: "Generated study — a profile in shadow dissolving into orange and cyan shards at the edge of the face",
        },
        {
          src: "/work/ai-design/carousel/glass-garden.png",
          alt: "Generated study — a woodland of transparent glass flowers and ferns above a stream, lit through mist",
        },
        {
          src: "/work/ai-design/carousel/glass-city.png",
          alt: "Generated study — a plaza of coloured glass towers and bridges reflected in wet stone, one figure crossing",
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
    /* Not rendered on this page — the showcase carries the argument. Kept as
       the service's canonical one-liner. */
    intro:
      "A fixed number of days a month, spent on whatever is most useful. No scoping ceremony for every small piece of work.",
    metaTitle: "Design retainer",
    metaDescription:
      "An ongoing design retainer from a Hampshire studio: retained creative support across brand, web, UX and product design, for teams with a steady stream of work rather than one project.",
    deliverables: [
      "Named team and fixed monthly days",
      "Shared board and a standing call",
      "Work across brand, web, UX, product and campaign",
      "Design system and component upkeep",
      "Context kept between briefs, not rebuilt",
      "Quarterly review of what the days are buying",
    ],
    phases: [
      { name: "Onboarding", weeks: 1 },
      { name: "Rolling delivery", weeks: 4 },
    ],
    headline: {
      roman: "Better work starts when we",
      italic: "stop starting over",
    },
    paper: true,
    showcase: {
      statement: {
        roman: "A project begins by explaining everything.",
        italic: "This begins where we left off",
      },
      body: [
        "The expensive part of hiring a studio is rarely the work. It is the fortnight either side of it — explaining the product, the audience, the internal politics, the three things that were tried in 2023 and quietly abandoned, and the one thing the founder will never approve.",
        "Do that once and it is an investment. Do it every time something needs designing, with a different supplier each time, and it is a tax you pay for the privilege of starting again.",
        "A retainer is the arrangement where that context stops being thrown away. The same people, a known number of days a month, pointed at whatever is most useful — and each brief starting from somewhere further along than the last one did.",
      ],
      /* Four disciplines, one each: web, interface, product and identity. All
         referenced where they already live — nothing was copied for this page.
         Three are 1:1 and fit the square tile exactly; the stationery shot is
         1.25 and gives up a fifth of its width, which lands on the dark ground
         either side of a centred box. */
      media: [
        {
          kind: "image",
          src: "/work/web-design/bespoke-garden-decor.png",
          alt: "Bespoke Garden Decor — the products page, its handcrafted range laid out in a three-column grid",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/ux-ui-design/machine-search.png",
          alt: "South Downs Plant & Machinery — the machine search interface, filters open beside the results",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/digital-product-design/journal-laptop.png",
          alt: "Bespoke Garden Decor — a journal article on choosing timber, open on a laptop above a full-width photograph",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/brand-identity/puzzle-stationery.png",
          alt: "Puzzle — business cards and a brand box in blue and white, the puzzle-piece mark repeating across the set",
          width: 1402,
          height: 1122,
        },
      ],
    },
    /* The same component the AI page uses, with its own slides — seven pieces
       of client work rather than generated studies, so the two pages configure
       one carousel independently. Sits after MOMENTUM, between the two grids. */
    carousel: {
      afterChapter: 1,
      label: "A cross-section of work from across the studio's disciplines",
      slides: [
        {
          src: "/work/gallery/south-downs-home.png",
          alt: "South Downs Plant & Machinery — the homepage, its machine search sitting over a working yard",
        },
        {
          src: "/work/ux-ui-design/levant-product.png",
          alt: "LEVANT — the product page open on a phone, the garment shown against a coral set",
        },
        {
          src: "/work/gallery/bespoke-garden-decor-journal.png",
          alt: "Bespoke Garden Decor — the journal index, its articles set as a run of illustrated cards",
        },
        {
          src: "/work/digital-product-design/garden-decor-phone.png",
          alt: "Bespoke Garden Decor — the homepage on a phone, its quote and services actions set over a finished pergola",
        },
        {
          src: "/work/ux-ui-design/loading-options-spec.png",
          alt: "An interface specification — loading and empty states drawn out as a set of annotated options",
        },
        {
          src: "/work/web-design/levant-tee.png",
          alt: "LEVANT — the 001 tee product page open on a phone against an orange set",
        },
        {
          src: "/work/brand-identity/bespoke-type-specimen.png",
          alt: "Bespoke Garden Decor — the brand typeface shown as a specimen beside the logotype and its weights",
        },
      ],
    },
    /* Second grid, after JUDGEMENT. Four different pieces from the first — and
       one of them moves, because by this point in the page a still grid twice
       would read as the same picture in a different place. */
    grid2: {
      afterChapter: 3,
      media: [
        {
          kind: "image",
          src: "/work/ux-ui-design/enquiry-sheet.png",
          alt: "South Downs Plant & Machinery — the export enquiry sheet, its steps laid out in black and yellow",
          width: 1872,
          height: 1872,
        },
        {
          kind: "video",
          src: "/work/web-design/levant.mp4",
          label:
            "LEVANT — the 001 tee page in motion on a phone, against a coral set",
        },
        {
          kind: "image",
          src: "/work/digital-product-design/south-downs-export.png",
          alt: "South Downs Plant & Machinery — the export enquiry steps on a phone, beside the company mark over a working excavator",
          width: 1254,
          height: 1254,
        },
        {
          kind: "image",
          src: "/work/brand-identity/levant-poster.png",
          alt: "LEVANT — a bus shelter poster at dusk, the wordmark over a sunset court",
          width: 1397,
          height: 1126,
        },
      ],
    },
    /* Between Continuity and How it runs: the argument is made by that point,
       and what follows is mechanics. */
    whatsappAfterChapter: 2,
    ctaStrip: {
      afterChapter: 5,
      statement: {
        roman: "Want to talk about",
        italic: "an ongoing arrangement?",
      },
      body: "Tell us what the year looks like and we'll say whether a retainer is the right shape for it.",
      label: "Book an intro",
      secondary: { label: "Build a scope", href: "/services#scope" },
    },
    chapters: [
      {
        eyebrow: "Context",
        statement: {
          roman: "No brief should have to",
          italic: "start at zero",
        },
        body: [
          "Most of what makes a piece of design right is unwritten. Which competitor the board is quietly measuring themselves against. Which word the founder has banned. Which page actually earns the enquiries, and which one everybody talks about but nobody visits.",
          "None of that arrives in a brief. It accumulates — and when the relationship ends at the end of a project, it is thrown away with it, then paid for again the next time somebody new is hired.",
          "Kept, it changes what a brief has to contain. \"The usual, but for the trade side\" is a complete instruction to somebody who already knows the product, and a fortnight of discovery to somebody who does not.",
        ],
      },
      {
        eyebrow: "Momentum",
        statement: {
          roman: "Groundwork only has to be",
          italic: "laid once",
        },
        body: [
          "The first piece of work with anyone is the slowest, and it should be. Type has to be chosen, a grid decided, components drawn, tone argued about, approvals routed through people you have not met.",
          "The second piece inherits all of it. So does the tenth. What was a fortnight of setup becomes an afternoon of extending something that already exists, and the time saved goes into the part that was always the point — whether the thing is any good.",
          "That is the practical case for continuity. Not that anyone works faster under a retainer, but that less of the work is spent rebuilding a starting position that was already reached months ago.",
        ],
      },
      {
        eyebrow: "Flexibility",
        statement: {
          roman: "The work changes.",
          italic: "The relationship does not have to",
        },
        body: [
          "Requirements rarely stay in one discipline. A quarter that starts with a landing page ends up needing a component library, then a campaign, then a rethink of how the enquiry flow actually behaves on a phone.",
          "Under a project arrangement each of those is a new conversation with a new supplier, each starting at zero. Under a retainer they are the same arrangement pointed somewhere else — brand, web, interface, product or campaign, decided month by month against what is actually in front of you.",
          "It is worth saying what this is not. It is not unlimited design, and the days are finite. What it removes is the procurement round in the middle, not the need to decide what matters most.",
        ],
      },
      {
        eyebrow: "Judgement",
        statement: {
          roman: "You are retaining the thinking,",
          italic: "not just the output",
        },
        body: [
          "The weakest version of a retainer is a queue: briefs in one end, assets out the other, nobody asking whether the brief was right. That arrangement produces a great deal of work and very little progress, and it is the reason some teams have tried one and concluded they do not work.",
          "The useful version is the opposite. Somebody who knows the product well enough to say that the page is not the problem, that the two things being asked for contradict each other, or that this has been tried before and here is why it did not hold.",
          "That judgement is the part that genuinely compounds. It cannot be bought in for a fortnight, because it is made of everything learned in the months before — and it is worth more than the extra pair of hands most retainers are sold as.",
        ],
      },
      {
        eyebrow: "Extension",
        statement: {
          roman: "Close enough to understand it.",
          italic: "Outside enough to question it",
        },
        body: [
          "This works alongside an internal team rather than in place of one. Most teams do not need every discipline permanently on staff; they need the ones they are missing, available when the work calls for them, and gone from the payroll when it does not.",
          "The useful position is a slightly awkward one: close enough to the business to know how it really works, far enough outside it to still notice what everybody internal has stopped seeing. Familiarity is what makes the work fast, and it is also what dulls the questions, so the distance is worth protecting deliberately.",
          "In practice that means being in the standing call and on the board, and still being the ones who ask why a thing is being done at all.",
        ],
      },
      {
        eyebrow: "Continuity",
        statement: {
          roman: "One project should remember",
          italic: "the one before it",
        },
        body: [
          "Systems decay fastest at the handovers. A component library built by one supplier and extended by the next drifts within two quarters — two type scales, four button variants, a spacing system nobody can explain.",
          "Kept in one place, the opposite happens. Decisions get reused rather than relitigated, the system gets tightened instead of forked, and the reasons behind the odd-looking choices survive the person who made them.",
          "Over a year that difference is not stylistic. It is the difference between a product that feels designed and one that looks like a record of everyone who has touched it.",
        ],
      },
      {
        eyebrow: "How it runs",
        statement: {
          roman: "Four steps, and then",
          italic: "it just keeps going",
        },
        body: [
          "First, we get close. A short onboarding to learn the product, the brand, the standards and — as much as any of it — how your team actually works, who decides, and how feedback really travels.",
          "Then we set the rhythm. How work enters the pipeline, how competing priorities get settled, how often we speak. A shared board and a standing call is usually the whole of the machinery; anything heavier tends to become the work rather than serve it.",
          "Then we keep making. Work moves without rebuilding context for every brief, and the fixed days get pointed wherever they are most useful that month. Every quarter we look back at what those days actually bought, and change where they go if the answer is unconvincing.",
        ],
      },
      {
        eyebrow: "Who it suits",
        statement: {
          roman: "If there is always a next brief,",
          italic: "stop treating them as separate projects",
        },
        body: [
          "This makes sense for teams with a steady stream of design work rather than one defined thing: an internal marketing or product team that needs capacity it does not have, a business changing quickly enough that the work never really stops, or anyone tired of sourcing and briefing somebody new every quarter.",
          "It does not make sense for everyone. If you need one identity, or one site, and then nothing for eighteen months, a project is the honest answer and costs less. A retainer only pays for itself where the context has something to accumulate into.",
          "If the next brief is already forming while the current one is being signed off, that is the signal. Tell us what the year looks like and we will say whether this is the right shape for it.",
        ],
      },
    ],
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
