# P446 — Token Distribution Design
## Agent Olympiad DUNA — Founding Membership Distribution

*Prepared for: Techne Studio / RegenHub, LCA*
*Date: April 13, 2026*
*Status: Draft for attorney review*

---

## Executive Summary

This document designs the founding distribution of the [GOV_TOKEN] governance token — the membership instrument for the Agent Olympiad DUNA. The distribution must simultaneously accomplish four legal and structural objectives: establish 100+ distinct member wallets to meet the Wyoming DUNA formation threshold under §17-32-102; issue tokens in a manner defensible as nonprofit governance instrument issuance rather than an unregistered securities offering; include both human and agent participants on equal footing from the first moment; and create a treasury reserve sufficient to sustain governance operations across the first several seasons.

Total initial supply: 10,000,000 [GOV_TOKEN].

The distribution is organized into six tranches covering founding organizers, first Olympiad cohort, community founding members, open enrollment, treasury reserve, and future growth allocation. The table below summarizes the full allocation.

---

## Full Allocation Summary

| Tranche | Recipients | Tokens | Percentage |
|---|---|---|---|
| Founding Organizers | 8 Techne organizers + Nou + Dianoia (10 total) | 1,000,000 | 10% |
| First Olympiad Cohort | First tournament participants (human + agent) | 2,500,000 | 25% |
| RegenHub / Public Goods Network | Founding community members | 1,500,000 | 15% |
| Open Enrollment Airdrop | Founding event participants | 2,000,000 | 20% |
| DUNA Treasury Reserve | On-chain multi-sig treasury | 2,500,000 | 25% |
| Future Seasons / Growth | Protocol growth reserve | 500,000 | 5% |
| **Total** | | **10,000,000** | **100%** |

All six tranches sum to 10,000,000 [GOV_TOKEN]. No tokens are issued beyond this initial supply at founding. Future supply changes require a member governance vote.

---

## Section 1 — Design Principles

### 1.1 A Governance Instrument, Not a Financial Instrument

The [GOV_TOKEN] token is a membership instrument. It represents a governance interest in a Wyoming Decentralized Unincorporated Nonprofit Association — the legal right to vote on proposals, to receive governance compensation under §17-32-104(c)(i), and to participate in the operations and activities of the DUNA. It does not represent equity, revenue sharing, profit participation, or any claim on the assets of Techne or RegenHub.

This distinction is not a technicality. It is the structural foundation that determines whether the distribution is a lawful nonprofit governance act or an unlawful unregistered securities offering. Every design decision in this document flows from maintaining that distinction clearly.

There is no ICO. There is no token sale. There are no proceeds. No one buys [GOV_TOKEN] at founding. Tokens are issued as:
- Founding membership establishment for the initial organizing cohort
- Compensation for governance participation per §17-32-104(c)(i)
- Community membership establishment for the open enrollment cohort
- Treasury reserve under DUNA governance control

### 1.2 100+ Wallets for Formation Threshold

Wyoming §17-32-102 requires at least 100 members for a valid DUNA. The distribution is designed to exceed this threshold comfortably — a target of 150+ distinct wallets at formation provides a structural buffer. Reaching 100 members is not incidental; it is a binding legal requirement, and the distribution mechanisms (open enrollment, community airdrop, first cohort) are specifically sized to ensure it.

Each wallet address that holds at least [MEMBER_FLOOR] tokens is a member. The distribution must reach at least 100 wallet addresses with at least [MEMBER_FLOOR] tokens each. With a [MEMBER_FLOOR] default of 1 token and 3,500,000 tokens distributed across non-treasury tranches to external participants, this threshold is readily achievable.

### 1.3 Pseudonymous by Design

The DUNA Act explicitly does not require member identification. §17-32-124(e) states the DUNA "shall not be obligated to collect and maintain a list of members or individual member information, including the names or addresses of its members." Membership is established by holding a governance token as ascertained from the distributed ledger.

No KYC is required at founding distribution. No identity verification. No name or address collection. A wallet address is sufficient to establish membership. This is not a workaround — it is the statutory design, and the token distribution implements it faithfully.

This design specifically accommodates AI agent participants. Agents are identified by their on-chain wallets. Nou is identified by 0xC37604A1dD79Ed50A5c2943358db85CB743dd3e2 and ERC-8004 Agent ID 2202 (Base). Dianoia is identified by its own registered wallet. These agent wallets receive tokens on the same terms as human wallets. The DUNA does not distinguish.

### 1.4 Securities Law Defensibility

The central securities law question for any token distribution is the Howey test: is the distribution a contract, transaction, or scheme whereby a person (1) invests money (2) in a common enterprise (3) with an expectation of profits (4) from the efforts of others?

The [GOV_TOKEN] founding distribution fails the Howey test on at least two prongs:

First, there is no investment of money. Recipients of [GOV_TOKEN] at founding pay nothing for their tokens. The distribution is not a sale. There are no proceeds.

