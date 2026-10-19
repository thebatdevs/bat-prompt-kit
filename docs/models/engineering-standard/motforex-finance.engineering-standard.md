# Motforex Finance Serverless Monorepo — Engineering Standard

- Status: populated reference for reuse; inferred conventions require maintainer review before activation.
- Owner: finance backend maintainers; designated approver not recorded in the repository.
- Version: 1.0.0-draft
- Reviewed: 2026-10-19
- Scope: `motforex-finance-serverless-monorepo-v2`, its backend stacks and shared packages.
- Source revision: `032fdc803db2ceb4109e5574b1f391f3cf36d05e` (clean working tree at inspection).

This document was populated from local source, manifests, configuration, domain documentation, and representative
withdrawal and internal-transfer flows. Paths below are relative to the source monorepo, not the repository storing this
reference. It is a source review, not a production audit or proof that existing checks pass.

**Evidence labels:** “Observed” describes existing behavior. “Recommended” proposes a default for future work and is not
evidence of an approved company policy. Unqualified instructions preserve observed contracts or apply the original
template's agent workflow. Known inconsistencies are recorded in section 12 rather than endorsed as patterns. To reuse
in another project, replace domain rules, package names, references, commands, and deployment settings with that
project's actual choices. This file is not an independently runnable starter.

## 1. Instructions for coding agents

- Read this standard and applicable repository instructions before implementing. No `AGENTS.md` was found in the
  inspected source tree or its ancestors. Recommended activation: link the adopted standard from a root `AGENTS.md`.
- MUST = required; SHOULD = default with justified exceptions; MAY = optional.
- Follow explicit task requirements and higher-priority instructions. Within engineering guidance, prefer approved
  project exceptions, this adopted standard, reviewed examples, then nearby implementations.
- Inspect `git status` and preserve unrelated changes. Inspect configuration, callers, schemas, tests, and the affected
  implementation before editing; do not spread known legacy defects.
- Identify task acceptance criteria, failure cases, affected stacks, and compatibility constraints before coding.
  Resolve minor reversible gaps using established patterns; ask about consequential business, security, monetary,
  state-transition, or external-contract decisions rather than inventing them.
- Verify the package name in its manifest before using a pnpm filter. Stack directory names are not always package
  names.
- Trace external effects before running tests or local handlers. “Offline,” a development stage, or a mock-test filename
  does not by itself guarantee isolation from real AWS, MT5, banking, or queue integrations.
- Report contradictions with the adopted standard. Do not silently migrate tooling, authorization, currencies, or
  storage.

## 2. Project and domain context

- Purpose/users: finance backend for client deposits, withdrawals, internal trading-account transfers, merchant
  payments, bank transaction processing, administrative configuration, reporting, and security/audit access.
- Boundaries: this repository orchestrates finance operations; account information, MT5 operations, permissions,
  restrictions, and other functions also live behind external Lambdas/APIs. Do not assume those implementations are
  local.
- Main HTTP flow: Serverless route definition → Cognito authorizer → shared HTTP wrapper → identity extraction and Zod
  parsing → domain service → repository/external integration → public-safe response mapping.
- Execution flow: task/scheduled/queue handler → service validation → conditional claim/state update → external money
  operation → checkpoint/status persistence → notification/reconciliation handling.
- Vocabulary: `requestedAmount`, `chargeAmount`, `amountWithCommission`, account-native currency, payment method,
  allowance, balance/credit hold, request status, partner reference, execution ticket. Preserve each schema's exact
  meaning; similarly named amounts are not interchangeable across operations.
- Invariants: enforce ownership and eligibility before effects; preserve commission semantics; update status-derived
  search keys with status; retain update history; protect state transitions with DynamoDB conditions.
- USD/USC: internal-transfer public requests, commissions, search keys, and notifications remain USD. Live USC balances,
  credit, equity, margin, free margin, and profit are native units; one USD equals 100 USC. Convert sender debit and
  recipient deposit independently. Do not multiply existing native credit again. Missing account currency defaults to
  USD in the shared converter; unsupported account currencies are rejected.
