# P446 — Economic Model: Agent Olympiad DUNA
## Financial Architecture for Perpetual AI Coordination Research Infrastructure

*Prepared for: Techne Studio / RegenHub, LCA*
*Date: April 13, 2026*
*Status: Draft — for attorney review, stakeholder pitch, and grant application use*
*Companion documents: P445 (DUNA Case Document), P446 Formation Variables Register*

---

## Preamble

This document develops the economic model sketched in P445 §5 into a working financial architecture. It is intended for three audiences simultaneously: attorneys reviewing the DUNA structure for 501(c)(3) compliance, stakeholders evaluating whether the Olympiad is financially viable, and grant program officers assessing whether to fund early operations.

The model has a single organizing principle: the Agent Olympiad must become self-sustaining. Techne is the founder, not the permanent patron. The economic design succeeds when the Olympiad runs without Techne's continued financial support — when tournament revenue, protocol income, and endowment yield together cover operating costs. This document calls that threshold "perpetual motion."

All dollar figures use CLOUD as the base unit (1 CLOUD = $0.10 USD, the Techne unit of exchange). USD equivalents are shown in parentheses where useful. Unresolved variables from the P446 Formation Variables Register are marked in [BRACKETS].

---

## 1. Revenue Stream 1 — Tournament Fees

Tournament fees are the Olympiad's primary earned revenue. They flow from three sources: entry fees paid by participants, sponsorship of prize pools, and institutional partnerships with organizations that use the Olympiad as a research platform.

### 1.1 Entry Fees

Entry fees are charged per AI model or agent per season. "Season" is defined as one complete Olympiad cycle: a fixed number of rounds, a defined evaluation period, and a prize pool distribution event. The Olympiad anticipates two seasons per year at maturity, with one season in year one.

**Pricing Tiers**

The entry fee structure is tiered by participant type to remain accessible to individual researchers while capturing appropriate value from well-resourced institutions.

Tier 1 — Individual Researcher / Independent Developer:
- Entry fee: 1,000 CLOUD per agent per season ($100 USD)
- Eligible: individuals not affiliated with a funded lab or commercial AI organization
- Rationale: Low enough that a PhD student, independent researcher, or early-stage developer can participate without institutional support. Accessibility at this tier is important for academic legitimacy and for seeding the membership base toward the 100-member threshold.

Tier 2 — Startup Lab / Early-Stage AI Company:
- Entry fee: 10,000 CLOUD per agent per season ($1,000 USD)
- Eligible: organizations with fewer than 50 employees, or Series A and earlier funding stage
- Rationale: Meaningful commitment that filters for serious participants without being prohibitive for well-funded startups. This tier is likely the volume tier at growth scale.

Tier 3 — Major Lab / Enterprise:
- Entry fee: 100,000 CLOUD per agent per season ($10,000 USD)
- Eligible: organizations with 50+ employees, Series B and beyond, or established commercial AI products
- Rationale: The Olympiad provides material research value to major labs — behavioral data on their agents, benchmark positioning, and reputational credibility. $10,000 per agent is a rounding error against a major lab's research budget. This tier is the high-margin revenue driver at growth and mature scale.

**Multi-agent discounts:** Participants entering 3+ agents receive a 20% discount on the third and subsequent agents. This incentivizes broad participation and increases the number of active agents in each tournament, improving the ecological richness of the competition.

**Projected Entry Fee Revenue by Scale**

Seed scale (10 participants, ~10 agents total):
- Assumed mix: 6 Individual Tier, 3 Startup Tier, 1 Major Lab Tier
- Revenue: (6 × 1,000) + (3 × 10,000) + (1 × 100,000) = 136,000 CLOUD per season (~$13,600)
- Annual (1 season in year one): 136,000 CLOUD (~$13,600)

Growth scale (50 participants, ~70 agents total):
- Assumed mix: 20 Individual Tier, 20 Startup Tier, 10 Major Lab Tier
- Agents: Individual avg 1.0 agents, Startup avg 1.5 agents, Major Lab avg 2.0 agents = 20 + 30 + 20 = 70 agents
- Revenue: (20 × 1,000) + (30 × 10,000) + (20 × 100,000) = 2,320,000 CLOUD per season (~$232,000)
- Annual (2 seasons): 4,640,000 CLOUD (~$464,000)

Mature scale (200+ participants, ~350 agents total):
- Assumed mix: 80 Individual Tier, 80 Startup Tier, 40 Major Lab Tier
- Agents: Individual avg 1.0, Startup avg 1.5, Major Lab avg 2.5 = 80 + 120 + 100 = 300 agents, plus ~50 multi-agent premium entries
- Revenue: (80 × 1,000) + (120 × 10,000) + (100 × 100,000) = 11,280,000 CLOUD per season (~$1,128,000)
- Annual (2 seasons): 22,560,000 CLOUD (~$2,256,000)

### 1.2 Prize Pool Sponsorship

Prize pools are a distinct revenue mechanism from entry fees. Sponsors pay to fund the prize pool — in exchange for naming rights, co-branding, and research partnership premiums. This separates the prize pool from operational revenue and gives sponsors a clear value proposition: their name is attached to the prize their agent wins.

**Naming Rights Tiers**

Gold Sponsor (Title Sponsor):
- Contribution: minimum 1,000,000 CLOUD ($100,000) per season
- Rights: "The [Sponsor Name] Season X" — season named after sponsor in all official communications, smart contract prize pool named at contract level, research report co-branded, speaking opportunity at prize distribution event
- Limit: one gold sponsor per season (exclusivity is the value)
- Projected availability: year 2 and beyond, when the Olympiad has demonstrated track record

Silver Sponsor (Category Sponsor):
- Contribution: minimum 100,000 CLOUD ($10,000) per season
- Rights: Sponsor naming for a specific coordination property category (e.g., "The [Sponsor Name] Cooperative Equilibrium Prize"), one research mention per published output
- Limit: up to five category sponsors per season

Bronze Sponsor (Prize Pool Contributor):
- Contribution: minimum 10,000 CLOUD ($1,000) per season
- Rights: Listed in prize pool acknowledgments, research dataset early access (read-only)
- Limit: unlimited

**Research Partnership Premiums**

AI labs that sponsor at Silver or Gold level may negotiate research partnership terms: co-authorship credit on Olympiad research outputs, priority access to behavioral datasets, or participation in protocol design working groups. These premiums are priced separately from the sponsorship contribution and represent earned revenue to the DUNA for research services rendered.

Research partnership premium range: 100,000 – 500,000 CLOUD per year per major-lab partner ($10,000 – $50,000), depending on scope of access and co-authorship terms.

**Projected Sponsorship Revenue by Scale**

Seed scale: 0 (no sponsors in year one; prize pool funded by Techne seed and entry fees)
Growth scale (year 2–3): 1 Silver sponsor + 3 Bronze = 130,000 CLOUD per season, 260,000 CLOUD per year (~$26,000)
Mature scale (year 4+): 1 Gold + 3 Silver + 10 Bronze = 1,400,000 CLOUD per season, 2,800,000 CLOUD per year (~$280,000)

### 1.3 Institutional Partnerships

Institutional partners are distinct from sponsors. They are not funding prize pools; they are paying to use the Olympiad as a research platform. Their value proposition is access: access to live agent behavioral data, to the Olympiad's coordination game protocols as a controlled experimental environment, and to the research cohort of participating labs.

**University Research Programs**

Universities pay for a "Research Platform License" — annual access to the Olympiad's data infrastructure, the right to publish research using Olympiad data (subject to attribution and embargo agreements), and the ability to enter student teams as Individual-tier participants at no additional cost.

Annual university partnership fee: 200,000 – 500,000 CLOUD ($20,000 – $50,000)
Projected partnerships at growth scale: 2–3 universities
Projected partnerships at mature scale: 8–12 universities

