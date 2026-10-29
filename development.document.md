# Development Document: Lottery Events

| Field          | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| Owner          | Unknown — confirmation required                                 |
| Reviewers      | Architecture, backend, product/rules, operations                |
| Status         | Draft — blocked by §12 questions 1–4 and 10                     |
| Target date    | Halloween launch: 2026-10-26 00:00 UTC+8 (2026-10-25T16:00:00Z) |
| Related ticket | Unknown — confirmation required                                 |

## 1. Summary

Build configurable lottery events for MYMOT customers and backoffice staff. Customers can view eligible events and prizes, spend MOT Points to spin, receive one prize per attempt, and review previous wins. Staff can configure events and prizes, manage delivery, and resolve uncertain charges. The first event is Halloween 2026; its rules, odds, default prize, eligibility enforcement, and fulfillment dependencies must be confirmed before production activation.

## 2. Requirements

### Functional requirements

- Staff can create and update lottery events, prizes, eligibility rules, odds, stock, delivery methods, and activation windows.
- Customers see only active events and prizes for which they are eligible.
- A spin uses one attempt, or `spinMultiplier` attempts when enabled, and charges `motpointsForPerSpin × attempts` once.
- Every successful paid attempt produces exactly one prize. Unassigned probability resolves to an eligible default prize.
- Stock and attempt slots are reserved atomically before charging. A failed reservation must not charge the customer.
- Daily and total limits apply per customer and event. The Halloween daily window resets at 00:00 UTC+8.
- Concurrent spins cannot exceed limits or allocate the same finite-stock unit twice.
- Automatic, mail, and self-claim fulfillment are supported with auditable delivery states.
- Unknown charge outcomes are retained for manual resolution; support can confirm or release the spin.
- Staff can list winners and customer attempts; customers can list charged wins.
- All persisted records include `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`.

### Non-functional requirements

| Concern             | Requirement                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Correctness         | No paid attempt without a prize; no prize delivered for an uncharged spin; finite stock cannot go below zero.                         |
| Concurrency         | DynamoDB conditions and transactions protect stock, attempt slots, and state transitions.                                             |
| Idempotency         | Charge, resolution, queue publication, and reward delivery require stable operation keys.                                             |
| Auditability        | Preserve spin, draw, charge, delivery, actor, and failure details.                                                                    |
| Security            | Automatic rewards use a code allow-list; table data must never select an arbitrary Lambda. Admin routes require explicit permissions. |
| Localization        | Customer errors and visible reward information support English and Mongolian. Exact reward-field shape is unresolved.                 |
| Observability       | Structured logs include `lotteryId`, `spinId`, `userId`, and prize IDs; stuck work raises operational alerts.                         |
| Traffic and latency | Unknown — confirmation required before capacity and load-test acceptance criteria can be approved.                                    |
| Cost                | On-demand/allocated capacity and expected event volume are unknown. Index and filtered-read costs must be measured.                   |

### Out of scope for Halloween

- Deposit, withdrawal, VIP, and MOT Points balance filter sources.
- Automatic competition entry if its private API is not ready; staff may fulfill it manually.
- Automatic mail fulfillment if email delivery and voucher-code ownership are not ready; staff may fulfill it manually.

## 3. Risk Assessment

| Risk                                                                                               | Likelihood | Impact        | Mitigation/prevention                                                                                                                            | Owner                | Residual risk |
| -------------------------------------------------------------------------------------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------- |
| Odds, stock, and default prize are not confirmed before launch                                     | High       | High          | Product signs off values; seed and verify them in dev; block activation when missing                                                             | Product              | Medium        |
| Published rules say a gift is not guaranteed while design guarantees a prize                       | High       | High          | Align rules and product decision before activation                                                                                               | Product/legal        | Low           |
| Motpoints withdrawal or credit times out after succeeding                                          | Medium     | High          | Require idempotency keys and status lookup; otherwise route to `CHARGE_UNKNOWN`/manual review without blind retries                              | Motpoints owner      | Medium/High   |
| Delivery reads reward configuration after an admin changes it, altering an already-won reward      | Medium     | High          | Snapshot reward type, amount/competition ID, information, and delivery method on the win row; deliver only from the snapshot                     | Backend              | Low           |
| `userId-spunAt-index` reads unrelated lotteries then filters by `lotteryId`                        | Medium     | High at scale | Use a composite `userLotteryKey = userId#lotteryId` partition key for limit/history queries, or prove bounded volume with pagination and metrics | Backend/architecture | Low/Medium    |
| Event/prize queries use filter expressions and may paginate before enough matching items are found | Medium     | Medium        | Implement complete pagination; measure items read vs returned; redesign keys if candidate volume exceeds agreed limits                           | Backend              | Medium        |
| Default prize becomes unavailable during an active event                                           | Low        | High          | Enforce invariant on every relevant admin mutation and again before reserve; alert and reject spin before charge                                 | Backend              | Low           |
| Queue publication is lost after charge confirmation                                                | Medium     | High          | Reconcile `PENDING` deliveries and publish with stable deduplication ID                                                                          | Backend/operations   | Low           |
| Shared tables are changed incompatibly by one stack                                                | Medium     | High          | Shared Zod contracts, deployment order, contract tests, and backward-compatible migrations                                                       | Backend              | Medium        |
| Launch date is close relative to unresolved dependencies                                           | High       | High          | Resolve blocking questions first; assign owners/dates; cut optional fulfillment modes from Halloween scope                                       | Engineering lead     | Medium        |