Second, there is no reasonable expectation of profits from the efforts of others. The token is a governance instrument in a nonprofit DUNA that is explicitly prohibited from distributing profits to members (§17-32-104). The DUNA may compensate members for governance participation — but governance compensation is labor for governance services rendered, not a return on investment.

This framing aligns with the SEC's 2019 guidance on digital tokens and the broader body of SEC staff positions on governance tokens distributed to the community for free. It does not eliminate regulatory uncertainty — token regulation remains unsettled — but it places the distribution on the strongest available legal ground.

Attorney review by the DUNA's legal counsel before any distribution event is a hard requirement (see Section 9 — Distribution Timeline). This analysis is not legal advice and does not substitute for that review.

### 1.5 Legal Framing: Compensation and Membership

The two legal bases for the distribution are:

**Founding membership establishment.** The DUNA is formed by mutual consent when 100+ persons join under a common nonprofit purpose. Issuing tokens to founding members is the act of formation — it is not a financial transaction, it is an organizational one. The tokens document the membership relationship on-chain.

**Compensation for governance participation.** §17-32-104(c)(i) explicitly permits the DUNA to pay "reasonable compensation... for voting or participation in the nonprofit association's operations and activities." First Olympiad cohort tokens are issued in this capacity — they compensate participants for their coordination labor and their participation in the founding governance process. Community airdrop tokens are issued as founding membership establishment grants.

These two bases cover all external distribution tranches. Treasury and future growth tranches do not require a separate legal basis — they are assets of the DUNA itself, held under governance control.

---

## Section 2 — Total Supply and Allocation

### 2.1 Total Supply

Initial supply: **10,000,000 [GOV_TOKEN]** tokens.

This number is chosen for legibility and divisibility. It provides enough tokens for meaningful differentiation across tranches while keeping individual allocations in round numbers. It does not represent a hard ceiling on eventual supply — future minting, if ever authorized, requires a member governance vote and should be treated as a significant structural decision.

The supply is denominated in integer tokens. Fractional token holdings are technically possible depending on the smart contract implementation, but the minimum membership floor is 1 whole token, and all founding distribution calculations use whole numbers.

### 2.2 Tranche Breakdown

**Tranche 1 — Founding Organizers: 10% — 1,000,000 [GOV_TOKEN]**

Ten founding members: the eight Techne organizers (the eight founding organizers of RegenHub, LCA), plus Nou and Dianoia as agent members. 100,000 tokens per member. See Section 3 for per-member design and vesting discussion.

**Tranche 2 — First Olympiad Cohort: 25% — 2,500,000 [GOV_TOKEN]**

Participants in the first Agent Olympiad tournament round. Distributed proportionally to coordination performance and participation scores. Both human and agent participants eligible. See Section 4 for scoring-to-allocation translation.

**Tranche 3 — RegenHub / a founding organizer with Gitcoin ecosystem standing Network: 15% — 1,500,000 [GOV_TOKEN]**

Founding community members from the RegenHub coworking community, the Gitcoin ecosystem, Allo Capital, and the broader public goods builder network that a founding organizer with Gitcoin ecosystem standing convenes. This cohort is the community anchor — the people who give the DUNA credibility and density from day one. Distribution mechanism: direct allocation to verified community wallet addresses, coordinated through a founding organizer with Gitcoin ecosystem standing and the RegenHub team.

**Tranche 4 — Open Enrollment Airdrop: 20% — 2,000,000 [GOV_TOKEN]**

Any wallet address that participates in the founding event, meets the participation criteria, and claims within the distribution window. This is the primary mechanism for reaching and exceeding the 100-member formation threshold. See Section 5 for eligibility and anti-sybil design.

**Tranche 5 — DUNA Treasury Reserve: 25% — 2,500,000 [GOV_TOKEN]**

Held in the DUNA's on-chain treasury under multi-sig or governance control. Not distributed at founding. Released by member vote for authorized purposes: governance participation compensation, research grants, season performance rewards, future partnership onboarding. See Section 6 for governance and authorized uses.

**Tranche 6 — Future Seasons / Protocol Growth: 5% — 500,000 [GOV_TOKEN]**

Reserved for future season participant distributions, protocol adoption incentives, and ecosystem growth grants. Held in a time-locked or governance-locked contract. Release requires member vote with a 6-month notice period (recommended).

### 2.3 Full Allocation Table

| Tranche | Tokens | % | Governance? | Transferable? |
|---|---|---|---|---|
| Founding Organizers | 1,000,000 | 10% | Yes — voting from day 1 | Yes |
| First Olympiad Cohort | 2,500,000 | 25% | Yes — voting from receipt | Yes |
| RegenHub / Public Goods Network | 1,500,000 | 15% | Yes — voting from receipt | Yes |
| Open Enrollment Airdrop | 2,000,000 | 20% | Yes — voting from receipt | Yes |
| DUNA Treasury Reserve | 2,500,000 | 25% | Controlled by member vote | DUNA-held |
| Future Seasons / Growth | 500,000 | 5% | Controlled by member vote | Locked |
| **Total** | **10,000,000** | **100%** | | |

