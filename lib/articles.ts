/**
 * A picture belonging to a piece.
 *
 * `width`/`height` are the file's own, so `next/image` can reserve the right
 * box and render at the source ratio without being told one. That is what lets
 * the body figures carry whatever shape they arrived in — they are not all 3:2,
 * and cropping one to match the others would cut the content out of it.
 *
 * Files live under a plain lowercase path keyed by slug. The folder they arrive
 * in has a literal `&` in its name, which Next 404s in a static route, so they
 * are copied to /public/articles rather than referenced where they landed.
 */
export interface ArticleImage {
  src: string;
  /**
   * What the picture shows — not the title, which the page already prints
   * beside it as a heading. Describing the picture instead of repeating the
   * headline is what makes it worth announcing at all.
   */
  alt: string;
  width: number;
  height: number;
}

/**
 * A block of an article body.
 *
 * The bodies were a flat `string[]` of paragraphs, which gave every piece a
 * single undifferentiated run of text and no heading structure at all — hard to
 * scan at length, and nothing for a search engine to read as sections. Blocks
 * keep the data plain (no CMS, no markdown dependency) while allowing the two
 * things the writing actually needs: sections, and the occasional summary.
 *
 * `text` may contain inline links written as `[label](/services)`. See
 * ArticleBody for the parser, which handles that and nothing else.
 */
export type ArticleBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  /** A short summary, set apart. Used sparingly — usually once, at the end. */
  | { kind: "takeaway"; text: string };

const p = (text: string): ArticleBlock => ({ kind: "p", text });
const h2 = (text: string): ArticleBlock => ({ kind: "h2", text });
const h3 = (text: string): ArticleBlock => ({ kind: "h3", text });
const takeaway = (text: string): ArticleBlock => ({ kind: "takeaway", text });

export interface Article {
  slug: string;
  title: string;
  standfirst: string;
  date: string;
  /** ISO for <time datetime>. */
  datetime: string;
  readingMinutes: number;
  author: string;
  /** The piece itself. */
  body: ArticleBlock[];
  /**
   * Overrides for the `<title>` and description, where the headline alone is
   * not what someone would search for. The headline stays as written — these
   * only affect metadata, never the page.
   */
  seoTitle?: string;
  metaDescription?: string;
  /**
   * The piece's own artwork: the listing card, and the hero at the top of the
   * article. One image doing both jobs, so a piece cannot show one face in the
   * index and a different one when opened.
   */
  image?: ArticleImage;
  /**
   * An optional second picture, set into the body at an editorial break. Only
   * where one genuinely exists for the piece — a duplicate of the hero halfway
   * down would be worse than no picture at all.
   */
  bodyImage?: ArticleImage;
  /**
   * Which BLOCK `bodyImage` follows, zero-indexed. Defaults to the midpoint,
   * and is stated wherever the natural section break is not the arithmetic
   * middle. It moved when the bodies were expanded: an index chosen for a
   * five-paragraph piece sits a fifth of the way down a thirty-block one.
   */
  bodyImageAfter?: number;
}