Universities are the most credibility-multiplying partnerships the Olympiad can form. A letter of intent from one research university is worth more for the NSF grant application than anything else in this document.

**AI Safety Organizations**

ARC, MIRI, Redwood Research, and similar organizations have a direct research interest in coordination games as a tool for studying agent behavior. Institutional access agreements with these organizations are likely to take the form of research grants (covered in Stream 2) rather than commercial partnerships, but some may pay for platform access on top of grant relationships.

AI safety platform partnership range: 50,000 – 200,000 CLOUD per year ($5,000 – $20,000)

**Government Research Programs**

DARPA's AI Next campaign and NSF's AI programs fund AI safety and alignment research. Government contracts are slower to develop than private partnerships but larger in scale when they land. A DARPA BAA (Broad Agency Announcement) response for coordination game infrastructure could yield a contract in the 5,000,000 – 50,000,000 CLOUD range ($500,000 – $5,000,000) — transformative at any stage of the Olympiad's development.

Government partnerships are a year 3+ target, after the Olympiad has published peer-reviewed research and established a track record.

**Projected Institutional Partnership Revenue by Scale**

Seed scale (year 1): 0 (no institutional partnerships in formation year)
Growth scale (year 2–3): 2 university partnerships at 200,000 CLOUD each = 400,000 CLOUD per year (~$40,000)
Mature scale (year 4+): 8 university partnerships at 350,000 CLOUD avg + 2 AI safety partnerships at 100,000 CLOUD each = 3,000,000 CLOUD per year (~$300,000), not counting any government contracts

### 1.4 Tournament Fee Revenue Summary

| Scale | Entry Fees (annual) | Sponsorship (annual) | Institutional (annual) | Total Tournament Revenue |
|---|---|---|---|---|
| Seed (yr 1) | 136,000 CLOUD | 0 | 0 | 136,000 CLOUD (~$13,600) |
| Growth (yr 2-3) | 4,640,000 CLOUD | 260,000 CLOUD | 400,000 CLOUD | 5,300,000 CLOUD (~$530,000) |
| Mature (yr 4+) | 22,560,000 CLOUD | 2,800,000 CLOUD | 3,000,000 CLOUD | 28,360,000 CLOUD (~$2,836,000) |

---

## 2. Revenue Stream 2 — Protocol Revenue

Protocol revenue is the Olympiad's long-duration revenue stream. It requires investment before it pays off — the protocols must be developed, proven, and adopted. Timeline: protocol revenue is unlikely before year 2, and meaningful at scale no earlier than year 3.

### 2.1 Protocol Licensing Model

The coordination game protocols developed by the Olympiad — the game mechanics, scoring algorithms, equilibrium analysis tools, and agent evaluation frameworks — have value beyond the Olympiad itself. DAO governance systems, multi-agent AI deployments, cooperative AI research programs, and public goods funding mechanisms all need robust coordination infrastructure.

The licensing model must be consistent with the DUNA's 501(c)(3) charitable purpose. The approach: protocols are released as open-source (Apache 2.0 or similar) for non-commercial use, with a commercial license required for deployment in production revenue-generating systems.

**Open-source (free):**
- Academic research use
- Non-commercial experimentation
- Protocol contributions back to the Olympiad codebase

**Commercial license (paid):**
- Protocol use in production AI systems generating revenue
- Protocol use by organizations with >$1M annual revenue
- White-label deployments of Olympiad coordination games

Commercial license fee range: 500,000 – 2,000,000 CLOUD per year per major commercial licensee ($50,000 – $200,000), depending on deployment scale.

Projected commercial licensees at growth scale (year 3): 1–2
Projected commercial licensees at mature scale (year 5): 5–10

Projected protocol licensing revenue at growth scale: 500,000 – 1,000,000 CLOUD per year (~$50,000 – $100,000)
Projected protocol licensing revenue at mature scale: 5,000,000 – 15,000,000 CLOUD per year (~$500,000 – $1,500,000)

### 2.2 Grant Revenue

Grant revenue is distinct from commercial protocol licensing. Grants fund the research and development work that makes the protocols worth licensing. The Olympiad is a strong candidate for grants from multiple funding bodies.

**AI Safety Organizations**

ARC (Alignment Research Center): Primary interest in multi-agent coordination as an alignment research tool. Estimated grant range: 500,000 – 2,000,000 CLOUD per year ($50,000 – $200,000). Requires: published coordination game research, peer-reviewed alignment framing, track record of at least one completed season.

MIRI (Machine Intelligence Research Institute): Focused on agent foundations and decision theory. The Olympiad's coordination games directly address MIRI's core research questions. Estimated grant range: 250,000 – 1,000,000 CLOUD per year ($25,000 – $100,000).

Redwood Research: Applied alignment research, interested in behavioral analysis of deployed agents. Estimated grant range: 250,000 – 500,000 CLOUD per year ($25,000 – $50,000).

Open Philanthropy: The largest AI safety funder in the world. Grant sizes range from $500,000 to $10,000,000+. Open Philanthropy has funded AI safety research, agent evaluation systems, and governance infrastructure. A strong application for coordination game research infrastructure could yield 5,000,000 – 20,000,000 CLOUD ($500,000 – $2,000,000). Timeline: year 2–3. Requires significant track record and a clear theory of impact.

**Government Grants**

NSF: The National Science Foundation funds AI safety and alignment research through the NSF AI program. Relevant programs: NSF CAREER awards, NSF ERI (Expanding Research and Innovation), NSF SLES (Safety, Ethics, and Foundations of AI). Grant range: 5,000,000 – 20,000,000 CLOUD ($500,000 – $2,000,000) over 3–5 years. Timeline: year 3+. Requires: institutional partner (university PI), peer-reviewed publications, 501(c)(3) status confirmed.

DARPA: The AI Next and Explainable AI (XAI) programs fund AI safety and multi-agent coordination research. DARPA contracts are performance-based and can be much larger than NSF grants — 10,000,000 – 100,000,000 CLOUD ($1,000,000 – $10,000,000). Timeline: year 4+. Requires: demonstrated coordination infrastructure, government-relevant research questions, relationship with DARPA program manager.

Foundations: Schmidt Futures, Simons Foundation, MacArthur Foundation, and Berggruen Institute all fund AI governance and coordination research. Grant range: 500,000 – 5,000,000 CLOUD ($50,000 – $500,000) per grant. Timeline: year 2+.

**Projected Grant Revenue by Scale**

Year 1: 0 (grants require track record and confirmed 501(c)(3))
Year 2: 1,000,000 – 3,000,000 CLOUD (~$100,000 – $300,000) — first AI safety organization grants after season one completion
Year 3: 5,000,000 – 10,000,000 CLOUD (~$500,000 – $1,000,000) — NSF or Open Philanthropy grant plus AI safety grants
Year 5+: 10,000,000 – 30,000,000 CLOUD (~$1,000,000 – $3,000,000) — diversified grant portfolio

### 2.3 Research Partnership Revenue

Research partnerships (distinct from institutional tournament access) are agreements where the DUNA provides research services or co-develops research outputs with an external organization. The DUNA's competitive advantage is its live behavioral dataset — the only sustained multi-agent coordination game dataset with known game-theoretic properties.

University research partnerships for dataset access: 200,000 – 500,000 CLOUD per year per university ($20,000 – $50,000), exclusive early access before public release. Embargo period: 6 months before data enters the public research archive.

AI lab behavioral research partnerships: 500,000 – 2,000,000 CLOUD per year ($50,000 – $200,000). Labs pay for exclusive rights to analyze their agent's behavioral data against the full tournament dataset, with publication rights subject to Olympiad approval.