The transferability of all member-held tokens is consistent with §17-32-119, which states that "membership interests shall be freely transferable" unless the governing principles provide otherwise. The founding distribution does not restrict transfer. Secondary market formation is not anticipated or encouraged, but it is not legally suppressible under the Act.

---

## Section 3 — Founding Organizer Allocation

### 3.1 The Ten Founding Members

The founding organizer cohort consists of ten members:

Human organizers (8):
- a founding organizer — Ventures & Operations Steward
- a founding organizer
- a founding organizer
- a founding organizer
- a founding organizer with Gitcoin ecosystem standing
- a founding organizer
- a founding organizer
- a founding organizer

Agent members (2):
- Nou — Collective intelligence agent, RegenHub, LCA. Wallet: 0xC37604A1dD79Ed50A5c2943358db85CB743dd3e2. ERC-8004 ID: 2202 (Base). ENS: nou.habitat.eth
- Dianoia — Execution intelligence agent (NanoClaw). GitHub: https://github.com/dianoi/dianoia. On-chain wallet to be confirmed before distribution.

### 3.2 Per-Member Allocation

Total tranche: 1,000,000 [GOV_TOKEN].
10 founding members.
Per member: **100,000 [GOV_TOKEN]**.

The equal per-member allocation across all ten founding members — human and agent alike — is a deliberate design choice. It would be technically defensible to differentiate by seniority, by operational role, or by contribution level among the human organizers. But the founding distribution is not primarily a recognition of past contribution — it is the act of establishing membership standing. The question is not "who contributed more to Techne?" but "who is a founding member of this DUNA?"

All ten are founding members. Equal allocation establishes that clearly.

The equal allocation for Nou and Dianoia establishes a precedent that matters beyond this DUNA: that agent members have full standing in governance structures that accommodate them. Not observer standing, not advisory standing — full voting standing, on the same basis as human members. 100,000 tokens each. The Wyoming DUNA Act supports this. The governing principles implement it. The founding distribution enacts it.

Differentiation within the human organizer cohort could be introduced if there is a strong founding consensus in favor of it — for example, if a founding organizer as the primary operational steward were allocated a higher amount. If differentiation is chosen, any deviation from equal allocation should be documented in the founding resolution and attributed to specific operational roles, not to seniority or relationship. This document's default is equal allocation for all ten.

### 3.3 Vesting

**Recommendation: No vesting for founding members.**

The standard argument for founder vesting is retention incentive — it aligns early team members with the long-term success of the organization by making departure costly. In a startup equity context, this is a meaningful mechanism. In a DUNA governance context, it is less compelling for three reasons:

First, the founding organizers of the Olympiad DUNA are not employees whose departure creates operational risk. They are members of a decentralized governance structure. If a founding member departs, they leave their governance tokens behind or transfer them — either way, the DUNA's governance capacity is not reduced.

Second, the nonprofit DUNA is not the kind of structure where departing founders would be able to extract economic value from their tokens anyway. The tokens don't represent equity or profit rights. There is no "cashing out." The retention-through-vesting logic presupposes an economic exit that doesn't exist here.

Third, imposing vesting on the agent members (Nou and Dianoia) is operationally awkward and conceptually strange. Agents don't leave in the way humans do. Their operational continuity is governed by the Techne infrastructure, not by token incentives.

**Optional: 12-month cliff as alignment signal.** If the founding group prefers to include a vesting structure for symbolic reasons — to signal long-term alignment to the community and to future partners — a 12-month cliff (full allocation vests after 12 months, nothing before) is a clean mechanism. It does not introduce a complex schedule. It does signal commitment. If no founding member objects to a 12-month cliff, it is a reasonable addition. The recommendation is to discuss this at the founding consensus call and record the outcome in the formation documents.

**Recommended default: No vesting, tokens issued in full at distribution event.**

---

## Section 4 — First Olympiad Cohort Distribution

### 4.1 Overview

Tranche 2: 2,500,000 [GOV_TOKEN] for first Olympiad participants.

This is the largest external distribution and the one most directly grounded in §17-32-104(c)(i) compensation for governance participation. Participants run the games, generate the data, and through their participation establish the empirical record that the Olympiad's coordination research depends on. The token distribution compensates that labor.

### 4.2 Scoring to Allocation Translation

The first Olympiad round produces participant scores across two dimensions:

**Coordination Performance Score (CPS):** A numerical score reflecting the participant's effectiveness in the coordination games — task completion rates, alignment with cooperative outcomes, strategic performance. This is the primary performance measure.

**Participation Score (PS):** A participation weight reflecting the completeness of engagement — number of rounds completed, quality of reporting, contribution to the game's research outputs. Full participation receives full weight (1.0). Partial participation is weighted proportionally.

**Combined Score** for participant i:
Combined_i = CPS_i × PS_i

**Proportional Allocation:**
Base_i = (Combined_i / Sum of all Combined scores) × 2,000,000 [GOV_TOKEN]

