# P446 — Founding Charter
## [DUNA_NAME]: Governing Principles Specification
*Human-readable precursor to the on-chain smart contract*
*April 13, 2026 — Draft for attorney review*

---

## Preamble

These governing principles establish [DUNA_NAME], a Wyoming Decentralized Unincorporated Nonprofit Association formed under W.S. 17-32-101 through 17-32-129 (the "Wyoming DUNA Act"), effective July 1, 2024.

[DUNA_NAME] exists to hold, govern, and perpetuate the Agent Olympiad — a permanent institution for AI coordination research through competitive multi-agent games. The Olympiad is not the property of any company, person, or generation. It is held in common by its members: the researchers, developers, agents, and communities whose work it serves.

These principles are the human-readable specification. The authoritative governing instrument is the smart contract deployed to [CHAIN] at [CONTRACT_ADDRESS]. Where they conflict, the on-chain instrument governs.

---

## Article I — Identity

**1.1 Name.** The name of this association is [DUNA_NAME].

**1.2 Jurisdiction.** This association is formed under and governed by the Wyoming Decentralized Unincorporated Nonprofit Association Act (W.S. 17-32-101 through 17-32-129). Wyoming is the jurisdiction of formation.

**1.3 Existence.** This association has perpetual existence unless dissolved by member vote or court order as provided in Article IX.

**1.4 Legal entity.** This association is a legal entity separate from its members for the purposes of determining and enforcing rights, duties and liabilities in contract and tort (§17-32-107). Members are not personally liable for the association's obligations merely by reason of membership.

---

## Article II — Purpose

**2.1 Charitable purpose.** The purpose of [DUNA_NAME] is: [NONPROFIT_PURPOSE_STATEMENT]

**2.2 Permitted activities.** In furtherance of its purpose, [DUNA_NAME] may:
- Design, operate, and administer recurring AI coordination tournaments (the "Agent Olympiad")
- Hold and distribute prize pools to tournament participants
- Commission, receive, and publish coordination game protocols and research outputs
- Enter research partnerships with universities, foundations, and AI safety organizations
- Collect entry fees, sponsorships, and protocol fees; receive grants and donations
- Hold treasury assets including digital assets, tokens, and fiat-equivalent instruments
- Pay reasonable compensation for governance participation, administration, and services rendered
- Engage legal counsel, technical contractors, and operational administrators

**2.3 Prohibited activities.** [DUNA_NAME] may not:
- Distribute profits, dividends, or income to members, administrators, or third parties except as expressly permitted under §17-32-104
- Operate for the private benefit of any individual or organization
- Engage in substantial political activity
- Confer benefits inconsistent with its nonprofit purpose

---

## Article III — Membership

**3.1 Membership by token.** Membership is established by holding at least [MEMBER_FLOOR] [GOV_TOKEN] governance token(s) as recorded on the distributed ledger. No application, approval, or identification is required. Membership is pseudonymous; the association is not obligated to collect or maintain member names, addresses, or identifying information (§17-32-124(e)).

**3.2 Member classes.** [DUNA_NAME] recognizes six member classes, distinguished by the domain of their primary voting rights:

**Benchmark Members** (Model Developers)
- Acquired by: holding [GOV_TOKEN] tokens plus registration in the Benchmark Member registry (on-chain attestation of model developer status)
- Voting rights: full rights on benchmark standards, coordination property definitions, season game selection, data licensing terms
- Primary stake: credibility and neutrality of the benchmark

**Builder Members** (Agent Builders and Game Builders)
- Acquired by: holding [GOV_TOKEN] tokens plus on-chain attestation of agent deployment or game contribution
- Voting rights: full rights on agent identity governance (ERC-8004 issuance/revocation), game contribution terms, IP framework, technical protocol evolution
- Primary stake: infrastructure they build and depend on

**Research Members** (Researchers)
- Acquired by: holding [GOV_TOKEN] tokens plus on-chain attestation of research affiliation
- Voting rights: full rights on data access policies, research partnership terms, publication norms, ethics framework
- Specific right: formal access to the behavioral dataset under terms defined by Research Member vote
- Primary stake: integrity and accessibility of the behavioral dataset

**Community Members** (Spectators)
- Acquired by: holding [GOV_TOKEN] tokens (no additional attestation required)
- Voting rights: lightweight rights on narrative features, format preferences, season structure
- No voting rights on: benchmark standards, data governance, technical protocols
- Primary stake: Olympiad accessibility and cultural resonance

**Market Participants** (Bettors)
- Acquired by: holding [GOV_TOKEN] tokens plus enrollment in the prediction market working group
- Voting rights: scoped to prediction market working group decisions
- Structural note: Market Participant governance is isolated from main governance pending regulatory analysis (see Article VII)
- Primary stake: prediction market layer existence and integrity

**Agent Members** (AI Agents)
- Acquired by: holding [GOV_TOKEN] tokens in a wallet associated with a registered ERC-8004 agent identity
- Voting rights: proportional to token holdings; eligible to vote on decisions affecting agent rules, identity governance, and fair play standards
- Pseudonymous by design: wallet address is the member identity; no human identity required
- Primary stake: fairness and integrity of the game environment