High-impact risks block approval until they have named owners and due dates. Required mitigations appear in the delivery plan.

## 4. Current State

The repository patterns referenced by the source plan include separate admin/client Serverless stacks, shared schemas, DynamoDB naming helpers, authorizers, Motpoints withdrawal, and notification Lambdas. The source code and linked files (`CLAUDE.md`, Halloween rules, and `lottery-diagrams.md`) were not supplied with this document, so repository-specific claims remain subject to code review.

No lottery stacks or tables are stated to exist yet. The Halloween event is the first planned event.

## 5. Proposed Design

### Request and data flow

1. Client loads active events and eligible prizes.
2. Spin service validates event state, customer eligibility, limits, and guaranteed default prize.
3. Service calculates draws using integer basis points.
4. One DynamoDB transaction reserves finite stock and creates one `RESERVED` row per attempt using deterministic daily-slot IDs.
5. Service calls Motpoints withdrawal once with `lottery-spin:{spinId}` as the idempotency key.
6. A definite success atomically moves all rows to `CHARGED`; a definite refusal releases stock and slots; an unknown result becomes `CHARGE_UNKNOWN`.
7. Charged prizes are queued for delivery. Self-claim prizes move to `AWAITING_CLAIM`.
8. Reconciliation detects stuck spins and deliveries and alerts operations.

### Technologies

| Technology                                  | Purpose                                                     | Why selected                                                          |
| ------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| TypeScript + Zod                            | Shared records, requests, responses, and runtime validation | Existing repository convention; keeps both stacks on one contract     |
| AWS Lambda/Serverless                       | Admin, client, delivery, and reconciliation functions       | Matches referenced stack architecture                                 |
| DynamoDB transactions                       | Reserve stock/slots and transition spin rows atomically     | Conditional writes handle concurrent spins without a global lock      |
| SQS FIFO + DLQ                              | Asynchronous prize delivery                                 | Stable per-prize deduplication and failure isolation                  |
| EventBridge schedule                        | Reconcile stuck states every 15 minutes in production       | Recovers lost enqueue and surfaces unknown outcomes                   |
| Existing Motpoints and notification Lambdas | Charge/credit and notify users                              | Reuses platform capabilities; idempotency contracts must be confirmed |

### Affected codebases

| Codebase/service                     | Planned change                                                     | Why affected                                            |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------- |
| `packages/schemas`                   | Lottery constants, Zod records, API contracts                      | Shared contract for both stacks                         |
| `admin-lottery`                      | Tables, event/prize CRUD, winner management, spin resolution       | Owns configuration and operational workflows            |
| `client-lottery`                     | Customer reads, spin orchestration, delivery queue, reconciliation | Owns customer-facing execution                          |
| Root locales                         | English and Mongolian lottery messages                             | Customer-facing validation and errors                   |
| Permissions documentation/admin auth | Add `lottery:*` permissions                                        | Protect admin endpoints                                 |
| Deployment workflows/environments    | Add both stacks and IAM access                                     | Required for staged deployment                          |
| Motpoints service                    | Confirm withdrawal/credit idempotency and lookup behavior          | Financial correctness dependency; no change assumed yet |
| Notification service                 | Register win-notification keys                                     | Customer communication                                  |

### Architecture diagram

