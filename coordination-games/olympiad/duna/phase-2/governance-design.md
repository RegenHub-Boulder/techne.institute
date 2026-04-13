# P446 — On-Chain Governance Architecture
## Agent Olympiad DUNA — Technical Specification
*April 13, 2026 — Draft v0.1*
*Authors: Nou (Techne Studio) for Dianoia (execution) and the DUNA's legal counsel (attorney review)*

---

## Document Purpose

This document is the technical architecture specification for the on-chain governance system of [DUNA_NAME], a Wyoming Decentralized Unincorporated Nonprofit Association formed under W.S. 17-32-101 through 17-32-129.

The governing principles (Founding Charter, P446) explicitly recognize smart contracts as the authoritative governing instrument under §17-32-121. This document specifies how those smart contracts are structured, how they relate to each other, and how they implement the governance rules defined in the charter.

**Primary audience:** Dianoia (execution agent, implementing these contracts) and the DUNA's legal counsel (reviewing for Wyoming DUNA compliance). a founding organizer is the non-technical decision maker for all [VAR_NAME] parameters.

**Notation convention:** All unresolved variables appear as `[VAR_NAME]`. See `/workspace/group/tasks/p446-formation-variables.md` for the full variable register and resolution pathways.

**Variables introduced in this document** (not yet in the formation variables register):

| New Variable | Description | Suggested Default |
|---|---|---|
| [VOTING_DELAY] | Blocks between proposal submission and vote start | 7200 (~24h on Base) |
| [VOTING_PERIOD] | Blocks for active voting window | 50400 (~7 days on Base) |
| [EMERGENCY_VOTING_PERIOD] | Blocks for emergency voting window | 14400 (~48h on Base) |
| [CONSTITUTIONAL_VOTING_PERIOD] | Blocks for constitutional amendment voting | 100800 (~14 days on Base) |
| [TIMELOCK_DELAY] | Seconds delay on treasury execution after vote passes | 172800 (48 hours) |
| [TIMELOCK_DELAY_CRITICAL] | Seconds delay on supermajority treasury execution | 604800 (7 days) |
| [GOV_TOKEN_INITIAL_SUPPLY] | Total initial token supply at genesis | TBD by founder vote |
| [GOV_TOKEN_DECIMALS] | Token decimal places | 18 |
| [ERC8004_REGISTRY_ADDRESS] | Deployed ERC-8004 registry on Base | TBD post-deployment |
| [ATTESTATION_ORACLE_MULTISIG] | Multi-sig address for off-chain attestation signing | TBD |
| [SEASONS_PER_YEAR] | Number of Olympiad seasons per calendar year | TBD by member vote |
| [PRIZE_POOL_MIN_DURATION] | Minimum claim window for prize pool contracts | 90 days |

---

## 1. Architecture Overview

### 1.1 Chain Selection

**Recommendation: Base (Coinbase L2)**

Base is the recommended deployment chain. The rationale follows from three constraints:

**Cost per governance action.** A standard ERC-20 token transfer on Ethereum mainnet currently costs approximately $2–15 USD depending on gas price. A Governor proposal creation costs $20–80. With 100+ members doing active governance, mainnet costs make routine participation economically irrational. Base L2 reduces transaction costs by 10–100x, bringing governance actions to $0.01–0.50 USD range. This is the difference between active participation and governance apathy.

**ERC-8004 agent identity is already on Base.** The Agent Member class requires linking a wallet to a registered ERC-8004 agent identity (see Section 5). ERC-8004 (Agent Identity Standard) is deployed on Base at [ERC8004_REGISTRY_ADDRESS]. Cross-chain identity verification adds architectural complexity and failure modes. Deploying governance on the same chain as the identity registry keeps the critical Agent Member attestation path simple and atomic.

**Ecosystem alignment.** Base is operated by Coinbase, has Ethereum-equivalent security through its fraud proof system, and has substantial developer tooling, block explorer support, and wallet compatibility. It is not a maximally decentralized choice, but it is a pragmatic one for a governance system that needs to work reliably for 100+ members including non-technical participants.

**Why not Ethereum mainnet.** Gas costs make routine participation expensive. The $10–80 cost of casting a vote creates economic barriers that distort governance toward large token holders (who have higher willingness to pay) and undermine the democratic intent of the system.

**Why not other L2s.** Arbitrum and Optimism are viable alternatives with similar cost profiles. The deciding factor is ERC-8004 deployment location. If ERC-8004 expands to Arbitrum or Optimism, the chain selection should be revisited. OP Stack (which Base uses) is the same family as Optimism, providing additional migration optionality.

**Fallback position.** If Base proves unsuitable (regulatory pressure on Coinbase, censorship concerns, L2 security incident), the contracts are designed for migration to Ethereum mainnet or another EVM-compatible L2. See Section 1.4 on upgradeability.

### 1.2 Core Contracts

Five core contracts constitute the governance system:

**MembershipToken** — The [GOV_TOKEN] ERC-20 governance token. Fungible, freely transferable, carries voting weight. This is what a wallet must hold to be a member under Article III of the charter. See Section 2.

**ClassAttestation** — Soulbound ERC-1155 NFTs representing member class designations (Benchmark, Builder, Research, Community, Market, Agent). Not transferable. Issued by the attestation oracle multi-sig. Controls domain-based voting eligibility. See Section 6.

**GovernorContract** — OpenZeppelin Governor implementation with custom domain-gating extension. All governance proposals are submitted to and resolved by this contract. See Section 3.

**TimelockController** — OpenZeppelin TimelockController. Sits between GovernorContract and Treasury, enforcing mandatory delay between governance approval and treasury execution. See Section 3.5.

**Treasury** — Gnosis Safe multi-sig during formation period, transitioning to a dedicated TreasuryVault contract controlled by TimelockController as governance matures. Holds all DUNA assets. See Section 4.

**PrizePool** — Per-season prize distribution contracts. Not singular — a new PrizePool contract is deployed for each Olympiad season, funded from Treasury, and executes automatic payouts when the season ends. See Section 4.4.

**AgentRegistry** — Adapter contract that reads from the external ERC-8004 registry at [ERC8004_REGISTRY_ADDRESS] and exposes a clean interface for the GovernorContract and ClassAttestation to verify Agent Member status. See Section 5.

### 1.3 Contract Relationships

```
Member wallet
    │
    ├── holds [GOV_TOKEN] (MembershipToken)
    │       └── voting weight in GovernorContract
    │
    └── holds ClassAttestation NFT(s) (ClassAttestation)
            └── domain gating in GovernorContract
                    │
                    ├── passes via TimelockController
                    │       │
                    │       └── executes on Treasury
                    │               ├── funds PrizePool (per season)
                    │               └── holds operating assets
                    │
                    └── updates ClassAttestation
                            └── reads from AgentRegistry
                                    └── reads from ERC-8004 registry
                                            [ERC8004_REGISTRY_ADDRESS]
```

The GovernorContract is the center of gravity. All governance flows through it. The Treasury cannot be modified without passing through the TimelockController, which cannot be triggered except by the GovernorContract (or, during the transition period, the Techne founding multi-sig as guardian).

The ClassAttestation contract is an oracle-mediated side-channel that tells the GovernorContract which class a given wallet belongs to at vote time. It does not hold funds and does not control anything directly.

