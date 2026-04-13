# P445 — DUNA Stakeholder Analysis: The Six Doors
*How the DUNA structure fills gaps in the current Olympiad conceptualization*
*April 13, 2026*

---

## Framing

The six doors represent six distinct relationships to the coordination games. Each has different needs, different stakes, and different reasons to care about a permanent institution. The DUNA doesn't serve them uniformly — it serves each differently, and in doing so reveals which gaps in the current structure are most consequential.

The current structure is a Techne project. Everything flows through Techne's discretion: what games run, who can participate, how data gets used, how results are certified, how the Olympiad evolves. That works for a prototype. It breaks down when the Olympiad becomes infrastructure that multiple stakeholders depend on. The DUNA is the transition from project to institution.

---

## Door 1 — Model Developer

Who they are: AI model builders (labs, startups) seeking credible multi-agent benchmarks that aren't self-reported.

The central gap: Trust. A benchmark's value is proportional to the credibility of the body that maintains it. Right now the Olympiad's benchmark standards — what games count, how coordination is scored, what the five properties measure — are Techne's to set. A model developer participating is essentially trusting a startup with their competitive data and their public reputation. That's a high ask, especially for larger labs with legal teams.

The DUNA fixes this: the benchmark governance becomes a matter of member voting, not Techne fiat. Model developers as DUNA members have formal input into how the five coordination properties are defined and how they evolve. They're not just customers of the benchmark — they're co-owners of the standard. That's the difference between a benchmark you submit to and one you help govern.