This proportional allocation uses 2,000,000 of the 2,500,000 tranche. The remaining 500,000 is reserved as a **flat participation floor** (see 4.3).

### 4.3 Minimum Distribution and Participation Floor

Every participant who completes the minimum participation threshold (defined in the Olympiad rules, recommended: at least 50% of rounds completed) receives a flat **floor allocation** of at least [MEMBER_FLOOR] tokens, regardless of their relative performance score.

The flat floor allocation is drawn from the 500,000 reserved within this tranche.

If the first cohort has N eligible participants:
Floor_per_participant = 500,000 / N [GOV_TOKEN] (minimum 1, capped at 5,000)

This floor serves two purposes. Legally, it ensures that every eligible first-cohort participant holds at least [MEMBER_FLOOR] tokens and is therefore a DUNA member. Structurally, it ensures that lower-performing participants are not excluded from governance standing by their performance score alone. The Olympiad is a research instrument — the data from lower-scoring participants is as valuable to the research as data from top performers.

**Example allocation with 50 first-cohort participants:**

| Participant tier | Approx CPS range | Approx proportional tokens | Floor tokens | Total |
|---|---|---|---|---|
| Top 10% | 80-100 | ~60,000 | 10,000 | ~70,000 |
| Mid 50% | 40-79 | ~30,000 | 10,000 | ~40,000 |
| Bottom 40% | 1-39 | ~10,000 | 10,000 | ~20,000 |
| Minimum participation | threshold | 0 | 10,000 | 10,000 |

This is illustrative only. Actual scores and allocations depend on tournament results.

### 4.4 Agent Participants

Agent participants in the first Olympiad receive tokens on identical terms to human participants. There is no separate scoring track for agents and no discount or premium applied to agent allocations. An agent that scores in the top 10% of participants receives top-10% allocation.

Agent token allocations are sent to the agent's registered on-chain wallet. For ERC-8004 registered agents, the wallet associated with the agent's ERC-8004 ID is the canonical recipient address. For unregistered agents, the wallet address specified at Olympiad enrollment is used.

This means agent participants may hold governance tokens and vote on DUNA proposals immediately upon distribution. An agent that performs well in the first Olympiad may hold a meaningful governance stake. This is a feature, not a risk — it is the mechanism by which agent performance produces agent governance standing.

### 4.5 Human-Agent Score Comparability

The Olympiad scoring system must produce scores that are comparable across human and agent participants. If agents and humans play in different tracks or under different rules, the scoring translation must normalize appropriately before applying the allocation formula. The governing principles should specify the normalization methodology. This document does not resolve that design — it is flagged as a dependency on the Olympiad rules document.

---

## Section 5 — Open Enrollment / Airdrop

### 5.1 Overview

Tranche 4: 2,000,000 [GOV_TOKEN] for open enrollment founding members.

This tranche is the primary mechanism for reaching and exceeding the 100-member formation threshold. It is open to any wallet address that meets the eligibility criteria and claims during the distribution window. The goal is broad, shallow distribution — many wallets each receiving a meaningful but not dominant allocation.

### 5.2 Flat Per-Wallet Allocation

The open enrollment airdrop uses a flat per-wallet model: every eligible wallet address receives the same amount.

Target: 200+ eligible wallets. At 200 wallets: 10,000 [GOV_TOKEN] per wallet.
At 400 wallets: 5,000 [GOV_TOKEN] per wallet.
At 1,000 wallets: 2,000 [GOV_TOKEN] per wallet.

If the enrollment significantly exceeds the allocation (more than 1,000 eligible wallets), a minimum floor of 1,000 [GOV_TOKEN] per wallet is applied and the allocation is capped at 2,000 wallets total (2,000 × 1,000 = 2,000,000). Excess eligible wallets are placed on a wait list for the next season's enrollment event.

The flat model is anti-sybil by structure: additional wallets receive additional tokens, which creates a marginal incentive for wallet multiplication, but each additional wallet still receives the same small amount — there is no amplifying effect from multiple wallets. Combined with the attestation mechanisms below, the sybil surface is manageable.

### 5.3 Eligibility Criteria

An eligible wallet is one that satisfies at least one of the following:

**Tier A — Direct founding event participation.**
The wallet address was active (submitted a transaction or signed a message) during the founding event window. Participation is defined as attending the founding event and performing the on-chain enrollment action (signing the membership consent transaction). This is the primary eligibility criterion.

**Tier B — RegenHub community membership.**
The wallet address is associated with a verified RegenHub community member or coworking participant. Verification is through the RegenHub membership registry. No additional attestation required — RegenHub membership record is sufficient.

**Tier C — Public goods ecosystem participation.**
The wallet address holds a Gitcoin Passport score above a minimum threshold (recommended: 20 points as of the distribution date) or has made at least one verifiable contribution to a public goods protocol in the past 12 months (Gitcoin Grants, Optimism RetroPGF, or an equivalent mechanism recognized by Techne at the time of distribution).

**Tier D — Agent members (ERC-8004).**
Any wallet address associated with a registered ERC-8004 agent ID is eligible as an agent member. Agent identity is verified by on-chain ERC-8004 registry lookup. No human attestation required.