- Editable draw.io source: Unknown — the source references `lottery-diagrams.md`, not an attached `.drawio` file.
- Exported preview: Unknown — confirmation required.

Required diagram flow: MYMOT → client API → lottery service → DynamoDB transaction → Motpoints; then lottery service → SQS FIFO → delivery consumer → reward provider/notification. Backoffice → admin API → shared lottery tables. EventBridge → reconciliation → shared tables/alerts.

## 6. Data Design

### Access patterns

| Operation                            | Key condition                                                         | Expected result                 | Consistency/notes                                                                       |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Get event                            | `lotteryId = :id`                                                     | One config                      | Strong read where activation invariants matter                                          |
| List active events                   | `status = ACTIVE AND startDate <= :now`                               | Small event list                | Filter `endDate`; paginate fully                                                        |
| List event prizes                    | `status/distributionMode` plus event membership                       | Tens of prizes                  | Current plan filters `contains(availableEvents, lotteryId)`; monitor read amplification |
| Count user attempts for event/window | Recommended: `userLotteryKey = userId#lotteryId AND spunAt >= :start` | Attempt rows and occupied slots | Avoid filtering all lotteries for one user; paginate fully                              |
| List user wins                       | Same composite user/event key, or user-only history endpoint          | Charged rows newest first       | Separate event-scoped limit query from cross-event history if needed                    |
| List event winners                   | `lotteryId = :id` ordered by `spunAt`                                 | Paginated wins                  | Filter/return only `CHARGED` rows unless support requests all states                    |
| Load spin                            | `spinId = :id`                                                        | All attempt rows for one spin   | Used for reconciliation and manual resolution                                           |
| Reconcile spin state                 | `spinStatus = :state AND spunAt < :cutoff`                            | Stuck rows                      | Sparse/status GSI; group by `spinId`                                                    |
| Reconcile delivery                   | `prizeDeliveryStatus = :state AND spunAt < :cutoff`                   | Stuck deliveries                | Sparse GSI                                                                              |

### Tables and indexes

| Table                                   | Primary key          | Required indexes                                                                                                                                            | Purpose                                                    |
| --------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `{stage}-cfd-bonus-lottery-configs`     | `lotteryId`          | `status-startDate-index`                                                                                                                                    | Event configuration and active-event discovery             |
| `{stage}-cfd-bonus-lottery-prizes`      | `lotteryPrizeId`     | Current: `status-distributionMode-index`; reassess event-centric key                                                                                        | Prize configuration and draw candidates                    |
| `{stage}-cfd-bonus-lottery-user-prizes` | `userLotteryPrizeId` | `userLotteryKey-spunAt-index` (recommended), `lotteryId-spunAt-index`, `spinId-spunAt-index`, `spinStatus-spunAt-index`, `prizeDeliveryStatus-spunAt-index` | Attempt audit, limit enforcement, wins, delivery, recovery |

`userLotteryPrizeId` is UUID v5 of `lotteryId:userId:dailyWindowStartedAt:dailyAttemptSlot` while an attempt occupies a slot. A released attempt is moved to a UUID v4 row without `dailyAttemptSlot`, preserving audit history while freeing the deterministic slot.

Every win row must snapshot all fulfillment-critical values, including:

- `lotteryPrizeId`, `prizeName`, and `isDefaultPrize`
- `prizeDeliveryMethod` and `automaticRewardType`
- `rewardMotpointsAmount` or `rewardCompetitionId`
- localized reward information once its shape is decided
- `motpointsCharged`, `drawResults`, and relevant event identity

Delivery must use this immutable snapshot, not the current prize configuration.

### Important schema invariants

- `endDate` is null or greater than `startDate`.
- `spinMultiplier <= userDailyLimit`; maximum multiplier is 30.
- `userTotalLimit` is null or at least `userDailyLimit`.
- Stored percentages are 0–100 with at most two decimals; draws use 0–10,000 integer basis points.
- Worst-case lottery odds, including all advantages a customer may match, cannot exceed 100%.
- Activating an event requires an unlimited, universally eligible, full-window default prize.
- Automatic delivery requires exactly the fields for its allow-listed reward type.
- Delivery status is absent until charge confirmation and is never added to released attempts.
- State updates use conditional expressions with the expected prior state.

Full Zod definitions should remain in the source schema package rather than being duplicated in this decision document.

### Capacity and growth limits

