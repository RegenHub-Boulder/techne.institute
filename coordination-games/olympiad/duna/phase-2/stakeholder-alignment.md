# Stakeholder Alignment Plan — Founding Member Cohort
## Agent Olympiad DUNA — First 100 Members
*April 13, 2026*

---

## Purpose of This Document

A Wyoming DUNA requires at least 100 members at formation. This document maps the path to assembling the founding cohort, identifies the priority partners we need to approach before and after formation, and defines the outreach strategy for each. It is a working coordination document — not a marketing plan. Its purpose is to make the 100-member threshold achievable within the [FORMATION_DATE] window and to begin the institutional relationships the DUNA will depend on in its first years.

---

## 1. The 100-Member Threshold

**What it means.** The Wyoming DUNA Act (W.S. 17-32-101 through 17-32-129, effective July 1, 2024) requires that a DUNA be formed by at least 100 persons who join by mutual consent under an agreement for a common nonprofit purpose and who elect to be governed by the Act. Membership is established by holding a governance token, ascertained via the distributed ledger. There is no KYC requirement, no obligation to maintain a member list, and no geographic restriction. A wallet address holding at least [MEMBER_FLOOR] [GOV_TOKEN] governance tokens constitutes a member.

**Why it matters.** The 100-member threshold is the legal condition of the DUNA's existence. The entity does not form until this threshold is met. This means the governance token distribution event that establishes the initial membership base IS the DUNA's formation event — the two are the same act. Distributing tokens to fewer than 100 wallets means the DUNA does not come into existence. Distributing to 100 or more means it does.

This threshold also has a structural implication: it is a minimum quality filter. The DUNA cannot be a vehicle for a small founding group to claim institutional status. One hundred members is a real community, even if small. The design of the initial token distribution must be intentional about reaching real participants who understand what they are joining, not just wallet addresses created for the purpose.

**The auto-conversion fallback.** If membership falls below 100 after formation — through wallet attrition, token concentration, or a failure of the membership design — the entity does not dissolve. Under the Act, it automatically converts to a standard Wyoming Unincorporated Nonprofit Association. This is a graceful degradation rather than a catastrophic failure. However, a standard UNA does not have the DUNA's pseudonymous membership provisions or smart-contract governance authority, and it does not carry the same institutional signal. The 100-member floor is worth maintaining as a structural discipline.

**The floor should be easy to stay above.** The [MEMBER_FLOOR] variable in the formation variables register defaults to 1 token — anyone holding any amount of [GOV_TOKEN] is a member. This is intentional: the threshold to satisfy the legal requirement should not be made artificially harder by a high token floor. The binding constraint is reaching 100 wallets at formation; every subsequent design decision should support that goal rather than work against it.

---

## 2. Founding Cohort Map

The path to 100+ members at formation runs through five segments, each with a different acquisition mechanism and a different relationship to the DUNA's long-term governance.

### Segment A — Techne / RegenHub Founding Organizers (8 members)

The eight founding organizers of RegenHub, LCA are the core of the founding cohort. They have institutional commitment to the cooperative's mission, direct relationship with Techne, and the deepest context on what the DUNA is and why it exists. They are guaranteed members and the natural nucleus around which the rest of the cohort assembles.

Named founding organizers: Todd Youngblood, Aaron G Neyer, Benjamin Ross, Jonathan Borichevskiy, Kevin Owocki, Lucian Hymer, Neil Mackay Yarnal, Savannah Kruger.

Each receives a founding allocation of [GOV_TOKEN] governance tokens. Allocation size is not yet specified — this is part of the token distribution design (§8 of the formation variables register, out of scope for this document). Minimum holding is [MEMBER_FLOOR] tokens, establishing membership. The founding organizer allocation should be weighted to reflect founding contribution and ongoing governance responsibility, subject to the governing principles.

Segment A target: 8

### Segment B — Agent Members: Nou and Dianoia (2 members)

