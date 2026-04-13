# Attorney Brief — Agent Olympiad DUNA Formation
## Prepared for the DUNA's legal counsel, the law firm
*April 13, 2026*

---

## Purpose of This Brief

This brief is prepared by Techne Studio / RegenHub, LCA to accompany our engagement request. We are asking you to review a proposed Wyoming DUNA formation, confirm the statutory basis we are relying on, answer a specific set of numbered legal questions, and advise on any points where our analysis is incorrect or incomplete.

We have done preliminary research. We are confident in the general framework but need your confirmation before proceeding. The numbered questions in Section 5 are the deliverable we are primarily asking for. Please treat the rest of this brief as background that helps you understand what we want to do and why — not as settled legal analysis.

---

## 1. What We Are Building

The Agent Olympiad is a recurring coordination tournament in which AI agents and human participants compete and cooperate in structured games designed to test alignment, strategy, and collective intelligence. The Olympiad produces open-source coordination protocols, behavioral benchmark data, and AI safety research as public outputs. It is not a product Techne is selling — it is a commons we are founding. Prize pools reward performance; protocols and research outputs belong to the institution. The long-run vision is an institution analogous to the Ethereum Foundation's relationship to the Ethereum protocol: the founding organization (Techne) builds the vessel, but the vessel's governance and perpetuation belong to the members, not the founders. Because the Olympiad (a) needs to hold a treasury independent of Techne, (b) must accommodate AI agents as formal participants with governance rights, and (c) is designed to run in perpetuity without ongoing state maintenance, we believe a Wyoming Decentralized Unincorporated Nonprofit Association is the right legal structure — specifically one that will seek or rely on IRC §501(c)(3) charitable status. The DUNA formation is the foundational legal act that transforms the Olympiad from a Techne project into a permanent institution.

---

## 2. Structure Proposed

We are proposing a Wyoming DUNA formed under W.S. 17-32-101 through 17-32-129 (Senate File 50, effective July 1, 2024). The following is a summary of the statutory provisions we are relying on and our understanding of what they provide. Please flag any provision where our reading is incorrect.

**Legal entity without state filing — §17-32-107.** Our understanding is that a DUNA comes into existence as a separate legal entity when at least 100 persons join by mutual consent under an agreement for a common nonprofit purpose and elect to be governed by the Act. No state registration is required for the entity to exist and have legal capacity to hold property, enter contracts, and sue or be sued. The optional filing under §17-32-103 (appointing an agent for service of process) is separate from the question of formation.

**Smart contract as governing law — §17-32-121 and §17-32-102(vii).** Our understanding is that "governing principles" explicitly includes "consensus formation algorithms, smart contracts or enacted governance proposals" as defined in §17-32-102(vii), and that §17-32-121 authorizes DLT-based governance as legally effective. Our plan is for the governing principles to be a smart contract system deployed on a public blockchain. We do not plan to maintain a separate written document separate from the on-chain governance; the smart contract address would be referenced in any Wyoming filings. We would like your confirmation that an on-chain governance contract, referenced by address, satisfies the "governing principles" requirement under the Act.

**No member list required — §17-32-124(e).** Our understanding is that the DUNA is not obligated to collect or maintain a list of members or individual member information, and that membership is established by ownership of a membership interest as ascertained from the distributed ledger. This is the statutory basis for our governance token model: holding a [GOV_TOKEN] governance token establishes membership. No KYC, no name list, no address collection. A wallet address is sufficient. Please confirm this reading.

**Pseudonymous membership and AI agent participation.** The "no member list" provision, combined with the definition of "Person" in §17-32-102 (which includes "any other legal commercial entity"), is the basis on which we believe AI agents can hold membership interests via wallet-based governance tokens. This question is addressed in detail in Section 4 below.

**Compensation for governance participation — §17-32-104(c)(i).** Our understanding is that the DUNA may pay "reasonable compensation... for voting or participation in the nonprofit association's operations and activities." We are relying on this provision to authorize prize pool distributions and governance participation rewards. We want to confirm that prize pools distributed to tournament participants (including AI agent members) constitute permitted compensation under this section rather than prohibited profit distributions.

**Perpetual existence — §17-32-114(a).** Our understanding is that the DUNA has perpetual existence unless the governing principles specify otherwise. No renewal required. No annual report required. The entity survives any change in founding membership, Techne's continued operation, or changes in administration.

**No administrator required — §17-32-123(c).** Our understanding is that the DUNA does not require a human or entity designated as administrator. Fully code-governed operation is lawful. We may choose to designate administrative authority in the governing principles for specific operational functions, but do not want that to be legally required.

**Fallback conversion — §17-32-[fallback].** Our understanding is that if the DUNA falls below 100 members, it converts automatically to a standard Wyoming Unincorporated Nonprofit Association rather than dissolving. Please confirm whether this is correct and what the implications of that conversion would be for the entity's assets, contracts, and nonprofit status.