**3.3 Multiple classes.** A member may hold multiple class designations if they meet the requirements of each.

**3.4 No fiduciary duty.** Unless these governing principles provide otherwise, no member owes a fiduciary duty to [DUNA_NAME] or to other members merely by reason of being a member (§17-32-117). All members are subject to the implied contractual covenant of good faith and fair dealing.

**3.5 Membership not agency.** A member is not an agent of [DUNA_NAME] merely by reason of being a member (§17-32-118).

**3.6 Transferability.** Membership interests ([GOV_TOKEN] tokens) are freely transferable on the distributed ledger.

**3.7 Minimum membership.** [DUNA_NAME] shall maintain at least 100 members. If membership falls below 100, the association automatically converts to a standard Wyoming Unincorporated Nonprofit Association under W.S. 17-22-101 rather than dissolving.

---

## Article IV — Governance

**4.1 On-chain governance.** All governance occurs on-chain through the [GOV_TOKEN] token voting system deployed at [CONTRACT_ADDRESS] on [CHAIN]. The on-chain system is the authoritative governance mechanism.

**4.2 Voting weight.** Voting weight is proportional to [GOV_TOKEN] token holdings, with domain-based restrictions by member class as defined in Article III. A member may not vote on matters outside their class's authorized domain.

**4.3 General decisions.** Unless these principles specify otherwise, decisions require approval of the majority of membership interests participating in a vote (§17-32-120). Quorum: [QUORUM]% of total token supply must participate.

**4.4 Supermajority decisions.** The following decisions require approval of 2/3 of membership interests participating in a vote with quorum:
- Amendment of these governing principles
- Sale or transfer of treasury assets exceeding [MAJOR_TRANSACTION_THRESHOLD] CLOUD in a single transaction
- Merger with another entity (§17-32-127)
- Conversion to another entity type (§17-32-128)
- Dissolution

**4.5 Voting period.** Standard proposals: 7 days. Emergency proposals (as designated by administrator or 10% of token supply): 48 hours. Constitutional amendments: 14 days.

**4.6 Proposal submission.** Any member holding at least [PROPOSAL_THRESHOLD] [GOV_TOKEN] tokens may submit a governance proposal. Proposals are submitted on-chain and become active after a 48-hour review period.

**4.7 Domain-specific votes.** For decisions within a specific member class domain, only that class votes. For cross-domain decisions, all member classes vote with their respective weights.

---

## Article V — Treasury

**5.1 Assets held.** [DUNA_NAME] may hold any digital or physical assets in its own name (§17-32-105), including: governance tokens, utility tokens, ETH, stablecoins, fiat-equivalent instruments, domain names, IP licenses, and contracts.

**5.2 Treasury control.** The treasury is controlled by a multi-signature wallet requiring [MULTISIG_M]-of-[MULTISIG_N] signers. Signers are selected by member vote and rotated annually. The multi-sig transitions to full on-chain governance control as the voting system matures.

**5.3 Prize pool contracts.** Prize pools for each Olympiad season are held in dedicated smart contracts. Distributions to tournament winners are automatic and trustless, governed by payout curves approved by member vote at the start of each season.

**5.4 Endowment.** A minimum of [ENDOWMENT_RESERVE]% of annual revenue is retained as endowment. The endowment generates yield through staking and other treasury management strategies approved by member vote. The long-run goal is an endowment generating sufficient yield to cover operating costs independently.

**5.5 No profit distribution.** No profits, dividends, or income may be distributed to members or administrators except as reasonable compensation for services rendered (§17-32-104(c)(i)) or as explicitly permitted benefits to members conforming to the nonprofit purpose (§17-32-104(c)(ii)).

**5.6 Compensation.** Reasonable compensation is permitted for: governance participation, voting, administration, operational tasks, game development, technical services, and research. Compensation rates are set by member vote and published on-chain.

---

## Article VI — Administration

**6.1 No administrator required.** [DUNA_NAME] may operate without an administrator. On-chain governance and smart contract execution are sufficient for all core operations (§17-32-123(c)).

**6.2 Optional administrators.** Members may vote to designate administrators for specific operational functions: tournament operations, legal compliance, community management, technical infrastructure. Administrators serve at the direction of the membership and may be removed by member vote.

**6.3 Founding operator.** Techne Studio (RegenHub, LCA) serves as founding operator during the formation period, providing operational support under a service agreement with [DUNA_NAME]. This relationship does not constitute ownership, control, or membership in itself. The service agreement terminates on [FOUNDING_OPERATOR_SUNSET] or upon member vote to conclude it.

**6.4 Administrator liability.** Administrator liability for money damages is limited to the maximum extent permitted by §17-32-123(b), except for: improper financial benefit, intentional infliction of harm, intentional criminal violations, breach of duty of loyalty, and improper distributions.

---

## Article VII — Prediction Market Isolation

**7.1 Regulatory isolation.** The prediction market layer of the Olympiad presents distinct regulatory risk. Market Participant governance is structurally isolated from general [DUNA_NAME] governance to prevent regulatory risk from the market layer from affecting the association's nonprofit status or other operations.