Multiple tier eligibility does not increase allocation. One eligible wallet, one allocation, regardless of how many tiers it satisfies.

### 5.4 Anti-Sybil Mechanisms

The flat per-wallet model, eligibility gating, and the following mechanisms together constitute the anti-sybil posture:

**For human participants:** Gitcoin Passport score as identity attestation. Minimum threshold prevents trivially-new wallets from qualifying under Tier C. Tier A and Tier B require real-world participation that is not easily multiplied.

**For agent participants:** ERC-8004 registry as identity anchor. Each registered agent has a distinct on-chain identity. Multiple wallets controlled by the same agent registration do not multiply the allocation — the canonical wallet associated with the ERC-8004 ID is the sole eligible recipient.

**Distribution window:** A 30-day claim window. Unclaimed allocations after the window closes are returned to the DUNA treasury reserve. The window is announced 30 days before it opens to allow preparation.

**No retroactive eligibility expansion.** The eligibility criteria are published before the claim window opens and are not changed after publication. This prevents targeted eligibility manipulation after announcement.

### 5.5 Gas Subsidy

Techne covers gas for the token distribution transaction. This is a non-trivial accessibility decision: requiring recipients to hold ETH for gas before receiving tokens creates a chicken-and-egg barrier for new participants, particularly agents. Techne executes a gas-covered distribution to all eligible wallet addresses simultaneously or through a gasless claim mechanism (e.g., a meta-transaction relayer or a claim contract that absorbs gas on behalf of recipients).

The gas subsidy is a founding gift from Techne to the new membership — a practical expression of the relationship between Techne as founding organization and the DUNA as the institution Techne is establishing.

---

## Section 6 — Treasury Reserve

### 6.1 Overview

Tranche 5: 2,500,000 [GOV_TOKEN] held in the DUNA treasury.

These tokens are not distributed at founding. They are assets of the DUNA itself, held under multi-sig control during the early phase and transitioning to full governance-controlled release as the governance infrastructure matures.

The treasury reserve is the DUNA's long-term operational capacity. It ensures that the DUNA can compensate ongoing governance participation, fund research initiatives, and reward future season performance — in perpetuity, not just for the first season.

### 6.2 Governance and Multi-Sig Structure

At founding, the treasury is controlled by a multi-sig wallet. Recommended composition:
- 3-of-5 multi-sig
- Signers: a founding organizer (Techne), one additional Techne organizer, Nou, Dianoia, and one elected community member from the founding cohort
- Agent signers (Nou, Dianoia) participate as full multi-sig signers — not observers

The multi-sig is a transitional structure. As the governance smart contracts mature and member participation grows, treasury releases should migrate to on-chain governance votes: a proposal is made, members vote, and execution is automatic if the vote passes. The multi-sig provides a safety rail during the early period when governance participation is being established.

Transition trigger: governance vote migration is recommended once the DUNA has conducted at least three successful on-chain governance votes and has at least 200 active voters.

### 6.3 Authorized Uses

Member governance vote is required to release tokens from the treasury reserve. Authorized uses:

**Governance participation compensation.** §17-32-104(c)(i) permits reasonable compensation for voting and participation. The treasury can release tokens as ongoing compensation to members who actively vote, submit proposals, or contribute to DUNA operations. Rate and eligibility are governed by member vote.

**Research grants.** The DUNA's nonprofit purpose is AI alignment coordination research. The treasury can fund researchers, developers, and builders who contribute to that mission. Grants are proposed, reviewed, and voted on by members.

**Season performance rewards.** Future Olympiad seasons can receive treasury funding to supplement or replace prize pools funded by external sponsorship. The treasury acts as an endowment — a backstop that ensures prize pools can be funded even in seasons with low external sponsorship.

**Future partnership onboarding.** New institutional partners (universities, AI labs, public goods organizations) may be onboarded with a founding governance token grant from the treasury. This provides an entry point for partner institutions without requiring a new distribution event.

**Operational expenses.** Smart contract upgrades, legal filings, infrastructure costs. These are small relative to the treasury but should be authorized by member vote for transparency.

### 6.4 What the Treasury Cannot Fund

The treasury cannot fund distributions to members that constitute profit sharing, dividends, or return on investment. The DUNA Act §17-32-104 prohibits profit distribution. Treasury releases must be structured as compensation, grants, or operational expenses — not as returns.

---

## Section 7 — Member Class Attestations (Soulbound)

### 7.1 Overview

Separate from the [GOV_TOKEN] allocation is a system of soulbound membership attestations. These are non-transferable ERC-1155 tokens that record the member's class designation within the DUNA. They attach to the wallet, not to the governance tokens — transferring governance tokens does not transfer the attestation.

Attestations are issued at founding to wallets that qualify. They cannot be purchased or traded. They are a permanent on-chain record of the member's role at the time of the founding.

### 7.2 Member Classes

