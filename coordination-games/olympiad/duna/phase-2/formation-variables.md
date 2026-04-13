# P446 — Formation Variables Register
*Agent Olympiad DUNA — Open Decision Points*
*April 13, 2026*

---

## Purpose

This document is the canonical register of open variables for the Agent Olympiad DUNA formation. Each variable is a named decision point that must be resolved before or during the Wyoming formation event. Variables are referenced by name throughout all P446 documents using the convention `[VAR_NAME]`.

These are not blockers — they are coordination surfaces. The DUNA formation process is designed to work around them through member vote, founder consensus, or attorney guidance at the appropriate phase.

---

## Variable Index

### [DUNA_NAME]

**What it governs:** The legal name of the DUNA as it appears in governing principles, Wyoming filings, and public communications.

**Options under consideration:**
- *The Olympiad Foundation* — institutional register, legible to non-crypto audiences, signals permanence and weight. Closest analog: "The Olympic Foundation." Risk: "Foundation" may imply a private foundation structure to some audiences, creating IRC §509 confusion.
- *Agent Olympiad Association* — descriptive and specific, names the participants (agents) and the form (association). Strongest legal clarity about what the entity is and does.
- *Coordination Commons* — broader mission framing, positions the entity as coordination research infrastructure generally rather than tied to a specific tournament brand. Most durable if the Olympiad evolves.

**How it gets resolved:** Founder consensus vote at formation event, or Todd/Techne decision before attorney engagement.

**Dependencies:** Attorney brief (§1), Wyoming filing (§7), visual identity, all public communications.

**Default if unresolved at filing:** "Agent Olympiad Association" — most legally descriptive, least ambiguous.

---

### [GOV_TOKEN]

**What it governs:** The name and ticker symbol of the membership/governance token. This token is what members hold to establish membership interest, vote on proposals, and receive governance compensation under §17-32-104(c)(i).

**Options under consideration:**
- *COORD* — short for coordination, matches the Olympiad's research mission, clearly distinct from CLOUD (the Techne unit of exchange).
- *OLYMP* — directly tied to the Olympiad brand, immediate legibility about what it governs.
- *AGORA* — Greek for the public assembly where citizens governed. Signals deliberation and shared governance. Fits the Techne etymological register.
- *OLY* — minimal ticker, common shorthand.

**Design constraints:**
- Must be distinct from CLOUD to avoid confusion between the unit of exchange and the governance instrument
- Should survive the Olympiad being renamed or rebranded
- Ticker must not conflict with existing major tokens (COORD: not in top 200 as of April 2026; OLYMP: minor existing token; AGORA: minor existing token)

**How it gets resolved:** Founder vote at token distribution event, or Todd decision before smart contract deployment.

**Dependencies:** On-chain governance design (§2), token distribution design (§8), economic model (§3).

**Default if unresolved at deployment:** COORD.

---

### [REGISTERED_AGENT]

**What it governs:** The person or entity named as agent for service of process on the optional Wyoming Secretary of State filing (W.S. 17-32-103). This is the address where legal notices are delivered.

**Options under consideration:**
- *Jeff Pote / Pote Law Firm* — natural choice if Jeff handles Wyoming formation. His firm address becomes the official contact. Most integrated with legal counsel relationship.
- *Commercial registered agent service* — Wyoming registered agent services run ~$50–150/yr (examples: Northwest Registered Agent, Registered Agents Inc.). More anonymous, no dependency on any one attorney's address.
- *Techne / RegenHub organizer* — a named founding organizer with a Wyoming presence. Low cost, maximum continuity risk.

**Important note:** This filing is optional under the Act. The DUNA exists without it. The filing provides legal service of process clarity for any future proceedings. It can be filed after formation.

**How it gets resolved:** Attorney recommendation from Jeff Pote, or Todd decision.

**Dependencies:** Wyoming filing preparation (§7). Does not block any other deliverable.

**Default if unresolved at attorney call:** Commercial registered agent service — preserves maximum flexibility without depending on any one person.

---

### [SEED_TREASURY]

**What it governs:** The initial CLOUD allocation from Techne to the DUNA treasury as a formation grant (not a loan, not an investment). This seeds year-one operations, formation costs, and optionally the first prize pool reserve.

**Options under consideration:**