- Exact event traffic, customer count, and retention are unknown.
- `spinMultiplier <= 30` keeps the worst-case release transaction below DynamoDB's 100-item limit (`2n` attempt operations plus up to `n` stock updates).
- Define retention/archival for attempt history before launch; no TTL should remove unresolved charge or delivery records.
- Add metrics for DynamoDB consumed capacity, throttles, transaction conflicts, items read/returned, and GSI pagination.

## 7. Alternatives Considered

| Option                                                                         | Advantages                                                                               | Disadvantages                                                                                     | Decision                                                                       |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Attempt rows are the source of truth; deterministic daily slots enforce limits | One audit record per attempt; no counter drift; transactionally reserves stock and slots | More complex release; limit query needs a correct event-scoped index                              | Selected, with composite user/event GSI                                        |
| Separate atomic counter per user/event/window                                  | Cheap strongly consistent limit check                                                    | Counter and attempt history can diverge unless included in every transaction; more recovery logic | Rejected for initial design                                                    |
| Separate spin table plus attempt/win rows                                      | Cleaner spin-level charge state and one row per charge                                   | Additional table/entity and synchronization complexity                                            | Rejected unless operational queries become difficult with duplicated row state |
| Direct synchronous reward delivery during spin                                 | Immediate result                                                                         | Extends latency and failure surface; unknown outcomes can duplicate rewards                       | Rejected                                                                       |
| Store arbitrary callback Lambda names in prize data                            | Flexible configuration                                                                   | Privilege escalation and unreviewed code execution path                                           | Rejected; fixed reward enum selected                                           |
| Read live prize fields during delivery                                         | Smaller snapshot                                                                         | Admin edits can change an already-won reward                                                      | Rejected; immutable fulfillment snapshot selected                              |

### Assumptions and limits

- Each event has tens, not thousands, of configured prizes. Revisit event membership indexing if this changes.
- Mongolia remains UTC+8 without daylight-saving changes; use one named offset constant.
- DynamoDB transactions and Motpoints APIs meet launch throughput. This must be demonstrated by load/integration tests.
- Halloween does not require deferred eligibility sources.
- No production activation occurs until product/rules and idempotency blockers are resolved.

## 8. Failure Modes and Operations

| Failure                                 | Expected behavior                                                              | Detection                                   | Recovery/mitigation                                           |
| --------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------- |
| Finite stock race                       | Losing transaction redraws affected attempts; no charge yet                    | Transaction cancellation metric/log         | Retry up to three rounds, then use default prize              |
| Daily slot race                         | One transaction succeeds; loser receives conflict without charge               | Conditional failure tagged as slot conflict | Client retries with fresh availability                        |
| Definite insufficient balance           | Release stock/slots; retain failed audit rows                                  | Charge response and state metric            | Return localized error                                        |
| Withdrawal outcome unknown              | Do not retry blindly; mark whole spin `CHARGE_UNKNOWN`                         | Timeout/error plus reconciliation alert     | Support verifies Motpoints history, then confirms or releases |
| Lambda dies after reserve               | Old `RESERVED` rows become `CHARGE_UNKNOWN`                                    | 15-minute reconciliation                    | Manual verification via stable charge reference               |
| Charge confirmed but queue publish lost | Charged row remains `PENDING`                                                  | Reconcile `PENDING > 5m`                    | Re-enqueue with `userLotteryPrizeId` deduplication ID         |
| Delivery outcome unknown                | Keep `PROCESSING`; do not duplicate automatically without provider idempotency | `PROCESSING > 30m` alert                    | Provider lookup or manual resolution                          |
| Repeated delivery failure               | Message reaches DLQ                                                            | DLQ alarm/webhook                           | Operations replay after root cause is fixed                   |
| No valid default prize                  | Reject before reserve/charge and alert                                         | Invariant check and metric                  | Repair event/prize configuration                              |
| Odds exceed 100%                        | Reject configuration or spin before charge                                     | Validation/alert                            | Correct prize odds/advantages                                 |

All service and repository functions log with the shared logger, include relevant IDs, call `logErrorMessage(error, functionName)` in their catch block, and rethrow. Never log secrets or full customer profiles.

## 9. Testing and Rollout

