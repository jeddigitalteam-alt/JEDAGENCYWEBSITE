export interface Article {
  slug: string;
  title: string;
  standfirst: string;
  date: string;
  /** ISO for <time datetime>. */
  datetime: string;
  readingMinutes: number;
  author: string;
  /** Paragraphs. Plain strings — no CMS yet. */
  body: string[];
  /**
   * Generated artwork for the piece, if one exists.
   *
   * All of them are 1536x1024 — 3:2 — and each is an editorial poster carrying
   * its own lettering, so the card frames them at their native ratio and
   * nothing is cropped away. The homepage teaser shows the articles that have
   * artwork and no others: an image is the entry ticket, so a card can never
   * appear with an empty or borrowed picture. Every article stays on
   * /articles and keeps its own page regardless.
   *
   * Files live under a plain lowercase path keyed by slug — the folder they
   * arrived in has a literal `&` in its name, which Next 404s in a static
   * route.
   */
  image?: string;
  /**
   * What the artwork shows — not the title, which the card already prints
   * beside it as a heading. Describing the picture instead of repeating the
   * headline is what makes it worth announcing at all.
   */
  imageAlt?: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "the-tenth-screen",
    title: "The tenth screen",
    standfirst:
      "Product teams design the first screen forty times and the tenth screen once. It shows.",
    date: "12 June 2026",
    datetime: "2026-06-12",
    readingMinutes: 6,
    author: "Ilse Moreau",
    body: [
      "Every product review meeting looks at the same screen: the one a new user sees first. It gets iterated, tested, argued over and shipped. Meanwhile the screen that someone will see two hundred times a year gets designed on a Thursday afternoon and never revisited.",
      "This is backwards, and it is understandable. First screens are legible to stakeholders. They photograph well. They are what a homepage shows. The tenth screen is dense, contextual and boring to look at in a slide — which is exactly why it deserves more attention, not less.",
      "A practical test: open the interface you are designing and count how many times a real user will see each view in a year. Sort the list by that number. Then compare it to how much design time each view has actually received. The mismatch is usually severe.",
      "The fix is not glamorous. Design the dense view first, at real data volume, with the worst-case string lengths. If it holds, the sparse views will be easy. If you design the sparse view first, you will spend the rest of the project discovering that your layout cannot survive information.",
      "There is a second-order effect. Interfaces designed around the tenth visit tend to reward familiarity — keyboard paths, stable positions, predictable density. Interfaces designed around the first visit tend to reward novelty, and novelty is a cost once you have already learned the tool.",
    ],
    image: "/articles/the-tenth-screen.png",
    imageAlt:
      "A phone lying flat with a whole landscape growing out of its screen — a path, a staircase and a figure walking towards a sunset",
  },
  {
    slug: "motion-that-earns-it",
    title: "Motion that earns it",
    standfirst:
      "Animation should explain something or acknowledge something. Most of it does neither.",
    date: "28 April 2026",
    datetime: "2026-04-28",
    readingMinutes: 5,
    author: "Tomas Reiff",
    body: [
      "There are exactly two defensible reasons to animate something. The first is to explain a spatial relationship: this panel came from that button, this row moved there, these items reordered. The second is to acknowledge an action: we heard you, something is happening, it worked.",
      "Everything else is decoration, and decoration has a cost measured in milliseconds of the user's attention and, on lower-end devices, in dropped frames.",
      "The test we use internally: describe what the animation tells the user, in one sentence, without using the words polish, premium, delight or feel. If you cannot, cut it or shorten it until it disappears.",
      "Duration follows from purpose. Acknowledgement wants to be fast — 120 to 200ms, barely perceived. Explanation wants to be slow enough to follow, usually 300 to 500ms, and it wants a curve that decelerates so the eye can land on the end state.",
      "The one animation almost every site under-invests in is the one between pages. It is the only moment where the user genuinely loses their place, and it is usually a hard cut.",
    ],
    image: "/articles/motion-that-earns-it.png",
    imageAlt:
      "A figure leaping out of a phone screen through a burst of blue and orange paint, against the words MOTION THAT EARNS IT",
  },
  {
    slug: "contrast-is-not-a-checkbox",
    title: "Contrast is not a checkbox",
    standfirst:
      "Passing AA on your body text says very little about whether your interface is readable.",
    date: "3 March 2026",
    datetime: "2026-03-03",
    readingMinutes: 7,
    author: "Ilse Moreau",
    body: [
      "Automated contrast checking has made one specific failure rare and left several others completely untouched. Your body copy almost certainly passes now. Your disabled states, placeholder text, focus rings, chart series, hover-only affordances and text-over-photography almost certainly do not.",
      "The most common real-world failure we find is the brand accent used as a link colour on white. A mid-tone blue that looks confident in a deck frequently lands around 2.5:1 against paper, which is not usable for text at any size that matters.",
      "This is worth catching early, because the fix is structural. If the accent cannot carry links on light backgrounds, then link colour has to be a semantic decision that changes with the surface — not a single value in the palette. Discovering that after eighty components exist is expensive.",
      "Second most common: focus rings that inherit a subtle border colour. A focus ring is not decoration; it is the only thing telling a keyboard user where they are. It should be the loudest thing on the screen at that moment.",
      "None of this requires a specialist. It requires checking pairs rather than checking colours, and doing it while the palette is still cheap to change.",
    ],
  },
  {
    slug: "what-a-rebrand-cannot-fix",
    title: "What a rebrand cannot fix",
    standfirst:
      "If the product is confusing, a new wordmark makes it confusing and unfamiliar.",
    date: "19 January 2026",
    datetime: "2026-01-19",
    readingMinutes: 4,
    author: "Dara Okonjo",
    body: [
      "We turn down rebrands. Not often, but reliably in one situation: when the stated problem is positioning and the actual problem is that nobody can tell what the product does from using it.",
      "Identity work is amplification. It makes an existing message louder and more consistent. If the message is unclear, amplification produces a louder unclear message, delivered with more confidence, which is worse.",
      "The diagnostic question is unglamorous: can three people who use the product describe it in one sentence, and do those sentences agree? If not, the work is positioning and product clarity, and the visual identity should wait until there is something settled to express.",
      "This is not an argument against rebrands. It is an argument for sequencing. The studios that produce identity work with real staying power are usually the ones that insisted on getting the sentence right first.",
    ],
    image: "/articles/what-a-rebrand-cannot-fix.png",
    imageAlt:
      "A torn paper poster of a blue puzzle piece taped to a wall, with new logo, new colours and new font each crossed out",
  },
  {
    slug: "designing-for-models-that-are-wrong",
    title: "Designing for models that are wrong",
    standfirst:
      "The interesting problem in AI interfaces is not generation. It is correction.",
    date: "8 December 2025",
    datetime: "2025-12-08",
    readingMinutes: 8,
    author: "Tomas Reiff",
    body: [
      "Most AI features are designed as if the model will be right. The happy path gets a beautiful streaming animation and the failure path gets a thumbs-down icon.",
      "But a model that is right ninety percent of the time will be wrong in front of your user within the first ten interactions. What happens then is the actual product.",
      "Correction needs to be cheap, specific and local. Cheap means one interaction, not a re-prompt. Specific means the user can point at the wrong part rather than rejecting the whole output. Local means the correction applies where they are, without losing the rest of the work.",
      "Confidence display is harder than it looks. Numeric confidence is usually meaningless to users and frequently miscalibrated in the model. Hedging language is better but degrades fast into noise if it appears on every response. The most useful pattern we have found is showing sources and letting the user judge, rather than asserting a probability.",
      "Refusal deserves design attention too. A refusal that explains what it will not do, and offers the nearest thing it will, reads as competence. One that apologises at length reads as evasion.",
      "None of this is about making the model seem smarter. It is about making the boundary between the model's capability and the user's judgement legible enough that the user can work with it.",
    ],
  },
  {
    slug: "the-brief-is-the-deliverable",
    title: "The brief is the deliverable",
    standfirst:
      "A good brief does more for the outcome than any amount of craft applied afterwards.",
    date: "14 October 2025",
    datetime: "2025-10-14",
    readingMinutes: 5,
    author: "Dara Okonjo",
    body: [
      "Studios talk about process constantly and about briefs almost never, which is odd, because the brief determines more of the outcome than the process does.",
      "The briefs that produce good work share a shape. They state a decision that needs making, not a deliverable that needs producing. They include the constraint that makes the problem hard. They name who has to be convinced. And they are short enough that everyone has actually read them.",
      "The briefs that produce mediocre work list adjectives. Modern, bold, premium, human. These are not constraints; they are moods, and every option satisfies them, which means the brief eliminates nothing.",
      "We now spend the first week of most projects rewriting the brief with the client. It is the least billable and highest-leverage week of the engagement.",
    ],
    image: "/articles/the-brief-is-the-deliverable.png",
    imageAlt:
      "A completed brief standing in a cardboard box on a conveyor belt, the box marked HANDLE WITH CLARITY",
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
