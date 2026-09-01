/**
 * Terms and conditions, as data.
 *
 * The copy is supplied by Puzzle and is reproduced verbatim — only the
 * apostrophes and quotes are set as proper typographic marks, to match the
 * rest of the site. Nothing here is generated or paraphrased, and it is kept
 * out of the page component so that amending a clause is a change to this file
 * alone.
 *
 * `{EMAIL}` inside a paragraph is replaced at render time with a `mailto:`
 * link built from `SITE.email`, so the address in the terms cannot drift from
 * the one every other part of the site publishes.
 */

export interface TermsBlock {
  /**
   * `note` is the site's takeaway treatment — a blue rule and a mono label —
   * borrowed from the article body for the one clause written as an aside.
   */
  kind: "p" | "list" | "note";
  /** `p` and `note`. */
  text?: string;
  /** `list` only. */
  items?: string[];
}

export interface TermsSection {
  /** Anchor id, so an individual clause can be linked to directly. */
  id: string;
  heading: string;
  blocks: TermsBlock[];
}

export const TERMS: TermsSection[] = [
  {
    id: "definitions",
    heading: "Definitions",
    blocks: [
      {
        kind: "p",
        text: "‘You’, ‘client’ or ‘clients’ refers to the person and/or the business that we are working with.",
      },
      {
        kind: "p",
        text: "‘We’, ‘Puzzle’, ‘us’ and ‘our’ all refer to Puzzle Studios.",
      },
      {
        kind: "p",
        text: "A live website means any website which has been completed to the client’s satisfaction and has been uploaded to the Internet to a web address of the client’s choice.",
      },
      {
        kind: "p",
        text: "The client’s approval for work to commence shall be deemed a contractual agreement between the client and Puzzle.",
      },
      {
        kind: "note",
        text: "Approval for the work to commence, and payment of the advance fee, indicates that the client accepts the terms and conditions outlined in this document.",
      },
    ],
  },
  {
    id: "order-agreement",
    heading: "Order Agreement",
    blocks: [
      {
        kind: "p",
        text: "An order agreement is a written or verbal contract, made by telephone, email or verbally between Puzzle and the client. Once an order agreement is in place, Puzzle will complete all work covered by the scope agreed in your quotation.",
      },
    ],
  },
  {
    id: "contract-with-puzzle",
    heading: "Contract with Puzzle",
    blocks: [
      {
        kind: "p",
        text: "As the client, you can accept our offer either verbally or in writing and when this is done we can begin the work on your project. Your intent to enter a contract with us is followed by the payment of your initial deposit, which formalises acceptance of our quotation and agreement to the work commencing.",
      },
    ],
  },
  {
    id: "our-commitment",
    heading: "Our Commitment",
    blocks: [
      {
        kind: "p",
        text: "Upon acceptance of our offer, Puzzle will deliver the services identified in your quotation in a professional and timely manner. We will keep you regularly informed throughout the process of design and production of your project and we will make every effort to meet any projected delivery schedules. Our aim is to ensure you are happy with our work and we will work with you to ensure this is the case.",
      },
    ],
  },
  {
    id: "liability",
    heading: "Liability",
    blocks: [
      {
        kind: "p",
        text: "Puzzle will not be liable for any costs incurred, compensation or loss of earnings due to work carried out for or on behalf of the client, or due to delays in the completion of a website where Puzzle has been delayed through no fault of its own, for example; when a client is required to provide specific content or information relative to the design and fails to meet agreed deadlines, fails to make key decisions relative to staged design work, fails to provide feedback, or has requested excessive changes to agreed design layout and content.",
      },
    ],
  },
  {
    id: "guarantee",
    heading: "Guarantee",
    blocks: [
      {
        kind: "p",
        text: "Puzzle guarantees any work for 6 months from the go-live date. In the unlikely event that any errors or issues arise within this time, these will be corrected at no cost to the client. After the guarantee period, any errors or faults will be fixed at our standard hourly rate.",
      },
    ],
  },
  {
    id: "payments",
    heading: "Payments",
    blocks: [
      {
        kind: "p",
        text: "The client is billed at the stages of development listed below unless stated otherwise:",
      },
      {
        kind: "list",
        items: [
          "25% non-refundable deposit upon placement of the order",
          "25% following sign-off of the project design phase",
          "25% after all web development is complete and the website is scheduled to be put onto a test server",
          "25% before the website is uploaded to the live server",
        ],
      },
    ],
  },
  {
    id: "late-payments",
    heading: "Late Payments",
    blocks: [
      {
        kind: "p",
        text: "Puzzle requires that all outstanding payments are made within 30 days of receipt of invoice. For invoices not settled within the agreed credit terms, we reserve the right to charge 5% interest on the overdue debt per month and any administration fees to cover the debt recovery costs incurred.",
      },
      {
        kind: "p",
        text: "For any outstanding invoices that remain unpaid, Puzzle reserves the right to terminate the website and hosting temporarily and/or withhold any handover until all payments have been met. Upon payment, all website functionality will be restored immediately.",
      },
    ],
  },
  {
    id: "out-of-pocket-expenses",
    heading: "Out of Pocket Expenses",
    blocks: [
      {
        kind: "p",
        text: "Fees for professional services are not included within the project quotation. This includes third-party software, photography licences and printing.",
      },
    ],
  },
  {
    id: "cancellation",
    heading: "Cancellation",
    blocks: [
      {
        kind: "p",
        text: "Should the client wish to cancel at any point during the process, they shall remain liable for the work that is outlined within the quotation and shall be invoiced accordingly.",
      },
      {
        kind: "p",
        text: "Puzzle will class a project as being cancelled if any or all of the below occurs:",
      },
      {
        kind: "list",
        items: [
          "The client fails to provide content which prevents the project from being completed, or prevents Puzzle from continuing with the development process.",
          "The client fails to respond to emails or any form of correspondence from Puzzle.",
          "The client is not contactable for more than 6 weeks.",
        ],
      },
      {
        kind: "p",
        text: "Non-payment will result in legal action being taken if necessary and the client will incur any fees involved in recovering the outstanding debt.",
      },
      {
        kind: "p",
        text: "If a project is cancelled at an intermediate stage, Puzzle reserves the right to charge the client for all work carried out to date calculated at a standard rate of £80 per hour.",
      },
      {
        kind: "p",
        text: "If a project is cancelled more than 50% of the way through, the client is liable to pay what was quoted for the project at the start plus any additional work carried out and quoted for throughout the project.",
      },
    ],
  },
  {
    id: "website-live-date",
    heading: "Website Live Date",
    blocks: [
      {
        kind: "p",
        text: "Once you have approved your website, and any outstanding balance of payment has been received, your website will be launched live onto the Internet, providing we have been supplied with the necessary information required below.",
      },
    ],
  },
  {
    id: "website-copyright",
    heading: "Website Copyright",
    blocks: [
      {
        kind: "p",
        text: "Puzzle holds the right to retain full copyright of all websites designed. Our designs must not be copied or used in any way by the client or any third party.",
      },
      {
        kind: "p",
        text: "Puzzle retains full ownership of the project and all assets until all payments have been made in accordance with the original quotation. Once all payments have been made, Puzzle will transfer full ownership of all assets and files to the client.",
      },
    ],
  },
  {
    id: "client-copyright-responsibilities",
    heading: "Client Responsibilities with Regards to Copyright",
    blocks: [
      {
        kind: "p",
        text: "In situations where the client provides images, text, animations or any other content for their website, they are legally responsible for ensuring that this material does not infringe any copyright.",
      },
      {
        kind: "p",
        text: "Certain images provided by Puzzle in the construction of the website may have been purchased under licence from stock image suppliers. These images are generally only licensed for use on a single website and may not be used in publicity material.",
      },
      {
        kind: "p",
        text: "The website owner is legally responsible for ensuring that this does not happen. If you wish to use any images from the site for other purposes, please contact us for clarification.",
      },
    ],
  },
  {
    id: "existing-domain-names",
    heading: "Existing Domain Names",
    blocks: [
      {
        kind: "p",
        text: "Where a domain name has already been purchased by an individual or agent, other than Puzzle, and in cases where a client’s new website is to be hosted on a different server, it is crucial that we are given full access to the aforementioned domain name control panel.",
      },
      {
        kind: "p",
        text: "This enables Puzzle to direct your domain name at the appropriate new server, to which it will be uploaded, or provide you with the ability to log in to your control panel yourself and to make the appropriate domain name server changes that will be required.",
      },
      {
        kind: "p",
        text: "If your website is unable to be uploaded because of a failure to provide this information to us, Puzzle will not be held liable and, in such cases, is deemed to have carried out our contractual agreement with you, upon which payment is then required.",
      },
    ],
  },
  {
    id: "existing-web-hosting",
    heading: "Existing Web Hosting",
    blocks: [
      {
        kind: "p",
        text: "If a client already has a website host and requires their new design to remain with them, they must provide Puzzle with full access to the FTP server so we can upload the website upon completion.",
      },
      {
        kind: "p",
        text: "If the client fails to provide us with access to the FTP server, which results in us being unable to upload the website, Puzzle will be deemed to have carried out all contractual agreements with the client and payment will be required.",
      },
    ],
  },
  {
    id: "additional-costs",
    heading: "Additional Costs",
    blocks: [
      {
        kind: "p",
        text: "All our quotes are based on an estimate of costs agreed at the project scope phase and created from the information provided to Puzzle.",
      },
      {
        kind: "p",
        text: "Any additional work, above that specified in the initial quote, will require our hourly rate of £80 to be payable and an estimate will be provided in writing prior to additional work being undertaken.",
      },
      {
        kind: "p",
        text: "Once the following stages are approved by yourself either verbally or in writing and the following stage begins, any changes requested to previous stages will be charged for. These stages are:",
      },
      {
        kind: "list",
        items: [
          "Design stage",
          "Initial Development stage",
          "Testing and minor amendments such as text edits",
          "Project Delivery",
        ],
      },
      {
        kind: "p",
        text: "Puzzle cannot guarantee the exact timescale for completion of the website at the outset until we are provided with all the information and content required.",
      },
      {
        kind: "p",
        text: "However, we will endeavour to be as accurate as we can in the provision of an estimated project completion date. We request that all clients are timely and professional in providing us with the correct information required to meet the project scope.",
      },
    ],
  },
  {
    id: "advertising-notice",
    heading: "Advertising Notice",
    blocks: [
      {
        kind: "p",
        text: "Puzzle reserves the right to include a small ‘Site by Puzzle’ link in the footer of each designed website and/or within the hidden META tags created within the design format.",
      },
    ],
  },
  {
    id: "search-engine-optimisation",
    heading: "Search Engine Optimisation",
    blocks: [
      {
        kind: "p",
        text: "Puzzle does everything possible to ensure that all our websites are search engine friendly and are compatible with the latest best-practice guidelines wherever possible.",
      },
    ],
  },
  {
    id: "website-hosting",
    heading: "Website Hosting",
    blocks: [
      {
        kind: "p",
        text: "Where website hosting is provided, Puzzle uses a third-party web host and, as such, cannot be held liable for any website downtime, restricted access or loss of earnings resulting from server maintenance, hacking or similar unforeseen circumstances.",
      },
      {
        kind: "p",
        text: "We only use trusted third-party hosts and so such occurrences are extremely rare.",
      },
    ],
  },
  {
    id: "approval",
    heading: "Approval",
    blocks: [
      {
        kind: "p",
        text: "By agreeing to these terms and conditions, your statutory rights are not affected.",
      },
      {
        kind: "p",
        text: "Puzzle reserves the right to change or modify any of these terms or conditions at any time.",
      },
      {
        kind: "p",
        text: "Should clarification of any of the above be required, please contact Puzzle Studios via {EMAIL}.",
      },
    ],
  },
];