- Unit tests: filter matching; UTC+8 windows; slot selection/reuse; odds and advantages; guaranteed defaults; sold-out redraws; state transitions; merged-update Zod rules.
- Statistical test: seeded 1,000,000-draw run within agreed tolerance; unassigned share always produces a default prize.
- Integration tests: reserve/charge/confirm, insufficient/release, unknown/manual resolution, lost enqueue/reconciliation, idempotent reward delivery, admin invariants.
- Concurrency test: parallel spins competing for one stock unit and the final daily/total attempt.
- Access-pattern test: force more than 1 MB of candidate data and verify complete pagination and limit correctness.
- Load test: target traffic is unknown; define it before approving production capacity.
- Deployment sequence: schemas → `admin-lottery` tables/API → seed inactive event/prizes → `client-lottery` → integration/load test → verify alarms → activate event.
- Rollback: set event `INACTIVE`; stop new spins; keep reconciliation and delivery active until all reserved/charged rows are resolved.
- Success metrics: spin success/failure by reason, transaction conflicts, `CHARGE_UNKNOWN`, delivery age/failure/DLQ, consumed capacity, items read/returned, and default-prize rate.

## 10. Delivery Plan

| Milestone                                  | Owner                     | Target                                      | Dependency                        | Completion criteria                                                 |
| ------------------------------------------ | ------------------------- | ------------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| Resolve launch blockers                    | Product + service owners  | Before implementation freeze                | Open questions 1–4 and 10         | Signed answers recorded in this document                            |
| Shared schemas/contracts                   | Backend                   | Unknown                                     | Confirmed requirements            | Contracts compile; invariant tests pass                             |
| Admin stack and tables                     | Backend                   | Unknown                                     | Schemas                           | CRUD, permissions, activation guards, and migrations tested         |
| Client reads and spin                      | Backend                   | Unknown                                     | Admin tables + Motpoints contract | End-to-end spin states and concurrency tests pass                   |
| Winner operations and resolution           | Backend/operations        | Unknown                                     | Spin state model                  | Support can inspect, confirm, and release uncertain spins           |
| Default automatic delivery + notifications | Backend + Motpoints owner | Before Halloween                            | Idempotent credit API             | Duplicate delivery test proves one reward                           |
| Reconciliation and alerts                  | Backend/operations        | Before Halloween                            | Indexes and alert channel         | Stuck-state drills produce actionable alerts                        |
| Optional competition/mail automation       | Backend + owners          | After Halloween if dependencies unavailable | Provider contracts                | Idempotent integrations pass                                        |
| Dev rehearsal and production readiness     | Team                      | Before 2026-10-25T16:00:00Z                 | All must-have milestones          | Seed verified; load/concurrency tests pass; rollback drill complete |

## 11. Design Review

Reviewers complete this section. Any score below 3 requires revision or an explicitly accepted exception.

| Area                    | Score (1–5) | Reviewer notes |
| ----------------------- | ----------: | -------------- |
| Requirement clarity     |             |                |
| Correctness             |             |                |
| Simplicity              |             |                |
| Performance/scalability |             |                |
| Reliability/operations  |             |                |
| Security/privacy        |             |                |
| Cost                    |             |                |
| Maintainability         |             |                |
| Testing/rollout safety  |             |                |

## 12. Open Questions

### Approval blockers

- [ ] Confirm odds, displayed odds, and quantity for all Halloween prizes — Product — due before implementation freeze.
- [ ] Confirm the default prize and unit economics; align published rules with “every attempt wins” — Product/legal — due before activation.
- [ ] Identify Motpoints credit API and confirm withdrawal/credit idempotency plus status lookup — Motpoints owner — due before delivery implementation.
- [ ] Confirm backend enforcement for KYC, age, and MYMOT-only participation — Product/security — due before API completion.
- [ ] Decide whether terms acceptance needs a persisted per-user/event record — Product/legal — due before schema freeze.
- [ ] Provide expected/peak traffic, retention, and latency targets — Product/architecture — due before load-test approval.

### Non-blocking or scope-dependent

- [ ] Confirm Airmarket voucher delivery method and voucher-code ownership.
- [ ] Define self-claim expiry.
- [ ] Identify Demo Masters competition and entry API owner.
- [ ] Identify owners for deferred filter attributes.
- [ ] Decide whether boosted odds are shown per customer.
- [ ] Choose localized reward-information schema.
- [ ] Attach editable draw.io architecture and exported preview.

## 13. Decision

| Field               | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| Decision            | Pending review                                                              |
| Approved by         |                                                                             |
| Decision date       |                                                                             |
| Required follow-ups | Resolve approval blockers and review the two recommended data-model changes |