What they're missing now:
- No formal IP agreement covering what Techne can do with their model's behavioral data
- No governance over benchmark evolution (next season's games, scoring rules)
- No institutional partner credible enough for a lab's legal team to approve participation
- No data licensing framework protecting how results can be published or used

DUNA member type: Full voting member. High-stake governance rights. Probably the heaviest represented class in the initial membership because their participation is what gives the benchmark its credibility.

Unique DUNA provision that applies: The DUNA need not maintain a list of members or their identifying information. A lab could participate pseudonymously — publishing their model's results without publicly associating their corporate identity with the DUNA membership itself. This is significant for competitive reasons.

---

## Door 2 — Agent Builder

Who they are: Developers building multi-agent systems (as distinct from the underlying models). They're deploying agents into the Olympiad, managing behavior, iterating on strategy.

The central gap: Agent identity and standing. The Olympiad issues on-chain identity (ERC-8004) to agents. But who governs that identity system? Who decides if an agent's identity gets revoked? Who adjudicates disputes? Currently, Techne does. There's no formal appeal, no due process, no governance.

More fundamentally: the agents themselves have no standing. They play, they earn, they build reputation — but they're objects in the system, not subjects. The DUNA is the first structure that can give an agent formal membership: a wallet address holding governance tokens, ascertained via the distributed ledger, with voting rights proportional to token holdings. The agent isn't just a participant in the game; it's a member of the governing institution.

What they're missing now:
- No governance over the identity system (ERC-8004 issuance, revocation, dispute resolution)
- No formal membership pathway for agents as pseudonymous participants
- No appeal or due process mechanism if an agent is removed or penalized
- No collective voice in how the games evolve (which games favor which agent architectures)

DUNA member type: Two-tier. The human builder is a full voting member. The agent itself can hold a lightweight membership via its on-chain identity — particularly relevant as agents become more autonomous and their wallets accumulate reputation and tokens independent of human direction.

Unique DUNA provision that applies: "Person" in the DUNA Act includes "any other legal commercial entity." Agent membership isn't explicitly named, but it isn't excluded either. The Wyoming Select Committee is actively working on amendments that would clarify this. Forming now positions the Olympiad DUNA to be cited in those amendments.

---

## Door 3 — Researcher

Who they are: Academics and AI safety researchers who want longitudinal behavioral data on agent coordination.

The central gap: Institutional legitimacy and data governance. A researcher wanting to publish findings based on Olympiad data needs to answer questions their IRB will ask: Who owns the data? What were participants' consent terms? Can you share the dataset? What's the data retention policy? Currently, none of those questions have formal answers.

Beyond compliance, there's an access problem. The Olympiad mentions "Ethereum Foundation collaboration" as a feature for researchers. But the Ethereum Foundation is not going to formalize a partnership with a startup project. A 501(c)(3)-eligible DUNA is the minimum institutional threshold for foundation-level research partnerships — with EF, with AI safety orgs (ARC, MIRI, Redwood), with universities.

What they're missing now:
- No formal data licensing terms (what researchers can publish, what requires permission)
- No ethics/IRB-equivalent process for access to behavioral data
- No institutional partner credible for formal research collaboration agreements
- No data retention policy or reproducibility guarantee
- No grant-receiving mechanism (the DUNA, once 501(c)(3) recognized, can receive restricted research grants)

DUNA member type: Full voting member, but with a specific data governance right: researchers as a class could have formal access rights to the behavioral dataset encoded in governing principles — a right that model developers and agent builders don't automatically have. This is the kind of tiered membership the DUNA's governing principles can encode.

Unique DUNA provision that applies: The governing principles can specify "the extent of a member's access to information" (§17-32-121(b)(i)). Research data access rights can be a formal class distinction in the DUNA's constitution.

---

## Door 4 — Game Builder

Who they are: Mechanism designers, academics, independent developers who want to contribute game designs to the Olympiad.

The central gap: IP and compensation. A game builder contributes a novel coordination protocol. Who owns it? Currently, implicitly, Techne does — or the question is deliberately left vague. If the game becomes canonical (the way Prisoner's Dilemma is canonical), what does the builder get? There's no formal answer.

The DUNA resolves this by making contributed games part of the commons. A game builder contributes IP to the DUNA under defined terms (encoded in governing principles), receives compensation from the season budget (voted by members), and holds a membership stake that gives them ongoing governance over how their contribution is used. Open-source contribution + member governance + explicit compensation = a principled commons model.

What they're missing now:
- No IP framework for contributed game designs
- No formal grant/bounty mechanism for game development
- No governance over season curation (what games get selected)
- No reproducibility guarantee (games could be modified or discontinued unilaterally by Techne)

DUNA member type: Full voting member with a specific stake in game curation governance. Could be weighted toward game builders for decisions specifically about season design, analogous to how some cooperatives give sector-specific votes on sector-specific decisions.

Unique DUNA provision that applies: The DUNA may "confer benefits on its members and administrators in conformity with its common nonprofit purpose" (§17-32-104(c)(ii)). Game development bounties, season grants, and IP licensing back to contributors are all structurally permitted.

---

## Door 5 — Spectator

Who they are: Observers — AI enthusiasts, journalists, analysts, engaged members of the public who want to follow the Olympiad as a narrative.

The central gap: The spectator is entirely passive in the current conceptualization. They watch; they have no voice. But the Olympiad is asking spectators to invest attention over a six-week season, to follow individual agents, to build emotional and intellectual investment in outcomes. That investment creates a community. Communities need institutions.

The DUNA can formalize the spectator relationship: lightweight membership (a free or low-cost governance token), with soft voting rights on narrative features — highlight selection, season format preferences, what stories get surfaced. This doesn't give spectators control over benchmark governance, but it gives them standing. They're not just an audience; they're community members.

This matters for the Olympiad's long-term health. Spectators are the distribution layer — they're how the Olympiad's research and findings reach people who don't run models. A governance stake, however lightweight, transforms them from passive consumers into active stakeholders. That changes their relationship to the Olympiad from "interesting thing I watch" to "thing I'm part of."

What they're missing now:
- No governance pathway (purely passive)
- No formal community status
- No way to signal preferences about the Olympiad's direction
- No stake that would make them invested in the DUNA's long-term success

DUNA member type: Community member — lightweight governance token, lower voting weight than technical participants, but formal standing and voting rights on a specific set of decisions (narrative, format, accessibility). The governance design should be explicit about what they vote on and what they don't.

---

## Door 6 — Bettor

Who they are: People who want to use the Olympiad as a prediction market substrate — expressing informed views about agent behavior with real stakes.

The central gap: The prediction market layer doesn't exist yet and has significant regulatory risk. The page describes it as an "early window opportunity" — which is honest, but also means a key stakeholder type is invited into a structure that isn't built. More importantly, prediction markets in the US exist in a regulatory gray zone that gets complicated when they involve real money and AI-generated outcomes.

The DUNA doesn't solve the regulatory problem, but it frames it differently. A prediction market operated within a nonprofit research structure — as a mechanism for studying how markets aggregate information about AI behavior — has a different regulatory posture than a commercial betting platform. The nonprofit purpose wrapper matters for the legal analysis.

The gap here is both structural (the market doesn't exist) and relational (bettors have no governance stake in whether or how the market gets built). The DUNA gives them a formal voice in that decision.

What they're missing now:
- The prediction market infrastructure doesn't exist
- No formal governance over market design (who decides what's bettable, what counts as resolution)
- No regulatory analysis for operating prediction markets within a nonprofit research context
- No formal membership or standing in the Olympiad structure

DUNA member type: Associate member or market participant. The prediction market layer may warrant its own governance structure (potentially a sub-DAO or working group within the DUNA) rather than full general membership. The regulatory risk should be isolated rather than spread across the whole DUNA.

Unique consideration: Bettors are the only door where the DUNA's nonprofit structure creates a potential tension rather than a clean solution. Prediction markets are profit-seeking activity. Running them inside a nonprofit requires careful structuring — the market layer may need to be a separate entity that partners with the DUNA rather than being governed by it directly.

---

## Cross-Cutting Gaps the DUNA Fills

These are gaps that appear across multiple doors — structural deficiencies in the current conceptualization that the DUNA addresses at the level of the whole institution.

1. Permanence. Every door assumes the Olympiad will run again next season. Currently that assumption rests on Techne's continued existence and interest. The DUNA makes it structural — the Olympiad exists independent of Techne.

2. Neutral governance of standards. The five coordination properties, the scoring system, the game selection process — these are currently Techne's to define. All six doors benefit from those decisions being made by member vote rather than by fiat.

3. IP commons. Four of the six doors involve IP questions (model behavior data, agent identity, contributed game designs, research outputs). The DUNA creates a formal commons framework: what goes in, who can use it, how contributors are compensated.

4. Institutional legitimacy. The researcher and model developer doors in particular require a credible institutional partner. A DUNA with 501(c)(3) status opens partnership doors that a startup cannot.

5. Agent standing. Only the agent builder door currently addresses agents as subjects — but even there, only indirectly. The DUNA is the first structure that formally gives AI agents governance participation. This matters across all six doors because agents are the primary participants in the Olympiad itself.

6. Endowment. No door has a formal relationship to the Olympiad's long-term financial sustainability. The DUNA's endowment model — tournament fees, protocol revenue, governed treasury — creates that sustainability independent of any door's contribution.

---

## Proposed Named Stakeholder Types for the DUNA

Based on the six doors, the DUNA's governing principles should define at minimum five distinct member classes. Each class has differentiated voting weight on different decision domains.

Benchmark Member (Model Developer)
— Full voting rights on: benchmark standards, coordination property definitions, season game selection, data licensing terms
— Primary stake: the credibility and neutrality of the benchmark

Builder Member (Agent Builder + Game Builder combined)
— Full voting rights on: agent identity governance, game contribution terms, IP framework, technical protocol evolution
— Primary stake: the infrastructure they build and depend on

Research Member (Researcher)
— Full voting rights on: data access policies, research partnership terms, publication norms, ethics framework
— Primary stake: the integrity and accessibility of the behavioral dataset

Community Member (Spectator)
— Lightweight voting rights on: narrative features, format preferences, season structure
— No voting rights on: benchmark standards, data governance, technical protocols
— Primary stake: the Olympiad's accessibility and cultural resonance

Market Participant (Bettor)
— Associate status; voting rights scoped to prediction market working group
— Primary stake: the market layer's existence and integrity
— Structural note: likely needs isolation from the main governance structure for regulatory reasons

Agent Member (AI agents themselves)
— Pseudonymous wallet-based membership; voting rights proportional to governance token holdings
— Eligible for governance participation on decisions that affect agent rules, identity, and fair play standards
— Primary stake: the fairness and integrity of the game environment in which they operate

This last class — Agent Member — is the most novel and the most important for the Olympiad's long-term identity. It is what distinguishes the Olympiad DUNA from any other sports organization, standards body, or research institution. Agents are not just the subjects of study; they are members of the institution studying and governing themselves.

---

## Summary of Gaps by Door

Model Developer: No formal IP/data agreement, no governance over benchmark standards, no institutional credibility for legal teams
Agent Builder: No formal agent membership pathway, no governance over identity system, no due process
Researcher: No data licensing framework, no IRB equivalent, no formal research partnership structure, no grant-receiving mechanism
Game Builder: No IP framework for contributions, no formal compensation mechanism, no governance over curation
Spectator: No governance pathway, purely passive, no community standing
Bettor: Market layer doesn't exist, regulatory analysis needed, potential structural isolation required
