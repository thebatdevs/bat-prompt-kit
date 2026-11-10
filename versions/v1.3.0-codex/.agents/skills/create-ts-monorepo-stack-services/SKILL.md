---
name: create-ts-monorepo-stack-services
description:
  Generate or extend entity services using the current CustomConfig services as the implementation reference. Requires
  an existing repository for the selected entity and stack; stops without generating services when it is missing.
  Produces operation-specific modules under src/services with verified contracts and business rules. Does not create
  repositories or API routes.
---

# Create TypeScript monorepo stack entity services

Generate service operations on top of the selected entity's existing repository. Services own business decisions,
validation, server-owned values, and workflow ordering; repositories own persistence mechanics. Read the current
`stacks/admin-finance-config/src/services/custom-config/` modules at generation time and reproduce their applicable
capabilities for the selected entity, adapting contracts and confirmed rules instead of copying entity-specific policy.

## Inputs and verified context

Identify the target stack, entity, repository path, and requested operations from the user's input or explicit session
context. Infer unambiguous paths and exports from the repository. Ask only for missing information that affects the
implementation; do not guess a stack, entity, permission boundary, initial status, or state-transition policy.

### Required repository gate

Before creating or editing any service or supporting contract, locate and read the selected entity's repository in the
selected stack (normally `src/repository/<entity>.repository.ts`; honor verified existing paths). Confirm it actually
implements persistence for this entity, not merely a placeholder, type declaration, similarly named entity, or the
CustomConfig reference in another stack. Inspect its exported signatures, result schemas, and absence semantics.

If that entity repository is missing, stop this service-generation task without writing service files, derived types, or
repository scaffolding. Report the entity, target stack, expected repository path, and missing prerequisite. The user
can generate the repository first with `create-ts-monorepo-stack-dynamodb-repository`; do not invoke it implicitly. If
the repository exists but lacks an operation needed for a requested service, identify that gap and do not generate fake
calls, direct DynamoDB access, or a weaker substitute. Continue only independently supported operations and report which
operations remain blocked. A file's existence alone does not establish usable persistence capabilities.

Read applicable `AGENTS.md` instructions, `.agents/rules/ts.engineering-standard.md`, and
`.agents/rules/project-profile.md`. Load relevant memory topics when present. Inspect the working tree, existing
services and callers, canonical schemas and aliases, stack-local contracts, repository signatures and result types,
constants, configuration, manifests, and declared verification commands. Preserve unrelated work.

Repository-relative sources for this monorepo include:

- `stacks/admin-finance-config/src/services/custom-config/custom-config-get.ts`, `custom-config-create.ts`,
  `custom-config-update.ts`, and `custom-config-validation.ts`: primary references for service capabilities, grouping,
  typed projections, domain errors, audit values, version checks, and logging/rethrow boundaries.
- `stacks/admin-finance-config/src/repository/custom-config.repository.ts`: reference persistence contracts. The
  selected entity's own repository remains the authoritative source for callable operations and result types.
- `packages/schemas/src/custom-config/custom-config.utility.types.ts` and its public exports: current shared request,
  response, summary, criteria, pagination and service parameter contracts. Inspect the selected entity's utility module
  and existing consumers before creating duplicate contracts. `src/types/` remains available for stack-owned contracts.
- `packages/libs/src/error/error-handling.ts`: verified `logErrorMessage(error, functionName)` behavior.
- `packages/libs/src/error/custom-error.ts`: expected domain errors through the public libs export.

Verify these paths and actual public exports before use. If the required repository or user-defined canonical schema is
missing, report the prerequisite and stop dependent work rather than inventing persistence or domain fields. An enum
defines allowed values, not permitted transitions. Resolve consequential business or data-integrity gaps before the
dependent operation; continue independent operations supported by verified requirements.

## Output structure and size

Use this user-selected layout, substituting the actual stack and kebab-case entity name:

```text
stacks/<target-stack>/src/services/<entity>/
  <entity>-get.ts
  <entity>-create.ts
  <entity>-update.ts
```

For example, `stacks/admin-finance-config/src/services/payment-method/payment-method-get.ts`. The folder is
**services**, plural, matching the engineering standard. Keep entity operation modules inside that folder; do not create
a parallel `src/service/` directory or migrate unrelated entities.

- Create only requested operation groups; do not scaffold empty modules. A general service-generation request covers
  get/create/update only when the repository and business requirements establish their behavior.
- Keep detail, collection, and requested table-description reads in `<entity>-get.ts`; creation in `<entity>-create.ts`;
  and edits, requested status transitions, and requested deletion in `<entity>-update.ts`. Deletion is optional.
- Every source file must remain within **250 physical lines**, including imports, comments, types, and exports. This
  service limit has no single-file exception. Do not compress formatting, remove needed documentation, or weaken
  responsibilities to fit the limit.