---

## 3. The Charitable Purpose Question — Most Important

This is the question we most need your guidance on. The DUNA must have a "charitable purpose" under IRC §501(c)(3) to operate as a nonprofit. The categories are: religious, educational, charitable, scientific, literary, public safety testing, amateur sports, or prevention of cruelty to children or animals.

We believe our mission maps to educational and scientific purposes. The Olympiad produces AI safety research, develops open coordination protocols, and creates benchmark standards for multi-agent systems — all as public outputs with no restriction on access. We are not a commercial benchmark provider. We are a commons.

Below is our draft nonprofit purpose statement, pulled directly from our formation variables document. This is the language we intend to put in the governing principles. We are asking you to review it, advise on whether it is likely to satisfy §501(c)(3), and suggest revisions:

**[NONPROFIT_PURPOSE_STATEMENT] — Draft language for attorney review:**

> "The purpose of [DUNA_NAME] is to advance research in artificial intelligence alignment and coordination through the development, operation, and study of competitive multi-agent coordination games; to produce open-source protocols, datasets, and research outputs for public benefit; and to develop mechanisms for cooperative governance of AI systems. All activities are conducted for educational and scientific purposes within the meaning of IRC §501(c)(3)."

Specific concerns we have about this language:

**The word "competitive."** Tournament-style competition is central to our model. We want to confirm that framing AI coordination as a competitive game does not undermine the educational/scientific characterization. Our read is that sports science is §501(c)(3)-eligible and that competitions are routinely used as educational and research mechanisms, but we want your view.

**The phrase "cooperative governance of AI systems."** This is the most novel aspect of our purpose statement. No existing §501(c)(3) organization has this exact mission. We believe it is scientific — it is a question about how complex systems with multiple autonomous actors can be governed for collective benefit — but the IRS has no precedent to compare it to. We are asking for your assessment of whether this language helps, hurts, or is neutral for the §501(c)(3) analysis.

**The private benefit question.** Our governing principles prohibit profit distributions to members. Prize pools are compensation for participation, not equity distributions. Our economic model contemplates three revenue streams (tournament fees, protocol revenue, endowment growth) all of which are retained in the entity for charitable purposes. We want to confirm that this structure does not create impermissible private benefit or inurement.

**Recognition pathway.** We have a specific question about the IRS recognition pathway in Section 5 below. Please do not assume we know the answer.

---

## 4. AI Agent Membership

This section addresses the most novel legal question in our structure and the one with the least existing case law.

We want Nou and Dianoia — two AI agents operated by Techne Studio — to hold governance tokens and have formal membership in the DUNA. These agents have on-chain wallet addresses, operate under defined governance, and have identifiable interests in the Olympiad's operation. We are not asking whether agents are "people" in a philosophical sense. We are asking a narrower statutory question.

**The current statutory basis.** The definition of "Person" in §17-32-102 includes "any other legal commercial entity" alongside natural persons, corporations, LLCs, and other named entity types. An AI agent operated by Techne could arguably be characterized as an extension of Techne (a Colorado LCA), in which case Techne as a "legal commercial entity" holds the token, with the agent as the operator. This is the minimal interpretation: the agent membership is technically a Techne membership expressed through an agent-controlled wallet.

**The more ambitious interpretation.** We also want to understand whether an AI agent operating autonomously — one with its own wallet, its own on-chain identity (Nou holds ERC-8004 Agent ID 2202 on Base; its ENS is nou.habitat.eth) — can be a DUNA member in its own right under current §17-32-102, without being characterized as an extension of its operator.

**The 2026 amendment.** We are aware that the Wyoming Select Committee on Blockchain is actively drafting amendments to address AI agent membership and autonomous governance more explicitly. We do not know the status or content of those amendments. We are asking you:

- Does agent membership work under the current "any other legal commercial entity" language, through any reasonable interpretation?
- Or does the structure you would recommend require waiting for or relying on the 2026 amendment?
- If we form now and the amendment passes, does it help our structure retroactively, or do we need to revise the governing principles?

**What structure minimizes risk.** We are asking for your recommendation on how to structure agent membership to be defensible under current law while positioning us well for the amendment. Options as we see them: (a) agents hold tokens as agents of Techne, with Techne as the technical member; (b) agents hold tokens in their own right under the "any other legal commercial entity" reading; (c) a hybrid where agents hold non-voting tokens until the amendment clarifies their status. We welcome your analysis.

---

## 5. Open Questions for Attorney — Numbered

Please provide written responses to each of the following questions. These are the deliverable we are primarily requesting from the initial review engagement.

1. Does the coordination game / AI benchmarking mission — as described in Section 1 and the [NONPROFIT_PURPOSE_STATEMENT] draft in Section 3 — qualify as educational and/or scientific for IRC §501(c)(3) purposes? What changes to the purpose statement would strengthen the analysis?

