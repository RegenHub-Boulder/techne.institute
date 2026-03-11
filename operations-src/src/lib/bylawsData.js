// Bylaws data — single source of truth shared by BylawsTree and SignalsAggregate

export const bylawsData = [
  {
    id: "preamble",
    label: "Preamble",
    info: "Your bylaws and member agreements define how money, power, and information flow in your cooperative. The preamble establishes the legal foundation — which statutes govern, which principles guide decisions, and how conflicts between documents are resolved.",
    children: [
      {
        id: "entity",
        label: "Entity Identity",
        children: [
          { id: "name", label: "Name", value: "RegenHub, LCA (DBA Techne)", status: "ASSUMED" },
          { id: "type", label: "Type", value: "Public Benefit LCA", status: "ASSUMED" },
          { id: "statutes", label: "Statutes", value: "ULCAA + PBCA", status: "ASSUMED" },
          { id: "filed", label: "Articles filed", value: "February 6, 2026", status: "ASSUMED" },
        ],
      },
      {
        id: "hierarchy",
        label: "Document Hierarchy",
        children: [
          { id: "h1", label: "1st", value: "Articles of Organization", status: "ASSUMED" },
          { id: "h2", label: "2nd", value: "Bylaws", status: "ASSUMED" },
          { id: "h3", label: "3rd", value: "ULCAA", status: "ASSUMED" },
          { id: "h4", label: "4th", value: "PBCA", status: "ASSUMED" },
        ],
      },
      {
        id: "ica",
        label: "ICA Principles",
        children: [
          { id: "ica1", label: "Adopted", value: "All 7 principles", status: "ASSUMED" },
        ],
      },
    ],
  },
  {
    id: "art1",
    label: "Art. I: Membership",
    info: "Who are your members? This is the most fundamental question. Your membership classes define who has ownership, voice, and economic participation. If you have multiple classes, each class may have different rights, fees, and patronage formulas. Start.coop recommends completing 60-70% of these questions before working with your attorney.",
    children: [
      {
        id: "s1.1",
        label: "1.1 Membership Classes",
        info: "Each membership class represents a different relationship to the cooperative. A multi-stakeholder co-op divides voting rights between classes. Consider: what are the benefits of each class? What are the requirements? How much does a membership share cost?",
        children: [
          { id: "classcount", label: "Number of classes", value: "Multiple (4 proposed)", status: "DECIDE" },
          { id: "class1", label: "Class 1", value: "Cooperative Member (voting patron class, full governance participation)", status: "DECIDE" },
          { id: "class2", label: "Class 2", value: "Coworking Member (non-voting, space + community, patronage eligible)", status: "DECIDE" },
          { id: "class3", label: "Class 3", value: "Community Participant (non-voting, programming access)", status: "DECIDE" },
          { id: "class4", label: "Class 4", value: "Investor Member (non-voting, capital account)", status: "DECIDE" },
          { id: "classauth", label: "Additional class authority", value: "Board", status: "PROPOSED" },
        ],
      },
      {
        id: "s1.2",
        label: "1.2 Eligibility",
        info: "What are the non-financial requirements to be a member? Can entities (not just individuals) join? Is there a residency requirement? The board typically has final say on admission.",
        children: [
          { id: "age", label: "Min age", value: "18", status: "CARRY" },
          { id: "entity", label: "Entity members", value: "Permitted (enables project-class)", status: "ASSUMED" },
          { id: "residency", label: "Residency", value: "Any state/country of business", status: "CARRY" },
          { id: "patronage", label: "Patronage commitment", value: "Per class in Member Agreements", status: "PROPOSED" },
          { id: "admission", label: "Admission authority", value: "Board sole discretion", status: "CARRY" },
        ],
      },
      {
        id: "s1.3",
        label: "1.3 Admission Process",
        children: [
          { id: "stock", label: "Stock purchase", value: "Min 1 share per class", status: "PROPOSED" },
          { id: "payment", label: "Payment methods", value: "Cash / Note / Combo", status: "CARRY" },
          { id: "noncash", label: "Non-cash toward stock", value: "Permitted at FMV per Board policy", status: "JEFF" },
          { id: "agreement", label: "Membership Agreement", value: "Required, per Board form", status: "CARRY" },
          { id: "approval", label: "Approval", value: "Board simple majority", status: "CARRY" },
          { id: "nondiscrim", label: "Non-discrimination", value: "Protected classes enumerated", status: "CARRY" },
        ],
      },
      {
        id: "s1.4",
        label: "1.4-1.6 Voting and Transfer",
        info: "One member, one vote is a foundational cooperative principle. Voting is restricted to Class 1 (Cooperative Members) — the only patron class with full governance participation. Classes 2–4 are non-voting. Stock is non-transferable.",
        children: [
          { id: "voting", label: "Votes per member", value: "1 vote per Class 1 (Cooperative Member) only. Classes 2–4 are non-voting.", status: "PROPOSED" },
          { id: "investor_vote", label: "Non-Class 1 voting rights", value: "Classes 2, 3, and 4 have no voting rights. A member holding Class 1 alongside other classes votes through their Class 1 interest only.", status: "PROPOSED" },
          { id: "multiclass", label: "Multi-class membership", value: "Permitted — a member may hold interests in more than one class simultaneously. Voting rights attach only through Class 1 membership.", status: "PROPOSED" },
          { id: "transfer", label: "Stock transferability", value: "Non-transferable", status: "CARRY" },
        ],
      },
      {
        id: "s1.7",
        label: "1.7 Withdrawal",
        info: "What happens if a member wants to leave? How do they give notice? Do they get their stock purchase back? The cooperative typically has up to 5 years to redeem equity to protect its financial health.",
        children: [
          { id: "notice", label: "Notice period", value: "14 calendar days", status: "CARRY" },
          { id: "redemption", label: "Redemption window", value: "Up to 5 years", status: "CARRY" },
          { id: "methods", label: "Redemption methods", value: "Cash / Note / Combo", status: "CARRY" },
          { id: "capsettle", label: "Capital account settlement", value: "Per 704(b) book value at withdrawal", status: "JEFF" },
        ],
      },
      {
        id: "s1.8",
        label: "1.8 Suspension and Termination",
        info: "Under what conditions can the cooperative remove a member? This section protects both the cooperative (from disruptive members) and members (through hearing rights and due process).",
        children: [
          { id: "susvote", label: "Suspension vote", value: "Board simple majority", status: "CARRY" },
          { id: "susmax", label: "Suspension max", value: "180 days", status: "CARRY" },
          { id: "termhearing", label: "Termination hearing notice", value: "15 calendar days", status: "CARRY" },
          { id: "arrears", label: "Arrears trigger", value: "30 days overdue after notice", status: "CARRY" },
          { id: "inactivity", label: "Inactivity trigger", value: "3 months (per class definition)", status: "PROPOSED" },
          { id: "selfvote", label: "Self-voting", value: "Prohibited", status: "CARRY" },
        ],
      },
      {
        id: "s1.9",
        label: "1.9-1.14 Financial and Records",
        children: [
          { id: "settle", label: "Equity settlement", value: "Within 180 days, Board discretion", status: "CARRY" },
          { id: "taxconsent", label: "Tax consent", value: "Sub K partnership pass-through per K-1", status: "JEFF" },
          { id: "authstock", label: "Authorized stock", value: "Multiple classes, no par value", status: "PROPOSED" },
          { id: "certs", label: "Certificates", value: "Optional", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art2",
    label: "Art. II: Member Meetings",
    info: "How often does your membership meet? Most cooperatives hold at least one annual meeting. Quorum — the minimum attendance for valid decisions — should reflect your membership size. Smaller co-ops need higher quorum (80%) because each voice matters more.",
    children: [
      {
        id: "s2.1",
        label: "2.1-2.4 Meeting Mechanics",
        children: [
          { id: "format", label: "Format", value: "In person / Phone / Video / Electronic", status: "CARRY" },
          { id: "location", label: "Default location", value: "Boulder, CO or electronic", status: "ASSUMED" },
          { id: "annual", label: "Annual meeting", value: "Once per calendar year", status: "CARRY" },
          { id: "special", label: "Special meeting callers", value: "2+ Directors or 10% Members", status: "CARRY" },
          { id: "noticep", label: "Notice period", value: "10-60 days", status: "CARRY" },
          { id: "noticemethod", label: "Notice method", value: "Email (primary)", status: "PROPOSED" },
        ],
      },
      {
        id: "s2.6",
        label: "2.6 Voting Mechanics",
        children: [
          { id: "threshold", label: "Passage threshold", value: "Simple majority of present Class 1 members", status: "PROPOSED" },
          { id: "proxy", label: "Proxy voting", value: "Permitted, written and signed", status: "CARRY" },
          { id: "cumulative", label: "Cumulative voting", value: "Prohibited", status: "CARRY" },
          { id: "electronic", label: "Electronic voting", value: "Board may authorize", status: "CARRY" },
        ],
      },
      {
        id: "s2.7",
        label: "2.7 Quorum (Sliding Scale)",
        info: "Quorum is the minimum percentage of members that must be present for valid votes. Setting it right matters: too high and you can't conduct business, too low and a small group can make decisions for everyone. The sliding scale adjusts as membership grows.",
        children: [
          { id: "q1", label: "11 or fewer members", value: "80%", status: "CARRY" },
          { id: "q2", label: "12 to 21 members", value: "Simple majority", status: "CARRY" },
          { id: "q3", label: "22+ members", value: "30%", status: "CARRY" },
          { id: "qclass", label: "Which classes count for quorum", value: "Class 1 (Cooperative Members) only", status: "PROPOSED" },
        ],
      },
      {
        id: "s2.8",
        label: "2.8 Action Without Meeting",
        children: [
          { id: "awmthresh", label: "Threshold", value: "Same as if all members present", status: "CARRY" },
          { id: "deadline", label: "Consent deadline", value: "60 days from first consent", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art3",
    label: "Art. III: Directors",
    info: "Your board manages the cooperative's business. Key questions: How many directors? Can non-members serve? How are they elected? Most boards start with 3-5 and expand to 7-9 over time (odd numbers avoid ties). Consider term limits to ensure fresh perspectives.",
    children: [
      {
        id: "s3.2",
        label: "3.2 Composition and Tenure",
        info: "Who sits on your first board? In a multi-stakeholder cooperative, each class should have representation. Many boards allow 1-2 outside directors who aren't members but bring expertise. Your CEO typically attends but doesn't vote.",
        children: [
          { id: "size", label: "Board size range", value: "3 to 9 Directors", status: "PROPOSED" },
          { id: "sizedetermination", label: "Size set by", value: "Current Board annually", status: "CARRY" },
          { id: "initialboard", label: "Initial Board", value: "TBD from 8 organizers", status: "DECIDE" },
          { id: "initialterm", label: "Initial term", value: "Until 1st annual meeting", status: "CARRY" },
          { id: "subsequentterm", label: "Subsequent term", value: "Approx 1 year", status: "CARRY" },
          { id: "termlimits", label: "Term limits", value: "None (consider adding)", status: "DECIDE" },
        ],
      },
      {
        id: "s3.3",
        label: "3.3-3.4 Qualifications and Elections",
        children: [
          { id: "dirqual", label: "Qualifications", value: "Natural person, 18+, good standing", status: "CARRY" },
          { id: "nominations", label: "Nomination deadline", value: "10 days advance or from floor", status: "CARRY" },
          { id: "electionmethod", label: "Election method", value: "Most votes, 1 vote per seat", status: "CARRY" },
          { id: "tiebreak", label: "Tie-breaking", value: "Run-off election", status: "CARRY" },
        ],
      },
      {
        id: "s3.5",
        label: "3.5 Removal",
        children: [
          { id: "remmembers", label: "By Members", value: "2/3 vote, with or without cause", status: "CARRY" },
          { id: "remboard", label: "By Board", value: "Unanimous, with cause only", status: "CARRY" },
          { id: "hearing", label: "Right to hearing", value: "Yes, in person with counsel", status: "CARRY" },
          { id: "autoremove", label: "Auto-removal", value: "On membership termination", status: "CARRY" },
        ],
      },
      {
        id: "s3.13",
        label: "3.13-3.15 Board Operations",
        children: [
          { id: "bquorum", label: "Quorum", value: "Simple majority of all Directors", status: "CARRY" },
          { id: "bvote", label: "Voting", value: "1 per Director, simple majority", status: "CARRY" },
          { id: "btie", label: "Tie result", value: "Motion fails", status: "CARRY" },
          { id: "referendum", label: "Referendum trigger", value: "2+ Directors refer to Members", status: "CARRY" },
          { id: "bawm", label: "Without meeting", value: "Unanimous written consent", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art4",
    label: "Art. IV: Officers",
    info: "Officers handle day-to-day operations. President, Secretary, and Treasurer are required by statute. The President must be a Director. Steward roles (operational leads) are defined in Member Agreements, not bylaws — keeping bylaws focused on governance structure.",
    children: [
      {
        id: "s4.1",
        label: "4.1 Officer Structure",
        children: [
          { id: "required", label: "Required", value: "President, Secretary, Treasurer", status: "CARRY" },
          { id: "optional", label: "Optional", value: "VP, Asst Secretary, Asst Treasurer", status: "CARRY" },
          { id: "combined", label: "Combined offices", value: "Secretary-Treasurer permitted", status: "CARRY" },
          { id: "president", label: "President", value: "Must be Director, serves as CEO", status: "CARRY" },
          { id: "stewards", label: "Steward roles", value: "In Member Agreements, not Bylaws", status: "PROPOSED" },
        ],
      },
      {
        id: "s4.8",
        label: "4.8-4.9 Terms and Compensation",
        children: [
          { id: "election", label: "Election", value: "By Board at annual Board meeting", status: "CARRY" },
          { id: "removal", label: "Removal", value: "Board simple majority", status: "CARRY" },
          { id: "comp", label: "Compensation", value: "Board discretion", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art5",
    label: "Art. V: Capital (Sub K Rewrite)",
    info: "This is the economic engine of your cooperative. RegenHub uses Subchapter K partnership tax treatment (not Subchapter T), meaning profits and losses pass through to members via K-1s. Capital accounts track each member's economic interest. The patronage formula determines how value is allocated — this is where the Financial Systems Committee's work is critical.",
    children: [
      {
        id: "s5.1",
        label: "5.1 Equity Capital",
        children: [
          { id: "qualifying", label: "Qualifying investment", value: "Per Schedule A, per class", status: "PROPOSED" },
          { id: "additional", label: "Additional contributions", value: "Board may require", status: "CARRY" },
          { id: "noncash", label: "Non-cash contributions", value: "Permitted at FMV", status: "JEFF" },
          { id: "bookcap", label: "Book capital account", value: "Per Treas. Reg. 1.704-1(b)(2)(iv)", status: "JEFF" },
          { id: "taxcap", label: "Tax basis capital account", value: "Maintained alongside book account", status: "JEFF" },
        ],
      },
      {
        id: "s5.3a",
        label: "5.3 Net Profits Computation",
        children: [
          { id: "grossrev", label: "Gross Revenue", value: "Dues + coworking + events + tools + other", status: "PROPOSED" },
          { id: "deductions", label: "Deductions", value: "Expenses + Reserves", status: "CARRY" },
          { id: "reserveauth", label: "Reserve authority", value: "Board establishes", status: "CARRY" },
          { id: "nonmember", label: "Non-member income", value: "No special treatment (Sub K pass-through)", status: "PROPOSED" },
        ],
      },
      {
        id: "s5.3b",
        label: "5.3.4 Losses",
        children: [
          { id: "lossmethod", label: "Loss allocation", value: "Pass through to members per K-1", status: "PROPOSED" },
          { id: "deficit", label: "Deficit protection", value: "QIO or DRO (Jeff to recommend)", status: "JEFF" },
          { id: "atrisk", label: "At-risk / passive rules", value: "Apply to individual members", status: "JEFF" },
        ],
      },
      {
        id: "s5.3c",
        label: "5.3.5 Partnership Allocations",
        info: "The patronage formula is how your cooperative distributes value. For every dollar of net profit, how is it allocated among members? Worker co-ops often use hours worked. RegenHub proposes a weighted formula: 40% labor, 30% revenue generation, 20% cash contributions, 10% community building. These weights are the most consequential economic decision the organizers will make.",
        note: "Replaces Meadow Patronage Dividends",
        children: [
          { id: "basis", label: "Allocation basis", value: "Patronage-weighted formula", status: "PROPOSED" },
          { id: "weight_labor", label: "Labor hours weight", value: "40%", status: "DECIDE" },
          { id: "weight_revenue", label: "Revenue generation weight", value: "30%", status: "DECIDE" },
          { id: "weight_cash", label: "Cash contributions weight", value: "20%", status: "DECIDE" },
          { id: "weight_community", label: "Community building weight", value: "10%", status: "DECIDE" },
          { id: "see", label: "Substantial economic effect", value: "Must pass 3-part 704(b) test", status: "JEFF" },
          { id: "liquidation", label: "Liquidation provision", value: "Distributions follow capital accounts", status: "JEFF" },
          { id: "revaluation", label: "Revaluation triggers", value: "Admission, withdrawal, new capital, periodic", status: "JEFF" },
          { id: "704c", label: "Section 704(c) method", value: "Traditional / Curative / Remedial", status: "JEFF" },
          { id: "frequency", label: "Allocation frequency", value: "Quarterly + annual reconciliation", status: "PROPOSED" },
          { id: "distribution", label: "Distribution policy", value: "Board discretion on timing/amount", status: "PROPOSED" },
          { id: "k1", label: "K-1 delivery", value: "Annually per IRS deadlines", status: "CARRY" },
        ],
      },
      {
        id: "s5.4",
        label: "5.4-5.8 Liens, Offsets, Redemption",
        children: [
          { id: "lien", label: "Co-op lien", value: "First lien on member equity", status: "CARRY" },
          { id: "solvency", label: "Solvency test", value: "Cannot impair Co-op", status: "CARRY" },
          { id: "redemptionmax", label: "Redemption max", value: "5 years", status: "CARRY" },
          { id: "borrowed", label: "Borrowed capital", value: "Permitted from any source", status: "CARRY" },
          { id: "relatedparty", label: "Related-party loans", value: "Arms-length terms", status: "CARRY" },
          { id: "interest", label: "Interest on equity", value: "None", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art6-10",
    label: "Art. VI-X: Operations",
    children: [
      {
        id: "s6",
        label: "Art. VI: Contracts and Finances",
        children: [
          { id: "contracts", label: "Contract authority", value: "Board authorizes", status: "CARRY" },
          { id: "loans", label: "Loan authority", value: "Board resolution required", status: "CARRY" },
          { id: "checks", label: "Check signing", value: "Per Board resolution", status: "CARRY" },
          { id: "deposits", label: "Depositories", value: "Credit union (TBD which)", status: "DECIDE" },
        ],
      },
      {
        id: "s7",
        label: "Art. VII: Fiscal Year",
        children: [
          { id: "fy", label: "Period", value: "January 1 to December 31", status: "ASSUMED" },
        ],
      },
      {
        id: "s8",
        label: "Art. VIII: Benefit Report",
        children: [
          { id: "content", label: "Content", value: "Benefits + Hindrances + Standard rationale", status: "CARRY" },
          { id: "distribution", label: "Distribution", value: "Members + Website", status: "CARRY" },
        ],
      },
      {
        id: "s9",
        label: "Art. IX: Unclaimed Money",
        children: [
          { id: "claimperiod", label: "Claim period", value: "3 years after notice", status: "CARRY" },
        ],
      },
      {
        id: "s10",
        label: "Art. X: Notice Methods",
        children: [
          { id: "hand", label: "Hand delivery", value: "On delivery", status: "CARRY" },
          { id: "email", label: "Email", value: "On confirmation or next day", status: "CARRY" },
          { id: "mail", label: "Certified mail", value: "5 days", status: "CARRY" },
          { id: "courier", label: "Overnight courier", value: "1 day", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art11",
    label: "Art. XI: Dispute Resolution",
    info: "How do you resolve conflicts? The escalation path moves from conversation → mediation → board hearing → binding arbitration. This protects the cooperative from costly litigation while ensuring every member gets due process.",
    children: [
      {
        id: "s11steps",
        label: "Escalation Path",
        children: [
          { id: "step1", label: "Step 1", value: "Good faith negotiation (required)", status: "CARRY" },
          { id: "step2", label: "Step 2", value: "Mediation (optional vs mandatory?)", status: "DECIDE" },
          { id: "step3", label: "Step 3", value: "Board hearing (50 day trigger)", status: "CARRY" },
          { id: "step4", label: "Step 4", value: "JAMS binding arbitration, Denver", status: "CARRY" },
        ],
      },
      {
        id: "s11terms",
        label: "Terms and Waivers",
        children: [
          { id: "fees", label: "Attorney fees", value: "Prevailing party", status: "CARRY" },
          { id: "jury", label: "Jury trial waiver", value: "Yes (confirm with Jeff)", status: "JEFF" },
          { id: "court", label: "Court access waiver", value: "Yes (confirm with Jeff)", status: "JEFF" },
          { id: "govlaw", label: "Governing law", value: "Colorado", status: "CARRY" },
        ],
      },
    ],
  },
  {
    id: "art12-14",
    label: "Art. XII-XIV: Amendments, Mergers, Dissolution",
    children: [
      {
        id: "s12",
        label: "Art. XII: Amendments",
        children: [
          { id: "boardpropose", label: "Board proposal", value: "2/3 vote", status: "CARRY" },
          { id: "mempetition", label: "Member petition", value: "25% to Secretary", status: "CARRY" },
          { id: "ratification", label: "Ratification", value: "2/3 vote of Members", status: "CARRY" },
        ],
      },
      {
        id: "s13",
        label: "Art. XIII: Mergers",
        children: [
          { id: "merger", label: "Approval", value: "2/3 Board + 2/3 Members", status: "CARRY" },
        ],
      },
      {
        id: "s14",
        label: "Art. XIV: Dissolution Waterfall",
        info: "If the cooperative dissolves, who gets what and in what order? The waterfall defines priority: first undistributed allocations, then capital account balances, then equal distribution to recent members. This must comply with 704(b) capital account rules.",
        children: [
          { id: "p1", label: "Priority 1", value: "Undistributed allocations + stock price", status: "JEFF" },
          { id: "p2", label: "Priority 2", value: "Proportionate capital account balance", status: "JEFF" },
          { id: "p3", label: "Priority 3", value: "Equal to members (3yr lookback?)", status: "DECIDE" },
          { id: "illiquid", label: "Illiquid assets", value: "Assign to aligned nonprofit", status: "CARRY" },
          { id: "704b", label: "704(b) compliance", value: "Must follow capital accounts", status: "JEFF" },
        ],
      },
    ],
  },
  {
    id: "schedA",
    label: "Schedule A: Stock and Dues",
    info: "Share prices and dues are the most visible economic decision for new members. Consider: can people afford the share price? Can you offer payment plans? The board can revise these over time, but starting values set expectations. Start.coop recommends considering how much capital you need in the first 6-12 months.",
    children: [
      {
        id: "sAvals",
        label: "Per-Class Values",
        children: [
          { id: "coop_share", label: "Cooperative Member share", value: "$250-500 (TBD)", status: "DECIDE" },
          { id: "coop_dues", label: "Cooperative Member dues", value: "TBD", status: "DECIDE" },
          { id: "cowork_share", label: "Coworking Member share", value: "$100-250 (TBD)", status: "DECIDE" },
          { id: "cowork_dues", label: "Coworking Member dues", value: "Monthly membership fee", status: "DECIDE" },
          { id: "community_share", label: "Community Participant share", value: "$0-50 (TBD)", status: "DECIDE" },
          { id: "community_dues", label: "Community Participant dues", value: "$0", status: "DECIDE" },
          { id: "investor_share", label: "Investor Member min capital", value: "TBD", status: "DECIDE" },
          { id: "revision", label: "Revision authority", value: "Board discretion with notice", status: "CARRY" },
        ],
      },
    ],
  },
];

// Flat map: item id → human-readable label (for use in aggregate views)
export const bylawsLabels = (() => {
  const map = {};
  function walk(nodes) {
    for (const n of nodes) {
      map[n.id] = n.label;
      if (n.children) walk(n.children);
    }
  }
  walk(bylawsData);
  return map;
})();