export const ARTICLES: Article[] = [
  {
    slug: "the-tenth-screen",
    title: "The tenth screen",
    standfirst:
      "Product teams design the first screen forty times and the tenth screen once. It shows.",
    seoTitle: "The tenth screen: designing for repeat use",
    metaDescription:
      "Teams design the first screen forty times and the tenth screen once. How to prioritise design effort by how often a view is actually used, and why the dense view should be designed first.",
    date: "12 June 2026",
    datetime: "2026-06-12",
    readingMinutes: 4,
    author: "Ilse Moreau",
    body: [
      p("Every product review meeting looks at the same screen: the one a new user sees first. It gets iterated, tested, argued over and shipped. Meanwhile the screen that someone will see two hundred times a year gets designed on a Thursday afternoon and never revisited."),
      p("That imbalance is one of the most reliable sources of quiet frustration in software. Nobody raises it, because nobody can point at it. The onboarding was lovely. The product is exhausting."),

      h2("Why the first screen wins the argument"),
      p("This is backwards, and it is also completely understandable. First screens are legible to stakeholders. They photograph well. They are what a homepage shows, what a pitch opens with and what a board sees. The tenth screen is dense, contextual and boring to look at in a slide."),
      p("There is a structural reason as well as a political one. A first screen can be judged by someone who has never used the product, which means everyone in the room is qualified to have an opinion on it. Judging the tenth screen requires knowing the work it supports. Fewer people can do that, so it gets discussed less, so it gets designed less."),
      p("The result is an interface optimised for the moment of least commitment and neglected at the moment of most."),

      h2("A test: sort your views by how often they are seen"),
      p("Open the interface you are designing and list every distinct view. Next to each one, write how many times a realistic user will see it in a year — one person's count, not the total across everybody. Then sort the list by that number."),
      p("Now compare it against how much design time each view has actually received. In most products the two orderings are close to inverted. The sign-up flow, seen once, has had months. The record list, seen daily, has had an afternoon and two rounds of colour changes."),
      h3("What the count usually shows"),
      p("Three patterns come up repeatedly. A search or list view that is the real home of the product but was never treated as one. A detail view that has quietly accumulated fields until it has no hierarchy left. And an empty state designed for a demo account rather than for somebody six months in with four hundred records."),
      p("None of these are exotic problems. They are problems nobody had a reason to raise."),

      h2("Design the dense view first"),
      p("The fix is not glamorous. Design the densest, most frequently visited view first, at real data volume, with worst-case string lengths and the least tidy genuine record you can find. If it holds, the sparse views will be straightforward — they are the same system with less in them."),
      p("Do it the other way round and you spend the rest of the project discovering that the layout cannot survive information. Padding that felt generous with three rows becomes unusable at sixty. A card that looked composed with a short title breaks with a long one. Every one of those discoveries arrives late, when the component is already used in nine places and changing it is a negotiation."),
      h3("What “real data” means in practice"),
      p("Real means the production distribution, not a tidy sample. Names one character long and names ninety. Currencies with no decimal places. A status field where eighty percent of rows share the same value, so the colour coding you were relying on carries almost no information. Dates in the past that should not be. If every example in your design file is plausible and pleasant, the design has not been tested."),
      p("This is also where designing and building in one team earns its keep: the person drawing the view can look at the real shape of the data rather than requesting a sample and waiting a week. It is a large part of why we keep [design and development](/services/web-design-development) in the same room."),

      h2("What a tenth-screen interface rewards"),
      p("Interfaces designed around the tenth visit tend to reward familiarity. Stable positions, so muscle memory works. Predictable density, so the eye knows where to go without re-reading. Keyboard paths, so the fastest route does not require a mouse. Restraint in motion, because an animation you enjoy once is an animation you sit through two hundred times."),
      p("Interfaces designed around the first visit reward novelty instead — and novelty becomes a cost the moment somebody has learned the tool. That is the same argument as [motion that earns it](/articles/motion-that-earns-it), applied to layout rather than movement."),

      h2("Common mistakes"),
      p("The most common is treating “dense” as a synonym for “cluttered” and responding by removing information people need. Density is not the problem; undifferentiated density is. A table with twelve columns and a clear visual hierarchy is calmer to use than a table with six and none."),
      p("The second is designing the tenth screen once and never returning to it. Frequency of use changes as a product grows: the view that mattered at launch may not be the one that matters after the second feature ships."),
      p("The third is measuring the wrong thing. Time on page is a poor proxy for a view somebody opens in order to get something done. Repeat visits and completion speed say considerably more, and they point in the opposite direction."),

      takeaway("Count how often each view is genuinely seen, sort by that number, and give the top of that list the design time currently going to the screen that photographs best. If the design holds at real data volume, everything sparser will hold too."),
    ],
    image: {
      src: "/articles/the-tenth-screen.png",
      alt: "A phone lying flat with a whole landscape growing out of its screen — a path, a staircase and a figure walking towards a sunset",
      width: 1536,
      height: 1024,
    },
    bodyImage: {
      src: "/articles/the-tenth-screen-body.png",
      alt: "Two phones on a blue field showing the LEVANT product page — size, quantity and availability on one, the product gallery on the other",
      width: 2000,
      height: 2000,
    },
    /* Before "Design the dense view first", and a dense product view is exactly
       what the picture shows — it reads as the example the section is about to
       argue for. Near the middle of the expanded piece rather than the middle
       of the five paragraphs it was originally placed in. */
    bodyImageAfter: 11,
  },
  {
    slug: "motion-that-earns-it",
    title: "Motion that earns it",
    standfirst:
      "Animation should explain something or acknowledge something. Most of it does neither.",
    seoTitle: "Motion that earns it: when UI animation is worth the time",
    metaDescription:
      "Interface animation should explain a spatial relationship or acknowledge an action. A practical test for what to keep, how long each kind should run, and the transition most teams under-invest in.",
    date: "28 April 2026",
    datetime: "2026-04-28",
    readingMinutes: 4,
    author: "Tomas Reiff",
    body: [
      p("There are exactly two defensible reasons to animate something in an interface. The first is to explain a spatial relationship: this panel came from that button, this row moved there, these items reordered. The second is to acknowledge an action: we heard you, something is happening, it worked."),
      p("Everything else is decoration, and decoration is not free. It costs milliseconds of attention, and on lower-end devices it costs frames. The question is never whether an animation is nice. It is what the animation is telling somebody."),

      h2("The two reasons, in practice"),
      h3("Explaining a spatial relationship"),
      p("A menu that grows out of the button that opened it tells you where you are and how to get back. The same menu fading in from nowhere tells you nothing, and quietly costs you the sense that the interface has a structure at all. Sorting a table with a transition shows rows moving to new positions; sorting it with a hard cut leaves people re-reading the whole list to work out what changed."),
      p("The test is whether removing the movement would leave somebody briefly lost. If it would, the movement is carrying information and is worth its cost."),
      h3("Acknowledging an action"),
      p("This is smaller and far more common. A button that responds on press. A field that confirms it accepted the input. A save indicator that appears before the request has finished. Acknowledgement is about latency more than delight: it closes the gap between doing something and seeing evidence that you did it."),
      p("It is also the category most often over-built. Acknowledgement wants to be almost subliminal. By the time you notice it as an animation, it is too long."),

      h2("The one-sentence test"),
      p("Describe what the animation tells the user, in one sentence, without using the words polish, premium, delight or feel. If you cannot, cut it — or shorten it until it disappears."),
      p("This is a blunt instrument on purpose. It is very easy to justify motion in the abstract and very hard to justify a specific instance of it in plain language. Most decoration does not survive the second attempt at the sentence."),

      h2("Duration follows purpose"),
      p("Once you know which of the two jobs an animation is doing, its length stops being a matter of taste. Acknowledgement wants to be fast — roughly 120 to 200ms, barely perceived. Explanation wants to be slow enough to follow, usually 300 to 500ms, with a curve that decelerates so the eye can land on the end state."),
      p("Easing carries as much meaning as duration. A movement that starts quickly and slows reads as something arriving and settling. One that starts slowly and accelerates reads as something leaving. Getting those the wrong way round makes an interface feel subtly wrong in a way people rarely manage to name."),
      h3("Where longer durations are defensible"),
      p("Mainly one place: a transition that covers a change the user would otherwise have to reconcile by themselves, such as moving between pages. There the animation is doing real work — it hides a reflow, a scroll reset and a repaint, and it keeps the reader oriented while the ground moves underneath them. That is worth a second of somebody's time. A hover state is not."),

      h2("The animation almost everyone under-invests in"),
      p("It is the one between pages. It is the only moment where a user genuinely loses their place, and on most sites it is a hard cut: the current page vanishes, the new one appears, the scroll position jumps to the top, and the reader reassembles the context themselves."),
      p("Treating that moment as a designed transition rather than an absence is one of the cheapest improvements available to most sites. It is also most of what we mean by [motion and video](/services/motion-video) as a discipline: the moving parts of a brand, made to do a job rather than to be admired."),

      h2("Motion and the people who asked for less of it"),
      p("`prefers-reduced-motion` is not an edge case, and it is not only about vestibular disorders — plenty of people simply turn it on. Respecting it does not mean removing feedback. It means removing travel: keep the state change, drop the distance, shorten or remove the transition."),
      p("A useful discipline is to build the reduced-motion version first. If the interface is comprehensible with nothing moving, every animation added afterwards is genuinely additive rather than load-bearing — and you will not discover late that a piece of information was only ever conveyed by a movement."),

      h2("Common mistakes"),
      p("Animating on every state change, so nothing stands out and the interface acquires a permanent low-level shimmer. Using one duration everywhere, which makes acknowledgement feel sluggish and explanation feel abrupt. Animating layout properties — width, height, top — where a transform would do, which is the difference between a composited animation and a dropped frame."),
      p("And staging entrances that fire while the element is still hidden behind something else, so the reader arrives at a page that has already finished animating. That one is easy to miss because it looks correct in isolation and only shows up when the animation is put back into the real page."),

      takeaway("Every animation should survive one sentence describing what it tells the user. Acknowledgement runs 120–200ms; explanation runs 300–500ms and decelerates. Spend the surplus on the transition between pages, which is the only moment people actually lose their place."),
    ],
    image: {
      src: "/articles/motion-that-earns-it.png",
      alt: "A figure leaping out of a phone screen through a burst of blue and orange paint, against the words MOTION THAT EARNS IT",
      width: 1536,
      height: 1024,
    },
  },
  {
    slug: "how-ai-is-reshaping-creative-design",
    title: "How AI Is Reshaping Creative Design",
    standfirst:
      "It has not replaced the judgement. It has moved where the judgement gets spent.",
    seoTitle: "How AI is reshaping creative design",
    metaDescription:
      "AI has not replaced creative judgement — it has moved where judgement gets spent. How it changes ideation, research, iteration and prototyping, and what stays firmly human.",
    date: "3 March 2026",
    datetime: "2026-03-03",
    readingMinutes: 6,
    author: "Ilse Moreau",
    body: [
      p("The question usually asked is whether a model can design. It is the wrong question, and it produces an argument neither side can win. The more useful one is narrower: which parts of this work were always judgement, and which parts were only the labour that judgement had to pass through to reach the page?"),
      p("Split the work along that line and the last few years stop looking like either a threat or a revolution. They look like a change in where the expensive part sits."),

      h2("What actually got cheaper"),
      p("Most of what has changed sits firmly on the labour side. Producing twenty directions instead of three. Filling a layout with plausible copy before the real copy exists. Standing up a working prototype on the same afternoon the idea arrived. Turning a rough sketch into something a stakeholder can react to without a day of production in between."),
      p("None of that was ever the creative act. It was the toll paid to get to it. Removing a toll does not make the destination worth less — it makes the road cheaper, and that changes what is worth attempting at all."),
      p("The second-order effect matters more than the first. When exploring a direction costs an hour instead of a week, teams explore directions they would previously have talked themselves out of. The work gets braver at the edges, because being wrong stopped being expensive."),

      h2("Speed is the visible change. Taste is the constraint."),
      p("Speed is the part most easily mistaken for the point. A team that can generate forty options and a team that can choose well between three are not the same team, and only one of those capabilities got cheaper."),
      p("Taste — knowing which of the forty is worth defending, and being able to say why — has quietly become the binding constraint on almost every project. It was always necessary. It used to be rationed by how many options anybody could physically produce, and that rationing has gone."),
      p("Which is why “we can produce more” is a weak claim on its own. Volume is only useful to a team that can also discard quickly and for stated reasons. Without that, more options is simply a larger pile to be indecisive about, and the indecision now happens later, with more sunk cost attached."),

      h2("Where it genuinely helps"),
      h3("Research and synthesis"),
      p("Grouping a thousand support tickets into themes is genuinely faster. So is summarising interviews, clustering feedback and getting a first read on a corpus nobody has time to read end to end."),
      p("What it does not do is decide which theme is the business's actual problem. That judgement depends on strategy, cost and appetite — things a model has no stake in. Treat synthesis as a way of reaching the shortlist faster, not as a way of skipping the argument about which item on it matters."),
      h3("Iteration"),
      p("A model will produce another variant indefinitely and never once tell you to stop. That is genuinely useful for widening a search early, and genuinely dangerous later, because “try another” is always available and always feels like progress."),
      p("Knowing when to stop is a judgement about the audience, the constraint and the risk. It is most of the job, and it is the first thing to get skipped when the next variant is one click away."),
      h3("Prototyping"),
      p("The gap between a static design and something you can actually click has narrowed considerably. That is a real change in how early an idea can be tested against reality rather than against opinion, and it moves decisions earlier — to the point where they are still cheap to revisit."),

      h2("Where it does not help"),
      p("Anywhere the cost was judgement rather than labour. Deciding what a business should be known for. Choosing which of three defensible directions fits a market you have actually looked at. Weighing whether a pattern some people find slightly confusing is still worth keeping because every alternative is worse somewhere else."),
      p("There is a related trap in interface work: designing as though the model will be right. That deserves its own treatment, and has one in [designing for models that are wrong](/articles/designing-for-models-that-are-wrong)."),

      h2("Authorship, and how it gets lost"),
      p("Authorship survives all of this, but only where it is actually exercised. The failure worth worrying about is not designers being replaced. It is designers accepting the first output because it is competent — when competent is the floor these tools now guarantee, and the entire reason to hire anybody is what sits above it."),
      p("A generated starting point is a draft with nobody's name on it. It becomes work when someone decides what it is for, removes the parts that serve nothing, and takes responsibility for what is left. That decision is the thing being paid for, and it does not become less valuable because the raw material arrived faster."),
      p("The practical risk is homogeneity. Tools trained on what already exists are, by construction, good at producing more of what already exists. If a brand's job is to be distinguishable, the default output is precisely the wrong place to stop."),

      h2("The floor rose. The ceiling did not."),
      p("The most durable change is what happened to competence. Work that is merely competent — a clean layout, a serviceable illustration, copy that reads properly — used to be a reasonable thing to sell, because producing it reliably was difficult. It is now close to free, and anything close to free stops being a differentiator."),
      p("What that leaves is everything competence was standing in front of: whether the thing is distinctive, whether it is aimed at somebody specific, whether it is making a claim worth making. Those were always the harder questions. They were simply easier to avoid when producing the artefact absorbed most of the budget."),
      p("Craft has not stopped mattering, but where it matters has narrowed. It matters most where an audience can actually perceive it — typography they read for minutes at a time, motion they sit through repeatedly, the density of a screen they use every day. It matters least in the places it was most often spent: producing variations nobody outside the team will ever see."),

      h2("What it changes about briefs and reviews"),
      p("Two practical things shift. Reviews stop being about whether the work is well made, because it usually is, and become about whether it is the right one. That is a harder conversation and a more useful one, and teams that have not prepared for it tend to fill the gap with taste-based notes that nobody can act on."),
      p("Briefs have to name the decision more sharply, because options are now cheap enough that a vague brief will generate forty plausible answers instead of three, and none of them will be wrong enough to reject cleanly. A brief that says what has to be true for the work to succeed is the only reliable defence against that — which is the argument in [the brief is the deliverable](/articles/the-brief-is-the-deliverable), made more urgent by the tooling."),

      h2("A working rule"),
      p("Use the tools where the cost was labour. Decline to use them where the cost was judgement. Let them widen the search and shorten the loop, and do not let them make the choice."),
      p("In practice that means being explicit about which mode you are in. Widening — generate freely, cheaply, without attachment. Narrowing — put the generator down and argue from the constraint, the audience and the evidence. Most of the poor outcomes we see come from running both modes at once, where every difficult decision can be deferred by producing one more option."),
      p("It is how we approach [AI design](/services/ai-design) work, and how we tend to advise teams [building AI products](/industries/ai): the model is a fast collaborator with no stake in the result, which makes it excellent at proposing and unqualified at deciding."),

      takeaway("Producing more is not the same as producing better. Use these tools to widen the search and shorten the loop, keep the choosing entirely human, and be explicit about which of the two you are doing at any given moment."),
    ],
    image: {
      src: "/articles/how-ai-is-reshaping-creative-design.png",
      alt: "A designer's desk at dusk, a monitor full of generated imagery beside a paper storyboard, with a glowing neural diagram labelled AI floating above the keyboard",
      width: 1536,
      height: 1024,
    },
    bodyImage: {
      src: "/articles/how-ai-is-reshaping-creative-design-body.png",
      alt: "A designer working at a tablet with a stylus, the screen ringed by floating labels reading Generate, Adapt, Suggest, Refine, Imagine and Enhance",
      width: 1536,
      height: 1024,
    },
    /* At the end of "Where it genuinely helps" and before "Where it does not" —
       the hinge the whole piece turns on, and the picture is a designer working
       with exactly the tools that section describes. */
    bodyImageAfter: 18,
  },
  {
    slug: "what-a-rebrand-cannot-fix",
    title: "What a rebrand cannot fix",
    standfirst:
      "If the product is confusing, a new wordmark makes it confusing and unfamiliar.",
    seoTitle: "What a rebrand cannot fix",
    metaDescription:
      "A rebrand amplifies an existing message. How to tell a positioning problem from an identity problem before commissioning either, and what identity work genuinely does fix.",
    date: "19 January 2026",
    datetime: "2026-01-19",
    readingMinutes: 3,
    author: "Dara Okonjo",
    body: [
      p("We turn down rebrands. Not often, but reliably in one situation: when the stated problem is positioning and the actual problem is that nobody can tell what the product does from using it."),
      p("That distinction sounds pedantic until you have watched a company spend two quarters and a significant budget making an unclear message louder."),

      h2("Identity work is amplification"),
      p("A brand identity does not create meaning. It takes meaning that already exists and makes it consistent, recognisable and repeatable. That is genuinely valuable, and it is most of what [brand identity](/services/brand-identity) work is for."),
      p("But amplification is indifferent to what it is amplifying. If the message is unclear, you get a louder unclear message, delivered with more confidence and better typography. Confidence attached to confusion is worse than confusion on its own, because it removes the visible signal that something is wrong."),

      h2("The diagnostic question"),
      p("It is unglamorous: can three people who use the product describe what it does in one sentence, and do those sentences agree?"),
      p("Ask three customers, not three colleagues. Colleagues share vocabulary that customers do not have, which is exactly the failure you are testing for. Write the sentences down verbatim, before comparing them, and resist the urge to help."),
      h3("If the sentences agree"),
      p("You have a real message and an expression problem. The work is making that message land faster, look like itself everywhere, and stop being reinvented by whoever is building the next deck. This is a good rebrand, and it will do what the brief says it will."),
      h3("If the sentences disagree"),
      p("Then the work is positioning and product clarity, and the visual identity should wait until there is something settled to express. Doing it in the other order commits an unclear message to a system whose entire purpose is to repeat it faithfully for years."),
      p("This is usually the cheaper diagnosis of the two, which is a good reason to make it before anybody opens a design tool."),

      h2("What a rebrand genuinely does fix"),
      p("Worth being precise here, because “rebrands do not fix things” is as wrong as the opposite. An identity reliably fixes inconsistency, and inconsistency is a real cost: sales decks that contradict the website, five versions of the logo in circulation, a colour that means something different in every channel."),
      p("It fixes the legibility of a message that already exists but is being expressed badly. It fixes a look that no longer matches the price, the ambition or the audience. And it fixes the internal problem of nobody knowing what “on brand” means, which quietly slows down every piece of work a company produces."),
      p("What it does not fix is a product nobody can explain, a proposition aimed at two audiences at once, or a business that has not yet decided what it is choosing not to do."),

      h2("Sequencing, not refusal"),
      p("None of this is an argument against rebrands. It is an argument for sequencing: positioning, then expression, then application — in that order, with the first settled enough that the second is not quietly guessing."),
      p("The studios producing identity work with real staying power are usually the ones that insisted on getting the sentence right first. It is also why [the brief matters more than the deliverable](/articles/the-brief-is-the-deliverable): a rebrand brief that names the decision rather than the artefact tends to produce a better artefact."),

      h2("Common misconceptions"),
      p("That a rebrand will fix a growth problem. It can remove friction from an existing demand; it cannot manufacture demand that was not there."),
      p("That a refresh is the safe middle option. A refresh applied to an unclear message produces a slightly nicer unclear message, at a cost not far below doing the whole thing properly."),
      p("That the audience will notice. Internally a rebrand is enormous. Externally, most customers register that something changed and then return to whatever they came for. That is not an argument against doing it — it is an argument for spending the effort where it changes their experience rather than where it changes yours."),

      takeaway("Before commissioning identity work, ask three customers what the product does. If their sentences agree, you have an expression problem and a rebrand will help. If they disagree, you have a positioning problem, and amplifying it will make it worse."),
    ],
    image: {
      src: "/articles/what-a-rebrand-cannot-fix.png",
      alt: "A torn paper poster of a blue puzzle piece taped to a wall, with new logo, new colours and new font each crossed out",
      width: 1536,
      height: 1024,
    },
  },
  {
    slug: "designing-for-models-that-are-wrong",
    title: "Designing for models that are wrong",
    standfirst:
      "The interesting problem in AI interfaces is not generation. It is correction.",
    seoTitle: "Designing for models that are wrong",
    metaDescription:
      "The interesting problem in AI interfaces is not generation, it is correction. Practical patterns for error, confidence, refusal and undo — and why legibility beats accuracy.",
    date: "8 December 2025",
    datetime: "2025-12-08",
    readingMinutes: 5,
    author: "Tomas Reiff",
    body: [
      p("Most AI features are designed as though the model will be right. The happy path gets a beautiful streaming animation. The failure path gets a thumbs-down icon."),
      p("But a model that is right ninety percent of the time will be wrong in front of your user within the first ten interactions. What happens then is not an edge case. It is the product."),

      h2("The failure path is the product"),
      p("This is a design problem before it is a modelling problem. Improving accuracy is expensive, slow and eventually asymptotic. Improving what happens when the output is wrong is comparatively cheap, entirely within your control, and it is what determines whether somebody trusts the feature enough to keep using it."),
      p("The useful reframing: you are not building a system that answers. You are building a system that proposes, plus a set of affordances for a person to accept, adjust or reject the proposal. Once the feature is described that way, the design work stops being about the output and starts being about the controls around it."),

      h2("Correction should be cheap, specific and local"),
      h3("Cheap"),
      p("One interaction, not a re-prompt. If the only way to fix a wrong output is to rewrite the request and run it again, the user pays the full cost of generation for a partial error — and loses everything that was right the first time along with the part that was not."),
      h3("Specific"),
      p("Let people point at the wrong part rather than rejecting the whole output. A thumbs-down tells you something failed and nothing about what. An interface that lets somebody select the offending sentence, field or row gives them agency, and gives you a far better signal than a binary ever will."),
      h3("Local"),
      p("The correction should apply where they are, without losing the surrounding work. Anything that resets state, closes a panel or discards nearby edits teaches the user that correcting is dangerous — and the lesson they take from that is to stop trusting the feature, not to correct more carefully next time."),

      h2("Confidence is harder than it looks"),
      p("Showing confidence sounds like the obvious answer to uncertainty, and it is usually the wrong one. Numeric confidence is close to meaningless to most users and frequently miscalibrated in the model itself, so you end up presenting a precise-looking number that is not precise."),
      p("Hedging language is better, and degrades quickly. If every response is wrapped in “I think” and “you may want to verify”, the hedge stops carrying information within a day and becomes texture that people read straight past."),
      p("The most useful pattern we have found is showing the basis rather than asserting a probability: the sources, the rows it used, the fields it read. That lets the user apply their own judgement, which they are far better placed to do than the model is, and it fails gracefully — a visible source that looks wrong is immediately actionable in a way that “72% confident” never is."),

      h2("Refusal deserves design attention"),
      p("A refusal that explains what it will not do, and offers the nearest thing it will, reads as competence. One that apologises at length reads as evasion. One that refuses silently reads as broken."),
      p("The same applies to partial capability. “I can do this part but not that part” is a genuinely useful response, and it is rarely designed for, because it does not fit an interface built around producing a single answer."),

      h2("Undo is the most underrated control"),
      p("Anywhere a model takes an action rather than producing text — moving data, sending something, changing a record — undo does more for trust than any amount of confidence display. It converts an irreversible risk into a reversible one, which is the difference between a feature people try and a feature people avoid."),
      p("Where undo is genuinely impossible, that is the moment for a confirmation step. Where it is possible, a confirmation step is usually just friction charged to every correct action in order to insure against the occasional wrong one."),

      h2("Test with a model that is wrong on purpose"),
      p("Most AI features are demoed on the happy path and reviewed on the happy path, which means the correction experience is frequently the only part of the product nobody has actually looked at. It ships untested because it was never on screen during a review."),
      p("The fix is procedural rather than clever: put deliberately wrong output in front of the team during design review. Stub a response with the wrong name in it, a fabricated row, a plausible-but-incorrect summary. Then watch how many interactions it takes to recover, and whether anything the user had already done gets lost on the way."),
      p("It is uncomfortable in a way that demos are designed not to be, and it surfaces the two failures that matter most: corrections that cost more than starting again, and errors the interface presents with exactly the same confidence as everything else."),

      h2("Making the boundary legible"),
      p("None of this is about making the model seem smarter. It is about making the boundary between the model's capability and the user's judgement legible enough that the user can work with it."),
      p("People are remarkably tolerant of a tool that is wrong in ways they can see and fix, and remarkably intolerant of one that is wrong in ways they cannot predict. Legibility, not accuracy, is what separates the two — which is why the correction path deserves the same care as the generation path, and usually gets a fraction of it."),
      p("This is the practical half of the argument in [how AI is reshaping creative design](/articles/how-ai-is-reshaping-creative-design): the model proposes, the person decides, and the interface's job is to make that division obvious. It is the shape of most of the [AI product work](/industries/ai) we take on."),

      takeaway("Design the correction path with the same care as the generation path. Make fixing cheap, specific and local; show the basis rather than a confidence score; and prefer undo over confirmation wherever the action can be reversed."),
    ],
    image: {
      src: "/articles/designing-for-models-that-are-wrong.png",
      alt: "A single blue jigsaw piece resting above the gap it does not sit in, surrounded by plain white pieces",
      width: 1536,
      height: 1024,
    },
  },
  {
    slug: "the-brief-is-the-deliverable",
    title: "The brief is the deliverable",
    standfirst:
      "A good brief does more for the outcome than any amount of craft applied afterwards.",
    seoTitle: "The brief is the deliverable: how to write a design brief",
    metaDescription:
      "A design brief should state a decision, not a deliverable. What separates briefs that produce good work from briefs that produce adjectives — and why rewriting one is the cheapest leverage in a project.",
    date: "14 October 2025",
    datetime: "2025-10-14",
    readingMinutes: 3,
    author: "Dara Okonjo",
    body: [
      p("Studios talk about process constantly and about briefs almost never, which is odd, because the brief determines more of the outcome than the process does."),
      p("A strong brief given to an average team beats a weak brief given to a great one. The second will produce something better looking, aimed at the wrong thing."),

      h2("What good briefs have in common"),
      h3("They state a decision, not a deliverable"),
      p("“We need a new website” is a purchase order. “We need prospects to understand what we do before they reach the pricing page” is a brief. The first names an artefact; the second names a change, and leaves room for the possibility that the artefact is not the answer."),
      h3("They include the constraint that makes it hard"),
      p("Every interesting project has one: a migration that cannot slip, a regulator, a legacy system, a small team who will own it afterwards, a category convention you cannot ignore without losing trust. Briefs that omit the hard constraint get proposals that ignore it, and the constraint reappears in week six as a change request."),
      h3("They name who has to be convinced"),
      p("Work does not get approved by an organisation; it gets approved by people. If a founder, a head of sales and a compliance lead all have to say yes, that is three sets of objections the work has to answer, and knowing it at the start is worth more than another week of exploration."),
      h3("They are short enough to be read"),
      p("A brief nobody has finished is not a brief. Length is not rigour — the longest documents we receive are usually the least decided, with every unresolved internal argument preserved in full rather than settled."),

      h2("What weak briefs look like"),
      p("They list adjectives. Modern, bold, premium, human. These are moods rather than constraints: every option satisfies them, which means the brief eliminates nothing, and the first review becomes the real briefing session — conducted through work instead of words, at considerably greater expense."),
      p("They describe competitors instead of customers. “Something like theirs, but better” inherits someone else's positioning without inheriting any of the reasons for it, including the ones that do not apply to you."),
      p("They defer the decision. A brief asking to “explore several directions” is often a brief that could not reach agreement, using exploration to postpone the argument until there is something concrete to have it about. That argument is very much cheaper on paper."),

      h2("Rewriting the brief with the client"),
      p("We now spend the first week of most projects rewriting the brief together. It is the least billable and highest-leverage week of the engagement, and it is not a formality: most briefs change substantially, and a few reveal that the project someone asked for is not the project they need."),
      p("The method is unremarkable. Restate the request as a decision. Ask what would have to be true for it to work. Ask what has already been tried, and why it did not. Name the constraint nobody has written down. Then get it onto one page and have the people who will approve the work agree that it is right."),
      p("Occasionally this ends with us recommending less work than was asked for. That is a good outcome, and a rare one to be paid for — which is roughly why it belongs in the first week rather than the last."),

      h2("What this buys you"),
      p("Fewer rounds. Reviews about whether the work answers the brief rather than whether the reviewer likes it, which is the single largest source of drift in creative projects. And a much better chance that what gets built is the thing that mattered rather than the thing that was easiest to specify."),
      p("It also changes what the work can be. A brief that names a decision leaves room for a designer to propose something the client had not imagined and can still recognise as an answer. A brief that names a deliverable does not — the best possible outcome is the thing that was already described, executed well."),
      p("If you are weighing up a project and are not yet sure the brief is right, that is a good moment to [start a conversation](/contact) rather than a bad one."),

      takeaway("Write the brief as a decision that needs making, include the constraint that makes it hard, name who has to approve it, and keep it to a page. Then spend a week making it sharper — it is the cheapest leverage available in the whole project."),
    ],
    image: {
      src: "/articles/the-brief-is-the-deliverable.png",
      alt: "A completed brief standing in a cardboard box on a conveyor belt, the box marked HANDLE WITH CLARITY",
      width: 1536,
      height: 1024,
    },
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * The four pieces the homepage teaser shows, named rather than derived.
 *
 * This was `ARTICLES.filter(a => a.image).slice(0, 4)`, which is a rule that
 * quietly changes its own answer: the moment a newer piece gained artwork it
 * took the fourth slot and pushed "The brief is the deliverable" off the
 * homepage. Nobody chose that. An editorial selection is an editorial decision,
 * so it is written down here and the section renders exactly this list.
 *
 * The order is the array's, so the row still reads newest-first.
 */
export const HOMEPAGE_ARTICLE_SLUGS = [
  "the-tenth-screen",
  "motion-that-earns-it",
  "what-a-rebrand-cannot-fix",
  "the-brief-is-the-deliverable",
] as const;

/**
 * Resolved in `ARTICLES` order, and only where artwork exists — the teaser is
 * built around pictures, so a card can never appear with an empty frame. A slug
 * that no longer resolves drops out rather than throwing.
 */
export function homepageArticles(): Article[] {
  const wanted = new Set<string>(HOMEPAGE_ARTICLE_SLUGS);
  return ARTICLES.filter((a) => wanted.has(a.slug) && a.image);
}

/** Word count of a piece's prose, for the reading estimate and for checks. */
export function articleWordCount(article: Article): number {
  return article.body.reduce(
    (n, block) => n + block.text.trim().split(/\s+/).filter(Boolean).length,
    0,
  );
}