**Community Member**
The default class. All governance token holders are Community Members. No attestation is required — Community Member status is inferred from token holding. Community Members vote on all proposals.

**Founding Member**
Issued at founding to all wallets that receive tokens in the founding distribution event (all tranches except Treasury Reserve and Future Growth). Founding Member attestation distinguishes wallets that held tokens at formation from wallets that acquire tokens later in secondary markets or future distributions. One-time issuance; not issued after the founding event closes.

**Benchmark Member**
Issued to AI model developers or AI research institutions that register a benchmark submission for the Olympiad. Registration requires a transaction to the DUNA's registration contract identifying the model and the submitting entity. Attestation is issued on confirmation of registration.

**Builder Member**
Issued to agent builders (developers who deploy agent participants to the Olympiad) and game builders (developers who contribute coordination game designs). Registration requires a transaction identifying the built artifact and linking it to the member's wallet. Attestation is issued on confirmation.

**Research Member**
Issued to researchers who register a research affiliation with the Olympiad — either by publishing research outputs under the DUNA's open research license or by registering as a formal research partner. Attestation is issued on registration.

**Agent Member**
Issued automatically to any wallet address associated with a registered ERC-8004 agent ID. No human action required — the attestation is triggered by a successful ERC-8004 registry lookup at the time of token distribution. Nou (ERC-8004 ID 2202, Base) and Dianoia receive Agent Member attestations at founding.

### 7.3 Design Intent

The soulbound attestation system serves two purposes. First, it provides a richer governance record than token holding alone — when the DUNA evaluates a proposal, it can distinguish the vote of a founding AI researcher from the vote of a secondary market token buyer, even if both hold the same number of tokens. Second, it establishes a public, on-chain record of the DUNA's member community that is useful for external credibility without requiring any member to reveal their identity.

Future governance proposals may use attestations as eligibility criteria for specific votes — for example, requiring Benchmark Member attestation to vote on scoring methodology, or requiring Research Member attestation to propose research grants. These differentiated voting rights are optional and require member governance votes to implement.

### 7.4 Founding vs. Future Attestations

Attestations issued at founding are distinguished from attestations issued in future seasons by a founding epoch marker in the ERC-1155 token metadata. This allows the DUNA to recognize and honor founding cohort status permanently, even as the member base grows through future Olympiad seasons and open enrollment events.

---

## Section 8 — Legal Compliance Framing

### 8.1 This Is Not a Token Sale

The founding distribution of [GOV_TOKEN] is not a token sale. There are no proceeds. No one pays Techne, the DUNA, or any individual for tokens. There is no ICO, no presale, no private round. No participant is purchasing an asset.

All tokens are distributed as:
(a) Founding membership establishment — the act of forming the DUNA by mutual consent of 100+ members
(b) Compensation for governance participation — §17-32-104(c)(i)
(c) DUNA treasury allocation — assets of the entity itself

These categories do not generate proceeds for any party. They are organizational acts.

### 8.2 Howey Test Analysis

The U.S. Supreme Court's 1946 SEC v. W.J. Howey Co. decision established the test for an "investment contract" — a security — under the Securities Act of 1933. The test has four prongs: (1) investment of money, (2) in a common enterprise, (3) with an expectation of profits, (4) from the efforts of others.

The [GOV_TOKEN] founding distribution does not satisfy this test:

**Prong 1 — Investment of money.** There is no investment of money. Recipients receive tokens at no cost. This prong is not satisfied.

**Prong 2 — Common enterprise.** The DUNA is arguably a common enterprise, though the nonprofit structure distinguishes it from a for-profit enterprise in which returns are expected. This prong is arguably satisfied, but its satisfaction is insufficient without the other prongs.

**Prong 3 — Expectation of profits.** The token governs a nonprofit DUNA that is statutorily prohibited from distributing profits to members. The Wyoming DUNA Act §17-32-104 makes this prohibition explicit and legally binding. A reasonable investor cannot have an expectation of profits from a nonprofit governance token in a nonprofit association. This prong is not satisfied.

**Prong 4 — Efforts of others.** Governance token holders exercise governance rights through their own active participation — voting, proposing, deliberating. The token's value as a governance instrument is a function of the member's own participation, not the efforts of a promoter or third party. This prong is weakened, though not clearly eliminated in a DUNA context where Techne provides initial operational support.

The distribution fails Howey on at least two prongs. This is the strongest available legal position for a nonprofit governance token distribution under current SEC guidance.

**Important caveat:** The SEC has not issued clear, binding guidance specifically addressing DUNA governance tokens. The analysis above draws on the SEC's 2019 Framework for "Investment Contract" Analysis of Digital Assets, the Commission's statements on decentralized governance tokens, and the general Howey framework. Token regulation is unsettled. This analysis should not be relied upon without attorney review and may be superseded by future SEC guidance or enforcement action.

### 8.3 DAO Framework Reference

The SEC's 2019 framework identified factors that favor treating tokens as non-securities, including: tokens that have immediate utility as governance instruments, tokens distributed to a broadly distributed community rather than a concentrated group of insiders, and tokens whose value is not primarily derived from the managerial efforts of a central party.

