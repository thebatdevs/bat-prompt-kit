# TypeScript Serverless Monorepo — Engineering Standard

Version: 2.1.0

Applies to backend TypeScript/Node.js monorepos using AWS Lambda, API Gateway, Serverless Framework, and pnpm. DynamoDB
rules apply only when used. Existing repository configuration and documented exceptions determine actual versions,
paths, commands, and compatible conventions. Adoption does not authorize unrelated migrations.

MUST = required. SHOULD = default with a justified exception. MAY = optional.

## 1. Agent workflow

1. Read repository instructions, this standard, and relevant project context. Inspect the working tree; preserve
   unrelated work.
2. Identify acceptance criteria, failure cases, affected layers, callers, contracts, tests, and external effects.
3. Inspect actual configuration and approved examples. Clarify consequential missing business, security, or
   data-integrity decisions; resolve minor reversible gaps using established patterns.
4. Implement the smallest complete change. Avoid unrelated cleanup, speculative abstractions, and unnecessary
   dependencies.
5. Verify relevant behavior, inspect the final diff, and update affected contracts/documentation.
6. Report outcome, checks actually run, material assumptions, and blockers. Never claim an unrun check passed.

## 2. Repository context

Maintain a short project profile linked from `AGENTS.md`, containing:

- Purpose, ownership, domain vocabulary, actors, permissions, tenant boundaries, and critical invariants.
- Main request/event flows, allowed state transitions, external systems, and sources of truth.
- Data semantics: IDs, units, precision/rounding, timestamps, expiry, retention, and deletion.
- Authoritative configuration paths, actual workspace names, exact verification commands and prerequisites.
- Approved feature/test references and documented exceptions with reason, owner, and review date.

Link existing authoritative files instead of duplicating their contents. Do not infer implemented behavior from plans or
names. Request acceptance does not imply reservation, execution, or delivery unless explicitly guaranteed.

## 3. Stack and tooling

- MUST use versions and scripts declared by manifests, lockfiles, runtime/compiler/bundler settings, and deployment
  config. Flag conflicts rather than silently rewriting tooling.
- MUST retain strict TypeScript. Do not weaken checks to bypass an error; use `unknown` and narrowing at trust
  boundaries.
- SHOULD reuse shared schemas, errors, logging, environment access, AWS clients, and integration wrappers.
- MUST declare workspace dependencies and use public exports. Justify new dependencies; update lockfiles through pnpm.
- SHOULD enforce mechanical rules with formatter, TypeScript, and ESLint: formatting, imports, unused code, promise
  handling, and selected JSDoc requirements. Mentioning a tool here does not require installing it during unrelated
  work.
- MUST regenerate generated files through their owning tool; do not edit dependencies, build output, or caches directly.

## 4. Architecture

Default direction: **handler → service → repository/integration**. Map these responsibilities to existing project paths.

- **Handler:** transport parsing, trusted identity extraction, route permissions, delegation, response mapping.
- **Service:** business rules, eligibility, calculations, workflow/state decisions, integration ordering.
- **Repository:** keys, queries, persistence mapping, conditions, transactions, pagination.
- **Shared package:** reusable contracts or utilities; MUST NOT import a stack's private implementation.

For new projects, use `stacks/<stack>/src/{functions,services,repository}` and necessary shared packages under
`packages/`. Create only needed layers. Use kebab-case files, feature-oriented services, configured aliases, and public
package imports. Avoid cycles and cross-stack private imports. Reuse SDK clients where appropriate; keep initialization
testable and identify environment values required before import.

## 5. How to write functions

- MUST give each function one responsibility and a clear input/output contract. Prefer named functions/exports,
  descriptive verb/entity names, early guards, and explicit return types for public application functions.
- SHOULD use object parameters for several related or ambiguous arguments; positional parameters suit simple signatures.
- SHOULD derive shared contract types from runtime schemas and use type-only imports where appropriate.
- MUST document absence semantics consistently per API. Keep storage records separate from public output when needed.
- SHOULD use readable loops/transforms, avoid hidden mutation of caller-owned inputs, and extract stable shared
  behavior.
- MUST await dependent effects in order. Parallelize only independent work with intentional failure behavior and bounded
  concurrency.