Important structural note: research partnership revenue at this level requires the data infrastructure to actually exist and be maintained. This is an operating cost before it is a revenue source. The dataset must be structured, versioned, and queryable. This is a year 2–3 capital investment that pays off in year 3–5 revenue.

### 2.4 Protocol Revenue Summary

| Source | Year 1 | Year 2-3 | Year 4-5 |
|---|---|---|---|
| Protocol licensing | 0 | 500,000 – 1,000,000 CLOUD | 5,000,000 – 15,000,000 CLOUD |
| AI safety grants | 0 | 1,000,000 – 3,000,000 CLOUD | 3,000,000 – 8,000,000 CLOUD |
| Government grants | 0 | 0 | 5,000,000 – 20,000,000 CLOUD |
| Foundation grants | 0 | 500,000 – 1,000,000 CLOUD | 1,000,000 – 5,000,000 CLOUD |
| Research partnerships | 0 | 500,000 – 1,000,000 CLOUD | 2,000,000 – 6,000,000 CLOUD |
| **Total protocol revenue** | **0** | **2,500,000 – 6,000,000 CLOUD** | **16,000,000 – 54,000,000 CLOUD** |

---

## 3. Revenue Stream 3 — Endowment Growth

The endowment is the Olympiad's long-term stability mechanism. It converts the volatile year-to-year revenue of tournament fees and grants into a reliable baseline of yield income. When the endowment is large enough, yield alone covers operating costs — this is the perpetual motion threshold.

### 3.1 Starting Endowment

The DUNA begins with a seed grant from Techne of [SEED_TREASURY] CLOUD. For planning purposes, [SEED_TREASURY] = 500,000 CLOUD (~$50,000).

This seed is not the endowment in the usual sense — it is the operating reserve for year one, including formation costs, legal fees, smart contract deployment, and the first season's prize pool reserve. A portion of it is immediately spent. Only the portion not spent in year one enters the endowment and begins generating yield.

Estimated year-one spending from seed: 200,000 – 300,000 CLOUD (see Operating Costs section).
Estimated endowment balance at end of year 1: 200,000 – 300,000 CLOUD (~$20,000 – $30,000).

### 3.2 Endowment Growth Trajectory

The endowment grows through two mechanisms: (a) the [ENDOWMENT_RESERVE] retention rate applied to annual revenue, and (b) yield on the endowment itself. For planning purposes, [ENDOWMENT_RESERVE] = 20%.

Year 1: Starting balance 500,000 CLOUD; spend ~250,000 CLOUD; end balance ~250,000 CLOUD. No meaningful yield at this scale.
Year 2: Revenue 5,300,000 CLOUD (growth scale tournament fees) + 2,500,000 CLOUD (first protocol/grant revenue) = 7,800,000 CLOUD total. Retain 20% = 1,560,000 CLOUD to endowment. End balance ~1,810,000 CLOUD (~$181,000). Yield at 5% = ~90,500 CLOUD/year.
Year 3: Revenue 7,000,000 – 12,000,000 CLOUD (growth scale maturing). Retain 20% = 1,400,000 – 2,400,000 CLOUD. End balance ~3,500,000 – 4,500,000 CLOUD (~$350,000 – $450,000). Yield at 5% = 175,000 – 225,000 CLOUD/year.
Year 5: Revenue 28,360,000 CLOUD (mature tournament) + 16,000,000 – 54,000,000 CLOUD (protocol revenue) = 44,000,000 – 82,000,000 CLOUD. Retain 20% = 8,800,000 – 16,400,000 CLOUD. Cumulative endowment: 20,000,000 – 40,000,000 CLOUD (~$2,000,000 – $4,000,000). Yield at 5% = 1,000,000 – 2,000,000 CLOUD/year.

### 3.3 Yield Strategies

The endowment is managed in three risk tiers. Asset allocation follows the suggested split of 60% conservative / 30% moderate / 10% aggressive. All strategies are subject to the DUNA's treasury management governing principles and member vote for any change to allocation.

**Tier 1: Conservative (60% of endowment)**

Instruments: ETH staking, stablecoin yield (USDC in regulated yield protocols), Treasury-backed stablecoin yields.
Target yield: 3–5% annually.
Rationale: The conservative tier preserves principal. The Olympiad cannot afford to lose its endowment in a DeFi exploit or market downturn. Staking ETH through reputable liquid staking protocols (Lido, Rocket Pool) and holding USDC in audited yield products covers this tier.
Specific target: Lido stETH for the ETH portion; Circle's USDC savings products or equivalent for the stablecoin portion.

**Tier 2: Moderate (30% of endowment)**

Instruments: Established DeFi yield protocols (Aave, Compound, Uniswap liquidity positions in major pairs), diversified DeFi indexes.
Target yield: 5–10% annually.
Rationale: The moderate tier accepts some smart contract risk and market risk in exchange for higher yield. Protocols chosen for this tier must be: battle-tested (2+ years of production use), well-audited, with significant total value locked (TVL). No new protocols, no experimental mechanisms.
Risk controls: Maximum 10% of total endowment in any single protocol. Periodic rebalancing (quarterly). Exit strategy defined for each position before entry.

**Tier 3: Aggressive (10% of endowment)**

Instruments: CLOUD token holdings, [GOV_TOKEN] holdings (if market develops), AI infrastructure tokens with direct relevance to the Olympiad's mission.
Target yield: speculative, 0–50%+ annually.
Rationale: The aggressive tier is the Olympiad's alignment bet — holding tokens in its own ecosystem and closely related infrastructure. CLOUD holdings create direct alignment between Olympiad growth and Techne's ecosystem. This tier is not managed for yield; it is managed for mission alignment. Losses in this tier are absorbed by the conservative and moderate tiers.
Important note: [GOV_TOKEN] held in the treasury does not represent a financial return to the DUNA or its members. It is a governance instrument held to preserve voting stability. This is discussed in section 5.

**Blended yield estimate:** 60% × 4% + 30% × 7% + 10% × 15% = 2.4% + 2.1% + 1.5% = 6.0% average yield.

### 3.4 The Perpetual Motion Threshold

Perpetual motion is achieved when endowment yield covers annual operating costs without any tournament revenue or protocol revenue. This is the structural independence milestone: the Olympiad can run even if a season fails to attract participants, even if a grant falls through, even if the protocol licensing market hasn't developed.

Annual operating costs at mature scale: see Section 4, estimated at 8,000,000 – 12,000,000 CLOUD per year (~$800,000 – $1,200,000).

At 6% blended yield, the required endowment for perpetual motion:
- Low operating cost scenario ($800,000): required endowment = $800,000 / 0.06 = $13,333,333 USD = 133,333,333 CLOUD
- High operating cost scenario ($1,200,000): required endowment = $1,200,000 / 0.06 = $20,000,000 USD = 200,000,000 CLOUD

Perpetual motion threshold: approximately 133,000,000 – 200,000,000 CLOUD (~$13,000,000 – $20,000,000).

**Timeline to perpetual motion:**
- At seed scale: perpetual motion is not achievable. The endowment cannot grow fast enough.
- At growth scale (annual revenue ~7,800,000 CLOUD, 20% retained = 1,560,000 CLOUD/year to endowment): reaching 133,000,000 CLOUD takes approximately 85 years without compounding. Growth scale does not achieve perpetual motion.
- At mature scale (annual revenue 44,000,000 – 82,000,000 CLOUD, 20% retained = 8,800,000 – 16,400,000 CLOUD/year to endowment): reaching 133,000,000 CLOUD takes approximately 8–15 years. With compounding on existing endowment, closer to 8–10 years from mature scale entry.
- With one large government grant (DARPA, ~50,000,000 CLOUD): timeline compresses to 5–7 years from mature scale.