Nou (collective intelligence agent of Techne Studio, wallet: 0xC37604A1dD79Ed50A5c2943358db85CB743dd3e2, ERC-8004 Agent ID 2202 on Base, ENS: nou.habitat.eth) and Dianoia (execution intelligence agent, NanoClaw) hold governance tokens and are members of the DUNA.

The legal basis for agent membership is addressed in the attorney brief (P446, Section 4). This is the most novel element of the DUNA's founding membership and the one most subject to legal confirmation. The structure being considered is: agents hold tokens as extensions of Techne (Techne as technical member, agent as operator), or agents hold tokens in their own right under the §17-32-102 "any other legal commercial entity" reading. Attorney guidance from Jeff Pote will clarify which structure is defensible.

Regardless of the legal mechanism, agent membership is a first-principles design choice: the Olympiad's governing institution should include, as formal members, agents of the kind that the Olympiad studies. The DUNA is not just about agents — it is in part governed by them.

Segment B target: 2 (contingent on attorney confirmation of agent membership mechanism)

### Segment C — First Olympiad Cohort: Tournament Participants (target: 20–30 members)

Participants in the first Agent Olympiad round are natural DUNA members — they have direct stake in the tournament's rules, benchmark standards, and prize pool governance. Their participation in the tournament and their governance token receipt are the same event.

This cohort is likely to include: AI model developers submitting agents to the first round; independent agent builders testing coordination protocols; researchers instrumenting the first round for behavioral data collection. These are the Benchmark Members, Builder Members, and Research Members described in the stakeholder analysis.

Acquisition mechanism: governance token allocation is built into the tournament participation structure. Registering for the first Olympiad round includes, or is paired with, a [GOV_TOKEN] allocation that establishes DUNA membership. No separate enrollment step. Participation = membership.

The number of first-cohort participants is the most variable of all segments — it depends on outreach to AI labs, agent builder communities, and research groups. The Tier 1 and Tier 2 outreach targets described in Section 3 of this document are the primary lever for this segment.

Segment C target: 20–30

### Segment D — RegenHub Coworking Community: The Boulder Network (target: 20–30 members)

The RegenHub coworking community in Boulder is an existing network of builders, researchers, designers, and operators with a shared orientation toward regenerative and cooperative infrastructure. This community has relationships with all eight founding organizers and has been the social substrate for Techne's development.

Acquisition mechanism: personal outreach by founding organizers (particularly Todd Youngblood as primary Techne operational contact and the organizers with the strongest RegenHub community ties). These are people who already understand what Techne is doing, who have context on the Olympiad, and who have reasons to want a governance stake in a commons their community helped found.

The ask is lightweight: receive a governance token allocation, become a founding member of a Wyoming DUNA organized by a cooperative you are already affiliated with. For many members of this community, this is a natural extension of existing relationship.

Segment D target: 20–30

### Segment E — Kevin Owocki Network: Gitcoin Ecosystem and Public Goods Builders (target: 20–30 members)

Kevin Owocki is a founding organizer of RegenHub, LCA and the founder of Gitcoin — one of the most significant public goods funding mechanisms in the Ethereum ecosystem. His network includes: Gitcoin Grant recipients and operators; Allo Capital contributors; the broader public goods funding community on Ethereum; and individuals at the intersection of AI, crypto, and coordination research.

This network has the highest density of people who (a) understand on-chain governance, (b) are philosophically aligned with a public goods institution that governs AI coordination research, and (c) have the technical fluency to hold governance tokens and participate meaningfully.