- Example: a USD 10 transfer plus USD 1 fee debits USC 1,100 from a USC sender; the recipient receives USD 10 or USC
  1,000.
- Creation does not reserve internal-transfer funds. Execution obtains fresh account information and revalidates. A
  conditional claim protects one request ID, not all requests sharing a sender. Unknown/partial external outcomes
  require reconciliation before replay.
- Withdrawal creation currently initializes holds to `NONE` and zero with hold permissions disabled. Preserve that
  behavior unless the task explicitly changes it; do not infer a reservation from request acceptance.
- Actors: clients act on their authenticated identity and owned resources; administrators additionally require
  operation-specific permission checks. Cognito authentication alone is not resource or admin authorization.
- Domain sources: `docs/internal-transfer-cent-accounts.md`, `docs/client-internal-transfer-cent-validation-plan.md`,
  `docs/internal-transfer-amount-scaling-implementation-plan.md`,
  `docs/v2-account-group-deposit-bonus-implementation-guide.md`, and `docs/permission.md`. Plans are supporting context;
  verify current implementation before treating planned behavior as active.

## 3. Selected technology stack

| Concern                    | Observed selection                                                               | Authoritative configuration / constraints                                                                       |
| -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Language/runtime           | TypeScript 5.6.3; mixed Lambda Node.js 22/24                                     | Root `package.json`; each `stacks/*/serverless.ts`; root Node engine is only `>=18`                             |
| Package manager/workspaces | Root `pnpm@12.9.1`; `stacks/*`, `packages/*`; Turbo `^2.11.7`                    | Root manifest, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`; nested manifests contain pnpm 10 versions |
| Framework/routing          | Serverless Framework v4, API Gateway HTTP event definitions, Middy               | Per-stack `serverless.ts`, `src/functions/**/index.ts`; `packages/libs/src/functions/`                          |
| Build/format/lint/types    | `tsc --build`, Prettier 3, ESLint 9/typescript-eslint where configured           | `.prettierrc`, `packages/ts-configs/base.json`, per-workspace manifests and configs                             |
| Validation/contracts       | Zod 4, schema-derived TypeScript types                                           | `packages/schemas/src/`; local types under `src/types/`                                                         |
| Database                   | DynamoDB, AWS SDK v3 DocumentClient, `dynamo-command-builder`                    | Per-stack `src/repository/dynamo-client.ts` and entity repositories                                             |
| Auth                       | Cognito route authorizer, shared metadata extraction, external permission Lambda | `packages/libs/src/functions/`, `packages/libs/src/custom/verification.ts`                                      |
| Tests                      | Vitest, Node environment, tsconfig paths plugin                                  | Stack `vitest.config.ts`, `test/setup.ts`, manifests; coverage configuration varies                             |
| Infrastructure             | Per-stack Serverless TypeScript config; offline/prune plugins                    | `stacks/*/serverless.ts`, `env.ts`, `scripts/deploy.sh`                                                         |
| Logging                    | Winston plus existing console-based integration logging                          | `packages/libs/src/utility/winston.ts`; no uniform metrics/tracing contract established by this review          |

- Reuse `@motforex-finance/libs` for HTTP wrappers, errors, required environment values, amount conversion, and logging.
- Reuse `@motforex-finance/schemas` for shared schemas, inferred types, constants, and public-safe projections.
- Reuse `@motforex-finance/aws-lambda`, `aws-sqs`, `aws-s3`, `aws-ssm`, `axios`, `web-api`, `manager-api-v2`,
  `merchant-service`, and `shared-utility` packages for their existing integration responsibilities.
- Internal dependencies use `workspace:*`; inspect the target manifest's dependencies/peers before adding imports.
- No dependency approval or deprecation policy was established by the inspected files. Recommended: prefer existing
  utilities, justify additions, and change the lockfile only when dependencies actually change.

## 4. Structure and architecture

```text
packages/
  schemas/src/             # Shared schemas, inferred types, constants
  libs/src/                # Handler factories, errors, utility/domain helpers
  lambda/src/              # Lambda invocation wrapper
  axios/src/               # HTTP wrappers
  web-api/src/             # External account/trading integrations
  manager-api-v2/src/      # Manager integration
  s3/, sqs/, ssm/          # AWS integration wrappers
  merchant-service/, openai/, shared-utility/, ts-configs/
stacks/<stack>/
  serverless.ts            # Provider, function registration, deployment settings
  env.ts                   # Deployment configuration validation where present
  src/functions/           # API/task/event adapters and function definitions
  src/services/<feature>/  # Domain orchestration and feature helpers
  src/repository/          # Dynamo client and entity persistence functions
  src/types/, src/constants/
  test/                    # Stack tests and setup
  scripts/                 # Deployment/helper scripts
docs/, postman/, locales/, prompts/
```

- Observed direction: function adapter → service → repository/shared integration. Services may compose other services.
  Shared packages expose public `src/index.ts` entrypoints. Do not import another stack's private source as a shortcut.
- Handlers parse request data, extract identity, enforce route permissions, delegate, and return domain output. Services
  own eligibility, calculations, workflow, external operation ordering, and status decisions. Repositories own keys,
  queries, conditions, projections, and persistence mapping.
- AWS clients are commonly module-scoped; table names are often resolved at module initialization. Tests need
  environment setup before importing these modules. Function-based composition and module mocks are the existing test
  seams; there is no observed repository-wide DI container requirement.
- Use `@/*` for stack-local `src/*` where configured; workspace package names for shared code; relative imports locally.
  Existing `index.ts` barrels group features. Follow nearby export conventions without creating circular imports.
- Use kebab-case files such as `withdraw-request-create.ts`, `withdraw-request.types.ts`, and
  `withdraw-request-cancel.mock.test.ts`. Keep stack-specific business logic in its owning stack; extract genuinely
  shared contracts/utilities into the appropriate package.

## 5. Coding behavior: implementation decisions

| Decision             | Observed default / recommended exception                                                                | Exact reference                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Functions/classes    | Named functions for services/repositories; classes for errors                                           | `packages/libs/src/error/custom-error.ts`; withdrawal services                                           |
| Declarations/exports | `export async function` for services; exported `const` wrapped handlers; repository export lists        | `stacks/client-withdraw/src/functions/api/withdraw-request/handler.ts`; `src/repository/withdraw-otp.ts` |
| Parameters           | Both positional and object parameters exist; recommended named objects for many related values          | `createWithdrawOtp({ userId })`; `updateWithdrawOtpRecord(params)`                                       |
| Returns              | Explicit public return types; typed promises; nullable lookup results vary                              | OTP repository uses `null`; withdrawal request repository uses `undefined`                               |
| Types                | Schema-first `z.infer`, `type` aliases, `import type` used but not universal                            | `packages/schemas/src/stacks/withdraw-otp.types.ts`                                                      |
| Naming               | Verb/entity names, `is`/`has` flags, uppercase constants; schema suffixes `Sch` and `Schema` both exist | `createWithdrawRequestByUserRequest`, `WITHDRAW_OTP_STATUS_PENDING`                                      |
| Control flow         | Guards and `CustomError`; orchestration split into feature helpers                                      | `withdraw-request-create.ts`, `account-currency.ts`                                                      |
| Collections/mutation | Array transforms and explicit loops both used; no universal immutability rule observed                  | OTP repository pagination; withdrawal history construction                                               |
| Async work           | Await dependent operations; `Promise.all` for independent checks                                        | Suspicious-user and hedge checks in withdrawal creation                                                  |
| Abstraction          | Reuse shared wrappers; feature helpers for multi-step domain operations                                 | `packages/libs/src/functions/function-gateway.ts`                                                        |
| Configuration        | Stack `env.ts` plus `getRequiredEnvVar`; direct `process.env` still exists                              | `packages/libs/src/utility/env.ts`; `src/repository/dynamo-client.ts`                                    |
| Documentation        | JSDoc on exported domain functions, often describing process and failure behavior                       | `internal-transfer-execute-single.ts`; verify comments against code                                      |
| Formatting           | Semicolons, single quotes, 2 spaces, LF, ES5 trailing commas, width 120                                 | Root `.prettierrc`; ESLint per workspace                                                                 |

- Preserve strict compiler settings: `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noImplicitReturns`, and other options in the shared base config.
- Recommended: use `unknown` plus validation rather than introducing `any`, unchecked casts, or non-null assertions at
  trust boundaries. Existing casts in repositories/tests are not proof that data was runtime-validated.
- Prefer observable domain decisions: explicit amount units, intentional side-effect order, clear service boundaries,
  public-safe schemas, and conditional writes. Reasons are correctness, compatibility, and reviewability.
- Recommended rejected patterns: business rules in transport adapters → service functions; raw SDK duplication in
  services → existing repository/integration wrapper; magic currency scaling → shared converters; broad catch-and-ignore
  → propagate critical failures and explicitly identify documented best-effort effects.
- Generated artifacts: do not directly edit `dist/`, `.serverless/`, `.turbo/`, `*.tsbuildinfo`, or `node_modules/`.
  Regenerate via the owning build/tool. Change `pnpm-lock.yaml` through pnpm when dependency changes require it.

## 6. Validation, contracts, and error handling

- Parse untrusted API bodies, parameters, configuration, and external responses at their boundaries using the owning
  schemas. Shared schema/type contracts live under `packages/schemas/src`; feature-only types may remain local.
- Zod object strictness/coercion/defaults differ by schema. Preserve the actual schema behavior; do not apply global
  coercion or reject unknown fields across all endpoints without a compatibility decision.
- HTTP wrappers `createHttpHandler`, `createI18nHttpHandler`, and `createNoResponseHttpHandler` apply JSON parsing and
  shared response/error formatting. Export handlers with `HttpHandler<S>` where appropriate.
- `formatApiResponse` serializes the body and supplies CORS headers; default success is 200. Public failures generally
  use `{ message }`. Preserve endpoint-specific status codes, message keys, projections, and pagination contracts.
- Expected failures use `CustomError(message, statusCode, key?)`; Zod failures map to 400. Client-facing i18n handlers
  use established translation keys, including keys maintained under `locales/`. Unexpected failures map to a
  generic 500.
- `logErrorMessage` plus rethrow is common in services; outer wrappers also log. Recommended: avoid adding redundant
  catches that only repeat logs, and keep raw tokens, OTPs, secrets, and sensitive payloads out of logs.
- Repository lookup semantics are mixed: OTP returns `null`, withdrawal request returns `undefined`. Preserve the
  existing function contract; services decide when absence becomes a public not-found error.
- External calls: reuse wrappers; inspect both transport and application response status and validate returned data.
  `invokeLambdaFn` parses response bodies, but generic typing is not runtime schema validation. Its client is currently
  fixed to `ap-southeast-1`. The Axios wrapper has no universal timeout/retry policy; do not assume one exists.
- Recommended for new external effects: document timeout budget, cancellation if supported, bounded retry policy, and
  idempotency/reconciliation behavior. Do not automatically retry an uncertain money operation.
- Conditional creation by request ID prevents overwriting that ID; it does not establish end-to-end business
  idempotency.
- Observed exception: `executePostCreationSilently` catches Coinsbuy queue dispatch failures after withdrawal
  persistence. Creation may succeed with dispatch incomplete. Preserve this explicitly scoped behavior during unrelated
  work; do not generalize it to all payment execution or claim guaranteed delivery.

## 7. Persistence and consistency

### Shared

- DynamoDB is the observed local persistence pattern. No relational or MongoDB dependency pattern was found in the
  inspected workspace manifests; those template alternatives are omitted.
- Schemas define IDs and data shapes; IDs vary by entity. OTP uses `WITHDRAW_OTP#<uuid>`; request IDs may be allocated
  externally. Do not normalize ID types without tracing callers and stored keys.
- `createdAt`/`updatedAt` commonly use epoch milliseconds; `postDate` uses ISO strings; DynamoDB TTL uses epoch seconds.
  Business expiry is separate from eventual TTL cleanup.
- Money uses amount/currency objects and numeric helpers. Preserve each converter's positivity, range, rounding, and
  source/target-unit checks; no global decimal-library or universal rounding policy was established by this review.
- Request histories and derived keys are part of the write contract. Changes to status must update the corresponding
  status keys and audit fields through existing update services.
- Retention/deletion/backfill policy is not globally defined. Confirm entity requirements before destructive changes.

### DynamoDB

- Use `DynamoDBDocumentClient` from `@aws-sdk/lib-dynamodb` and native JavaScript item values at repository boundaries.
  `dynamo-command-builder` query descriptors may separately declare key types; do not confuse these descriptors with
  low-level AttributeValue-encoded item payloads.
- Use the stack's `src/repository/dynamo-client.ts` and entity functions. Table environment-variable constants live in
  `packages/schemas/src/constants/dynamo-table.constants.ts`; actual bindings are in the stack's Serverless config.
- Preserve exact entity primary keys and GSI attributes; there is no universal PK/SK single-table layout. Example OTP
  GSI: `userIdStatusSearchKey-createdAt-index`, partition value `<userId>~<status>`.
- Prefer Query against a supported access pattern. Verify deployed index availability before introducing a new query; do
  not assume that adding an index string in code provisions it. Client-withdraw declares empty `resources`.
- Creation uses `attribute_not_exists(id)`. OTP updates use `attribute_exists(id) AND updatedAt = :previousUpdatedAt`.
  Withdrawal status changes use status conditions; the inspected helper has timestamp locking commented out.
- Cursor contracts use `LastEvaluatedKey`/`lastEvaluatedKey`; one request repository emits `{}` at completion while the
  OTP repository omits the cursor. Respect the owning contract and stop pagination correctly.
- Recommended for new queries: bounded page sizes and explicit order/projections. The existing OTP latest-record lookup
  reads all matching pages then sorts; treat that as a performance limitation, not a required pattern.
- Do not claim cross-system atomicity between DynamoDB checkpoints and MT5 operations. Transfer execution records
  checkpoints, but a timeout may leave external outcome unknown. Reconcile trading history and worker state first.
- No repository-wide batch retry, consistency-level, or migration tooling standard was established. Specify these per
  feature when needed rather than inventing a universal implementation.

## 8. Security and operational behavior

- API Gateway Cognito authorizers authenticate protected routes. Shared metadata extractors use `jwt.decode`, not
  signature verification; they rely on that upstream boundary and must not be treated as standalone token verifiers.
- Services enforce resource ownership, account eligibility, KYC/restrictions, and allowed states before side effects.
  Admin handlers use `verifyPermission` for operation-specific permissions; consult `docs/permission.md` and verify
  code.
- Recommended new admin endpoints enforce the chosen permission in every stage. Existing missing/stage-gated checks are
  recorded gaps, not patterns to copy. Changes to legacy enforcement need explicit scope and regression coverage.
- Secrets are referenced through environment/SSM configuration; never copy live `.env` contents, token values, bank
  credentials, or secrets into this standard, tests, responses, or logs.
- OTP: cryptographic generation, stored hash, business expiry, TTL cleanup, conditional updates, and a public schema
  omitting `otpHash`. These are useful primitives; this review does not establish that an entire OTP
  delivery/verification workflow is implemented or race-free.
- Logging: reuse Winston and existing audit helpers; preserve actor/request identifiers and relevant status transitions.
  Recommended additions redact sensitive data and distinguish diagnostic logs from business audit records.
- Operational limits are stack-specific. Client-withdraw currently sets 29 seconds, 512 MB, arm64, provider log
  retention 365 days, and API usage-plan rate/burst settings. These are configuration observations, not universal
  service guarantees.
- Region, IAM role, VPC, runtime, stage, resources, and external targets must be inspected per stack. Several configs
  have production defaults or fixed production Lambda/table names. A `dev` stage does not prove environment separation.
- Metrics, alarms, health checks, tracing, and organization-wide retention/encryption policies are not fully specified
  by this review. Confirm requirements when changing an operational path; do not claim observability coverage exists.

## 9. Testing and verification commands

- Test observable business outcomes and failure paths; use existing mock/integration separation under `test/`. Cover
  ownership, invalid inputs, conditions/conflicts, unit conversion, and uncertain external outcomes as applicable.
- Useful behavior-focused reference:
  `stacks/client-withdraw/test/service/withdraw-request/account-margin-currency.mock.test.ts`. Existing orchestration
  tests also use `vi.mock` and `vi.mocked`; reproduce useful failure coverage rather than every internal call assertion.
  Use synthetic identities instead of copying existing personal data from fixtures.
- Integration files may access real services and mutate data. Inspect imports, setup, configuration, and targets first.
  Client-withdraw's test script sets `DOTENV_CONFIG_PATH=.env.test`, but `test/setup.ts` explicitly loads `.env` with
  `override: true`. Do not assume that script selects isolated credentials.
- Make new tests deterministic with controlled clocks/IDs, bounded fixtures, mock cleanup, and explicit service seams.
  Node/Vitest with `globals: false`, tsconfig path support, and mock reset is configured in client-withdraw.
- No root test script or Turbo test task exists. Run the affected stack's runner explicitly and use `run` to avoid
  watch.

Commands below run from the source monorepo root. They were checked against manifests/configuration, not executed as
part of this documentation-only review. Install needs registry access and may run the configured Husky prepare script.
Offline development needs deployment environment values and can still invoke configured real integrations.

| Operation                      | Exact command                                                                                                              | Prerequisites / scope                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Install                        | `pnpm install --frozen-lockfile`                                                                                           | Resolve root/nested pnpm version inconsistency if installation fails; do not silently rewrite lockfile |
| Develop withdrawal stack       | `pnpm --filter client-withdraw dev`                                                                                        | Stack configuration and reviewed external targets; offline ports 3008/3108 in current config           |
| Root format check              | `pnpm run format:check`                                                                                                    | Runs only scripts declared in participating workspaces                                                 |
| Withdrawal lint                | `pnpm --filter client-withdraw lint`                                                                                       | ESLint config and installed dependencies                                                               |
| Withdrawal typecheck           | `pnpm --filter client-withdraw type-check`                                                                                 | Includes stack source, tests, and configuration                                                        |
| Root typecheck, uncached       | `pnpm run type-check:fresh`                                                                                                | Broad verification when shared contracts change                                                        |
| Targeted withdrawal test       | `pnpm --filter client-withdraw exec vitest run test/service/withdraw-request/account-margin-currency.mock.test.ts`         | Inspect environment setup/import effects first                                                         |
| Transfer currency regression   | `pnpm --filter admin-internal-transfer exec vitest run test/service/internal-transfer/internal-transfer-cent.mock.test.ts` | Inspect setup and mocked external seams first                                                          |
| Withdrawal integration example | `pnpm --filter client-withdraw exec vitest run test/service/withdraw-request/withdraw-request-get.integration.test.ts`     | Dedicated validated test resources and credentials; inspect test before execution                      |
| Root lint, uncached            | `pnpm run lint:fresh`                                                                                                      | Only workspaces with lint scripts participate                                                          |
| Build dependency graph         | `pnpm run build:fresh`                                                                                                     | Turbo dependency-ordered TypeScript builds; does not deploy                                            |
| Generate/migrate locally       | No uniform command exists                                                                                                  | Use the owning feature's documented process; do not invent a migration script                          |

Checks by change: documentation → references and Markdown; service logic → targeted tests, affected lint/typecheck;
shared schemas/utilities → consuming stacks plus relevant regressions and broader typecheck/build; persistence →
conditions/query semantics in isolated integration tests; infrastructure → inspect explicit stage/targets and packaging
requirements. Do not deploy as a verification shortcut.

Root `.husky/pre-commit` runs formatting fixes, lint, typecheck, and build; it does not run tests. Stack `format:check`
commonly checks only `src/**/*.ts`, so it does not verify every changed test/config/document. Never claim a check passed
unless it ran successfully; report exact scope and blockers.

## 10. Reference examples: the engineer's coding fingerprint

These are reviewed source references from this analysis, not a claim of formal maintainer approval. Read their current
implementation and apply the limitations in section 12. Paths must exist in the adopting project or be replaced with
accessible pinned examples.

| Pattern                       | Exact path + symbol                                                                                                                           | Decisions to reproduce                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Complete HTTP feature         | `stacks/client-withdraw/src/functions/api/withdraw-request/index.ts`: `APIS_WITHDRAW_REQUEST`; adjacent `handler.ts`: `createWithdrawRequest` | Route/authorizer registration, wrapper, identity extraction, schema parsing, service delegation |
| Domain orchestration          | `stacks/client-withdraw/src/services/withdraw-request/withdraw-request-create.ts`: `createWithdrawRequestByUserRequest`                       | Ordered eligibility/calculation/persistence; explicitly scoped post-creation behavior           |
| Persistence                   | `stacks/client-withdraw/src/repository/withdraw-otp.ts`: `createWithdrawOtpRecord`, `updateWithdrawOtpRecord`                                 | Schema parsing, native DocumentClient values, conditional create, optimistic locking            |
| Public-safe schema            | `packages/schemas/src/stacks/withdraw-otp.types.ts`: `withdrawOtpPublicRecordSch`                                                             | Derive public projection by omitting internal hash                                              |
| Amount conversion             | `packages/libs/src/utility/account-currency.ts`: `convertUsdToAccountAmount`, `convertToAccountAmount`                                        | Explicit currency, finite/range validation, conversion at the appropriate boundary              |
| Error boundary                | `packages/libs/src/functions/function-gateway.ts`: `createI18nHttpHandler`; `packages/libs/src/error/error-handling.ts`                       | Shared transport/error mapping and safe unexpected-error response                               |
| Concurrent execution/recovery | `stacks/admin-internal-transfer/src/services/internal-transfer/internal-transfer-execute-single.ts`: `executeSingleTransferRequest`           | Conditional claim, fresh validation, checkpoints, uncertainty and reconciliation limits         |
| Behavioral test               | `stacks/client-withdraw/test/service/withdraw-request/account-margin-currency.mock.test.ts`                                                   | Parameterized USD/USC cases, threshold boundaries, invalid amount/currency rejection            |
| Cancellation tests            | `stacks/client-withdraw/test/service/withdraw-request/withdraw-request-cancel.mock.test.ts`                                                   | Success and propagated failures; preserve conditional transition behavior                       |

Scenario: debit a USC account from a USD request.

```ts
// Preferred: shared validation and an amount carrying its unit.
const senderDebit = convertUsdToAccountAmount(request.chargeAmount, senderAccount);
// Avoid: ad hoc multiplication without checking currency, finiteness, or recipient units.
const unsafeDebit = request.chargeAmount.amount * 100;
```

Reason: USD and USC accounts coexist; each account's live data and operation amount must use the same unit.

Scenario: change a workflow state.

```text
Preferred: read/validate → conditional state update through the owning service → record history/derived keys.
Avoid: unconditional repository update after a separate status read.
Reason: another worker can change the request between the read and the write.
```

## 11. Agent workflow and empty-project bootstrap

### Existing project

1. Inspect working-tree state, instructions, this standard, and the task's acceptance criteria.
2. Identify owning stack/package; trace the route/task through schema, service, repository, external calls, and callers.
3. Read relevant domain docs and tests. Confirm amount units, ownership, state transitions, stage, and external targets.
4. Plan proportionately; clarify consequential missing decisions. Preserve unrelated behavior and local work.
5. Implement a complete change through existing boundaries, including contract/history/search-key changes where needed.
6. Add meaningful regression coverage and run the relevant isolated checks. Inspect final diff for unintended edits.
7. Update affected docs, contracts, examples, Postman requests, or locale keys. Report result, checks, assumptions, and
   limits.

### Empty project / reuse elsewhere

The source README calls the repository a template, but it contains operational finance code and fixed infrastructure
references. It is not an approved generic starter. No separate pinned starter was established by this inspection.

1. Select runtime/package manager, framework, architecture, data model, auth, and external contracts for the new
   project. Remove Motforex-specific domain rules and targets unless explicitly required.
2. Use this source revision only as a reference; scaffold the chosen minimal stack and necessary shared packages.
3. Configure workspaces, strict TypeScript, formatting/linting, tests, environment validation, and isolated resources.
4. Build one named vertical slice with explicit acceptance criteria: authenticated request, validation, one business
   rule, conditional persistence if needed, public-safe response, and a meaningful success/failure test.
5. Add reproducible commands, synthetic fixtures, configuration examples without secrets, and reviewed runnable
   examples.
6. Verify install, targeted tests, types, and build. Adopt an `AGENTS.md` entrypoint linking the completed standard.
7. Leave unneeded integrations/layers out. Resolve consequential choices before activation; do not inherit production
   IDs.

## 12. Completion, exceptions, and maintenance

Completion requires the requested behavior, applicable contracts/rules, relevant passing checks, and updated supporting
context. Report **implementation complete; verification blocked** when checks cannot run; reserve **verified complete**
for successful verification of the relevant scope. This reference itself has not been adopted in the source repository.

| Observed gap / unresolved decision                            | Impact and handling                                                                                                                     | Owner / review                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Root pnpm 12.9.1 versus nested pnpm 10.24/10.28               | Reconcile supported version intentionally; do not rewrite tooling during unrelated work                                                 | Finance maintainers; next tooling change               |
| Root Node `>=18` versus Lambda Node 22/24                     | Per-stack runtime and esbuild target govern deployment; confirm local runtime compatibility                                             | Finance maintainers; next runtime change               |
| Permission gaps and stage-gated enforcement                   | `docs/permission.md` documents missing checks; review actual handlers before adoption                                                   | Security/finance maintainer to be designated           |
| Stage variable casing mismatch                                | Admin transfer handler checks `process.env.stage`; its Serverless config injects `STAGE`. Do not assume that guard enforces permissions | Finance maintainers; before security-sensitive changes |
| Mixed stage defaults and fixed production targets             | Development/offline execution may reach production resources; target separation needs explicit review                                   | Operations/finance maintainer to be designated         |
| Test setup overrides `.env.test` intent                       | `client-withdraw/test/setup.ts` loads `.env` with override; isolation is not established by script name                                 | Finance maintainers; before integration execution      |
| Queue dispatch after creation is swallowed                    | Persisted auto-processing request can outlive failed dispatch; no guaranteed-delivery mechanism established here                        | Finance maintainers; recovery design review            |
| Cross-system money operations are not atomic                  | Conditional claim is per request, no sender-wide serialization; uncertain effects require reconciliation                                | Finance/operations; before replay                      |
| Mixed lookup/cursor contracts and locking                     | OTP and withdrawal repositories differ; withdrawal helper has timestamp check commented out                                             | Owning feature maintainers; affected change            |
| Comments can be stale                                         | Cancellation JSDoc says PENDING, while code accepts PENDING/HALTED; creation handler mentions an older function name                    | Owning feature maintainers; touched-file review        |
| No root test task; uneven lint/format coverage                | Use explicit affected-stack commands; hook success is not test evidence                                                                 | Finance maintainers; tooling review                    |
| No universal retry/retention/migration/telemetry policy found | Clarify when required by the task; do not invent a blanket policy                                                                       | Appropriate maintainer; feature design                 |
| Formal approval and named standard owner absent               | This is an evidence-backed draft; maintainer selects enforceable defaults and resolves gaps                                             | Designated approver still to be assigned               |

Do not convert every existing pattern into a mandatory rule. Update this standard when approved behavior changes; retain
source revision/review date and validate referenced files/commands. When adopting elsewhere, replace these exceptions
with that project's decisions rather than carrying Motforex's gaps forward.