- MUST keep required environment validation outside business logic. Follow executable formatting configuration.

### Error handling

- MUST catch only to translate at an owned boundary, recover, clean up, or log a terminal failure. Otherwise propagate.
  Do not add catch-and-rethrow boilerplate or enforce a try/catch count per function.
- MUST assign one diagnostic logging owner per failure flow, normally the transport/worker boundary. Recovery incidents
  may be logged where handled; do not repeat the same failure at every layer. Business audit events are separate.
- MUST narrow `catch (error: unknown)`, preserve original errors when propagating, and preserve causes when translating.
- MUST keep critical failures observable. Document any best-effort suppression and its recovery/delivery guarantees.
- MUST await promises inside `try` when its catch must handle rejection. Use `finally` for necessary cleanup without
  masking the original failure. Extract distinct recovery into a helper when clearer; nested catches require a distinct
  purpose.
- SHOULD reuse existing HTTP/worker error wrappers instead of duplicating their handling in callbacks.

### JSDoc

- MUST document exported application APIs, business services, and integration/workflow operations.
- SHOULD briefly document private helpers with non-obvious constraints. Clear names/types suffice for obvious helpers
  and inline callbacks. Generated/vendor code and test-runner callbacks follow their owning conventions.
- Full structure: responsibility sentence → numbered `Process flow:` for multi-step behavior → `@param` descriptions in
  signature order → `@returns` with result/absence/effects → applicable `@throws` with conditions.
- Explain units, ownership, idempotency, concurrency, and partial effects when relevant. Do not duplicate TypeScript
  types, invent failures, or repeat obvious implementation steps. A trivial void completion needs no redundant return
  description.
- MUST update comments when behavior changes; do not expand untouched functions solely for documentation uniformity.

Illustrative service; types, repository, and validators are supplied by the adopting project. The caller's shared
transport boundary owns error mapping/logging, so this service needs no catch.

```ts
/**
 * Validates a create request against its payment method's rules.
 *
 * Process flow:
 * 1. Fetches the method and rejects a missing record.
 * 2. Validates the amount, currency, and required metadata.
 * 3. Returns the validated method.
 *
 * @param request - Method ID, requested amount, and metadata.
 * @returns The method after all request checks succeed.
 * @throws {CustomError} If the method is missing or request values violate its rules.
 * @throws {Error} If the method lookup fails.
 */
export async function validateCreateRequest(request: CreateRequest): Promise<PaymentMethod> {
  const method = await getPaymentMethodById(request.paymentMethodId);
  if (!method) throw new CustomError('paymentMethodNotFound', 404);

  validateAmountForPaymentMethod(request.amount, method);
  validateMetadataForPaymentMethod(request.metadata, method);
  return method;
}
```

## 6. Validation and contracts

- MUST validate untrusted requests, events, configuration, and important external responses at boundaries. Type
  assertions and generic response types are not runtime validation.
- MUST choose unknown-field handling, coercion, normalization, defaults, and limits intentionally; preserve existing
  status codes, error/message shapes, serialization, pagination, and localization unless changing the contract is in
  scope.
- MUST use typed expected failures and public-safe unexpected-error responses. Do not expose internal traces or secrets.
- Services decide when missing data becomes a domain failure; repositories preserve their documented absence convention.

## 7. Persistence and consistency

- MUST preserve identifiers, units, precision, audit history, and derived keys. Convert through shared tested helpers at
  documented boundaries rather than inserting magic multipliers.
- MUST protect state-dependent writes with conditions/transactions. A read followed by an unconditional write is not
  race-safe.
- MUST bound queries/batches and define ordering, cursor completion, retention, migration, and rollback when relevant.
- MUST document exclusion scope: claiming a request does not serialize all operations on the same account/resource.
- MUST distinguish database atomicity from external effects. Preserve checkpoints and reconcile unknown outcomes before
  replay.

When using DynamoDB:

- Use SDK v3 DocumentClient/native values unless the project selects the low-level API; keep conversion inside adapters.
- Record deployed keys/indexes/access patterns and provisioning ownership; application code does not provision an index.
- Prefer Query; justify bounded Scan use. Use conditional creates/updates; handle expected conflicts explicitly.
- Preserve the cursor contract, fetch only needed pages, retry unprocessed batch items within bounds, and account for
  index consistency. Business expiry MUST NOT rely on eventual TTL deletion.