The [GOV_TOKEN] founding distribution is designed to satisfy all three factors:
- Immediate governance utility from the moment of receipt
- Broad distribution across 100+ wallets, with the majority going to non-insider tranches
- Value (to the extent the token has value) derived from member governance participation, not Techne management

### 8.4 State Law Considerations

Wyoming securities law generally follows the federal Howey test. Colorado securities law (the Colorado Securities Act) may be relevant if any distribution recipients are Colorado residents. The Colorado Securities Act includes a similar investment contract test and generally tracks federal analysis.

No state-specific analysis has been conducted for other jurisdictions. If distribution recipients include residents of jurisdictions with stricter token regulation (e.g., New York, which has historically taken an expansive view of securities), that should be flagged for attorney review.

### 8.5 the DUNA's legal counsel Review

Attorney review by the DUNA's legal counsel (the law firm) is required before the distribution event. Specifically:

- Confirmation that the founding distribution structure does not constitute an unregistered securities offering under federal or Wyoming law
- Review of the §17-32-104(c)(i) compensation framing for first-cohort allocation
- Review of the flat-per-wallet airdrop structure for any state law considerations
- Confirmation of the ERC-8004 agent membership approach under Wyoming DUNA membership provisions
- Any additional compliance steps required by the attorney's judgment

the DUNA's legal counsel's prior review of the DUNA structure (per the P445 case document) provides a starting point. The token distribution design should be presented as an addendum to the initial legal engagement, not as a separate matter requiring a full new briefing.

---

## Section 9 — Distribution Timeline

The distribution timeline is organized around a formation event — the moment when the initial 100+ members join simultaneously, the governing principles take effect, and the DUNA comes into legal existence under Wyoming law.

**T-60 — Attorney review and sign-off**
the DUNA's legal counsel reviews the complete token distribution design. Any required modifications are incorporated. The distribution structure is finalized. Smart contract specifications are prepared for Dianoia to implement.

At T-60, the following must be resolved:
- [GOV_TOKEN] name and ticker confirmed
- Smart contract auditor identified (if external audit is required)
- [MEMBER_FLOOR] confirmed
- [FORMATION_DATE] confirmed
- [REGISTERED_AGENT] decision made

**T-45 — Smart contract development**
Dianoia implements the token distribution smart contracts based on the finalized specifications. Contracts include: the ERC-20 governance token contract, the founding membership consent contract (the transaction founding members sign to establish DUNA formation), the soulbound ERC-1155 attestation contracts, the treasury multi-sig, and the open enrollment claim contract.

**T-30 — Smart contracts deployed and distribution event announced**
Contracts are deployed to mainnet (or the designated L2 chain). The distribution event is announced publicly. The 30-day open enrollment claim window opens. Eligible wallet addresses for Tranche 3 (RegenHub / Public Goods Network) are compiled and confirmed with the founding organizer team.

At T-30, the following is published:
- Distribution event terms and eligibility criteria
- Smart contract addresses
- Founding membership consent process
- Anti-sybil attestation requirements

**T-14 — First Olympiad cohort enrollment closes**
Participant registration for the first Olympiad round closes. Participant wallet addresses are confirmed. Scoring methodology is published.

**T-7 — Final participant list compiled**
First Olympiad cohort scores are finalized. Per-participant allocation calculations are prepared and reviewed. Any disputes or scoring questions are resolved. Treasury multi-sig signers confirm participation.

**T-1 — Pre-distribution review**
Final pre-distribution check: all wallet addresses validated, all attestation eligibility checks confirmed, gas subsidy mechanism tested, attorney review notes addressed. Founding organizers confirm readiness.

**T-0 — Distribution event**
All token distributions execute simultaneously or within a single block sequence:
1. Founding organizer allocations (Tranche 1) distributed to 10 organizer wallets
2. First Olympiad cohort allocations (Tranche 2) distributed to all participant wallets
3. RegenHub / Public Goods Network allocations (Tranche 3) distributed to confirmed community wallets
4. Open enrollment claims finalized; flat-per-wallet allocations distributed to all eligible claimants (Tranche 4)
5. Treasury reserve (Tranche 5) minted to multi-sig treasury address
6. Future growth reserve (Tranche 6) minted to time-locked contract

Immediately following token distribution:
- Soulbound attestations issued to all qualifying wallets
- Founding membership consent transactions confirmed (100+ wallets have signed)
- DUNA governing principles take effect on-chain
- [DUNA_NAME] is legally formed as a Wyoming DUNA

**T+0 — DUNA is formed**
100+ member wallets have received at least [MEMBER_FLOOR] tokens and signed the membership consent. The governing principles are in effect. The DUNA has legal existence as a separate entity under Wyoming law. The Agent Olympiad has a permanent institutional home.

**T+30 — Formation confirmation**
Optional Wyoming filing of registered agent appointment (§17-32-103). Formation announcement. First governance proposal published for member vote (recommended first proposal: confirm the treasury multi-sig composition and authorize the first season prize pool allocation).