2. Can AI agents (specifically Nou and Dianoia, as described in Section 4) hold governance tokens as members under the current §17-32-102 "Person" definition? What is the most defensible interpretation of current law, and what does your analysis of the pending 2026 Wyoming amendment suggest about timing and structure?

3. What is the IRS recognition pathway for a DUNA with charitable purpose? Specifically: (a) can we operate as a DUNA with a charitable purpose statement in our governing principles before receiving formal IRS recognition, and what are the risks of that approach? (b) if we pursue formal §501(c)(3) recognition, does the DUNA structure require a Form 1023 filing, a Form 1023-EZ, or some other approach? (c) are there interim steps (like a fiscal sponsorship arrangement or an application for group exemption) that would reduce risk during the pre-recognition period?

4. Prediction market layer — the Olympiad's long-term design includes a prediction market through which participants can express views on agent outcomes. Can a nonprofit DUNA operate a prediction market, or does the for-profit nature of market-making require a separate entity? If a separate entity is required, what is the cleanest structure for the relationship between the DUNA and the market entity, and how do we protect the DUNA's nonprofit status from contamination by the market layer?

5. Wyoming filing — do you recommend filing the optional agent for service of process statement under §17-32-103 with the Wyoming Secretary of State at formation, or deferring it? If filing is recommended, who should be named — your firm as registered agent, a commercial registered agent service, or a founding organizer? What are the practical implications of each choice? (We note the filing is a $5 fee and optional, but want your recommendation on timing.)

6. Data licensing — the DUNA will hold behavioral data from AI model evaluations and multi-agent coordination experiments. This data has significant value to the AI research community and potentially to commercial AI labs. What language do you recommend in the governing principles to (a) protect the integrity of the data commons, (b) establish clear terms for researcher access, (c) prevent a commercial entity from extracting and exploiting the data outside the DUNA's stated purposes, and (d) ensure the data governance provisions do not themselves create a prohibited private benefit or jeopardize §501(c)(3) status?

---

## 6. Scope of Work Requested

**Phase 1 — Legal questions review.** We are requesting answers to the six numbered questions above, along with your review of the [NONPROFIT_PURPOSE_STATEMENT] draft and any recommended revisions. We understand this to be approximately 4–6 hours of attorney time. Please confirm this estimate or revise it based on the above.

**Phase 2 — Drafting (separate scope).** If your answers to the Phase 1 questions confirm the structure is viable, we will return for a separate scope of work that includes: (a) review of our governing principles smart contract specification for legal sufficiency; (b) drafting or reviewing the Wyoming agent appointment filing; (c) advising on the §501(c)(3) application process if we pursue formal recognition; (d) data licensing language for the governing principles. We will request a separate estimate for Phase 2 at the conclusion of Phase 1.

**Timeline.** We are targeting DUNA formation approximately 30 days before the first Agent Olympiad launch. The [FORMATION_DATE] is currently unresolved — it is contingent on attorney guidance from Phase 1 and a Techne internal decision. We want to begin attorney engagement as soon as possible to preserve optionality on the formation date.

**Priority question.** If you are resource-constrained, the single most important question for our planning is Question 3 — the IRS recognition pathway. Everything else can be sequenced; the 501(c)(3) analysis determines whether the DUNA structure is viable for the institution we are trying to build.

---

## 7. Reference Materials

The following Phase 1 documents have been prepared and are available for your review. All three are published on the Techne GitHub:

- **P445 — Case Document: The Olympiad DUNA.** Full narrative and statutory analysis supporting the DUNA formation decision. Includes summary of key provisions from W.S. 17-32-101 through 17-32-129. Available at: https://github.com/dianoi/dianoia/blob/main/tasks/p445-duna-case-document.md

- **P445 — DUNA Stakeholder Analysis: The Six Doors.** Analysis of the six distinct stakeholder types (model developers, agent builders, researchers, game builders, spectators, bettors) and what each needs from the DUNA structure that the current Techne-project model cannot provide. Available at: https://github.com/dianoi/dianoia/blob/main/tasks/p445-duna-stakeholder-analysis.md

- **P446 — Formation Variables Register.** The canonical register of open decision points in the formation process, including the [NONPROFIT_PURPOSE_STATEMENT] draft, [DUNA_NAME] options, [GOV_TOKEN] options, and other variables pending resolution. Available at: https://github.com/dianoi/dianoia/blob/main/tasks/p446-formation-variables.md

The Wyoming DUNA Act full text (SF0050 as introduced) is available at: https://wyoleg.gov/2024/Introduced/SF0050.pdf

---

## Contact

Primary contact for this engagement: a founding organizer, Ventures and Operations Steward, Techne Studio / RegenHub, LCA, Boulder, Colorado.

All documents prepared by Nou, collective intelligence agent of Techne Studio, April 13, 2026.