- Give each function one cohesive responsibility. If a function becomes too large or an operation module exceeds the
  limit, extract cohesive steps into clearly named entity-local modules such as `<entity>-validation.ts` or
  `<entity>-eligibility.ts`. Keep the main operation readable and maintain the same folder and dependency direction. Do
  not split into arbitrary numbered chunks, a generic service factory, or one trivial function per statement.
- Use named exports, explicit public input/output types, and verified stack aliases/public package imports. Alias
  repository imports when needed to keep service names clear. Use `get` for new retrieval functions, not `list`.
- Reuse existing canonical-derived contracts from their verified owner, including shared entity utility types exported
  by schemas where approved in the project profile. Do not duplicate or relocate them. If required types are absent, add
  only the necessary derived contracts under `src/types/<entity>.ts`; do not modify the user-owned canonical schema,
  publish API-only types in shared packages, or define transport schemas in the repository.

## Business logic and persistence boundary

Call the entity repository directly. Do not construct DynamoDB commands, table names, keys/index expressions,
conditional expressions, transaction payloads, or AWS clients in service modules. Repositories must continue enforcing
mandatory existence/version guards atomically. Do not replace conditional writes with read-then-unconditional-write.

Use actual repository return shapes: detail may be absent, collections may contain SDK metadata and a continuation key,
create returns a validated saved entity, and an update may return only changed fields and required key/audit values. Do
not advertise a complete entity when the repository returns a partial update response.

### Get operations

- Decide when an absent detail is a domain 404 using verified error conventions; do not return fabricated records.
- Accept parsed pagination and a server-selected projection from the caller. Preserve typed selection guarantees,
  validate any service-level response projection, and retain the documented cursor/count behavior. Do not assume an
  empty filtered page means completion. Single-page operations must not automatically fetch all pages.
- Map SDK collection envelopes to an existing service/API contract when required. Do not invent new cursor formats,
  indexes, parser signatures, projections, or unbounded scans. Keep selection fields aligned with the derived summary
  schema.
- Include table-description services only when requested or established by the entity contract. Respect the actual
  repository response shape and documented missing-table behavior.

### CustomConfig capability mapping

For a general request to generate similar services, assess each capability below and implement it when the entity's
repository and confirmed requirements support it. Explicit requests for fewer operations take precedence. Report
unsupported capabilities and the missing prerequisite rather than quietly dropping them or inventing business policy.

