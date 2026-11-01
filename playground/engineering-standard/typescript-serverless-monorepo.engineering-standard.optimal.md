# TypeScript Serverless Monorepo — Engineering Standard

Version: 2.2.0

Updated: 2026-10-21

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

If no profile is linked, inspect relevant existing configuration and documentation. Do not invent missing facts.
Continue work supported by verified context; clarify consequential gaps before dependent changes. Create or update the
profile when adoption or context maintenance is in scope.

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

- MUST keep each source file within 250 lines, including imports, types, functions and exports. Split cohesive modules
  when needed; do not compress code to meet the limit.
- MUST group service functions by entity and operation, for example `services/<entity>/<entity>-get.ts` and
  `<entity>-update.ts`. Related operations share a module while it remains within the limit; do not automatically create
  one service file per endpoint.
- MUST reuse the existing HTTP handler factories, request/query parsers, schema exports, DynamoDB utilities,
  `CustomError`, `logErrorMessage`, naming helpers and environment accessors before adding equivalent functionality.

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

### Retrieval naming and query flow

- MUST use `get` for retrieval functions, not `list`. Use `get<Entity>ById`, `get<Entities>ByQuery` and
  `get<Entity>TableDesc` for their respective service operations. Handler names follow the route contract, for example
  `getConfigs`; alias a service import only when needed to avoid a name collision.
- MUST parse collection query parameters with the existing `extractQueryReqFromParams` utility and verified index/key
  defaults, then pass the resulting `DynamoQueryRequest` to the service. Do not replace this with a new incompatible
  pagination format or reject the shared parser's supported parameters.
- MUST define collection projection expressions explicitly in the handler and pass them through the service to the
  repository's `projectionExpression`, following the reference below. Keep DynamoDB command construction in
  repositories. Projection strings are server-defined, not arbitrary request fields.
- MUST derive and validate the collection response schema from the canonical entity schema with `.pick()`, matching the
  selected fields. Do not validate a projected row against the full entity schema or silently strip a selected field
  absent from the response schema. Preserve cursor metadata; fetch details by ID for fields omitted from a list.

Illustrative handler call; the surrounding handler owns authentication, permissions and query parsing:

```ts
return await getConfigsByQuery(
  queries,
  `id, eventName, minDefaultLevel, description, logoImageUrl, status, createdAt, pricePerEntryByMotpoints`,
);
```

The corresponding service accepts `(query: DynamoQueryRequest, projection?: string)` and forwards both arguments. The
repository passes the expression to the shared query utility. If it supplies a default projection, that default must
match its collection response schema. Projection expressions reduce returned data; do not claim they reduce DynamoDB
read-capacity consumption for the same items.

### Error handling

- MUST wrap every business service function's operation in `try/catch (error: unknown)`, call the shared
  `logErrorMessage(error, '<enclosingFunctionName>')` in the catch, and rethrow the same error with `throw error`. This
  includes retrieval and table-description services. Do not replace the error, return a success fallback, or lose its
  status/cause. This service-level logging convention was explicitly requested on 2026-10-21 and supersedes the earlier
  single-logging-owner rule for services.
- Other layers SHOULD catch only to translate at an owned boundary, recover, clean up, or log a terminal failure. Reuse
  shared transport error formatting. Nested services, repositories and the HTTP wrapper may log the same error;
  function-name context identifies the propagation path, but repeated entries do not represent distinct incidents.
  Business audit events are separate.
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
- MUST use this structure for APIs covered by the documentation requirement above: responsibility sentence; numbered
  `Process flow:` for multi-step behavior; `@param` descriptions in signature order; `@returns` with
  result/absence/effects; and applicable `@throws` with conditions. Apply the exceptions below.
- Explain units, ownership, idempotency, concurrency, and partial effects when relevant. Do not duplicate TypeScript
  types, invent failures, or repeat obvious implementation steps. A trivial void completion needs no redundant return
  description.
- MUST update comments when behavior changes; do not expand untouched functions solely for documentation uniformity.

Illustrative service; types, repository, validators and `logErrorMessage` are supplied by the adopting project. The
service records its function context and rethrows; the shared transport wrapper still owns HTTP error mapping.