## 8. External effects, security, and operations

- MUST authenticate at a trusted boundary and enforce resource ownership, tenant scope, and action permissions before
  effects. JWT decoding alone is not verification. Protected admin operations require permissions in every deployed
  environment unless a deliberate exception is documented.
- MUST keep secrets and sensitive data out of source, logs, fixtures, and public responses. Use approved secret storage,
  public-safe projections, structured logs, correlation IDs, and appropriate audit records.
- MUST inspect actual stage/account/resource bindings; development labels and offline emulation do not prove isolation.
- External adapters MUST define timeouts and bounded retries appropriate to the operation. Validate application
  outcomes, not only transport status. Specify idempotency key scope/lifetime and duplicate behavior where needed.
- MUST distinguish success, failure, and unknown external outcomes. Do not replay uncertain non-idempotent effects.
- Required delivery needs durable recovery; do not swallow dispatch failure and imply guaranteed delivery. Queue
  consumers define duplicate handling, ordering, per-message failures, and failed-message recovery; use partial-batch
  responses where appropriate.
- MUST select IAM, time budgets, resource limits, telemetry, alerts, and recovery ownership for the actual workload.
  Keep deployment separate from verification and specify the intended environment explicitly.

## 9. Verification

- MUST test observable behavior and contracts relevant to the change: happy path plus meaningful failure/boundary cases.
  Include ownership, conflicts, duplicates, units, and partial recovery when applicable. Bug fixes SHOULD have
  regression tests.
- Unit tests isolate external effects; integration tests verify actual boundary/storage semantics in designated
  resources. Use deterministic clocks/IDs, synthetic fixtures, cleanup, and appropriate mocks. Avoid tests that only
  mirror implementation.
- MUST inspect test setup, environment-loading precedence, credentials, and targets before integration execution.
- Run targeted checks first; broaden to affected consumers for shared changes. Do not rerun broad suites without a
  reason.
- Record exact commands and working directories in the project profile. Verify manifest package names, scripts, file
  globs, and prerequisites; do not invent commands or assume a root test task exists.
- Documentation changes need reference/format consistency checks. Code changes need relevant tests and lint/types;
  shared contracts need consumer compatibility/build checks; persistence needs condition/query verification.
- Never treat a hook passing as evidence for checks it did not run. Report blocked verification accurately.

## 10. Approved references

The project profile MUST link an accessible reviewed feature or pinned starter and relevant examples of:

- Registration/auth → schema → handler → service → repository/integration → meaningful tests.
- Error translation and its logging owner.
- Conditional persistence/pagination when used.

Link exact paths and symbols; verify their existence. Examples must follow this standard or label their exceptions.
Reproduce approved decisions, not unrelated business logic or legacy defects. Use inline examples when a new project has
no usable references; replace them as real approved implementations become available.

## 11. New-project bootstrap

1. Select purpose, invariants, runtime/tools, contracts, auth, datastore, and minimal structure in the project profile.
2. Use an accessible pinned starter or scaffold only required packages/layers. Do not inherit another project's
   production targets.
3. Configure strict types, formatter/lint, test runner, environment validation, and isolated development resources.
4. Build one named vertical slice with acceptance criteria, meaningful success/failure tests, and auth when required.
5. Verify install, tests, types, and build; record actual commands/examples and link the adopted profile/standard from
   `AGENTS.md`.

## 12. Completion and evaluation

Completion means requested behavior works, applicable contracts/invariants hold, relevant checks pass, and affected
context is current. If required verification is unavailable, report **implementation complete; verification blocked**,
not fully verified. Maintain exceptions in the project profile; keep changing versions/settings in authoritative
configuration.

Evaluate changes to this standard on comparable feature, bug-fix, refactor, contract, and concurrency tasks. Hold model,
tools, starting revisions, and task instructions comparable; use multiple independent trials when practical. Track
acceptance results, critical defects, review corrections, time, tool calls, input/output tokens, and actual cost. Set
thresholds before evaluation; accept efficiency gains only when correctness and critical invariants are preserved. No
9+/10 performance claim is established by document review alone.