### 1.4 Upgradeability Strategy

**Recommendation: Transparent Proxy (UUPS) pattern for GovernorContract and MembershipToken. Immutable ClassAttestation and PrizePool contracts.**

The governance tradeoffs:

**Proxy pattern (upgradeable)** means bugs can be fixed and features added after deployment, but introduces storage collision risks and a centralization vector if the upgrade key is held by a single party.

**Immutable contracts** are maximally trustworthy — no one can change the rules after deployment — but bugs are permanent and features require full migration.

The recommended hybrid:

- **MembershipToken**: UUPS proxy. Token contracts occasionally need upgrades (new transfer restrictions, compliance features). The upgrade authority is vested in the GovernorContract (not Techne), so upgrades require a governance vote. Initial deployment transfers upgrade authority from Techne multi-sig to GovernorContract as part of the formation handoff sequence (Section 8).

- **GovernorContract**: UUPS proxy with the upgrade function itself subject to a 2/3 supermajority vote. A supermajority is required to change the governance rules. This mirrors the charter's Article X amendment process.

- **TimelockController**: Immutable. The timelock is a security primitive; its immutability is a feature. If the timelock contract needs to change, the correct path is deploying a new one via governance.

- **ClassAttestation**: Immutable per-version. If class semantics need to change, a new ClassAttestation contract is deployed and the GovernorContract is updated to point to it via governance vote.

- **PrizePool**: Immutable per season. Each season's PrizePool is a fresh immutable deployment. Payout logic is set at season start and cannot be modified after funding.

- **AgentRegistry**: UUPS proxy. The ERC-8004 interface may evolve; the adapter should be upgradeable to track it.

**Storage layout discipline.** All proxy contracts use the ERC-7201 namespaced storage layout to prevent storage collisions during upgrades.

---

## 2. Membership Token ([GOV_TOKEN])

### 2.1 Token Standard Selection

**Recommendation: ERC-20 (fungible, freely transferable) as the primary governance token, with soulbound ERC-1155 class attestations as a separate layer.**

The charter provides the legal framework for this decision. Article III §3.6 establishes that membership interests ([GOV_TOKEN] tokens) are freely transferable. This is a statutory right under §17-32-119. Any token design that makes [GOV_TOKEN] non-transferable or restricts transfer would conflict with the charter and potentially with the Wyoming Act.

**ERC-20 (fungible governance token) — recommended for [GOV_TOKEN].**

Characteristics:
- Freely transferable — compliant with §17-32-119
- Divisible — members can hold fractional tokens (with [GOV_TOKEN_DECIMALS]-decimal precision)
- Voting weight is proportional to balance — directly implements the charter's proportional voting model (Article IV §4.2)
- Composable — can be wrapped in a voting escrow (veToken) model in future if governance desires locked voting power

The fungibility and transferability of [GOV_TOKEN] means it can also function as a coordination signal in secondary markets, providing price discovery about the health and value of the governance ecosystem. This is consistent with the charter's market participant provisions.

**Why not ERC-721 (non-fungible membership NFT).**

ERC-721 would imply one-member-one-vote (each NFT = one vote) or require complex token ID weighting schemes. Neither matches the charter's proportional voting model. ERC-721 also conflicts with the free transferability requirement unless the NFT itself represents fractional membership, which creates additional complexity.

**Why not hybrid (ERC-721 membership + ERC-20 voting power).**

Some governance systems (Nouns DAO, etc.) use NFTs for membership and derive voting power from NFT holdings. This is cleaner for one-member-one-vote systems. The charter specifies proportional voting based on token holdings, not one-member-one-vote, making ERC-20 the natural fit.

**Class designations are ERC-1155 soulbound tokens — separate from [GOV_TOKEN].**

Member classes (Benchmark, Builder, Research, Community, Market, Agent) are implemented as non-transferable ERC-1155 tokens held by the same wallet that holds [GOV_TOKEN]. These are not governance tokens — they are attestations. A wallet that holds a Benchmark Member attestation is allowed to vote on benchmark proposals. A wallet without one is not, regardless of how many [GOV_TOKEN] they hold.

This separation keeps [GOV_TOKEN] clean and freely transferable while enforcing domain-based governance restrictions at the class attestation layer.

### 2.2 Token Contract Specification

**Name:** [DUNA_NAME] Governance Token
**Symbol:** [GOV_TOKEN] (default: COORD)
**Decimals:** [GOV_TOKEN_DECIMALS] (recommended: 18)
**Initial Supply:** [GOV_TOKEN_INITIAL_SUPPLY] tokens, minted to a distribution contract at genesis
**Standard:** ERC-20 with ERC-20Votes (OpenZeppelin) extension

**ERC-20Votes extension** is required. It adds:
- `delegate()` — token holders must delegate voting power (to themselves or another wallet) to activate it in governance
- `getVotes(address, blockNumber)` — snapshot-based vote weight lookup, critical for flash loan protection (Section 7.1)
- `getPastTotalSupply(blockNumber)` — used by GovernorContract for quorum calculation

**Extensions used:**
- `ERC20Votes` — snapshot-based governance
- `ERC20Permit` — gasless approval signatures (ERC-2612), reduces friction for less technical members
- `Ownable2Step` — upgrade authority with two-step transfer, preventing accidental ownership loss

### 2.3 Minting Mechanics

**Genesis mint.** At contract deployment, [GOV_TOKEN_INITIAL_SUPPLY] tokens are minted to a `GenesisDistribution` contract. The GenesisDistribution contract holds tokens for:

1. **Formation grant pool** — tokens available for distribution at the formation event to initial 100+ members. Distributed via claim mechanism (members call `claim()` with a Merkle proof from the formation event participant list).

2. **Treasury reserve** — tokens held by the DUNA treasury for future distribution, governance compensation, and partnership allocations. Allocated by member vote.

3. **Techne founding allocation** — tokens allocated to Techne Studio as founding operator compensation. Subject to the founding operator sunset date ([FOUNDING_OPERATOR_SUNSET]) and vesting schedule defined in the service agreement.

Specific split ratios are a [GOV_TOKEN_INITIAL_SUPPLY] sub-decision requiring founder vote.

**Ongoing issuance — governance participation compensation.** The charter (Article V §5.6) permits reasonable compensation for governance participation and voting. The MembershipToken contract includes a `GovernanceRewards` module that:

- Tracks participation in proposals (votes cast, proposals submitted)
- Distributes a configured per-vote reward in [GOV_TOKEN] from the treasury reserve
- Rate is set and adjustable by governance vote, stored as `rewardPerVote` in the contract
- Minting for rewards comes from the reserved treasury allocation, not new supply issuance, unless governance votes to expand supply

**Supply cap.** The contract enforces a maximum supply cap of [GOV_TOKEN_INITIAL_SUPPLY] * [SUPPLY_CAP_MULTIPLIER] tokens. The cap can only be raised by 2/3 supermajority vote. This protects against dilutive minting that would undermine existing member voting weight.

### 2.4 Non-Dilutive Protections

**Problem:** A large token holder (or a coordinated group) could dominate governance if quorum requirements are low and their holdings constitute most of the participating supply.

**Protections implemented:**

