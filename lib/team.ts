export interface Person {
  name: string;
  role: string;
  /** One dry line. Not a personality quiz answer. */
  note: string;
  /** Grid position on the About board, before anyone drags it. */
  col: number;
  row: number;
}

export const TEAM: Person[] = [
  {
    name: "Ilse Moreau",
    role: "Founder, design",
    note: "Writes the brief three times before anyone opens Figma.",
    col: 0,
    row: 0,
  },
  {
    name: "Dara Okonjo",
    role: "Strategy",
    note: "Will ask what decision this is meant to unblock.",
    col: 1,
    row: 0,
  },
  {
    name: "Tomas Reiff",
    role: "Motion, interaction",
    note: "Keeps a spreadsheet of easing curves. It is genuinely useful.",
    col: 2,
    row: 0,
  },
  {
    name: "Priya Raman",
    role: "Engineering lead",
    note: "Enforces the performance budget in CI so nobody has to argue.",
    col: 3,
    row: 0,
  },
  {
    name: "Jonas Vik",
    role: "Brand design",
    note: "Draws letterforms by hand first. Faster, somehow.",
    col: 0,
    row: 1,
  },
  {
    name: "Ada Fenn",
    role: "Product design",
    note: "Designs the empty state before the populated one.",
    col: 1,
    row: 1,
  },
  {
    name: "Rem Castellan",
    role: "Front-end",
    note: "Has opinions about focus rings. Correct ones.",
    col: 2,
    row: 1,
  },
  {
    name: "Noor Haddad",
    role: "Producer",
    note: "The reason projects land on the date we said.",
    col: 3,
    row: 1,
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Which case study this fit note belongs beside. */
  project: string;
}

/**
 * Rendered as "fit notes" — each quote is a piece that seats next to the
 * project it refers to, rather than a floating carousel of praise.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "They pushed back on our brief twice. Both times they were right, and it saved us a quarter.",
    name: "Richard",
    role: "Founder",
    project: "Bespoke Garden Decor",
  },
];