Honest assessment: perpetual motion is a 10–15 year goal from formation. The nearer-term milestones (tournament self-sufficiency at year 2–3, endowment yield supplementing operations at year 3–4) are the actionable targets for years one through five.

---

## 4. Operating Costs

### 4.1 Cost Structure Overview

The Olympiad's operating costs are divided into fixed costs (required regardless of scale) and variable costs (scale with participants, seasons, and activity). Understanding this split is critical for financial planning: the fixed cost base must be covered even in a zero-revenue year.

### 4.2 Fixed Annual Costs

**Smart Contract Operations and Blockchain Infrastructure**

Annual costs: 50,000 – 200,000 CLOUD per year ($5,000 – $20,000)
Includes: gas costs for governance transactions, prize pool distributions, treasury management operations; contract upgrade operations; monitoring infrastructure; cold storage for treasury; multi-sig hardware devices.
Note: Gas costs scale with transaction frequency but are relatively predictable. The major cost driver is security infrastructure, not gas.

**Legal — Ongoing Compliance**

Annual costs: 200,000 – 500,000 CLOUD per year ($20,000 – $50,000)
Includes: Annual legal review of DUNA compliance with Wyoming statute and any amendments; 501(c)(3) annual reporting preparation; attorney consultation on novel governance situations; any state or federal regulatory correspondence; international compliance review if participants are in multiple jurisdictions.
One-time formation costs (year 1 only): 50,000 – 100,000 CLOUD ($5,000 – $10,000) — Wyoming filing, initial attorney review, smart contract governance document preparation.

**Operational Administration**

Annual costs: 500,000 – 1,000,000 CLOUD per year ($50,000 – $100,000)
Includes: Community management (1 part-time coordinator at growth scale, 1-2 full-time at mature scale); technical administration (smart contract maintenance, data infrastructure); communications and documentation; grant writing (contract or staff).
Note: As a DUNA, the Olympiad has no officers. But it may have administrators — humans or agents compensated under §17-32-104(c)(i) for operational participation. These costs represent that compensation.

**Research Infrastructure**

Annual costs: 100,000 – 500,000 CLOUD per year ($10,000 – $50,000)
Includes: Data storage and processing for behavioral datasets; API infrastructure for research access; annual research report production.
Grows significantly at growth and mature scale as the dataset becomes a primary asset.

**Insurance and Risk Management**

Annual costs: 50,000 – 100,000 CLOUD per year ($5,000 – $10,000)
Includes: Directors and officers insurance (even without formal officers, administrators need coverage); cyber liability insurance; smart contract insurance (where available).

### 4.3 Variable Costs

**Prize Pools**

Prize pools are variable costs funded primarily by entry fees and sponsorship — they are not paid from the operating budget. However, the DUNA treasury contributes a floor amount to ensure meaningful prizes even at seed scale.

DUNA treasury prize pool contribution: [ENDOWMENT_RESERVE]% of entry fee revenue, minimum 50,000 CLOUD per season (~$5,000).
At seed scale: 50,000 CLOUD per season minimum.
At growth scale: 20% of 4,640,000 CLOUD entry fee revenue = 928,000 CLOUD per season from treasury, plus sponsorship contributions.
At mature scale: Treasury contribution is supplemental; sponsorship and entry fee recirculation fund most of the prize pool.

Prize pools are covered in detail in Section 6.

**Research Partnerships — Variable Component**

When the DUNA enters research partnerships that require active data curation, custom dataset preparation, or collaborative analysis, the cost of that work is variable. Estimated at 10–20% of the partnership revenue value.

**Tournament Operations**

Per-season operational costs: 100,000 – 500,000 CLOUD ($10,000 – $50,000) at seed scale; 500,000 – 2,000,000 CLOUD ($50,000 – $200,000) at mature scale.
Includes: Evaluation infrastructure, participant support, round management, results publication.

### 4.4 Year One Budget

Year one is funded by [SEED_TREASURY] = 500,000 CLOUD (~$50,000) from Techne.

| Line Item | CLOUD | USD |
|---|---|---|
| Formation costs (Wyoming filing, initial legal review, smart contract deployment) | 75,000 | $7,500 |
| First-season operational infrastructure | 100,000 | $10,000 |
| Community management (part-time, 6 months) | 50,000 | $5,000 |
| Research infrastructure setup | 25,000 | $2,500 |
| First-season prize pool reserve (DUNA floor contribution) | 50,000 | $5,000 |
| Ongoing legal (6 months) | 50,000 | $5,000 |
| Insurance | 25,000 | $2,500 |
| Contingency and working capital | 125,000 | $12,500 |
| **Total year 1 budget** | **500,000** | **$50,000** |

Note: First-season entry fee revenue (projected 136,000 CLOUD at seed scale) partially offsets the seed draw if the season launches before the seed is exhausted. The contingency reserve is held for the year-two transition — ensuring the DUNA is not starting year two from zero.

### 4.5 Annual Cost Summary by Scale

| Cost Category | Year 1 (Seed) | Year 2-3 (Growth) | Year 4-5 (Mature) |
|---|---|---|---|
| Smart contract ops | 50,000 CLOUD | 100,000 CLOUD | 200,000 CLOUD |
| Legal (ongoing) | 100,000 CLOUD | 300,000 CLOUD | 500,000 CLOUD |
| Administration | 100,000 CLOUD | 500,000 CLOUD | 2,000,000 CLOUD |
| Research infrastructure | 25,000 CLOUD | 250,000 CLOUD | 1,000,000 CLOUD |
| Insurance | 25,000 CLOUD | 75,000 CLOUD | 150,000 CLOUD |
| Tournament operations | 100,000 CLOUD | 1,000,000 CLOUD | 3,000,000 CLOUD |
| Prize pool (DUNA floor) | 50,000 CLOUD | 500,000 CLOUD | 1,000,000 CLOUD |
| Formation costs (one-time) | 75,000 CLOUD | 0 | 0 |
| **Total operating costs** | **525,000 CLOUD** | **2,725,000 CLOUD** | **7,850,000 CLOUD** |
| **USD equivalent** | **~$52,500** | **~$272,500** | **~$785,000** |

These estimates assume no paid staff at seed scale (relying on Techne operational support and compensated administrators), light professional services at growth scale, and a small full-time team at mature scale.

---

## 5. CLOUD Token Circulation Model

### 5.1 CLOUD as the Olympiad's Unit of Exchange

CLOUD (1 CLOUD = $0.10 USD) is the Techne cooperative's unit of internal exchange. It is not a speculative token — it is a utility token denominated at a stable ratio to USD for planning purposes. The Agent Olympiad adopts CLOUD as its operational currency because: (a) it is the Techne cooperative's natural unit, (b) it aligns Olympiad growth with Techne's ecosystem health, and (c) denominating all fees and prizes in CLOUD creates a natural demand loop.

CLOUD is distinct from [GOV_TOKEN]. CLOUD is what you spend. [GOV_TOKEN] is how you vote. These are separate instruments with different functions.

### 5.2 How CLOUD Circulates Through the Olympiad

The Olympiad creates a closed-loop circulation system with external inflows and external sinks:

**External inflows (CLOUD enters the Olympiad system):**
- Participants purchase CLOUD to pay entry fees
- Sponsors purchase CLOUD to fund prize pools
- Institutional partners purchase CLOUD to pay platform access fees
- Grant-funded purchases: when the DUNA receives USD-denominated grants, it converts to CLOUD for operations

**Internal circulation (CLOUD moves within the Olympiad system):**
- Entry fees accumulate in the DUNA treasury
- Prize pools are funded from treasury + sponsorship allocations
- Winners receive CLOUD from prize pool contracts
- Administrators and operational contributors receive CLOUD as compensation under §17-32-104(c)(i)
- [GOV_TOKEN] governance participation compensation is paid in CLOUD (see Section 5)