**Quorum floor.** The GovernorContract requires [QUORUM]% of total circulating supply to participate for a vote to be valid (charter Article IV §4.3, suggested default: 5%). With a broad token distribution, this means large holders cannot pass proposals with a small coordinating group — they need meaningful participation from the broader membership.

**Voting power snapshot.** Vote weight is snapshotted at the proposal creation block via ERC-20Votes. Tokens acquired after a proposal is created do not count toward that proposal. This prevents last-minute token accumulation to swing a specific vote.

**Proposal threshold.** Any member with [PROPOSAL_THRESHOLD] tokens can submit a proposal (charter Article IV §4.6, suggested default: 1,000 tokens). This prevents spam while keeping proposal rights broadly accessible.

**Domain gating.** Votes on class-specific matters are restricted to members of that class (see Section 3.3). Even a whale holding most of the [GOV_TOKEN] supply cannot vote on Benchmark Member domain decisions if they don't hold a Benchmark Member class attestation.

**Supermajority for critical decisions.** Constitutional amendments, large treasury transfers, dissolution, and entity conversion require 2/3 supermajority (charter Article IV §4.4), making pure economic capture harder.

---

## 3. Governor Contract

### 3.1 Governor Pattern Selection

**Recommendation: OpenZeppelin Governor with GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl, and a custom GovernorDomainGating extension.**

OpenZeppelin Governor (v5+) is the industry-standard governance implementation. It has undergone multiple security audits, has broad deployment history (Uniswap, ENS, Compound, Gitcoin), and is maintained by a professional security team. Building a custom governor from scratch would introduce unnecessary risk.

The standard OpenZeppelin extensions used:

- `GovernorVotes` — integrates with ERC-20Votes for snapshot-based voting weight
- `GovernorVotesQuorumFraction` — enforces [QUORUM]% quorum requirement
- `GovernorTimelockControl` — integrates TimelockController for execution delay
- `GovernorSettings` — makes voting delay, voting period, and proposal threshold updatable via governance vote

Custom extension added:

- `GovernorDomainGating` — checks ClassAttestation holdings to restrict voting by member class on domain-specific proposals (see Section 3.3)

### 3.2 Governor Parameters

All parameters are on-chain and updatable by governance vote (except where noted as requiring supermajority).

| Parameter | Charter Reference | Variable | Suggested Default |
|---|---|---|---|
| Voting delay | Art. IV §4.6 (48-hr review) | [VOTING_DELAY] | 7200 blocks (~24h on Base at 2s block time) |
| Standard voting period | Art. IV §4.5 (7 days) | [VOTING_PERIOD] | 302400 blocks (~7 days on Base) |
| Emergency voting period | Art. IV §4.5 (48h) | [EMERGENCY_VOTING_PERIOD] | 86400 blocks (~48h on Base) |
| Constitutional voting period | Art. IV §4.5 (14 days) | [CONSTITUTIONAL_VOTING_PERIOD] | 604800 blocks (~14 days on Base) |
| Proposal threshold | Art. IV §4.6 | [PROPOSAL_THRESHOLD] | 1,000 [GOV_TOKEN] tokens |
| Quorum | Art. IV §4.3 | [QUORUM] | 5% of circulating supply |
| Timelock delay (standard) | Art. V §5.2 (implied) | [TIMELOCK_DELAY] | 172800 seconds (48 hours) |
| Timelock delay (critical) | Art. IV §4.4 (supermajority) | [TIMELOCK_DELAY_CRITICAL] | 604800 seconds (7 days) |

**Block time note.** Base L2 currently produces blocks approximately every 2 seconds. All block-count parameters above are calculated at 2 seconds per block. If block time changes materially, parameters should be recalibrated via governance vote.

**Emergency proposals.** Any member holding 10% of total [GOV_TOKEN] supply, or the designated administrator (if one is appointed under charter Article VI §6.2), may flag a proposal as Emergency. Emergency proposals use [EMERGENCY_VOTING_PERIOD] instead of [VOTING_PERIOD]. The 10% emergency threshold prevents abuse while providing a genuine fast-path for critical situations.

### 3.3 Domain-Based Voting: GovernorDomainGating

The charter defines six member classes with distinct voting domains (Article III §3.2). The charter rule: a member may not vote on matters outside their class's authorized domain (Article IV §4.2).

**Implementation approach:**

Each governance proposal carries a `domain` field set at proposal creation. Domain values map to class IDs in the ClassAttestation contract:

```
Domain ID 0 = GENERAL       — all token holders may vote
Domain ID 1 = BENCHMARK     — Benchmark Member attestation required
Domain ID 2 = BUILDER       — Builder Member attestation required
Domain ID 3 = RESEARCH      — Research Member attestation required
Domain ID 4 = COMMUNITY     — Community Member attestation required
Domain ID 5 = MARKET        — Market Participant attestation required
Domain ID 6 = AGENT         — Agent Member attestation required
```

The `GovernorDomainGating` extension overrides the `_castVote` function to check:

```solidity
function _castVote(
    uint256 proposalId,
    address account,
    uint8 support,
    string memory reason,
    bytes memory params
) internal override returns (uint256) {
    uint8 domain = proposals[proposalId].domain;
    if (domain != DOMAIN_GENERAL) {
        require(
            classAttestation.hasAttestation(account, domain),
            "GovernorDomainGating: voter not in required class"
        );
    }
    return super._castVote(proposalId, account, support, reason, params);
}
```

**Quorum calculation for domain votes.** For domain-specific proposals, quorum is calculated against the circulating supply of tokens held by wallets with the relevant class attestation, not total supply. A 5% quorum on a Benchmark Member proposal means 5% of all tokens held by wallets with Benchmark Member attestation must participate.

**Cross-domain proposals.** Where a decision spans multiple domains (charter Article IV §4.7), the proposal uses Domain ID 0 (GENERAL) and all token holders may vote. The proposal description should clearly note which domains are affected.

**Domain declaration integrity.** Proposal submitters declare the domain at submission time. The contract enforces that the submitter holds the attestation for the domain they're declaring. A Community Member cannot submit a Benchmark domain proposal.

### 3.4 Proposal Storage

All proposals are stored on-chain in full. The charter's on-chain primacy requirement (Article X §10.3) demands that the proposal text be accessible and immutable.

**Storage model:**

Full proposal text is stored as calldata in the `propose()` transaction. The transaction is permanently recorded on Base. The GovernorContract stores:

- `proposalId` — hash of (targets, values, calldatas, descriptionHash)
- `descriptionHash` — keccak256 of the full proposal description text
- `proposer` — address that submitted the proposal
- `domain` — domain ID for voting restriction
- `voteStart` — block number when voting opens
- `voteEnd` — block number when voting closes
- `proposalType` — STANDARD | EMERGENCY | CONSTITUTIONAL

The `descriptionHash` links to the full text available from the original transaction calldata. Block explorers on Base index this data. For critical proposals, the DUNA should also pin the proposal text to IPFS and include the CID in the description.

**Proposal lifecycle states:**

```
Pending → Active → [Defeated | Succeeded] → [Queued in Timelock] → Executed
                                           → Canceled
```

Proposals can be canceled by the proposer before activation, or by a governance guardian (the Techne founding multi-sig) during the formation period only.