| Scenario | CLOUD Amount | USD Equivalent | What It Covers |
|---|---|---|---|
| Formation only | 50,000 CLOUD | ~$5,000 | Wyoming filing, attorney review (4-6 hrs), smart contract deployment |
| Formation + first season | 500,000 CLOUD | ~$50,000 | Formation costs + first full Olympiad season prize pool + 6-month operating reserve |
| Full year one endowment | 5,000,000 CLOUD | ~$500,000 | Formation + two seasons + endowment reserve generating yield |

**Structural note:** Under §17-32-104, the DUNA may not distribute profits to members — the seed is a grant to the commons, not recoverable by Techne. The appropriate amount depends on when the DUNA is expected to become self-sustaining through tournament fees and protocol revenue.

**How it gets resolved:** Todd/Techne decision, ideally before attorney engagement so the financial structure can be reviewed.

**Dependencies:** Economic model (§3), attorney brief (§5). Does not block charter drafting.

**Default for planning purposes:** 500,000 CLOUD (~$50,000) — the middle scenario. All economic model documents use this figure unless noted.

---

### [FORMATION_DATE]

**What it governs:** The target date for DUNA formation — when the initial 100+ members join by mutual consent and the governing principles take effect.

**Options:**
- *At first Olympiad launch* — formation event coincides with the tournament kickoff. The token distribution event that establishes membership IS the launch. Cleanest narrative, maximum membership at formation.
- *Before first Olympiad launch* — formation 30–60 days prior. Gives the DUNA legal existence before prize pools are held. Required if the DUNA will hold treasury during the first round.
- *After attorney review* — formation waits for Jeff Pote to confirm Wyoming compliance and 501(c)(3) framing. Most conservative.

**How it gets resolved:** Todd/Techne timeline decision, informed by attorney call.

**Default for planning purposes:** Before first Olympiad launch by 30 days.

---

### [MEMBER_FLOOR]

**What it governs:** The minimum governance token holding required for membership interest. Sets the floor below which a wallet address is a token holder but not a voting member.

**Design considerations:**
- A floor of 1 token means anyone with any token is a member (maximally inclusive, easiest to hit 100-member threshold)
- A floor of 100 tokens creates a meaningful commitment threshold but may require more careful distribution design
- The Act requires 100 members; a floor that's too high risks falling short

**How it gets resolved:** Token distribution design (§8), founder vote.

**Default for planning purposes:** 1 token minimum. The 100-member threshold is the binding constraint; the floor should not make it harder to reach.

---

### [NONPROFIT_PURPOSE_STATEMENT]

**What it governs:** The precise language in the governing principles that defines the DUNA's charitable purpose for IRC §501(c)(3) purposes. This is the statement the IRS will evaluate.

**Draft language (for attorney review):**

> "The purpose of [DUNA_NAME] is to advance research in artificial intelligence alignment and coordination through the development, operation, and study of competitive multi-agent coordination games; to produce open-source protocols, datasets, and research outputs for public benefit; and to develop mechanisms for cooperative governance of AI systems. All activities are conducted for educational and scientific purposes within the meaning of IRC §501(c)(3)."

**How it gets resolved:** Attorney review by Jeff Pote. The draft above is a starting point; the final language must be acceptable to the IRS under §501(c)(3).

**Dependencies:** Attorney brief (§5), founding charter (§1).

---

## Summary Table

| Variable | Status | Blocks | Default |
|---|---|---|---|
| [DUNA_NAME] | Open | Wyoming filing, attorney brief, visual identity | Agent Olympiad Association |
| [GOV_TOKEN] | Open | Smart contract deployment, token distribution | COORD |
| [REGISTERED_AGENT] | Open | Wyoming filing (optional) | Commercial service |
| [SEED_TREASURY] | Open | Economic model, attorney brief | 500,000 CLOUD |
| [FORMATION_DATE] | Open | All formation activities | 30 days before first Olympiad |
| [MEMBER_FLOOR] | Open | Token distribution design | 1 token |
| [NONPROFIT_PURPOSE_STATEMENT] | Draft | Attorney review, governing principles | See draft above |

---

## Resolution Protocol

Each variable is resolved through one of three pathways:

1. **Todd/Techne decision** — variables within Techne's founding authority (name, seed amount, formation date). Todd decides; decision is recorded in this document.

2. **Attorney guidance** — variables with legal implications (registered agent, nonprofit purpose statement). Jeff Pote advises; decision is recorded here with counsel note.

3. **Founder vote** — variables best decided by the initial member cohort (governance token name, member floor). Resolved at the formation event or via pre-formation consensus poll.

When a variable is resolved, update this document: replace "Open" with "Resolved — [value]" and note the pathway and date.