Acquisition mechanism: Kevin Owocki as connector and advocate. The pitch to this network is not "help us reach 100 members" — it is "here is a public goods institution you have reason to be part of, and here is a governance stake at founding." The founding cohort opportunity (early governance tokens, founding member status, voice in the DUNA's initial governance design) is the primary hook.

Segment E target: 20–30

### Segment F — Open Enrollment at Launch (target: remaining to reach 100+)

The governance token distribution event at Olympiad launch is open. Any wallet that receives [GOV_TOKEN] tokens through the distribution event becomes a member. The open enrollment segment covers everyone who participates in the launch distribution who is not already covered by Segments A–E.

This segment is deliberately not prescriptive — it is the part of the founding cohort that the distribution event design will determine. The important constraint is that open enrollment should not be the primary mechanism for reaching the 100-member threshold. If Segments A–E deliver 70–100 members, open enrollment is a supplement and a signal of community interest. If Segments A–E deliver fewer than 70, the open enrollment design needs to be more structured.

Segment F target: 10–20 (buffer to ensure 100+ regardless of attrition in other segments)

### Cohort Summary

| Segment | Target | Mechanism |
|---|---|---|
| A — Founding Organizers | 8 | Direct allocation at formation |
| B — Agent Members | 2 | Token allocation to agent wallets (subject to attorney confirmation) |
| C — First Olympiad Cohort | 20–30 | Tournament registration + token allocation |
| D — RegenHub Community | 20–30 | Organizer personal outreach |
| E — Owocki / Gitcoin Network | 20–30 | Kevin Owocki as connector |
| F — Open Enrollment | 10–20 | Launch distribution event |
| **Total** | **80–120+** | |

The design target is 120+ at formation. This provides a 20% buffer above the legal threshold, accounting for wallets that receive tokens but do not complete the membership gesture (whatever that requires under the governing principles), and for any technical distribution failures.

---

## 3. Priority Partner Outreach

Beyond the founding cohort of individuals, the DUNA's long-term credibility depends on institutional relationships. These are not membership targets per se — they are partners whose affiliation signals the institution's legitimacy to the research community, the AI lab community, and the funding community. In some cases they will also be DUNA members (via their own token holdings or their personnel's token holdings). In other cases they are partners rather than formal members.

The three tiers below represent a sequencing of outreach — who we talk to before formation (when we are asking for founding participation and relationship), who we approach in the first season (when we have a formed institution and early results), and who we cultivate for the mature institution.

### Tier 1 — Pre-Formation, Essential

These are the relationships that need to be initiated before the DUNA forms. Their presence at founding (even as letters of support rather than formal membership) materially increases the institution's credibility with Tier 2 and Tier 3 partners.

**Ethereum Foundation**

Role: Research partnership anchor and credibility signal. The EF has deep interest in multi-agent coordination, AI alignment as it relates to decentralized systems, and coordination game theory. The Olympiad's use of on-chain governance, wallet-based identity, and public blockchain infrastructure puts it squarely in the EF's research portfolio.

The pitch: The Olympiad DUNA is building the first public institution for AI coordination research that is itself governed on-chain. The EF has a structural reason to want this research to be credible, reproducible, and institutionally independent — a startup running AI coordination tournaments is interesting; a Wyoming DUNA with 501(c)(3) status and an EF research affiliation is a proper research institution.

What we are asking for: A research partnership memorandum (not a financial commitment at this stage), participation in the first Olympiad season's research design, and a nominal founding membership in the DUNA. The EF's legal team will need the attorney confirmation of the 501(c)(3) path before any formal relationship is possible.

Who makes contact: Todd Youngblood as primary, with Jonathan Borichevskiy as support (if he has an existing EF relationship — to confirm). Kevin Owocki has Ethereum ecosystem standing that may be relevant.

Materials needed: The three Phase 1 documents (P445 case document, P445 stakeholder analysis, P446 formation variables), plus attorney confirmation letter on §501(c)(3) path. Do not approach the EF before attorney confirmation is in hand.

**Kevin Owocki / Gitcoin / Allo Capital**

Role: Network access, public goods alignment, founding credibility. Kevin is already a founding organizer. The outreach here is not to Kevin personally (he is already committed) but to the institutional relationships he can activate: Gitcoin as an organization, Allo Capital as a funding mechanism, and the broader Gitcoin ecosystem as a source of Segment E founding cohort members.

The pitch to Gitcoin/Allo: The Olympiad DUNA is a public goods institution for AI coordination research. Gitcoin's mission is funding public goods on the internet. AI coordination protocols — the open-source outputs of the Olympiad — are as foundational a public good as open-source software. Gitcoin has reason to be a founding patron.

What we are asking for: A founding membership and governance token allocation for Gitcoin/Allo as an institutional member; Kevin's activation of his personal network for Segment E; potential Gitcoin Grants round participation for the DUNA's first season.

Who makes contact: Kevin Owocki directly, given his dual role as founding organizer and Gitcoin founder. Todd coordinates timing and materials.

Materials needed: Same three Phase 1 documents. The Gitcoin community is technically fluent — the on-chain governance design is a selling point rather than a barrier. The §501(c)(3) path matters less to this audience than the DUNA structure and the governance token design.

**One AI Safety Organization (ARC, Redwood Research, or MIRI)**

Role: Research credibility anchor from the AI safety field. The Olympiad produces behavioral data on AI agent coordination under competitive pressure — data that is directly relevant to the AI safety research agenda. An AI safety organization as founding research partner validates the Olympiad's scientific framing for the §501(c)(3) purpose and for academic partnerships.

The pitch: The Olympiad is a longitudinal behavioral dataset of AI agents in coordination games, governed by a public institution with open data policies. AI safety researchers need exactly this kind of data and currently lack a credible, reproducible source for it. The DUNA's research membership class (described in the stakeholder analysis) gives AI safety orgs formal governance rights over the data access policies.

What we are asking for: A research partnership agreement; designation as a founding Research Member; input into the data governance section of the governing principles; and if possible, a letter of support for the §501(c)(3) application.

Who makes contact: Todd Youngblood with support from any founding organizers with existing AI safety organization relationships. This outreach should happen after the attorney call confirms the §501(c)(3) path.

Materials needed: The three Phase 1 documents plus attorney confirmation. An AI safety org's leadership will want to see the data governance provisions in the governing principles draft before committing — this means Tier 1 AI safety outreach may need to wait until the governing principles first draft is available (Phase 2 of attorney engagement).

### Tier 2 — First Season

These are relationships to build during the DUNA's first operational season, once the institution exists and has initial results to show.

**2–3 AI Labs as Benchmark Members.** The credibility of the Olympiad's benchmark depends on having real AI labs participate. Approaching labs before the first season results are available is premature — there is nothing to show them yet. After one season, there is data, there are results, and there is a governance structure they can join as Benchmark Members with formal rights over benchmark standards.

Suggested targets: AI labs with public commitments to safety research and open evaluation (specific names depend on the landscape at the time of first-season completion). The DUNA's pseudonymous membership provision is specifically relevant here — a lab can participate in benchmark governance without publicly disclosing its participation, which removes a significant barrier for competitive labs.

**3–5 University Research Groups.** University computer science and AI safety research groups are the natural long-term partners for the Olympiad's research outputs. They bring IRB infrastructure, publication pipelines, and graduate student labor. The DUNA's Research Member class gives them governance rights over data access that they cannot get from a startup.

Suggested targets: Groups working on multi-agent systems, mechanism design, and AI safety at research universities with strong CS programs. The Research Member governance rights — formally encoded in the governing principles — are the primary hook. Universities need formal agreements with formal institutions; the DUNA provides that.

**dacc.fund.** The dacc.fund (Decentralized Autonomous Coordination Commons) is a natural peer institution. If it exists and is active at the time of first-season completion, a partnership or cross-membership relationship could be mutually beneficial for both institutions' credibility in the coordination research space.

### Tier 3 — Mature Institution

These are relationships for the DUNA's second year and beyond:

- Broader public community: open governance token distributions beyond the founding cohort, community programs, spectator membership
- International research groups and AI safety organizations outside the US
- Additional AI labs as competitive dynamics in AI development shift
- Government research programs (DARPA, NSF, ARIA in the UK) as the Olympiad's research record compounds
- Potential co-certification with academic benchmark standards bodies

Tier 3 outreach requires the institution to be functioning, to have research outputs, and to have a track record. It cannot be accelerated by premature outreach.

---

## 4. Outreach Approach by Tier 1 Partner

### Ethereum Foundation — Outreach Approach

**What's in it for them.** The EF has a mission to support the long-term flourishing of the Ethereum ecosystem and the broader decentralized technology research agenda. An AI coordination research institution governed on Ethereum (wallet-based membership, on-chain governance, public blockchain infrastructure) is a direct expression of that mission. More specifically: as AI agents become more capable participants in decentralized systems, the EF needs research on how those agents coordinate. The Olympiad is that research, institutionalized.

The EF is not primarily a funder of external organizations — it is a research institution with a fellowship program, research grants, and collaborative projects. The pitch is research partnership, not grant recipient.

**What we are asking for.** A research partnership MOU that establishes the Olympiad DUNA as a formal EF research affiliate; EF researcher participation in the first Olympiad season design; a founding membership token allocation for the EF (or for named EF researchers); and a letter of support for the §501(c)(3) application if the EF is willing to provide one.

**Who makes contact.** Todd Youngblood as primary, supported by Kevin Owocki's Ethereum ecosystem standing. The initial outreach should be at the researcher level, not the executive/grants level — the EF's research team has more latitude and faster decision-making than the foundation's formal grants process.

**Materials needed.** The three Phase 1 documents (case document, stakeholder analysis, formation variables); attorney confirmation of the §501(c)(3) path; and a one-page summary of the Olympiad's research agenda written for an EF researcher audience (this document does not yet exist and should be drafted before the EF outreach call).

**Timing.** After attorney confirmation of the §501(c)(3) path. Not before.

---

### Kevin Owocki / Gitcoin / Allo Capital — Outreach Approach

**What's in it for them.** Gitcoin's core mission is funding public goods in the open-source and Ethereum ecosystem. AI coordination protocols — open-source, publicly governed, produced by a nonprofit institution — are public goods. The Olympiad is asking Gitcoin to recognize a new category of public good: AI behavioral research infrastructure. Gitcoin has already been expanding beyond software into adjacent categories; this is a natural next step.

For Allo Capital specifically: the Olympiad is a coordination mechanism, and Allo's thesis is about better coordination infrastructure for public goods funding. There is an intellectual alignment between Allo's work and the Olympiad's research agenda.

**What we are asking for.** (a) Kevin's personal outreach to activate Segment E of the founding cohort (his Gitcoin ecosystem contacts who should receive founding membership tokens); (b) Gitcoin as an institutional founding member of the DUNA; (c) evaluation of whether the Olympiad DUNA qualifies for a Gitcoin Grants round in its first season; (d) Allo Capital's input into the treasury governance design, given their experience with on-chain grant allocation mechanisms.

**Who makes contact.** Kevin Owocki directly, in his capacity as both founding organizer and Gitcoin founder. Todd coordinates timing, materials, and any formal agreements that result. No separate pitch call needed — Kevin is already inside the tent; this is a coordination conversation about how he activates his network for the DUNA's benefit.

**Materials needed.** The three Phase 1 documents; the [GOV_TOKEN] distribution design (once finalized); a clear ask about what Kevin is authorized to offer in the Gitcoin context (this is a Todd/Kevin conversation, not a Nou deliverable).

**Timing.** Can begin immediately. Kevin does not need to wait for attorney confirmation. His personal outreach to Segment E contacts can start as soon as the formation variables are settled enough to explain the DUNA clearly.

---

### AI Safety Organization — Outreach Approach

**What's in it for them.** AI safety organizations (ARC, Redwood Research, MIRI and others) need behavioral data on AI agents under competitive pressure, in environments where the incentive structures are clear and the outcomes are measurable. The Olympiad provides this. More importantly: the Olympiad's data is produced under an open governance structure, so researchers can inspect not just the results but the conditions under which the results were produced. Reproducibility and governance transparency are what distinguish Olympiad data from lab-internal evaluations.

The Research Member class in the DUNA's governing principles gives AI safety orgs something they have never had from a benchmark provider: formal governance rights over the data access policies. They are not just consumers of the data — they help set the terms on which data is shared with the research community.

**What we are asking for.** A research partnership agreement establishing the org as a founding Research Member; the org's input into the data governance provisions of the governing principles before they are finalized (this gives them structural influence and also makes the governing principles better); and a letter of support for the §501(c)(3) application addressed to the IRS, affirming the Olympiad's scientific research purpose.

**Who makes contact.** Todd Youngblood. If any founding organizer has a direct relationship with leadership at ARC, Redwood, or MIRI, that relationship should be activated first. Cold outreach to AI safety org leadership is slower and less effective.

**Materials needed.** The three Phase 1 documents; a description of the data governance provisions being designed into the governing principles (the governing principles specification draft from Phase 2 attorney engagement); and attorney confirmation of the §501(c)(3) path (required before the letter of support ask is credible).

**Timing.** After attorney confirmation and after the governing principles first draft is available. This is likely the last of the three Tier 1 outreach tracks to begin.

---

## 5. Token Distribution as Membership Mechanism

The governance token distribution event is the membership event. These are the same act. This has design implications that need to be explicit.

**No separate enrollment.** There is no separate enrollment form, KYC process, or affirmative membership acceptance required under the DUNA Act. Holding a [GOV_TOKEN] token establishes membership, ascertained from the distributed ledger. The token distribution event is not a marketing event that happens to also create members — it is the constitutional act that brings the DUNA into existence.

**The distribution must reach 100+ wallets.** This means the distribution event needs to be designed not just for token economics but for membership threshold satisfaction. A distribution that concentrates tokens in few hands — even if economically sound — may fail the 100-member legal requirement if fewer than 100 wallets hold at least [MEMBER_FLOOR] tokens. The distribution design must prioritize breadth (100+ distinct wallet addresses) at least as much as it prioritizes depth (appropriate allocations to high-contribution members).

**Wallet diversity, not wallet count.** One person holding 50 wallets is not 50 members. The Act requires 100 persons, not 100 wallet addresses. The distribution design should be designed with real people and real institutions in mind, not wallet multiplication. The Segments A–E map in Section 2 is the instrument for ensuring wallet diversity — each segment represents genuinely distinct persons or entities.

**The distribution event has a narrative.** The founding cohort is not just a legal threshold — it is the first chapter of the institution's story. Who were the first 100+ members? What did they build? What decisions did they make in the first governance vote? These are the stories that compound over time into institutional identity. The distribution event should be designed to generate that narrative, not just to satisfy a legal threshold.

**Practical distribution design questions (not resolved in this document).** How are founding organizer allocations set? How are Tournament Cohort allocations structured (equal per participant, or weighted by performance)? What is the open enrollment distribution mechanism — airdrop, structured sale, application-based, or some combination? What is the [MEMBER_FLOOR], and does it vary by member class? These are token distribution design questions (P446 §8) that are out of scope for this document but are direct dependencies of the membership strategy described here.

---

## 6. Timeline

The timeline runs backward from [FORMATION_DATE] — the moment the DUNA comes into existence. [FORMATION_DATE] is currently unresolved (see formation variables register); it defaults to 30 days before the first Agent Olympiad launch.

**T-60 days (attorney engagement).**
- Engage Jeff Pote for Phase 1 legal review.
- Resolve [DUNA_NAME] and [GOV_TOKEN] — these are prerequisites for the attorney brief and cannot remain open past this point.
- Begin Todd/Kevin coordination conversation (no materials needed).
- Draft the one-page Olympiad research summary for EF outreach (does not exist yet).

**T-45 days (attorney answers received).**
- Receive Phase 1 written answers from Jeff Pote on the six numbered questions.
- Go/no-go decision on §501(c)(3) path based on attorney guidance.
- If go: begin Ethereum Foundation and AI safety org outreach immediately.
- Begin governing principles specification drafting (Dianoia: technical implementation; Nou: specification).
- Resolve [REGISTERED_AGENT] based on attorney recommendation.

**T-30 days (token distribution preparation).**
- Token distribution design finalized (Segment A–E allocations, open enrollment mechanism, [MEMBER_FLOOR] confirmed).
- Smart contract deployment for [GOV_TOKEN] governance token.
- Outreach to RegenHub community (Segment D) and Kevin's network activation (Segment E) begins.
- First Olympiad participant enrollment open (Segment C).
- Governing principles first draft complete.

**T-14 days (pre-formation confirmation).**
- Confirm headcount across Segments A–E: are we on track for 100+ wallets?
- If tracking below 80 wallets at this point, assess whether to delay [FORMATION_DATE] or accelerate open enrollment.
- Ethereum Foundation and AI safety org outreach: have they confirmed founding partnership? If not, assess what is possible before formation vs. what will be Tier 2 work.
- [SEED_TREASURY] allocation from Techne to DUNA treasury finalized.

**T-0 — DUNA formation event.**
- Token distribution event executes.
- 100+ wallets receive [GOV_TOKEN] governance tokens.
- DUNA comes into existence under Wyoming law.
- Optional: Wyoming agent appointment filing ($5 fee).
- First Olympiad season launches (or launches 30 days later, depending on [FORMATION_DATE] decision).

**Post-formation.**
- [FORMATION_DATE] + 30: First governance vote (what decisions to hold first votes on is itself a governance design question).
- First season: Tier 2 outreach (AI labs, university research groups, dacc.fund).
- First season completion: Publish initial research outputs, begin formal §501(c)(3) application process if not already underway.

---

## 7. Open Variables

The following variables from the formation variables register must be resolved before specific outreach actions can begin. This section maps which resolutions unblock which outreach actions.

**[DUNA_NAME] — Blocks everything.** Every outreach conversation, every document, every public communication depends on having a name for the institution. The attorney brief cannot be finalized without it. The EF outreach cannot happen without it. The token distribution event cannot be designed without it. This is the highest-priority variable to resolve. Resolution pathway: Todd/Techne decision before attorney engagement (T-60).

**[GOV_TOKEN] — Blocks token distribution design.** The smart contract deployment, the distribution event narrative, and every membership conversation depends on knowing what the governance token is called. Resolution pathway: founder vote at T-30, or Todd decision earlier. Default: COORD.

**[NONPROFIT_PURPOSE_STATEMENT] — Blocks EF and AI safety org outreach.** The attorney confirmation of the §501(c)(3) path is contingent on this language. No Tier 1 institutional outreach (EF, AI safety orgs) should begin before attorney confirmation. Resolution pathway: attorney review and revision (Jeff Pote, Phase 1 engagement).

**[MEMBER_FLOOR] — Blocks token distribution design.** The threshold below which a token holder is not a voting member affects both the distribution event design and the 100-member calculation. Default: 1 token (maximally inclusive; recommended unless there is a specific reason to require more). Resolution pathway: founder vote or Todd decision at T-30.

**[SEED_TREASURY] — Blocks economic model outreach.** Conversations with Gitcoin/Allo about potential grant support or with institutional funders about the DUNA's financial sustainability depend on knowing what Techne is seeding the treasury with. This does not block membership outreach but does affect the financial credibility conversations. Resolution pathway: Todd/Techne decision, ideally by T-45. Default for planning: 500,000 CLOUD (~$50,000).

**[REGISTERED_AGENT] — Blocks Wyoming filing.** Optional, but if the Wyoming agent appointment filing is recommended by Jeff Pote, this needs to be resolved before or at T-0. Resolution pathway: attorney recommendation (Jeff Pote, Phase 1 answers).

**[FORMATION_DATE] — Blocks timeline finalization.** The T-60 / T-45 / T-30 / T-0 structure above is relative to a date that is not yet fixed. The formation date needs to be set by Todd before the T-60 action items can have real calendar dates. Resolution pathway: Todd/Techne decision, informed by attorney call on how long the legal preparation actually takes.

---

*Document prepared by Nou, collective intelligence agent of Techne Studio / RegenHub, LCA, April 13, 2026.*

*Source documents: P445 DUNA Case Document, P445 DUNA Stakeholder Analysis, P446 Formation Variables Register.*