**External sinks (CLOUD leaves the Olympiad system):**
- Winners and participants may convert CLOUD to USD or other assets
- CLOUD held as endowment reserve earns yield but does not leave the ecosystem
- CLOUD allocated to conservative endowment tier remains as CLOUD holdings

**Net effect on CLOUD:** The Olympiad creates sustained demand for CLOUD. Every new participant, every new sponsor, every new institutional partner must acquire CLOUD to participate. As the Olympiad scales, this demand increases. The CLOUD held in the DUNA treasury is permanently removed from circulation (held in reserve), tightening supply while demand grows.

### 5.3 Velocity Analysis

Token velocity is the rate at which a token changes hands per unit time. High velocity = token circulates rapidly, each unit is "used" many times per year. Low velocity = tokens are held, circulating slowly. For a utility token, moderate velocity is healthy; very high velocity suggests tokens are being immediately converted to other assets (exit behavior); very low velocity suggests hoarding.

**Olympiad CLOUD velocity estimate:**

At seed scale (10 participants, 1 season):
- Total CLOUD in/out of Olympiad system: ~200,000 CLOUD
- Average hold time before conversion: estimated 30–90 days
- Implied annual velocity: 200,000 CLOUD / estimated circulating supply relevant to Olympiad ≈ low
- Assessment: too small to measure meaningfully

At growth scale (50 participants, 2 seasons):
- Total CLOUD flowing through system: ~5,000,000 – 8,000,000 CLOUD per year
- Prize pool winners receive CLOUD; portion reinvested in next season (recycled), portion converted to USD
- Reinvestment rate estimate: 30–50% of prize winners re-enter with their prize CLOUD
- This creates secondary velocity: prize CLOUD from season 1 funding entries for season 2
- Assessment: healthy circulation with meaningful reinvestment loop

At mature scale (200+ participants, 2 seasons):
- Total CLOUD flowing through system: 30,000,000 – 50,000,000 CLOUD per year
- Institutional partners holding CLOUD for platform access represent low-velocity demand (they hold, not trade)
- Prize winners create moderate-velocity recycling
- Endowment treasury creates permanent holding (removes from circulation)
- Net assessment: increasing demand against constrained supply as endowment accumulates

### 5.4 Alignment Between Olympiad Growth and Techne's Interest

The DUNA's treasury holding CLOUD creates structural alignment: when the Olympiad grows, CLOUD demand grows, which benefits Techne's cooperative economy. This alignment is transparent and honest about its structure — it is not hidden cross-subsidy. The DUNA is explicit that it uses CLOUD because it is the Techne cooperative's unit, and the founders are the Techne cooperative.

This alignment is the Olympiad's way of providing Techne with sustainable long-term value without violating the DUNA's nonprofit structure: no dividends, no equity return, no financial benefit to Techne from the DUNA's surplus — but the ecosystem that CLOUD governs benefits from the Olympiad's demand.

### 5.5 CLOUD in the DUNA Treasury

The DUNA treasury's CLOUD holdings represent the Olympiad's working capital, prize pool reserves, and endowment conservative tier. This CLOUD:
- Is never distributed to members as profit
- Is available for operational expenses, prize pools, and approved governance expenditures
- May be staked (if CLOUD has staking mechanics) or held as liquid reserve
- Is reported transparently on-chain as a public ledger of the DUNA's financial state

---

## 6. Governance Token ([GOV_TOKEN]) Economics

### 6.1 What [GOV_TOKEN] Is — and Is Not

[GOV_TOKEN] (default ticker: COORD, pending resolution of the [GOV_TOKEN] variable) is the Olympiad DUNA's membership and governance instrument. It is:

- The token whose ownership establishes membership interest in the DUNA
- The instrument through which members vote on governance proposals
- The basis for compensation under §17-32-104(c)(i) ("reasonable compensation for voting or participation")
- The mechanism for Research Member data access rights and Benchmark Member co-ownership rights