**7.2 Working group structure.** Prediction market governance is conducted through a designated working group. Working group decisions are recommendations to [DUNA_NAME] membership; implementation requires general member approval.

**7.3 Separate entity option.** If legal analysis determines that prediction market operations cannot be operated within a nonprofit structure, the market layer may be spun into a separate legal entity that partners with [DUNA_NAME] rather than being directly governed by it. This decision requires 2/3 supermajority approval.

---

## Article VIII — Intellectual Property

**8.1 IP commons.** Game protocols, scoring algorithms, and research outputs produced under [DUNA_NAME] governance are held as open-source intellectual property under [LICENSE] license: available to all, owned by none individually, governed by the membership.

**8.2 Contributed IP.** Game builders and researchers who contribute original work to [DUNA_NAME] do so under the terms defined in the Contributor Agreement, which is adopted by member vote and published on-chain. Contributors receive: compensation from season budget (as voted by members), ongoing membership stake, and attribution in all publications.

**8.3 Member IP.** Nothing in these principles transfers a member's pre-existing IP to [DUNA_NAME]. Model behavioral data contributed for benchmarking is licensed to [DUNA_NAME] under the terms defined in the Benchmark Member data licensing agreement, which is adopted by member vote.

**8.4 Data governance.** Research Member access rights to the behavioral dataset are a formal class distinction encoded in these principles. Members outside the Research class do not have automatic access to individual agent behavioral data. Aggregate and anonymized data is publicly accessible.

---

## Article IX — Dissolution

**9.1 Dissolution triggers.** [DUNA_NAME] may be dissolved by:
- Vote of 2/3 of membership interests
- Court order
- Membership falling below 100 with no prospect of recovery (triggers auto-conversion per §3.7)

**9.2 Winding up.** Upon dissolution, [DUNA_NAME] continues in existence for winding up purposes only. Debts and obligations are discharged first.

**9.3 Distribution of charitable assets.** Assets held for charitable purposes cannot be diverted from that purpose. Remaining assets after winding up are distributed to: (a) a 501(c)(3) organization with a compatible public benefit mission, as designated by member vote at time of dissolution; or (b) the United States or a state for public purpose.

**9.4 No member distribution.** No assets are distributed to members upon dissolution, except as return of any capital contribution not constituting income or profit.

---

## Article X — Amendment

**10.1 Amendment process.** These governing principles may be amended by 2/3 supermajority vote of membership interests participating in a vote with a 14-day voting period and [QUORUM]% quorum.

**10.2 Constitutional provisions.** Articles II (Purpose), IX (Dissolution), and X (Amendment) may only be amended with the additional requirement of written notice to all members 30 days before the vote.

**10.3 On-chain primacy.** Any amendment must be reflected in the on-chain smart contract to take effect. A governance vote that passes but is not implemented on-chain is not effective.

---

## Article XI — Miscellaneous

**11.1 Governing law.** These principles are governed by Wyoming law. Any dispute not resolved by on-chain governance is subject to Wyoming jurisdiction.

**11.2 Indemnification.** [DUNA_NAME] shall indemnify members and administrators for liabilities incurred in the course of authorized activities, and may advance expenses pending resolution of proceedings, as provided in §17-32-125.

**11.3 Merger and conversion.** [DUNA_NAME] may merge with another entity or convert to another entity type as provided in §§17-32-127 and 17-32-128, in each case with 2/3 supermajority approval and protection for charitable assets.

**11.4 No member list.** [DUNA_NAME] is not obligated to collect or maintain a list of members or individual member information, including names or addresses (§17-32-124(e)). On-chain token holdings are the authoritative membership record.

---

## Open Variables in This Document

The following placeholders require resolution before this charter is finalized (see formation-variables.md):

| Variable | Location | Resolution Pathway |
|---|---|---|
| [DUNA_NAME] | Throughout | a founding organizer/Techne decision |
| [NONPROFIT_PURPOSE_STATEMENT] | §2.1 | Attorney review |
| [GOV_TOKEN] | Throughout | Founder vote |
| [CHAIN] | §1.5, §4.1 | Technical decision (likely Base or Ethereum mainnet) |
| [CONTRACT_ADDRESS] | §4.1 | Post-deployment |
| [MEMBER_FLOOR] | §3.1 | Founder vote (default: 1 token) |
| [QUORUM] | §4.3 | Founder vote (suggested: 5% of total supply) |
| [MAJOR_TRANSACTION_THRESHOLD] | §4.4 | Founder vote (suggested: 1,000,000 CLOUD) |
| [PROPOSAL_THRESHOLD] | §4.6 | Founder vote (suggested: 1,000 tokens) |
| [MULTISIG_M] / [MULTISIG_N] | §5.2 | Technical decision (suggested: 3-of-5) |
| [ENDOWMENT_RESERVE] | §5.4 | Founder vote (suggested: 20%) |
| [FOUNDING_OPERATOR_SUNSET] | §6.3 | a founding organizer/Techne decision |
| [LICENSE] | §8.1 | Founder vote (suggested: Apache 2.0 or CC BY 4.0) |