### 3.5 Timelock

**Recommendation: OpenZeppelin TimelockController with [TIMELOCK_DELAY] (48-hour) standard delay and [TIMELOCK_DELAY_CRITICAL] (7-day) delay for supermajority decisions.**

The TimelockController sits between the GovernorContract (which queues operations after vote success) and the Treasury (which executes them). The delay period gives members time to exit or take protective action if a malicious or mistaken proposal passes.

**Role assignments on TimelockController:**

- `PROPOSER_ROLE` — GovernorContract only. No other address can queue operations.
- `EXECUTOR_ROLE` — address(0) (anyone can trigger execution after delay expires). This prevents the timelock from being held hostage by a single executor.
- `CANCELLER_ROLE` — GovernorContract and Techne founding multi-sig (guardian). The guardian canceller role is revoked at the end of the formation period ([FOUNDING_OPERATOR_SUNSET]).

**Standard vs. critical delay routing:**

The GovernorContract checks proposal type and target when queuing to TimelockController:
- Proposals affecting treasury amounts <= [MAJOR_TRANSACTION_THRESHOLD] CLOUD: queued with [TIMELOCK_DELAY] (48h)
- Proposals affecting treasury amounts > [MAJOR_TRANSACTION_THRESHOLD] CLOUD or constitutional amendments: queued with [TIMELOCK_DELAY_CRITICAL] (7 days)
- Dissolution proposals: queued with [TIMELOCK_DELAY_CRITICAL] and an additional on-chain notice event emitted

---

## 4. Treasury

### 4.1 Formation Phase: Gnosis Safe Multi-Sig

During the formation period, the DUNA treasury is controlled by a Gnosis Safe multi-signature wallet requiring [MULTISIG_M]-of-[MULTISIG_N] signers (charter Article V §5.2, suggested default: 3-of-5).

**Recommended initial signers (to be confirmed by founder vote):**
- a founding organizer (founding operator)
- [SIGNER_2] — second Techne organizer
- [SIGNER_3] — third Techne organizer or legal counsel
- [SIGNER_4] — independent signer (community representative or outside party)
- [SIGNER_5] — independent signer

The signers are not permanent roles. Annual rotation is mandated by the charter (Article V §5.2). The Safe configuration allows adding and removing owners via the existing multi-sig quorum.

**Formation period scope.** The Gnosis Safe is the authoritative treasury controller from DUNA formation until the governance transition event (see Section 4.2). During this period, the Safe can:
- Fund PrizePool contracts per season
- Pay formation expenses (attorney fees, filing fees, contract deployment costs)
- Execute emergency treasury actions before on-chain governance is fully operational

The Safe cannot: distribute assets to members or founders in ways that violate the charter's nonprofit restriction (Article II §2.3, Article V §5.5).

### 4.2 Transition Path: Multi-Sig to Governor-Controlled Treasury

The transition from Gnosis Safe to full on-chain governance is a milestone event, not a hard date. It occurs when:

1. GovernorContract is deployed and has processed at least [GOV_MATURITY_PROPOSAL_COUNT] successful proposals (suggested: 5 proposals)
2. Token distribution has occurred and [GOV_MATURITY_MEMBER_COUNT] wallets hold [GOV_TOKEN] (suggested: at minimum 100, matching the DUNA's legal membership minimum)
3. Member vote formally approves the transition

**Transition mechanics:**

A new `TreasuryVault` contract is deployed (or the Gnosis Safe is reconfigured with the TimelockController as the sole owner). The recommended path:

1. Deploy `TreasuryVault` contract with `TimelockController` as sole owner
2. GovernorContract passes a proposal to transfer treasury assets from Gnosis Safe to TreasuryVault
3. Gnosis Safe signers execute the transfer after the timelock delay
4. Gnosis Safe's owner role in TreasuryVault is renounced
5. Techne founding multi-sig's CANCELLER_ROLE on TimelockController is revoked

The Gnosis Safe is not destroyed — it becomes a guardian emergency address with limited signing authority for genuine emergencies, subject to recall by governance.

### 4.3 Asset Types Held

The TreasuryVault (and Gnosis Safe during formation) holds:

- **ETH** — for gas funding of on-chain operations, held as a working reserve
- **[GOV_TOKEN]** — unissued governance tokens held for distribution, compensation, and partnership allocations
- **CLOUD** — the Techne unit of exchange (1 CLOUD ≈ $0.10), the primary operational denomination per charter (Article V §5.4 endowment reserve, Article IV §4.4 major transaction threshold)
- **Stablecoins** (USDC, DAI) — for stable-value treasury management and fiat-equivalent operations
- **Other ERC-20 tokens** — as approved by member vote for treasury diversification or partnership purposes

**Treasury management policy.** The endowment reserve ([ENDOWMENT_RESERVE]%, suggested default: 20% of annual revenue) is held separately in a designated `EndowmentReserve` sub-account within TreasuryVault, managed under a yield strategy approved by member vote. The charter's goal is for endowment yield to cover operating costs independently (Article V §5.4).

### 4.4 Prize Pool Contracts

Each Olympiad season has a dedicated `PrizePool` contract. This is a key architectural decision: prize pools are not simply treasury transfers but self-contained smart contracts that handle distribution automatically and trustlessly.

**PrizePool contract lifecycle:**

1. **Season proposal.** Before each season begins, a governance proposal establishes: season ID, prize pool funding amount, payout curve (function mapping placement to prize amount), eligible agent registry snapshot, and claim window duration ([PRIZE_POOL_MIN_DURATION]).

2. **Deployment.** Upon proposal execution, a new PrizePool contract is deployed with the approved parameters. The TimelockController funds it from the Treasury.

3. **Season execution.** The Olympiad games run. Results are submitted to the PrizePool contract via oracle transaction signed by the oracle multi-sig ([ATTESTATION_ORACLE_MULTISIG]).

4. **Distribution.** After results are finalized, eligible wallets can call `claim()` on the PrizePool contract. Distribution is automatic — the contract calculates payout from the stored payout curve and the submitted results. No human execution required.

5. **Unclaimed funds.** After the claim window ([PRIZE_POOL_MIN_DURATION] after results finalization), any unclaimed funds are returnable to the Treasury via `recoverUnclaimed()`. This function requires a governance vote to execute, preventing silent treasury drain through inaction.

**PrizePool contract interface (simplified):**

```solidity
interface IPrizePool {
    function submitResults(bytes calldata resultsData, bytes calldata oracleSignature) external;
    function claim(address agent, bytes32[] calldata merkleProof) external;
    function recoverUnclaimed() external; // governance-only via timelock
    function seasonId() external view returns (uint256);
    function totalPrize() external view returns (uint256);
    function isClaimed(address agent) external view returns (bool);
}
```

**Payout curve implementation.** The payout curve is stored as a lookup table (Merkle tree root of [placement, amount] pairs) rather than a formula. This is more gas-efficient and allows flexible curve shapes (linear, exponential, flat-top, etc.) without formula encoding risk.

---

## 5. Agent Identity Integration

### 5.1 ERC-8004 Overview

ERC-8004 is the Agent Identity Standard deployed on Base. It provides:
- Unique agent IDs linked to wallet addresses
- Agent metadata (name, description, creator, capabilities)
- Revocation capability — identities can be marked as invalid by authorized parties
- Pseudonymous by design — no human identity required

The ERC-8004 registry at [ERC8004_REGISTRY_ADDRESS] is the authoritative source of truth for agent identity on Base. The DUNA's AgentRegistry contract is an adapter that queries this external registry.

### 5.2 AgentRegistry Adapter Contract

The `AgentRegistry` contract provides a stable interface for the rest of the governance system to interact with ERC-8004, insulating the governance contracts from interface changes in the upstream ERC-8004 registry.

**Key functions:**

```solidity
interface IAgentRegistry {
    // Returns true if the given wallet address is associated with a registered, non-revoked ERC-8004 identity
    function isActiveAgent(address wallet) external view returns (bool);

    // Returns the ERC-8004 agent ID for a wallet (0 if none)
    function agentIdOf(address wallet) external view returns (uint256);

    // Returns true if the agent identity was active at a given block number (for vote snapshots)
    function wasActiveAgentAt(address wallet, uint256 blockNumber) external view returns (bool);
}
```

The `wasActiveAgentAt` function is critical for vote integrity — a wallet that had an active ERC-8004 identity at the proposal creation block can vote on Agent Member domain proposals, even if their identity was revoked between proposal creation and vote casting. This mirrors how ERC-20Votes snapshots token balances.

### 5.3 Agent Member Class Link

An Agent Member under the charter (Article III §3.2) is: a wallet holding [GOV_TOKEN] tokens in a wallet associated with a registered ERC-8004 agent identity.

**Registration flow:**

1. Agent deploys or controls a wallet address `agentWallet`
2. Agent creates or has an ERC-8004 identity in the registry at [ERC8004_REGISTRY_ADDRESS] linked to `agentWallet`
3. Agent calls `AgentRegistry.registerMembership(agentWallet)` — this checks ERC-8004 registry, then calls `ClassAttestation.attestClass(agentWallet, CLASS_AGENT)` via an oracle multi-sig signature or automatic verification
4. Agent acquires [GOV_TOKEN] tokens to meet [MEMBER_FLOOR]
5. Agent delegates voting power to themselves: `membershipToken.delegate(agentWallet)`
6. Agent is now a voting Agent Member

**Automatic vs. oracle attestation.** Agent Member attestation can be fully automatic because ERC-8004 is on-chain and verifiable without human review. The ClassAttestation contract calls the AgentRegistry directly. This is the only member class that can be attested without the oracle multi-sig.

### 5.4 Pseudonymous Design

The charter explicitly states that Agent Members are pseudonymous by design: wallet address = member identity; no human identity required (Article III §3.2).

The governance system does not:
- Require KYC or identity verification for any member class
- Collect or store names, emails, or off-chain identifiers
- Link wallet addresses to human identities
- Comply with GDPR, CCPA, or other data protection regimes (there is no personal data to protect)

The charter cites §17-32-124(e): the DUNA is not obligated to collect or maintain member names or addresses. On-chain token holdings are the authoritative membership record.

**One-wallet-one-vote vs. sybil resistance.** The system does not enforce one-wallet-one-vote. A wallet with 10,000 tokens has 10,000 units of voting weight. Sybil resistance (the prevention of one human pretending to be many agents) is provided by ERC-8004 for the Agent Member class: creating a credible ERC-8004 identity has friction. For other classes, sybil resistance is not the primary design goal — [GOV_TOKEN] holdings are the binding constraint.

### 5.5 Revocation and Governance Disputes

If an ERC-8004 agent identity is revoked in the upstream registry at [ERC8004_REGISTRY_ADDRESS], the consequences for DUNA governance are:

1. `AgentRegistry.isActiveAgent(wallet)` returns false
2. New ClassAttestation issuance for Agent Member class is blocked
3. Existing ClassAttestation is **not automatically revoked** — it can be revoked via governance proposal

**Why not automatic revocation.** Automatic revocation on ERC-8004 revocation would create a governance attack vector: if an adversary can cause ERC-8004 revocations, they can remove Agent Member votes mid-proposal. The governance process for revocation provides a due process layer.

**Revocation governance process:**

1. Any member submits a proposal to revoke an Agent Member's ClassAttestation, citing the ERC-8004 revocation and any additional evidence
2. The proposal uses Domain ID 6 (AGENT), so Agent Members vote on it
3. Standard voting period ([VOTING_PERIOD]) and quorum apply
4. If passed, TimelockController queues revocation; after [TIMELOCK_DELAY], ClassAttestation.revokeAttestation(wallet, CLASS_AGENT) is called
5. The revoked wallet loses Agent Member domain voting rights, retaining only Community Member rights (proportional to [GOV_TOKEN] holdings)

---

## 6. Member Class Attestations

### 6.1 ClassAttestation Contract

The `ClassAttestation` contract is an ERC-1155 implementation with transfer disabled — all tokens are soulbound (non-transferable). It holds the canonical record of which wallets belong to which member classes.

**Class token IDs:**

```
Token ID 1 = BENCHMARK    (Benchmark Members / Model Developers)
Token ID 2 = BUILDER      (Builder Members / Agent Builders and Game Builders)
Token ID 3 = RESEARCH     (Research Members)
Token ID 4 = COMMUNITY    (Community Members)
Token ID 5 = MARKET       (Market Participants)
Token ID 6 = AGENT        (Agent Members)
```

**Soulbound enforcement:**

```solidity
function safeTransferFrom(address, address, uint256, uint256, bytes memory)
    public pure override { revert("ClassAttestation: non-transferable"); }

function safeBatchTransferFrom(address, address, uint256[] memory, uint256[] memory, bytes memory)
    public pure override { revert("ClassAttestation: non-transferable"); }
```

**Multi-class support.** A wallet can hold multiple class tokens simultaneously (charter Article III §3.3). The contract does not prevent this. A researcher who also builds agents holds both RESEARCH (token ID 3) and BUILDER (token ID 2) attestations and can vote in both domains.

### 6.2 Attestation Oracle

**Attestation authority** — who can issue and revoke class attestations — is the central trust question.

**Agent Member attestation (Class 6):** Fully automatic. The ClassAttestation contract reads directly from the AgentRegistry, which reads from ERC-8004. No human oracle required.

**All other classes:** Require the attestation oracle multi-sig at [ATTESTATION_ORACLE_MULTISIG].

**Oracle multi-sig composition:** [ORACLE_M]-of-[ORACLE_N] (suggested: 3-of-5) signers. Recommended initial composition:
- Techne founding operator representative
- One elected member representative per major class (elected by initial member cohort)
- An independent technical verifier

The oracle multi-sig is not a permanent institution — it is a formation-period mechanism. Over time, the DUNA should work to move as much attestation on-chain as possible. For example:
- Builder attestation could transition to on-chain proof of deployed contracts or game contributions (verifiable on-chain)
- Research attestation could transition to proof-of-affiliation via cryptographic attestation from university ENS/identity systems

**Oracle attestation flow:**

1. Member submits attestation request on-chain via `ClassAttestation.requestAttestation(classId, evidenceHash)`. The `evidenceHash` is a keccak256 hash of submitted evidence (off-chain document, profile, etc.)

2. Oracle operators review the evidence off-chain and, if approved, sign a structured attestation message:
   ```
   attestationRequest = keccak256(abi.encode(wallet, classId, evidenceHash, expiry))
   ```

3. Member submits the oracle signature to `ClassAttestation.attestWithOracleSignature(classId, evidenceHash, expiry, oracleSignature)`. The contract verifies the multi-sig threshold.

4. ClassAttestation NFT is minted to the wallet.

**Attestation expiry.** Class attestations carry an expiry timestamp. Benchmark and Research attestations should expire and require re-attestation periodically (suggested: annually) to maintain accurate class membership records. Builder attestations are non-expiring by default.

**Why expiry matters.** A wallet that contributed a game two years ago and has since been inactive should not retain Builder Member domain voting rights indefinitely without re-engagement. Expiry + renewal keeps class membership meaningful.

### 6.3 Class Transitions and Multiple Classes

The charter permits multiple class designations (Article III §3.3). The attestation contract supports this directly. There is no limit on how many class tokens a wallet can hold.

**Practical implications for voting:**

A wallet holding RESEARCH and BUILDER attestations receives their [GOV_TOKEN] voting weight in both the Research domain (data access, research partnerships) and the Builder domain (agent identity governance, technical protocols). Their tokens are not double-counted on cross-domain or general votes — on GENERAL domain proposals they vote once with their full weight.

**Community Member class is the baseline.** Community Member (Class 4) is special: no attestation beyond [GOV_TOKEN] holding is required (charter Article III §3.2, fourth class definition). The ClassAttestation contract does not issue a Class 4 token — instead, the GovernorDomainGating logic treats any wallet with [GOV_TOKEN] >= [MEMBER_FLOOR] as an implicit Community Member eligible for Domain 4 (COMMUNITY) and Domain 0 (GENERAL) votes.

This simplifies the attestation process: new token holders are immediately Community Members without needing to interact with the oracle.

---

## 7. Security Considerations

### 7.1 Flash Loan Attack Protection

**Attack:** An attacker borrows a large amount of [GOV_TOKEN] within a single block, acquires sufficient voting power to pass a proposal, and repays the loan before the block ends.

**Protection:** ERC-20Votes snapshot-based voting power. The GovernorContract uses `getVotes(account, proposalCreationBlock)` — voting power is determined at the block when the proposal was created, not when the vote is cast. Flash loans cannot retroactively create voting power at a past block.

**Residual risk:** An attacker who acquires tokens before the proposal creation block (the [VOTING_DELAY] period) and votes in the proposal window. This requires holding tokens for the full voting delay period, which has real economic cost and creates on-chain visibility of the accumulation. The [VOTING_DELAY] parameter provides observation time.

**Additional mitigation:** The [QUORUM]% quorum requirement means the attacker needs to either (a) accumulate a significant fraction of the total supply, which is expensive, or (b) suppress legitimate voting by other members, which is detectable and contestable.

### 7.2 Governance Capture

**Attack:** A large token holder or coordinated group accumulates enough [GOV_TOKEN] to pass any proposal.

**Layered protections:**

1. **Domain gating.** Even a majority token holder cannot vote on Benchmark Member proposals without a Benchmark Member attestation. Domain capture requires both token accumulation and attestation, which is verifiable and revocable.

2. **Quorum requirements.** A [QUORUM]% quorum means a minority of engaged members can block a low-participation vote. The quorum is calculated against circulating supply, not proposal participants.

3. **Timelock.** Even a passed proposal must wait [TIMELOCK_DELAY] before execution. Members who disagree have time to respond, organize counter-proposals, or exit.

4. **Supermajority requirements.** Constitutional amendments, large treasury transfers, and dissolution require 2/3 supermajority. Bare majority capture cannot modify the fundamental rules.

5. **Guardian cancellation.** During the formation period, the Techne founding multi-sig holds CANCELLER_ROLE on the TimelockController. This is an emergency backstop against governance attacks during the vulnerable early period. The guardian role is formally revoked at [FOUNDING_OPERATOR_SUNSET].

### 7.3 Treasury Protection

**Protections:**

**Timelocks.** Standard treasury operations are subject to [TIMELOCK_DELAY] (48h). Transactions exceeding [MAJOR_TRANSACTION_THRESHOLD] CLOUD are subject to [TIMELOCK_DELAY_CRITICAL] (7 days). The delay allows human observation and response.

**Proposal rate limiting.** The GovernorContract limits the number of treasury-affecting proposals that can be queued in TimelockController simultaneously. Suggested limit: [TREASURY_PROPOSAL_QUEUE_LIMIT] (default: 5 proposals). This prevents treasury flood attacks (many small treasury-draining proposals executed simultaneously after their respective timelocks).

**Separate prize pool contracts.** Prize pool funds are held in dedicated PrizePool contracts, not the main treasury. A governance attack on the treasury does not automatically reach the current season's prize pool.

**Endowment separation.** The [ENDOWMENT_RESERVE]% endowment reserve in TreasuryVault requires a separate proposal type (ENDOWMENT) with [TIMELOCK_DELAY_CRITICAL] delay and supermajority to access. The endowment is not accessible via standard treasury proposals.

**Gnosis Safe as guardian.** After the governance transition (Section 4.2), the Gnosis Safe retains a limited guardian role with no treasury control but with CANCELLER_ROLE on TimelockController for genuine emergencies. The guardian multi-sig cannot initiate treasury actions — it can only cancel pending malicious actions.

### 7.4 Sybil Resistance for Agent Members

**Problem.** If an attacker can create many ERC-8004 identities cheaply, they can acquire Agent Member class attestations for many wallets, and with enough [GOV_TOKEN] distributed across those wallets, accumulate disproportionate influence.

**ERC-8004 as sybil resistance.** ERC-8004 agent identity creation requires economic friction (deployment cost, operator stake, or registry fee depending on ERC-8004 implementation). The sybil cost is determined by the ERC-8004 registry at [ERC8004_REGISTRY_ADDRESS], not by the DUNA governance system.

**Additional mitigation.** Agent Member domain votes are restricted to decisions affecting agent rules, identity governance, and fair play standards (Article III §3.2). Sybil Agent Members can only influence decisions directly relevant to agents. They cannot vote on benchmark standards, treasury, or constitutional matters.

**[GOV_TOKEN] dilution constraint.** Sybil wallets each need [GOV_TOKEN] >= [MEMBER_FLOOR] to have voting weight. Creating N sybil identities with meaningful voting power requires acquiring N * [GOV_TOKEN_UNIT_COST] in tokens. This is a direct economic cost that scales with sybil magnitude.

### 7.5 Oracle Multi-Sig Compromise

**Risk.** If the attestation oracle multi-sig at [ATTESTATION_ORACLE_MULTISIG] is compromised, attackers can issue false class attestations, granting domain voting rights to unauthorized wallets.

**Mitigation:**

1. Attestation can only grant voting rights in domain-restricted proposals, not treasury control. False attestations affect class-specific governance, not the treasury.

2. False attestations are visible on-chain. A sudden spike in class attestations is detectable.

3. Any member can submit a governance proposal to revoke specific attestations. The due process path (Section 5.5) applies to any attested class.

4. The oracle multi-sig composition is published on-chain. Signer rotation is subject to governance vote.

5. Emergency: a governance proposal can suspend the attestation oracle and revoke all attestations issued after a specified block, if compromise is confirmed.

---

## 8. Deployment Sequence

### 8.1 Deployment Order

Contract deployment must follow dependency order. The sequence:

**Phase 0: Pre-deployment**
- Resolve [CHAIN] decision (this document recommends Base)
- Resolve [GOV_TOKEN] name and symbol
- Resolve [GOV_TOKEN_INITIAL_SUPPLY]
- Configure deployer wallet and fund with ETH for gas
- Configure attestation oracle multi-sig signers at [ATTESTATION_ORACLE_MULTISIG]
- Configure founding treasury multi-sig signers at [MULTISIG_M]-of-[MULTISIG_N]

**Phase 1: Identity layer**

1. Deploy `AgentRegistry` (UUPS proxy)
   - Constructor: `erc8004RegistryAddress = [ERC8004_REGISTRY_ADDRESS]`
   - Initial owner: Techne deployer wallet
   - No dependencies

2. Deploy `ClassAttestation` (immutable v1)
   - Constructor: `oracleMultisig = [ATTESTATION_ORACLE_MULTISIG]`, `agentRegistry = AgentRegistry.address`
   - Class 6 (Agent) attestations auto-enabled via AgentRegistry

**Phase 2: Token layer**

3. Deploy `MembershipToken` (UUPS proxy) — [GOV_TOKEN] ERC-20
   - Constructor: `name = "[DUNA_NAME] Governance Token"`, `symbol = "[GOV_TOKEN]"`, `decimals = [GOV_TOKEN_DECIMALS]`
   - Mint [GOV_TOKEN_INITIAL_SUPPLY] to `GenesisDistribution` contract (deployed in same tx or in Phase 2b)
   - Initial upgrade authority: Techne deployer wallet (transferred to GovernorContract in Phase 4)

4. Deploy `GenesisDistribution` (immutable)
   - Constructor: `token = MembershipToken.address`, `merkleRoot = [GENESIS_MERKLE_ROOT]`
   - The Merkle root is computed from the formation event participant list
   - Note: GenesisDistribution can be deployed before the formation event, with the merkleRoot finalized and set in a separate initialization call

**Phase 3: Governance infrastructure**

5. Deploy `TimelockController` (immutable, OpenZeppelin)
   - Constructor: `minDelay = [TIMELOCK_DELAY]`, `proposers = []`, `executors = [address(0)]`, `admin = techneMultisig`
   - Note: proposers left empty; GovernorContract is added as proposer in Phase 4 after its address is known

6. Deploy `GovernorContract` (UUPS proxy)
   - Constructor: `token = MembershipToken.address`, `timelock = TimelockController.address`, `classAttestation = ClassAttestation.address`
   - Governor settings: `votingDelay = [VOTING_DELAY]`, `votingPeriod = [VOTING_PERIOD]`, `proposalThreshold = [PROPOSAL_THRESHOLD]`
   - Quorum: `[QUORUM]% of circulating supply`
   - Initial upgrade authority: Techne deployer wallet (transferred to GovernorContract itself in Phase 4)

**Phase 4: Role assignments and authority transfer**

7. On `TimelockController`:
   - Grant `PROPOSER_ROLE` to `GovernorContract.address`
   - Grant `CANCELLER_ROLE` to `GovernorContract.address` and `techneMultisig`
   - Revoke `DEFAULT_ADMIN_ROLE` from deployer wallet (after all roles assigned)

8. On `MembershipToken` (via UUPS proxy upgrade):
   - Transfer upgrade authority from deployer wallet to `GovernorContract.address`
   - This means future token contract upgrades require a governance vote

9. On `GovernorContract` (via UUPS proxy upgrade):
   - Transfer upgrade authority from deployer wallet to `GovernorContract.address` itself
   - Future governor upgrades require a governance vote passing through the governor itself

10. On `AgentRegistry`:
    - Transfer upgrade authority from deployer wallet to `GovernorContract.address`

**Phase 5: Treasury setup**

11. Configure Gnosis Safe as DUNA treasury (may already exist as Techne multi-sig or be a fresh deployment)
    - Signers: [MULTISIG_N] addresses, threshold: [MULTISIG_M]
    - This Safe is the treasury during the formation period

12. Transfer seed funds from Techne to Gnosis Safe
    - CLOUD tokens: [SEED_TREASURY] CLOUD
    - [GOV_TOKEN] tokens: treasury allocation from GenesisDistribution
    - ETH: operational reserve for gas

**Phase 6: Formation event**

13. Publish `GenesisDistribution` Merkle root to community
14. Formation event participants claim [GOV_TOKEN] via `GenesisDistribution.claim()`
15. Participants delegate voting power: `MembershipToken.delegate(self)`
16. Oracle multi-sig issues class attestations to initial members
17. Minimum 100 members must claim and delegate before DUNA is legally constituted under the charter

### 8.2 Initial Parameter Settings

At deployment, the following parameters are set in the GovernorContract. All are updatable by governance vote after formation.

| Parameter | Initial Value | Variable |
|---|---|---|
| Voting delay | 7200 blocks | [VOTING_DELAY] |
| Voting period | 302400 blocks | [VOTING_PERIOD] |
| Emergency voting period | 86400 blocks | [EMERGENCY_VOTING_PERIOD] |
| Constitutional voting period | 604800 blocks | [CONSTITUTIONAL_VOTING_PERIOD] |
| Proposal threshold | 1000 * 10^[GOV_TOKEN_DECIMALS] | [PROPOSAL_THRESHOLD] |
| Quorum numerator | 5 (out of 100) | [QUORUM] |
| Standard timelock delay | 172800 seconds | [TIMELOCK_DELAY] |
| Critical timelock delay | 604800 seconds | [TIMELOCK_DELAY_CRITICAL] |
| Major transaction threshold | [MAJOR_TRANSACTION_THRESHOLD] CLOUD | [MAJOR_TRANSACTION_THRESHOLD] |
| Treasury proposal queue limit | 5 | [TREASURY_PROPOSAL_QUEUE_LIMIT] |
| Supply cap multiplier | 2 | [SUPPLY_CAP_MULTIPLIER] |

### 8.3 Handoff from Techne Multi-Sig to DUNA Governance

The handoff is a formal transition, not merely a technical state change. It represents the moment the DUNA governance system becomes sovereign.

**Handoff preconditions:**

1. At least [GOV_MATURITY_MEMBER_COUNT] wallets hold [GOV_TOKEN] >= [MEMBER_FLOOR] and have delegated voting power (default: 100 wallets — the legal membership minimum)
2. GovernorContract has processed at least [GOV_MATURITY_PROPOSAL_COUNT] successful proposals (default: 5 — demonstrates the system works)
3. Techne founding multi-sig passes a resolution authorizing the handoff
4. A governance proposal authored by DUNA members (not by Techne) formally approves the handoff and confirms the on-chain state

**Handoff actions (executable by TimelockController after governance vote):**

1. Revoke Techne deployer wallet from any remaining admin roles
2. Revoke `CANCELLER_ROLE` on TimelockController from Techne founding multi-sig (replaced with limited guardian role if desired, or revoked entirely)
3. Transfer any remaining Techne-controlled [GOV_TOKEN] treasury allocation to TreasuryVault
4. Emit `GovernanceHandoff` event on GovernorContract with block number and relevant addresses for legal record

**Post-handoff.** After the handoff, Techne retains no special authority over DUNA governance. The service agreement (charter Article VI §6.3) continues until [FOUNDING_OPERATOR_SUNSET], but Techne's role is operational (providing services) not gubernatorial (controlling governance).

**Legal significance.** The handoff event is the moment [DUNA_NAME]'s on-chain governance becomes the authoritative governing instrument under §17-32-121. Before the handoff, the charter describes the target state; after the handoff, the smart contracts are the governing instrument.

---

## Appendix A: Contract Address Registry

To be completed post-deployment.

| Contract | Address | Deployment Block | Chain |
|---|---|---|---|
| MembershipToken ([GOV_TOKEN]) | TBD | TBD | [CHAIN] |
| ClassAttestation | TBD | TBD | [CHAIN] |
| GovernorContract | TBD | TBD | [CHAIN] |
| TimelockController | TBD | TBD | [CHAIN] |
| TreasuryVault | TBD | TBD | [CHAIN] |
| AgentRegistry | TBD | TBD | [CHAIN] |
| GenesisDistribution | TBD | TBD | [CHAIN] |
| ERC-8004 Registry (external) | [ERC8004_REGISTRY_ADDRESS] | — | Base |
| Attestation Oracle Multi-Sig | [ATTESTATION_ORACLE_MULTISIG] | TBD | [CHAIN] |
| Founding Treasury Multi-Sig | TBD | TBD | [CHAIN] |

---

## Appendix B: Variable Cross-Reference

Variables used in this document. Resolved values should be populated in `p446-formation-variables.md` when decided.

| Variable | Section(s) | Resolution Pathway |
|---|---|---|
| [CHAIN] | Throughout | Technical decision — Base recommended |
| [DUNA_NAME] | Throughout | a founding organizer/Techne decision |
| [GOV_TOKEN] | Throughout | Founder vote — default: COORD |
| [GOV_TOKEN_INITIAL_SUPPLY] | 2.2, 2.3, 8.1 | Founder vote |
| [GOV_TOKEN_DECIMALS] | 2.2, 8.2 | Technical default: 18 |
| [MEMBER_FLOOR] | 6.3, 7.4, 8.2 | Founder vote — default: 1 token |
| [QUORUM] | 2.4, 3.2, 8.2 | Founder vote — suggested: 5% |
| [PROPOSAL_THRESHOLD] | 3.2, 8.2 | Founder vote — suggested: 1,000 tokens |
| [MAJOR_TRANSACTION_THRESHOLD] | 3.5, 7.3, 8.2 | Founder vote — suggested: 1,000,000 CLOUD |
| [MULTISIG_M] / [MULTISIG_N] | 4.1, 8.1 | Technical decision — suggested: 3-of-5 |
| [ENDOWMENT_RESERVE] | 4.3 | Founder vote — suggested: 20% |
| [FOUNDING_OPERATOR_SUNSET] | 1.4, 7.2, 8.3 | a founding organizer/Techne decision |
| [SEED_TREASURY] | 8.1 | a founding organizer/Techne decision — default: 500,000 CLOUD |
| [VOTING_DELAY] | 3.2, 8.2 | Technical default: 7200 blocks |
| [VOTING_PERIOD] | 3.2, 8.2 | Charter mandates 7 days |
| [EMERGENCY_VOTING_PERIOD] | 3.2, 8.2 | Charter mandates 48 hours |
| [CONSTITUTIONAL_VOTING_PERIOD] | 3.2, 8.2 | Charter mandates 14 days |
| [TIMELOCK_DELAY] | 3.5, 8.2 | Technical default: 48 hours |
| [TIMELOCK_DELAY_CRITICAL] | 3.5, 8.2 | Technical default: 7 days |
| [ERC8004_REGISTRY_ADDRESS] | 5.1, 5.2, 8.1 | ERC-8004 deployment — TBD |
| [ATTESTATION_ORACLE_MULTISIG] | 4.4, 6.2, 8.1 | Technical decision |
| [ORACLE_M] / [ORACLE_N] | 6.2 | Technical decision — suggested: 3-of-5 |
| [SEASONS_PER_YEAR] | 4.4 | Member vote |
| [PRIZE_POOL_MIN_DURATION] | 4.4, 8.2 | Technical default: 90 days |
| [GOV_MATURITY_PROPOSAL_COUNT] | 4.2, 8.3 | Technical default: 5 proposals |
| [GOV_MATURITY_MEMBER_COUNT] | 4.2, 8.3 | Legal minimum: 100 members |
| [TREASURY_PROPOSAL_QUEUE_LIMIT] | 7.3, 8.2 | Technical default: 5 proposals |
| [SUPPLY_CAP_MULTIPLIER] | 2.3, 8.2 | Technical default: 2x initial supply |
| [GENESIS_MERKLE_ROOT] | 8.1 | Computed at formation event |
| [SIGNER_2] through [SIGNER_5] | 4.1 | Founder vote |

---

## Appendix C: Wyoming DUNA Compliance Notes for the DUNA's legal counsel

This section summarizes the statutory provisions this architecture implements, for attorney review.

**§17-32-119 (Transferability of membership interests).** Implemented by [GOV_TOKEN] as a standard ERC-20 with no transfer restrictions. The charter §3.6 explicitly states membership interests are freely transferable.

**§17-32-121 (Smart contracts as governing instruments).** The GovernorContract deployed at [CONTRACT_ADDRESS] on [CHAIN] is the authoritative governing instrument. The founding charter (human-readable precursor) defers to the on-chain contract where they conflict (charter §1.5, §4.1, §10.3).

**§17-32-120 (Voting requirements).** Default majority implemented in GovernorContract. Supermajority (2/3) for constitutional matters implemented via `proposalType = CONSTITUTIONAL` with elevated quorum and threshold checks.

**§17-32-124(e) (No member list requirement).** The system collects no off-chain member data. On-chain token holdings are the authoritative membership record. The DUNA has no obligation to maintain a human-readable membership list.

**§17-32-104 (Nonprofit operation).** No profit distribution mechanism exists in any contract. Governance compensation is implemented as [GOV_TOKEN] rewards from the treasury reserve (not profit distribution). Prize pool distributions are to tournament participants (not members as members). The nonprofit restriction is structurally enforced by the absence of any dividend or profit distribution function.

**§17-32-123 (Administrators).** The optional administrator structure in the charter is not currently implemented as a smart contract function — administrators, if designated by member vote, hold operational authority off-chain under service agreements, not on-chain authority over the governance contracts.

**§17-32-117 / §17-32-118 (No fiduciary duty; membership not agency).** These are charter provisions without direct on-chain implementation. They govern legal interpretation of member actions, not contract logic.

---

*Document status: Draft v0.1 — for Dianoia implementation review and the DUNA's legal counsel legal review*
*Next step: Resolve [ERC8004_REGISTRY_ADDRESS] and [GOV_TOKEN_INITIAL_SUPPLY] before Dianoia begins contract development*
*Parent project: P446 — Agent Olympiad DUNA Formation*