```ts
/**
 * Validates a create request against its payment method's rules.
 *
 * Process flow:
 * 1. Fetches the method and rejects a missing record.
 * 2. Validates the amount and required metadata.
 * 3. Returns the validated method.
 *
 * @param request - Method ID, requested amount, and metadata.
 * @returns The method after all request checks succeed.
 * @throws {CustomError} If the method is missing or request values violate its rules.
 * @throws {Error} If the method lookup fails.
 */
export async function validateCreateRequest(request: CreateRequest): Promise<PaymentMethod> {
  try {
    const method = await getPaymentMethodById(request.paymentMethodId);
    if (!method) throw new CustomError('paymentMethodNotFound', 404);

    validateAmountForPaymentMethod(request.amount, method);
    validateMetadataForPaymentMethod(request.metadata, method);
    return method;
  } catch (error: unknown) {
    logErrorMessage(error, 'validateCreateRequest');
    throw error;
  }
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

### Create, update and default semantics

- MUST derive editable request schemas from canonical stored schemas with `.pick()` or `.omit()` and infer types from
  Zod. Keep IDs, creation audit fields and status server-owned unless the documented operation explicitly permits them.
- MUST apply documented defaults on create and retain them when parsing older records that omit newly added fields.
  Parsing a default does not backfill storage; document any separate migration requirement.
- MUST preserve omitted fields on PATCH. Remove creation defaults before making defaulted fields optional, for example
  `entitySch.shape.field.removeDefault().optional()`, so a partial edit does not reset stored values. Validate explicit
  values; do not treat `null` as omission unless the canonical field is nullable. Document defaults applied by PUT.
- MUST use separate request schemas for status routes and general edits. Status routes accept only their documented
  inputs, select the target status from the route, enforce documented transition guards and optimistic locking, and
  write only status and update audit fields. Do not let a generic patch bypass those routes.
- MUST keep domain-specific names, values and validation rules in shared feature schemas and the feature specification,
  not in this general standard. When they change, update affected requests, response projections, examples and docs.

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

### Administrative table descriptions

When table-description APIs are requested for an administrative entity, follow the established admin-stack pattern:

- Register `GET <entity-base-path>/table-desc` with the admin authorizer and applicable permission convention.
- Keep handler → service → repository flow: handler `get<Entity>TableDesc`, service `get<Entity>TableDesc`, repository
  `get<Entity>TableDescription`, shared `getTableDescFromDynamo`. Resolve the table name lazily through the existing
  environment accessor, never from a caller-supplied table name.
- Return the SDK response's `Table` metadata and throw `CustomError` when it is absent, using the documented HTTP status
  (the current admin-lottery contract uses 502). Do not return fabricated metadata or create/alter tables.
- Add scoped `dynamodb:DescribeTable` permission to the execution-role policy and keep the endpoint registry, permission
  documentation and Postman collection consistent.

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

### API examples, IAM and implementation scope

- MUST update the stack's Postman collection when endpoints or request contracts change. Keep base URLs and tokens as
  placeholders, provide schema-valid bodies, use the stack's actual authentication style, and document any automatic
  capture of entity IDs and optimistic-lock versions. Never send requests merely to validate a collection.
- When role JSON is requested, provide separate trust and permissions documents using repository naming/stage/region
  conventions, documented account placeholders and scoped resources/actions. Distinguish runtime execution permissions
  from deployment permissions; editing the files does not apply them to AWS.
- MUST distinguish table infrastructure ownership from record creation. Grant/create only operations authorized by the
  feature. For example, admin-lottery provisions lottery tables, but clients create prize records and admin updates must
  not upsert missing prizes. IAM `UpdateItem` alone does not enforce record existence; use repository conditions.
- MUST keep scaffolding honest: until persistence/business behavior is implemented, use an explicit typed failure such
  as `CustomError(..., 501)`, not fabricated success. Do not describe planned draw/delivery/eligibility logic as working
  merely because request validation and persistence exist.
- Temporary authorization changes MUST be explicitly requested and documented as a scoped exception. The current
  admin-lottery permission assertions are commented out at the user's request while Cognito authorizers remain enabled;
  this is not a default for new stacks or permission changes elsewhere.

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
