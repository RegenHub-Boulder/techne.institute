// Member Agreement data — variables extracted from Meadow Cooperative, LCA template
// Source: Meadow_MemberAgreement_Source.pdf
// Each leaf with status DECIDE | PROPOSED | JEFF requires organizer signal before attorney draft

export const memberAgreementData = [
  {
    id: "ma_identity",
    label: "Identity and Purpose",
    info: "Document-level variables that must change from the Meadow Cooperative template to reflect RegenHub, LCA's identity, address, and public benefit purpose.",
    children: [
      {
        id: "ma_entity",
        label: "Cooperative Identity",
        children: [
          { id: "ma_name",    label: "Cooperative legal name",         value: "RegenHub, LCA",                                          status: "ASSUMED" },
          { id: "ma_address", label: "Principal office address",       value: "1515 Walnut St, Suite 200, Boulder, CO 80302",           status: "ASSUMED" },
          { id: "ma_purpose", label: "Public benefit purpose statement", value: "Cultivating scenius — confirm exact language vs. Articles", status: "DECIDE" },
        ],
      },
    ],
  },

  {
    id: "ma_s1",
    label: "§1 Membership, Stock and Dues",
    info: "The membership class structure and share price must be updated from Meadow's single Class A stock to RegenHub's four-class system. Meadow references $500 USD per share; RegenHub will set prices per class in Schedule A. These are the most visible economic decisions for incoming members.",
    children: [
      {
        id: "ma_s1.1",
        label: "1.1 Membership Class",
        children: [
          { id: "ma_classref",     label: "Stock / class language",          value: "Class A (Meadow) → RegenHub member class per admission (Class 1–4)",   status: "DECIDE" },
          { id: "ma_classpurchase", label: "Required purchase at admission",  value: "Min 1 share per applicable class",                                      status: "PROPOSED" },
        ],
      },
      {
        id: "ma_s1.4",
        label: "1.4 Stock Price per Class",
        info: "Meadow charges $500/share flat. RegenHub uses a per-class pricing structure defined in Schedule A. These values need to be finalized before the Member Agreement can be executed.",
        children: [
          { id: "ma_price_s1", label: "Cooperative Member (Class 1) share price",      value: "$250–500 (Schedule A)",  status: "DECIDE" },
          { id: "ma_price_s2", label: "Coworking Member (Class 2) share price",        value: "$100–250 (Schedule A)",  status: "DECIDE" },
          { id: "ma_price_s3", label: "Community Participant (Class 3) share price",   value: "$0–50 (Schedule A)",     status: "DECIDE" },
          { id: "ma_price_s4", label: "Investor Member (Class 4) minimum capital",     value: "TBD (Schedule A)",       status: "DECIDE" },
          { id: "ma_payment",  label: "Payment methods",                               value: "Lump sum / Promissory note / Combo", status: "CARRY" },
        ],
      },
      {
        id: "ma_s1.5",
        label: "1.5 Membership Dues",
        children: [
          { id: "ma_dues_s1", label: "Cooperative Member annual dues",    value: "TBD (Schedule A)",           status: "DECIDE" },
          { id: "ma_dues_s2", label: "Coworking Member monthly dues",     value: "Monthly membership fee (Schedule A)", status: "DECIDE" },
          { id: "ma_dues_s3", label: "Community Participant dues",        value: "$0",                         status: "DECIDE" },
          { id: "ma_dues_s4", label: "Investor Member dues",              value: "None",                       status: "DECIDE" },
        ],
      },
    ],
  },

  {
    id: "ma_s2",
    label: "§2 Benefits and Obligations",
    info: "The member benefits and patronage provisions must be updated to reflect RegenHub's actual offering: physical space, collective intelligence infrastructure, venture ecosystem access, and the patronage formula to be parameterized by the Financial Systems Committee (March 2, 2026).",
    children: [
      {
        id: "ma_s1.3",
        label: "1.3 Services Description",
        children: [
          { id: "ma_services", label: "Services description per class", value: "Generic in Meadow — define per class (venture, coworking, community, investment)", status: "DECIDE" },
        ],
      },
      {
        id: "ma_s2.2",
        label: "2.2 Member Benefits",
        children: [
          { id: "ma_ben_ownership",  label: "Ownership statement",         value: "Per bylaws class structure",                                       status: "CARRY" },
          { id: "ma_ben_governance", label: "Governance rights",           value: "1 vote per Class 1 (Cooperative Member) only. Classes 2–4 are non-voting.",  status: "PROPOSED" },
          { id: "ma_multiclass",    label: "Multi-class membership",      value: "Permitted — member may hold multiple classes simultaneously. Voting rights attach only through Class 1 membership.", status: "PROPOSED" },
          { id: "ma_ben_patronage",  label: "Patronage dividend language", value: "FSC formula: labor / revenue / cash / community (to parameterize)", status: "DECIDE" },
          { id: "ma_ben_community",  label: "Community benefits",          value: "Space access / cohort programming / infrastructure — customize per class", status: "DECIDE" },
        ],
      },
      {
        id: "ma_s2.3",
        label: "2.3 Patronage Formula Language",
        info: "Meadow's agreement describes patronage based on 'value or quantity of products or services purchased from or through Cooperative' — a consumer co-op framing. RegenHub uses a multi-factor formula (labor + revenue + cash + community). The agreement text must reflect this.",
        children: [
          { id: "ma_patronage_basis", label: "Allocation basis",         value: "Meadow: product/service volume → RegenHub: labor+revenue+cash+community", status: "DECIDE" },
          { id: "ma_patronage_auth",  label: "Formula change authority", value: "Board (with Financial Systems Committee recommendation)",               status: "DECIDE" },
        ],
      },
    ],
  },

  {
    id: "ma_s3",
    label: "§3 Intellectual Property",
    info: "The works-made-for-hire provision assigns IP created within the scope of cooperative services to RegenHub. Critical question for a venture studio: does work on ventures constitute 'services to the Cooperative'? The carveout for Applicant IP must clearly exclude venture IP that founders retain. This is a Jeff question.",
    children: [
      {
        id: "ma_s3.1",
        label: "3.1 Works Made for Hire",
        children: [
          { id: "ma_ip_scope",    label: "Scope of cooperative services",  value: "Coordinating / shared infrastructure — not venture-specific work",       status: "DECIDE" },
          { id: "ma_ip_carveout", label: "Venture IP carveout",            value: "Explicitly exclude venture IP (Parachute, Postage, Habitat, future)",    status: "DECIDE" },
          { id: "ma_ip_confirm",  label: "Jeff review of IP provisions",   value: "Confirm works-for-hire scope is appropriate for multi-stakeholder model", status: "JEFF" },
        ],
      },
    ],
  },

  {
    id: "ma_s8",
    label: "§8 General Provisions",
    info: "Forum selection must move from Denver County to Boulder County. Non-solicitation period and jury waiver need attorney review. Dispute resolution references the bylaws escalation path — confirm consistency with Art. XI (JAMS binding arbitration).",
    children: [
      {
        id: "ma_s8.1",
        label: "8.1 Non-Solicitation",
        children: [
          { id: "ma_nonsolicitation", label: "Non-solicitation period", value: "2 years (Meadow) — confirm appropriate for RegenHub context", status: "DECIDE" },
        ],
      },
      {
        id: "ma_s8.7",
        label: "8.7 Forum and Governing Law",
        children: [
          { id: "ma_forum",  label: "Forum / venue",     value: "County of Denver (Meadow) → County of Boulder, Colorado",          status: "PROPOSED" },
          { id: "ma_govlaw", label: "Governing law",     value: "Colorado (no conflict-of-law rules)",                               status: "CARRY" },
          { id: "ma_jury",   label: "Jury trial waiver", value: "Yes — confirm with Jeff (consistent with Bylaws Art. XI §11)",     status: "JEFF" },
        ],
      },
      {
        id: "ma_s8.8",
        label: "8.8 Dispute Resolution",
        children: [
          { id: "ma_dispute", label: "Dispute resolution reference", value: "Per Bylaws dispute resolution provisions (Art. XI — JAMS, Denver)", status: "CARRY" },
        ],
      },
    ],
  },

  {
    id: "ma_sig",
    label: "Signature Page",
    children: [
      {
        id: "ma_sig_items",
        label: "Execution",
        children: [
          { id: "ma_signer",    label: "Cooperative authorized signatory", value: "TBD — President or designated officer",   status: "DECIDE" },
          { id: "ma_sig_title", label: "Signatory title",                  value: "TBD",                                     status: "DECIDE" },
        ],
      },
    ],
  },
];

// Flat map: item id → label
export const memberAgreementLabels = (() => {
  const map = {};
  function walk(nodes) {
    for (const n of nodes) {
      map[n.id] = n.label;
      if (n.children) walk(n.children);
    }
  }
  walk(memberAgreementData);
  return map;
})();