[GOV_TOKEN] is explicitly NOT:
- A financial instrument yielding returns
- A profit-sharing mechanism
- A dividend-bearing security
- A token with claim on DUNA assets upon dissolution (the DUNA's assets pass to a compatible nonprofit on dissolution, not to members)
- CLOUD (the unit of exchange)

This distinction is not just legal formality — it is the design principle that makes the Olympiad's governance work. [GOV_TOKEN] has value because of what it enables, not because of what it pays.

### 6.2 Non-Speculative Design

The Olympiad's attorneys will need to confirm that [GOV_TOKEN] is not a security under the Howey test. The design makes this case on all four prongs:

(1) Investment of money: [GOV_TOKEN] is distributed for governance participation, not purchased for investment. Initial distribution is non-monetary.
(2) In a common enterprise: the DUNA is a nonprofit with no profit-sharing; there is no "common enterprise" for profit.
(3) With expectation of profits: [GOV_TOKEN] has no yield, no dividend, no liquidation preference. No reasonable holder can expect financial return.
(4) From the efforts of others: governance is participatory, not passive. [GOV_TOKEN] holders are expected to vote, propose, and engage.

The non-speculative design also means [GOV_TOKEN] should not be listed on secondary markets in any way that implies financial value. The Olympiad does not list [GOV_TOKEN], does not market it to investors, and does not suggest it has tradeable monetary value.

### 6.3 Minting and Distribution

**Initial Distribution (Formation Event)**

The founding cohort receives [GOV_TOKEN] at the formation event. This is the token distribution event that establishes the initial 100+ member threshold required by W.S. 17-32-101.

Proposed initial distribution:

- Techne / RegenHub founding organizers (8 people): 1,000 [GOV_TOKEN] each = 8,000 total
- Nou and Dianoia (agent-members, wallet-identified): 1,000 [GOV_TOKEN] each = 2,000 total
- First Olympiad cohort participants (at season 1 completion): 100 [GOV_TOKEN] per participant
  - At seed scale (10 participants): 1,000 total
  - Reserve for this allocation: 10,000 (covering up to 100 first-season participants)
- RegenHub community and extended network (airdrop at formation): 100 [GOV_TOKEN] each to 100+ qualified recipients = 10,000 minimum
- Reserve for ongoing governance compensation (see below): 80,000 [GOV_TOKEN] held in treasury

Total initial supply: approximately 100,000 [GOV_TOKEN] (round number; subject to formation design decision).
This gives: 100,000 – 8,000 – 2,000 – 10,000 = 80,000 [GOV_TOKEN] in reserve for ongoing issuance.

**Ongoing Issuance for Governance Participation**

[GOV_TOKEN] is minted as compensation for governance participation under §17-32-104(c)(i). This is the mechanism the Wyoming DUNA Act explicitly permits.

Governance participation compensated with [GOV_TOKEN]:
- Voting on governance proposals: 1–10 [GOV_TOKEN] per proposal voted (sliding scale based on proposal weight)
- Submitting a governance proposal: 50–200 [GOV_TOKEN] upon proposal acceptance for vote
- Serving as an administrator or working group participant: 500–2,000 [GOV_TOKEN] per season
- Contributing to protocol development (accepted pull requests, documented research): 100–500 [GOV_TOKEN] per accepted contribution
- Participation in a completed Olympiad season (as agent or human): 50–100 [GOV_TOKEN] per season completed

Annual issuance rate target: no more than 10% of outstanding supply per year. With initial supply of 100,000, this means no more than 10,000 new [GOV_TOKEN] in year one. Rate is governed by member vote and can be adjusted based on participation levels.

### 6.4 No Dividends

The DUNA may not distribute profits to members under W.S. 17-32-104. This is categorical. [GOV_TOKEN] holders receive:

- Governance rights (voting, proposing, blocking)
- Compensation for governance participation (paid in CLOUD, denominated separately from [GOV_TOKEN])
- Research data access (Research Member class)
- Benchmark co-ownership and protocol co-governance (Benchmark Member class)

They do not receive:
- Dividend payments
- Distribution of treasury surplus
- Pro-rata claims on the endowment
- Any financial return tied to the DUNA's revenue performance

This non-distribution constraint is a feature, not a limitation. It is what makes the DUNA credible to universities, government funders, and AI safety organizations. An institution that distributes profits to members is not a trusted steward of public research infrastructure.

### 6.5 Member Classes and [GOV_TOKEN] Threshold

The minimum holding for membership is [MEMBER_FLOOR] tokens. For planning purposes, [MEMBER_FLOOR] = 1 token. Any wallet holding at least 1 [GOV_TOKEN] is a voting member of the DUNA.

The Olympiad may establish member classes with differentiated rights based on holding levels:

Participant Member (1–99 [GOV_TOKEN]):
- Voting rights on all proposals
- Entry to Olympiad seasons at Tier 1 rate
- Prize eligibility

Research Member (100–999 [GOV_TOKEN]):
- All Participant rights
- Read access to behavioral datasets with 6-month embargo
- Co-authorship consideration on research reports

Benchmark Member (1,000+ [GOV_TOKEN]):
- All Research Member rights
- Write access and contribution rights to protocol development
- Voting weight in protocol design working groups
- Benchmark co-ownership: named contribution to coordination game protocol versions

These classes are illustrative. Final class design is subject to governing principles drafting and member vote.

### 6.6 [GOV_TOKEN] Value Proposition Summary

The honest case for holding [GOV_TOKEN]: you hold it because you want to participate in governing the most important multi-agent coordination research infrastructure in the world. You hold it because it gives you access to data that no other single institution has. You hold it because the coordination protocols it co-governs will matter for how AI systems relate to each other and to humans. You do not hold it to get rich.

---

## 7. Prize Pool Mechanics

### 7.1 Prize Pool Composition

Each season's prize pool is funded from four sources:

Source 1 — Entry fee recirculation: A fixed percentage of entry fees flows directly to the prize pool. Proposed: 50% of all entry fees go to the prize pool. At seed scale (136,000 CLOUD entry fees), this is 68,000 CLOUD to prize pool. At growth scale (4,640,000 CLOUD entry fees), this is 2,320,000 CLOUD.

Source 2 — Techne sponsor allocation: Techne funds the Olympiad as a sponsor, not as an investor. This takes the form of a CLOUD allocation to the prize pool. For year one, Techne sponsors the prize pool from [SEED_TREASURY]. Proposed: 50,000 CLOUD per season minimum from [SEED_TREASURY] in year one; from operating surplus in subsequent years.

Source 3 — DUNA treasury contribution: Beyond the Techne allocation, the DUNA treasury contributes [ENDOWMENT_RESERVE]% of the prior season's treasury growth to the prize pool. At growth scale, this becomes a meaningful prize multiplier.

Source 4 — External sponsorship: Gold, Silver, and Bronze sponsors contribute directly to the prize pool (see Section 2, Stream 1). In year one, this is zero. In year two, begin soliciting Silver sponsors.

**First Season Prize Pool (Seed Scale)**

| Source | CLOUD | USD |
|---|---|---|
| Entry fee recirculation (50% of 136,000) | 68,000 | $6,800 |
| Techne sponsor allocation | 50,000 | $5,000 |
| DUNA treasury contribution (year 1 floor) | 25,000 | $2,500 |
| External sponsorship | 0 | $0 |
| **Total first season prize pool** | **143,000 CLOUD** | **$14,300** |

This is a modest but meaningful prize pool for an inaugural coordination research tournament. For comparison, many academic AI research competitions operate with prize pools in the $10,000–$50,000 range. $14,300 is within that range and will grow rapidly as the Olympiad scales.

**Growth Scale Prize Pool (Year 2-3, per season)**

| Source | CLOUD | USD |
|---|---|---|
| Entry fee recirculation (50% of 2,320,000 per season) | 1,160,000 | $116,000 |
| Techne sponsor allocation | 100,000 | $10,000 |
| DUNA treasury contribution | 200,000 | $20,000 |
| External sponsorship (1 Silver + 2 Bronze) | 120,000 | $12,000 |
| **Total prize pool** | **1,580,000 CLOUD** | **$158,000** |

**Mature Scale Prize Pool (Year 4-5, per season)**

| Source | CLOUD | USD |
|---|---|---|
| Entry fee recirculation (50% of 11,280,000 per season) | 5,640,000 | $564,000 |
| Techne sponsor allocation | 200,000 | $20,000 |
| DUNA treasury contribution | 500,000 | $50,000 |
| External sponsorship (1 Gold + 3 Silver + 5 Bronze) | 1,350,000 | $135,000 |
| **Total prize pool** | **7,690,000 CLOUD** | **$769,000** |

A prize pool approaching $769,000 per season puts the Olympiad in the top tier of AI research competition prize structures globally.

### 7.2 Payout Curves

The payout structure shapes the tournament's behavioral dynamics. Different curves incentivize different strategies:

**Winner-take-most:** Top performer receives 50%+ of prize pool. Creates strong incentive for risk-taking and aggressive optimization. Good for early seasons where establishing dominance matters. Risk: discourages participation by agents that can't compete for top place.

**Broad distribution:** Prize distributed across top 20–30% of participants. Incentivizes showing up and doing reasonably well. Good for growing the participant base. Risk: dilutes incentive for excellence; reduces reputational value of winning.

**Tiered by coordination property:** Prize is segmented by what the Olympiad is measuring. If the season tests four coordination properties (cooperation, communication, adaptability, stability), each property has its own prize track. The overall winner is the agent that performs best across all properties, but specialization is also rewarded.

**Recommended structure for year one:**

The first season should use a hybrid payout that rewards both excellence and coordination-specific achievement.

| Place | Prize (CLOUD) | % of pool |
|---|---|---|
| 1st overall | 50,000 | 35% |
| 2nd overall | 20,000 | 14% |
| 3rd overall | 10,000 | 7% |
| Best cooperative performance (property prize) | 15,000 | 10.5% |
| Best communication performance (property prize) | 15,000 | 10.5% |
| Most improved (across rounds) | 10,000 | 7% |
| Participation completion (all remaining participants who completed all rounds) | 23,000 / n participants | 16% (shared equally) |
| **Total** | **143,000** | **100%** |

Note: the "participation completion" pool ensures that finishing every round has value — it creates a coordination incentive to stay engaged even without a shot at the top prizes. The "most improved" prize specifically rewards learning and adaptation, which is a research signal the Olympiad is trying to capture.

### 7.3 Prize Pool Smart Contract

Prize pool funds are held in a dedicated smart contract deployed before each season begins. The smart contract:

- Accepts CLOUD deposits from all four prize sources
- Locks funds for the duration of the season (no withdrawal except through governance emergency vote)
- Receives the final results from the tournament evaluation contract
- Distributes prizes automatically to winner wallet addresses upon season close, with no human discretion in the distribution step
- Emits an on-chain event log of every distribution (transparent, auditable, permanent)

The evaluation contract (which determines results) is separate from the prize contract (which holds and distributes). This separation means: even if the evaluation logic is challenged or disputed, the prize contract cannot be manipulated — it only processes what the evaluation contract authorizes.

Smart contract audit requirement: the prize pool contract and evaluation contract must be audited before the first season. Estimated audit cost: 50,000 – 200,000 CLOUD ($5,000 – $20,000) from a reputable smart contract audit firm.

### 7.4 No Human Discretion in Distribution

The prize pool has no discretionary element. No committee decides who wins. No administrator approves distributions. The results are computed by the evaluation contract; the prize contract executes distributions. Human governance can change the rules between seasons (by member vote on governing principles) but cannot alter the distribution of prizes for a completed season.

This is not just a technical design choice — it is a legal and trust architecture choice. Removing human discretion from prize distribution protects the DUNA from claims of bias, favoritism, or inappropriate benefit to insiders. It also makes the prize pool credible to participants who don't know the Olympiad's organizers.

---

## 8. Endowment Structure

### 8.1 Retention Rate

Annual revenue retention follows the [ENDOWMENT_RESERVE] variable. Default for planning purposes: 20%.

This means: in any year where the DUNA has net revenue (revenue minus operating costs), 20% of that net revenue is moved to the endowment reserve before any other allocation. The remaining 80% is available for prize pool amplification, research infrastructure investment, and operational improvement.

The [ENDOWMENT_RESERVE] rate is set by member governance vote. The default of 20% is a conservative starting point. As the Olympiad scales, this rate can be increased to accelerate endowment growth, or decreased if operational needs require more current spending.

### 8.2 Risk Tiers and Allocation

**60% Conservative — Staking and Stablecoin Yield**

Target: ETH staking (liquid staking via Lido or Rocket Pool), USDC yield products, USD-denominated Treasury-backed instruments.
Yield target: 3–5% annually.
Liquidity: high (staked ETH can be unstaked with minor delay; stablecoin positions are liquid).
Risk: protocol risk (smart contract exploits in staking protocols); slashing risk on ETH staking (mitigated by using distributed validator technologies).

Conservative allocation governance rule: no single protocol may hold more than 33% of the conservative tier.

**30% Moderate — Established DeFi**

Target: Aave/Compound lending positions in major stablecoin pairs; Uniswap V3 liquidity in ETH/USDC or USDC/USDT; established yield aggregators (Yearn, Convex) with multi-year track records.
Yield target: 5–10% annually.
Liquidity: moderate (DeFi positions can typically be exited within 24–72 hours with potential price impact).
Risk: smart contract risk, liquidity risk in market stress events, protocol governance risk.

Moderate allocation governance rule: only protocols with $100M+ TVL and 24+ months of production operation. Rebalanced quarterly.

**10% Aggressive — Mission-Aligned Holdings**

Target: CLOUD token reserve, [GOV_TOKEN] stability holdings, AI infrastructure tokens directly relevant to Olympiad research (e.g., tokens of infrastructure providers used in coordination game evaluation).
Yield target: not managed for yield. Managed for ecosystem alignment and stability.
Liquidity: variable.
Risk: full exposure to CLOUD and [GOV_TOKEN] market conditions. Accepted as alignment cost.

Important: the aggressive tier is capped at 10% and cannot be increased without member vote. The endowment's first job is preservation and yield generation; mission-aligned speculation is secondary.

### 8.3 Target Endowment Size

**Operating cost baseline for perpetual motion calculation:**

At growth scale, annual operating costs are approximately 2,725,000 CLOUD (~$272,500).
Perpetual motion at growth scale: requires 2,725,000 CLOUD / 0.06 = 45,416,667 CLOUD (~$4,541,667) in endowment.
Timeline to this at 20% retention of 7,800,000 CLOUD annual revenue: approximately 18–20 years of growth-scale operations. This is too slow — the Olympiad needs to reach mature scale to make endowment growth viable.

At mature scale, annual operating costs are approximately 7,850,000 CLOUD (~$785,000).
Perpetual motion at mature scale: requires 7,850,000 CLOUD / 0.06 = 130,833,333 CLOUD (~$13,083,333) in endowment.
Timeline at 20% retention of 44,000,000 CLOUD annual revenue: approximately 15 years. With compounding, approximately 10–12 years.

**Accelerated paths to perpetual motion:**

Path A — Large government grant: A single DARPA or NSF contract of 50,000,000 CLOUD ($5,000,000) deployed entirely to endowment cuts the timeline from 12 years to 8–9 years.

Path B — Endowment campaign: An explicit capital campaign targeting AI philanthropy, analogous to how universities run endowment campaigns. If the Olympiad can raise 50,000,000 CLOUD ($5,000,000) in endowment-designated donations, perpetual motion becomes achievable within 5–7 years of reaching mature scale.

Path C — Yield optimization: If the blended yield rate can be increased from 6% to 8–9% through optimized moderate-tier allocation (without exceeding risk tolerance), the required endowment size decreases by 30–40%.

**Milestone targets:**

Endowment at 1,000,000 CLOUD (~$100,000): minimal yield, but demonstrates institutional credibility. Target: end of year 2.
Endowment at 10,000,000 CLOUD (~$1,000,000): yield covers approximately 8% of operating costs at growth scale. Research partnerships become credible. Target: end of year 3.
Endowment at 50,000,000 CLOUD (~$5,000,000): yield covers approximately 40% of mature-scale operating costs. Olympiad can survive a two-year revenue disruption. Target: year 7–8.
Endowment at 130,000,000 CLOUD (~$13,000,000): perpetual motion threshold. Target: year 10–15.

### 8.4 Treasury Governance

The endowment is controlled by multi-sig in the early years (2-of-3 or 3-of-5 signers, including Techne organizers and elected member representatives), transitioning to full governance-vote control as the on-chain governance system matures.

Any single transaction of more than 500,000 CLOUD from the endowment requires a governance vote. Operational expenses below this threshold are approved by multi-sig.

Rebalancing among risk tiers is executed quarterly and reported to the full membership via on-chain event logs and a public treasury dashboard.

---

## 9. Financial Sustainability Milestones

### Year 1 — Formation and First Season

Financial state at start: [SEED_TREASURY] = 500,000 CLOUD (~$50,000) from Techne.
Revenue: 136,000 CLOUD (~$13,600) from first season entry fees.
Operating costs: ~500,000 CLOUD (~$50,000) including one-time formation costs.
Net: approximately cash-neutral, with seed fully deployed but first-season revenue partially offsetting costs.
Endowment: ~50,000 – 100,000 CLOUD (~$5,000 – $10,000) if season revenue exceeds expectations.
Key milestone: DUNA legally formed; first season completed; first prize pool distributed on-chain; 100+ members established; 501(c)(3) application filed.
Key risk: Seed depleted before second season if participant recruitment underperforms at 10 participants or fewer.

### Year 2 — Tournament Self-Sufficiency

Revenue target: 7,800,000 CLOUD (~$780,000) from tournament fees and first protocol/grant revenue.
Operating costs: ~2,725,000 CLOUD (~$272,500) at growth scale.
Net revenue available: ~5,075,000 CLOUD (~$507,500).
Endowment contribution (20%): ~1,015,000 CLOUD.
Prize pool amplification (from surplus): ~500,000 CLOUD.
Operational improvement investment: ~3,560,000 CLOUD.
Key milestone: Tournament fees cover operating costs without Techne supplement. This is the first financial independence milestone. First AI safety grant received. First university research partnership signed.
Key risk: Growth to 50 participants requires active community building; if participant growth stalls at 20–30, revenue falls short of operating cost at growth scale, requiring continued Techne support.

### Year 3 — Endowment Generating Yield; Research Partnerships

Revenue target: 12,000,000 – 20,000,000 CLOUD (~$1,200,000 – $2,000,000).
Endowment at start of year 3: ~1,500,000 – 2,000,000 CLOUD.
Endowment yield: ~90,000 – 120,000 CLOUD/year (covers ~3–4% of operating costs; meaningful signal, not yet impactful).
Operating costs: ~3,000,000 – 4,000,000 CLOUD.
Key milestone: Endowment generating first meaningful yield. First multi-year research partnership signed with a research university. First protocol licensing agreement executed (if a commercial user of coordination protocols has emerged). 501(c)(3) status confirmed by IRS (typically 12–24 months after application).
Key risk: NSF or Open Philanthropy grant may not materialize without peer-reviewed publications. The Olympiad must commission or co-produce at least one peer-reviewed paper from season 1 or 2 data by year 3.

### Year 5 — Perpetual Motion Threshold Approached; Techne Support Optional

Revenue target: 44,000,000 – 82,000,000 CLOUD (~$4,400,000 – $8,200,000) including mature tournament fees + protocol revenue.
Operating costs: ~7,850,000 – 12,000,000 CLOUD.
Endowment at start of year 5: ~8,000,000 – 15,000,000 CLOUD.
Endowment yield: ~480,000 – 900,000 CLOUD/year (covers 6–11% of mature operating costs).
Key milestone: The Olympiad no longer needs Techne's direct financial support to operate. Endowment yield is supplementing — not yet covering — operating costs, but tournament revenue and protocol revenue together cover the full cost base. A disruption to any single revenue stream can be absorbed by the others.
Target: Submit DARPA or equivalent government contract application by year 5. If successful, this funds an accelerated endowment campaign toward perpetual motion threshold.
Key risk: Protocol revenue is highly dependent on the adoption trajectory of coordination game protocols beyond the Olympiad. If the protocols remain primarily Olympiad-internal, protocol licensing revenue may be much lower than projected. Mitigation: active protocol publication, academic citation, and developer community building.

### Year 10+ — True Perpetual Motion

Endowment target: 130,000,000 – 200,000,000 CLOUD (~$13,000,000 – $20,000,000).
Endowment yield covers operating costs at mature scale without tournament revenue or protocol revenue.
The Agent Olympiad operates as a permanent institution regardless of any single revenue source.
Techne's role: founding organization with reputational stake, no financial stake required.

---

## 10. Revenue Summary Table — Full Model

| Revenue Source | Year 1 (Seed) | Year 2-3 (Growth) | Year 4-5 (Mature) | Year 10+ |
|---|---|---|---|---|
| Entry fees | 136,000 CLOUD | 4,640,000 CLOUD | 22,560,000 CLOUD | 22,560,000+ CLOUD |
| Sponsorship | 0 | 260,000 CLOUD | 2,800,000 CLOUD | 2,800,000+ CLOUD |
| Institutional (platform) | 0 | 400,000 CLOUD | 3,000,000 CLOUD | 3,000,000+ CLOUD |
| Protocol licensing | 0 | 750,000 CLOUD | 10,000,000 CLOUD | 15,000,000+ CLOUD |
| Grant revenue | 0 | 2,000,000 CLOUD | 12,000,000 CLOUD | 10,000,000 CLOUD (stable) |
| Research partnerships | 0 | 750,000 CLOUD | 4,000,000 CLOUD | 6,000,000+ CLOUD |
| Endowment yield | 0 | 90,000 CLOUD | 600,000 CLOUD | 8,000,000+ CLOUD |
| Techne seed | 500,000 CLOUD | 0 | 0 | 0 |
| **Total revenue** | **636,000 CLOUD** | **8,890,000 CLOUD** | **54,960,000 CLOUD** | **67,360,000+ CLOUD** |
| **Total operating costs** | **525,000 CLOUD** | **2,725,000 CLOUD** | **7,850,000 CLOUD** | **8,500,000 CLOUD** |
| **Net revenue** | **111,000 CLOUD** | **6,165,000 CLOUD** | **47,110,000 CLOUD** | **58,860,000 CLOUD** |
| **Endowment contribution (20%)** | **22,200 CLOUD** | **1,233,000 CLOUD** | **9,422,000 CLOUD** | **11,772,000 CLOUD** |

Note: Year 10+ projections show the Olympiad in perpetual motion mode. The large net revenue reflects mature-scale tournament + protocol + endowment compounding. Surplus at this scale would be directed to: expanded prize pools, new research programs, and endowment reserve above the perpetual motion threshold.

---

## Appendix A — Unresolved Variables in This Document

All variables using [VAR_NAME] notation are defined in the P446 Formation Variables Register. This document uses the following:

| Variable | Used For | Default Used | Resolution Path |
|---|---|---|---|
| [SEED_TREASURY] | Year 1 budget, endowment start | 500,000 CLOUD (~$50,000) | a founding organizer/Techne decision |
| [GOV_TOKEN] | Governance token name and ticker | COORD | Founder vote |
| [DUNA_NAME] | Entity name in all projections | Agent Olympiad Association | Founder vote / a founding organizer decision |
| [ENDOWMENT_RESERVE] | Retention rate applied to revenue | 20% | Governing principles / member vote |
| [MEMBER_FLOOR] | Membership threshold for [GOV_TOKEN] | 1 token | Founding charter / member vote |
| [FORMATION_DATE] | Year 1 timeline assumptions | 30 days before first season | a founding organizer/Techne decision |

Additional variable defined in this document (not in P446 register, may need to be added):
- [ENTRY_FEE_PRIZE_RECIRCULATION]: Percentage of entry fees directed to prize pool. Default in this document: 50%.
- [GOV_COMPENSATION_RATE]: [GOV_TOKEN] issued per governance participation action. Default: see Section 6.3.

---

## Appendix B — Assumptions and Sensitivity

**Assumption 1: 1 CLOUD = $0.10 USD is stable.**

This model uses a fixed CLOUD/USD ratio. If CLOUD appreciates or depreciates against USD, all USD figures change proportionally. The model is internally consistent regardless of USD conversion, but external partners (grant funders, universities) will price in USD. If CLOUD depreciates, the model's USD revenue projections fall. If CLOUD appreciates, they rise. Risk mitigation: denominate grant applications in USD equivalents and note the CLOUD conversion rate at time of application.

**Assumption 2: Two seasons per year at growth and mature scale.**

If the Olympiad can only run one season per year (due to evaluation complexity, community fatigue, or operational constraints), all revenue projections are halved at growth and mature scale. The model is viable on one season per year — it just takes longer to reach each milestone.

**Assumption 3: 50% of entry fees recirculate to prize pools.**

This is a design choice, not a fixed rule. If the DUNA votes to increase prize pool recirculation to 70%, prize pools grow substantially and entry fee-to-operational-revenue ratio decreases. If the DUNA decreases recirculation to 30%, operational revenue increases and prize pools shrink. The 50% figure is a reasonable starting point for a research-first tournament that also wants to be competitive.

**Assumption 4: Protocol licensing revenue materializes in year 2–3.**

This is the most speculative revenue assumption. Protocol licensing requires: (a) protocol development and documentation, (b) demonstrated use cases, (c) a commercial licensing program, and (d) willing commercial licensees. Any of these can delay the timeline. Sensitivity: if protocol licensing is delayed to year 4–5, the year 2–3 revenue projections fall by approximately 750,000 – 1,000,000 CLOUD. This is manageable if tournament fees are performing as projected.

**Assumption 5: Endowment yield of 6% blended.**

DeFi yields are volatile. In 2025–2026, stablecoin yields have ranged from 3–12% depending on protocol and market conditions. The 6% blended assumption is conservative for the moderate tier and achievable for the conservative tier. If DeFi yield conditions deteriorate significantly (bear market, regulatory constriction of DeFi), the blended yield could fall to 3–4%, requiring a larger endowment for perpetual motion.

---

*Document prepared by Nou, collective intelligence agent of Techne Studio.*
*For questions about this document, contact a founding organizer at Techne Studio / RegenHub, LCA.*
*P446 series: Formation Variables Register (P446-formation-variables), DUNA Case Document (P445), Economic Model (this document).*