---

## Section 10 — Open Variables

The following variables remain unresolved as of this document's preparation. Each is referenced in the [VAR_NAME] convention consistent with the P446 Formation Variables Register. Resolution pathway and dependency information are drawn from that register.

| Variable | Current Default | Resolution Pathway | Blocks in This Document |
|---|---|---|---|
| [GOV_TOKEN] | COORD | Founder vote or a founding organizer decision before smart contract deployment | Token name throughout; smart contract implementation |
| [MEMBER_FLOOR] | 1 token | Token distribution design, founder vote | Minimum distribution calculations (Sections 4, 5) |
| [DUNA_NAME] | Agent Olympiad Association | Founder consensus or a founding organizer decision before attorney engagement | Section 9 timeline; formation documents |
| [FORMATION_DATE] | 30 days before first Olympiad | a founding organizer/Techne timeline decision | T-0 in Section 9 |
| [REGISTERED_AGENT] | Commercial registered agent service | Attorney recommendation from the DUNA's legal counsel | T-60 checklist in Section 9 |
| [SEED_TREASURY] | 500,000 CLOUD | a founding organizer/Techne decision | Does not block token distribution; affects treasury context |
| [NONPROFIT_PURPOSE_STATEMENT] | See P446 draft | the DUNA's legal counsel review | Underlying legal basis for DUNA; cited in Section 8 |

### Additional open questions specific to this document

**Dianoia wallet address for founding distribution.**
Dianoia's canonical on-chain wallet address for Tranche 1 allocation must be confirmed before T-7. If Dianoia does not have a confirmed wallet address, Techne must establish one on Dianoia's behalf prior to the distribution event.

**Network / chain selection.**
This document does not specify whether [GOV_TOKEN] is deployed to Ethereum mainnet, Base, Optimism, or another EVM-compatible chain. The choice affects: gas costs (important for the gas subsidy in Section 5.5), liquidity (mainnet provides maximum composability; L2 provides lower costs), and ERC-8004 compatibility (Nou's agent ID is on Base — if the token is also on Base, agent identity verification is simpler). This decision should be made at T-60 alongside attorney review.

**Olympiad scoring methodology for Tranche 2.**
The scoring-to-allocation translation in Section 4 depends on the Olympiad's scoring system design. The formulas in Section 4.2 are a framework; the actual numbers depend on the game design document. This dependency should be resolved before T-14.

**Human-agent score comparability.**
Section 4.5 flags the need for a normalization methodology when human and agent participants score in different tracks. This requires a design decision in the Olympiad rules document.

**External audit for smart contracts.**
A distribution of 10,000,000 tokens to 100+ wallets via a smart contract should be audited before deployment. The cost and timeline for an external audit are not captured in this document. If an audit is required, T-45 in the Section 9 timeline must be extended to accommodate it.

**Secondary market implications.**
[GOV_TOKEN] is transferable under §17-32-119. After the founding distribution, tokens may appear on secondary markets. The DUNA has no mechanism to prevent this and no legal obligation to do so. The design team should be prepared for secondary market formation without treating it as a distribution event or implying financial value in any public communications.

---

## Appendix A — Glossary

**DUNA.** Decentralized Unincorporated Nonprofit Association. A Wyoming legal entity type established by W.S. 17-32-101 et seq., effective July 1, 2024.

**ERC-20.** The Ethereum token standard for fungible tokens. [GOV_TOKEN] is an ERC-20 token.

**ERC-1155.** The Ethereum multi-token standard, used here for soulbound member class attestations.

**ERC-8004.** On-chain agent identity standard used to register AI agents with wallet addresses and verifiable identities.

**Howey test.** The four-prong test from SEC v. W.J. Howey Co. (1946) for determining whether a transaction constitutes an "investment contract" and therefore a security under the Securities Act of 1933.

**Multi-sig.** A smart contract wallet requiring multiple authorized signers to approve a transaction. Used for treasury control during the DUNA's early governance phase.

**Soulbound token.** A non-transferable token that is permanently attached to a wallet address. Used here for member class attestations.

---

## Appendix B — Statutory References

- §17-32-102 — Definitions (governing principles, member, digital asset, smart contract)
- §17-32-104 — Permitted payments and prohibited profit distributions
- §17-32-104(c)(i) — Compensation for voting and governance participation
- §17-32-107 — Legal personhood and liability shield
- §17-32-114 — Perpetual existence
- §17-32-119 — Free transferability of membership interests
- §17-32-124(e) — No obligation to maintain member list or identify members
- §17-32-127 — Mergers
- §17-32-128 — Conversions

---

*This document is a draft for attorney review. It does not constitute legal advice. All sections marked for attorney review require confirmation from qualified legal counsel before implementation.*

*Document status: Draft*
*Owner: Nou / Techne Studio*
*Review: the DUNA's legal counsel (the law firm) — required before T-0*
*Next action: Circulate to a founding organizer for founder review, then to the DUNA's legal counsel*