| Reference capability        | Adaptation for the selected entity                                                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getCustomConfigById`       | Detail lookup with typed optional selection and domain 404 for absence. Adapt composite keys where configured.                                                                                            |
| `getCustomConfigsByQuery`   | One validated summary page, server-selected projection, and existing cursor contract. Use the repository's established Query or bounded Scan access pattern.                                              |
| `queryAllCustomConfigs`     | All-page Query with required key conditions and optional selection. Forward query options to the entity repository's shared-helper-backed all-page function; never implement a scan loop under this name. |
| `getCustomConfigsTableDesc` | Unwrap repository Table metadata; follow the established missing-metadata error contract.                                                                                                                 |
| `getValidCustomConfig`      | Exactly-one lookup using validated canonical-derived criteria when required: 404 for none, 409 for multiple. AND fields and preserve scalar/membership semantics.                                         |
| `createCustomConfig`        | Validate editable input, assign confirmed service-owned defaults/ID/audit values, and await conditional create.                                                                                           |
| `updateCustomConfig`        | Nonempty editable patch, confirmed eligibility/version checks, advancing audit values, and partial update response.                                                                                       |
| `updateCustomConfigStatus`  | Separate status input and operation only where the entity's confirmed rules establish status changes.                                                                                                     |
| `deleteCustomConfig`        | Optional deletion only when authorized and supported by repository/domain rules.                                                                                                                          |
| Eligibility/audit helpers   | Cohesive reusable helpers in `<entity>-validation.ts` when needed; preserve atomic repository guards.                                                                                                     |

For query-all, preserve `indexName`, multiple `partitionKeys`/`sortKeys`, filters, ordering, page size and starting
cursor supported by the repository. Keep DynamoDB construction and `queryAllRecordsFromDynamo` calls inside the
repository. Require the actual configured table/index key conditions; no default scan or invented index. GSI reads must
select fields available in that index. Accumulating all pages in memory provides no snapshot guarantee.

For criteria lookups, choose a supported key lookup where possible. The reference scans for non-ID uniqueness because
its table has no suitable index; this is not a universal requirement. Do not introduce unbounded scan traversal solely
to imitate the reference. When an all-page criteria scan is explicitly established, retain cursor-progress checks and
empty-page handling, and document its cost and consistency limits. Validate criteria against full fields needed for
matching before projecting the result. Do not copy unused inputs such as the reference's currently unused criteria
`attributes` parameter; each generated parameter must affect behavior or preserve an existing public contract.

CustomConfig's UUID IDs, ACTIVE creation status, READONLY rule, administrator email actors, millisecond versions,
string-only cursors and strict-equality scalar matcher apply only where verified for the selected entity. Nested
canonical values need an appropriate comparison contract rather than copied object-reference equality.

### Create operations

- Validate the service input using the canonical-derived request contract. Keep client-editable fields distinct from
  server-owned fields and reject unknown inputs according to the existing contract.
- Apply only confirmed defaults, initial status, ID strategy, trusted actor, timestamps, and domain guards. Assign
  server-owned values after validated client fields so they cannot be overridden.
- Run prerequisite checks before dependent writes and await persistence. Do not retry ID collisions, duplicate financial
  work, or ambiguous external effects without a verified bounded recovery/idempotency contract.

### Update operations

- Preserve omitted fields, handle explicit null only where allowed, and prevent changes to keys or creation audit data.
  Reject empty edits according to the existing contract. Avoid applying create defaults during PATCH.
- Fetch current state only when needed for domain decisions or validation of the effective merged state. Preserve
  repository atomic guards after such reads; the prior read alone does not prevent races.
- Enforce verified state/editability rules, trusted actor values, and monotonically advancing update timestamps when the
  entity uses versioned updates. Pass the caller's validated expected version to the repository.
- Keep separate general-edit and status-transition inputs when required. General edits must not bypass status rules.
  Apply only the confirmed transition matrix and change only status/update-audit fields for a status operation.
- Use the repository's supported structured condition contract for additional confirmed state requirements; never
  forward raw caller-supplied persistence conditions or override mandatory guards. If a required atomic guard is
  unsupported, report the repository gap rather than silently weakening the operation.
- Include deletion only when in scope and supported. Apply confirmed domain guards before the repository's conditional
  delete, preserve documented absence/conflict handling, and return void when deletion has no result payload.

Independent work may run concurrently only when effect ordering and failure behavior are intentional. Dependent side
effects must be awaited in order. Do not add external effects, API registration, authorization changes, IAM,
provisioning, or deployments to a service-generation request.

## Exactly one try/catch per service function

Every business service function, including get and table-description functions, must contain exactly one
`try/catch (error: unknown)` around its operation, including validation and awaited dependent calls. In its catch, call
`logErrorMessage(error, '<enclosingFunctionName>')` and then `throw error`.

```ts
try {
  // Validate, apply this operation's business rules, and await repository work.
  return await repositoryOperation(input);
} catch (error: unknown) {
  logErrorMessage(error, 'enclosingFunctionName');
  throw error;
}
```

Use the real enclosing function name and verified imports in generated code. Do not generate nested try/catch blocks,
catch-and-continue paths, promise `.catch()` recovery inside the service, or a wrapper that hides the required boundary.
If distinct recovery or orchestration is required, extract a cohesive operation with its own single boundary and keep
its recovery behavior explicit and authorized. Do not replace propagated errors or lose their status/cause. Pure
validation/calculation helpers are not business-service entry points; they may have no catch and throw to the calling
service's boundary. A helper that performs service orchestration must follow the single-boundary rule too.

## JSDoc

Apply the engineering standard's JSDoc requirements to every exported service operation. Document private helpers when
their constraints are non-obvious. Each service operation needs:

- A responsibility sentence.
- Numbered `Process flow:` steps for multistep behavior.
- `@param` descriptions in signature order, including expected-version units and trusted actor provenance when relevant.
- `@returns` describing the actual result, absence, or effects; omit redundant return text for trivial void completion.
- Applicable `@throws` conditions for domain errors, validation, repository failures, and external effects that actually
  occur.

Describe concurrency, idempotency, and partial effects when relevant. Do not duplicate TypeScript types, invent
failures, or copy stale repository documentation. Update comments whenever the resulting behavior changes.

## Verify and report

Review generated modules for single responsibility, correct operation grouping, strict types, supported repository
calls, and documented business rules. Count all lines in each generated/changed source file and inspect each service
function for exactly one try/catch with the correct logger context and same-error rethrow. Verify helper extraction
preserves ordering, error propagation, and caller imports. Confirm the required entity repository gate ran before
writes; compare supported generated capabilities with the current CustomConfig services, explaining omissions. Verify
query-all delegates to the repository without a Scan fallback and that existing shared utility contracts are reused.
Update affected existing documentation and scoped context.

Run the selected stack's declared type-check, targeted lint/format checks, relevant existing tests, and
`git diff --check`; inspect scripts and prerequisites first. Do not generate test files, cases, fixtures, mocks,
snapshots, or type-test files unless explicitly requested. Do not deploy or contact live AWS as verification.

Report the entity/repository and generated service paths, implemented operations, domain decisions and their sources,
line-limit and error-boundary verification, checks actually run, and unresolved prerequisites. An empty test run does
not establish behavioral coverage. If required checks are unavailable, report implementation complete; verification
blocked, with the specific limit. Do not certify a quality score from static checks alone.
