# TypeScript Serverless Monorepo — Engineering Standard

Version: 1.0.0

Scope: backend TypeScript monorepos using Node.js, AWS Lambda, API Gateway, Serverless Framework, pnpm workspaces, and
shared packages. DynamoDB guidance applies only to services using DynamoDB. This standard contains no frontend rules.

Use this as a common baseline across similar repositories. Repository-specific domain rules, selected versions,
commands, infrastructure targets, and examples belong in a short project profile linked from `AGENTS.md`. The paths and
commands below are conventions and examples, not claims about files or scripts in an adopting repository. Existing
repositories retain their established compatible structure; adoption alone does not authorize a migration.

## 1. Instructions for coding agents

- Read applicable repository instructions, this standard, and the project profile before implementing code.
- MUST means required; SHOULD means the default with a justified exception; MAY means optional.
- Follow explicit task requirements and higher-priority instructions. Within engineering guidance, use documented
  project exceptions, this standard, approved examples, then nearby implementations.
- Inspect the working tree and preserve unrelated work. Trace affected implementations, callers, schemas, tests,
  configuration, and external effects before editing.
- Identify acceptance criteria, important failure cases, affected packages/stacks, and compatibility constraints.
- Inspect actual configuration rather than guessing versions, commands, package names, or infrastructure settings. Flag
  contradictions; do not silently change architecture or tooling to make them disappear.
- Resolve minor reversible gaps using an approved nearby pattern and state material assumptions. Clarify consequential
  missing business, authorization, data-integrity, or public-contract decisions before implementing dependent behavior.
- Complete the smallest coherent change. Avoid unrelated cleanup, speculative abstractions, and new infrastructure
  unless required by the task.

## 2. Project and domain context

Each repository MUST provide a project profile containing:

| Project information | Required content                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Ownership and scope | Project purpose, users, responsible team, owned capabilities, exclusions                         |
| Vocabulary          | Domain terms and exact meanings reused in code                                                   |
| Main flows          | HTTP/event entrypoint → validation → business operation → persistence/integration → output       |
| Invariants          | Uniqueness, resource ownership, limits, state transitions, and other rules that must always hold |
| Actors              | Roles, permissions, tenant boundaries, machine identities                                        |
| Data semantics      | IDs, units, currencies if used, precision/rounding, timestamps, retention                        |
| External boundaries | Owned versus external systems; source of truth for each important datum                          |
| Supporting context  | Exact paths to business rules, architecture decisions, operational recovery guides               |

Do not infer business rules from names alone. Planned behavior in design documents is not proof of implemented behavior.
For workflows involving quantities or money, keep units explicit and convert at documented boundaries. Request
acceptance must not imply a reservation, execution, or delivery guarantee unless the implementation establishes it.

## 3. Technology stack and configuration

Use repository-selected versions and tools. For a new repository, start with TypeScript, a supported Node.js Lambda
runtime, pnpm workspaces, Serverless Framework, schema-based runtime validation, and Vitest unless the project specifies
otherwise. Do not pin universal version numbers in this document; record and maintain them in authoritative
configuration.

| Concern                      | Authoritative source to inspect and record in the project profile                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Language/runtime             | Root manifest, runtime version file if present, TypeScript config, per-stack Lambda runtime and build target |
| Package manager/workspaces   | Root `packageManager`, workspace manifest, lockfile, nested manifests                                        |
| Task runner                  | Root scripts and Turbo or other task configuration, if used                                                  |
| Framework/routing            | Stack deployment config, handler registration, middleware                                                    |
| Formatting/linting/types     | Executable formatter, lint, and TypeScript configuration                                                     |
| Validation/contracts         | Schema package exports and boundary schemas                                                                  |
| Persistence                  | Selected datastore, SDK/client, repositories, infrastructure/migration ownership                             |
| Authentication/authorization | Authorizer configuration, verification utilities, resource and permission checks                             |
| Testing                      | Runner configuration, setup files, scripts, fixtures, integration dependencies                               |
| Operations                   | Deployment configuration, IAM, environment bindings, logs, metrics, traces, alerts                           |

- Reuse existing shared wrappers for HTTP handling, errors, logging, configuration, AWS clients, and external APIs.
- Declare internal dependencies using the repository's workspace protocol and import their public entrypoints.
- Prefer existing dependencies; justify additions and follow the project's dependency policy. Update the lockfile
  through the package manager when dependencies change.
- Keep runtime, compiler target, bundler target, and dependency support compatible. Treat version conflicts as explicit
  tooling issues rather than silently rewriting unrelated manifests.

## 4. Structure and architecture

Use this layout for new projects when no alternative is specified; map these responsibilities to existing paths during
adoption. Create only the packages and directories the project needs.

```text
packages/
  schemas/src/                 # Shared runtime contracts and inferred types
  libs/src/                    # Shared handler, error, configuration, logging utilities
  <integration>/src/           # Shared AWS or external-system adapter
  ts-configs/                  # Shared compiler configuration
stacks/<stack>/
  serverless.ts                # Function registration and deployment configuration
  env.ts                       # Deployment configuration validation where needed
  src/functions/               # HTTP/event/task adapters and their registrations
  src/services/<feature>/      # Business rules and orchestration
  src/repository/              # Persistence operations and datastore client
  src/types/, src/constants/   # Local types and constants where needed
  test/                        # Tests, fixtures, setup
  scripts/                     # Necessary development/deployment helpers
docs/                          # Project profile, domain rules, decisions, recovery guides
```

- Dependency direction: handler → service → repository/integration. Services may compose services without cycles.
- Handlers own transport parsing, verified identity extraction, route-level permissions, delegation, and response
  mapping.
- Services own eligibility, business calculations, state transitions, integration ordering, and workflow outcomes.
- Repositories own keys, queries, conditions, persistence mapping, and storage-specific behavior.
- Shared packages MUST NOT depend on a stack's private implementation. Communicate across deployed boundaries using
  published contracts rather than importing another stack's source.
- Reuse SDK clients where appropriate to Lambda execution reuse. Make initialization testable; document environment
  values needed before module import. Use existing factories or module mocks rather than adding a DI framework by
  default.
- Use kebab-case filenames, feature-oriented service folders, and the existing test placement. Use configured local
  aliases and workspace public exports; avoid deep private imports and circular barrels.

## 5. Coding behavior: implementation decisions

The function structure and JSDoc rules below are required for new or behaviorally modified application functions. Other
decisions in the table are defaults. Preserve untouched code; record explicit project exceptions in the profile.

| Decision             | Default                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Functions/classes    | Named functions for services/repositories; classes only where identity or stateful behavior warrants them, including custom errors        |
| Exports              | Named exports; exported async functions for operations; exported wrapped handlers for entrypoints                                         |
| Parameters           | Object parameters for several related values, optional settings, or ambiguous same-type arguments; positional for simple clear signatures |
| Returns              | Explicit public contracts; `Promise<T>` for async operations; one documented absence convention per repository API                        |
| Types                | Schema-derived types for validated contracts; `unknown` at untrusted boundaries; type-only imports where appropriate                      |
| Naming               | Verb/entity function names, `is`/`has` boolean names, descriptive constants; consistent schema suffix within a package                    |
| Control flow         | Early guards, clear failure paths, exhaustive handling for closed variants where practical                                                |
| Collections/mutation | Choose readable transforms or loops; avoid hidden mutation of caller-owned inputs                                                         |
| Async work           | Await dependent operations; parallelize independent work with explicit failure behavior and bounded concurrency                           |
| Abstraction          | Extract stable shared behavior; keep one-off domain logic local; avoid wrappers that add no useful boundary                               |
| Configuration        | Validate required values at initialization/boundaries; keep environment access out of business logic                                      |
| Documentation        | Explain domain intent, invariants, units, failure semantics, and non-obvious decisions; keep comments current                             |
| Formatting           | Follow executable configuration; for new projects use semicolons, single quotes, two spaces, LF, and an agreed line width                 |

- Enable strict TypeScript; use additional checks such as `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` in
  new repositories. Do not weaken compiler settings to bypass a local error.
- Do not replace runtime validation with casts, `any`, or non-null assertions at trust boundaries.
- Keep public output types distinct from storage records when internal fields must be excluded.
- Edit generated code through its generator. Do not hand-edit build output, dependency directories, or compiler caches.

### Function structure: one function, one try/catch

- Every application function MUST have exactly one outer `try/catch` enclosing its executable body. This includes
  exported functions, private helpers, methods, and handler callbacks, including synchronous functions.
- Do not nest another `try/catch` in the same function. Extract an independently recoverable operation into a named,
  documented helper with its own single outer `try/catch`.
- Use `catch (error: unknown)`. Rethrow the original error by default; do not replace it with a generic error that loses
  its identity or stack. Translate only when the function owns that boundary and preserve the cause where supported.
- A catch MAY perform documented recovery or delegate to the shared transport error mapper. It MUST NOT return a
  success-shaped fallback for a critical failure. Best-effort helpers must document the suppressed failure explicitly.
- Designate a logging owner for each flow, normally the transport/worker boundary. Inner functions may simply
  `throw error`; a required catch does not require another log. Log at an inner boundary only when it owns recovery or
  adds necessary context without producing repeated logs for the same failure.
- Use `return await operation()` inside an async `try` when this function's catch must handle rejection. Returning a
  promise without awaiting it lets its later rejection bypass that catch.
- Keep one responsibility per function. Extract business branches or recovery boundaries for clarity, not merely to
  satisfy an arbitrary line count.
- Application callbacks follow the same rules. Extract inline callbacks into documented named functions when that makes
  the structure clearer. Test-runner callbacks and generated/vendor code are outside these application rules; do not
  catch assertion failures to make tests pass.

This is an explicit project style preference. A catch that only rethrows does not add recovery behavior; its purpose
here is a consistent function shape. Do not claim it makes a function safer by itself.

### Mandatory JSDoc structure

Every application function MUST have JSDoc immediately above its declaration, method, or exported handler binding. Use
this order:

1. One sentence stating the function's responsibility in domain terms.
2. A blank line, then `Process flow:` and numbered steps matching the actual implementation order.
3. A blank line, then one `@param` per declared parameter, in signature order. Explain units, ownership, or constraints
   when relevant. For object parameters, document the object and important properties; do not restate every obvious
   type.
4. `@returns` describing the result, absence semantics, or completion/side effects for `void` functions. For async
   functions describe the resolved value; keep the TypeScript signature as the type authority.
5. `@throws` for intentional domain failures and meaningful propagated integration/storage failures. State the
   condition. Omit this tag only when the function has no meaningful throwing contract; do not invent an error type.

Keep the block proportional to the function: one numbered step is enough for a one-step helper. Document recovery,
idempotency, concurrency, units, and partial effects when they matter. Update the block whenever behavior changes;
comments must describe current behavior rather than desired behavior.

The following is a service example. Its types, repository, validators, and errors are illustrative project-owned
symbols, not a requirement to introduce these exact names. Logging belongs to its caller's transport boundary.

```ts
/**
 * Validates a create request against the selected payment method's rules.
 *
 * Process flow:
 * 1. Fetches the payment method by ID and rejects a missing method.
 * 2. Ensures the requested amount satisfies the method's limits and currency rules.
 * 3. Validates request metadata against the method's requirements.
 * 4. Returns the validated payment method.
 *
 * @param request - The create request containing the method ID, amount, and metadata.
 * @returns The payment method after all request checks succeed.
 * @throws {CustomError} If the method is missing, the amount is invalid, or metadata is invalid.
 * @throws {Error} If the payment method lookup fails.
 */
export async function validateCreateRequest(request: CreateRequest): Promise<PaymentMethod> {
  try {
    const paymentMethod = await getPaymentMethodById(request.paymentMethodId);
    if (!paymentMethod) {
      throw new CustomError('paymentMethodNotFound', 404);
    }

    validateAmountForPaymentMethod(request.amount, paymentMethod);
    validateMetadataForPaymentMethod(request.metadata, paymentMethod);

    return paymentMethod;
  } catch (error: unknown) {
    throw error;
  }
}
```

Before finishing a code change, verify each new or behaviorally modified application function has its JSDoc, numbered
process flow, explicit return contract, and exactly one outer `try/catch`; verify errors remain observable and are
logged by the appropriate boundary. These checks supplement behavioral tests.

## 6. Validation, contracts, and error handling

- Validate untrusted bodies, path/query parameters, configuration, event payloads, and external responses at boundaries.
  Use shared schemas for shared contracts; keep feature-only schemas local.
- Define unknown-field handling, coercion, normalization, size limits, and defaults intentionally. Preserve existing
  endpoint behavior unless the task includes a compatible contract change.
- Use shared HTTP wrappers for parsing and response/error mapping. Preserve the owning endpoint's success codes,
  message/error shape, pagination, serialization, and localization contract.
- Use typed expected failures with stable public codes/messages. Map unexpected failures to public-safe responses;
  retain useful internal cause information without exposing stack traces, credentials, or sensitive data.
- Services decide whether a missing record is a valid absence or a domain failure. Repositories retain documented lookup
  semantics; avoid mixing `null`, `undefined`, and thrown not-found errors without an explicit contract.
- Let critical failures propagate through the mandatory outer catches defined in section 5. Perform translation,
  recovery, or best-effort suppression only at the function that owns it. Avoid duplicate logging at every layer.
- External adapters MUST define timeouts and bounded retry behavior appropriate to the operation. Distinguish transport
  success from application success and runtime-validate important response data.
- Specify idempotency key scope, lifetime, and duplicate behavior for operations requiring it. A conditional insert
  prevents duplicate storage keys; it does not prove end-to-end idempotency.
- Do not retry an uncertain external side effect until replay safety is established. Distinguish failed, succeeded, and
  unknown outcomes; preserve recovery information.
- Mark notifications or other best-effort effects explicitly. If delivery is required, provide a durable recovery path
  such as an outbox or reconciled queue workflow rather than swallowing dispatch failures.
- Queue consumers MUST define duplicate-delivery handling and per-message failure behavior; use partial-batch responses
  where supported and appropriate. Define failed-message recovery and ordering requirements for the chosen queue.

## 7. Persistence and consistency

### Shared

- Document entity identifiers, storage/domain mapping, lookup semantics, timestamps, units, and retention in the project
  profile.
- Use consistent units within a calculation. Document precision and rounding when quantities require them; reuse tested
  conversion helpers instead of embedding unexplained scaling factors.
- Validate writes and read data where persisted or external data cannot be trusted. Preserve public/storage separation.
- Protect state-dependent writes using datastore conditions or transactions; a preceding read alone does not prevent
  races.
- Update status-derived keys, history, and audit fields consistently with the state transition.
- Bound queries, pagination, and batches. Document ordering and the exact terminal cursor representation.
- Define deletion, migration, backfill, and rollback behavior before changes that affect existing data.
- A database transaction cannot atomically commit an unrelated external API effect. Use claims/checkpoints and recovery
  appropriate to the workflow; document whether exclusion is per request, resource, account, or tenant.

### DynamoDB — when selected

- Use AWS SDK v3 DocumentClient with native JavaScript values unless the project explicitly selects the low-level API.
  Keep AttributeValue conversion within the adapter; do not mix item representations.
- Use entity repositories and shared/stack-local client helpers. Services should not reconstruct raw SDK access
  everywhere.
- Record actual table keys, index names, access patterns, consistency needs, and resource provisioning ownership. Adding
  a query in application code does not create the corresponding deployed index.
- Prefer Query on supported access patterns; use Scan only with a documented bounded operational reason.
- Use conditional creation for uniqueness and conditional status/version updates for concurrency. Handle conflicts as
  expected outcomes where appropriate; do not silently overwrite concurrent changes.
- Carry `LastEvaluatedKey` through the owning cursor contract. Fetch only the pages needed for the operation.
- Handle unprocessed batch items with bounded retries. Account for item/batch limits and eventual index consistency.
- Keep business expiry checks separate from DynamoDB TTL cleanup; TTL deletion timing is not an authorization boundary.
- For other datastores, replace this subsection with their transaction, query, migration, and concurrency rules.

## 8. Security and operational behavior

- Authenticate at a documented trusted boundary and enforce resource ownership, tenant scope, and action permissions
  before side effects. JWT decoding alone is not verification.
- New protected admin operations MUST enforce their selected permissions in every deployed environment; any deliberate
  environment-specific behavior requires a documented project exception.
- Store secrets through approved environment/secret-management mechanisms. Never commit or log credentials, tokens, raw
  verification codes, or sensitive payloads; return explicit public-safe projections.
- Use least-privilege IAM and explicit resource/environment bindings. Inspect stage variable names and actual
  integration targets; stage labels and local emulation do not prove isolation.
- Use shared structured logging. Include appropriate correlation, operation, resource, and actor identifiers; redact
  sensitive fields. Distinguish diagnostics from required audit records.
- Configure function timeout, memory, concurrency, payload limits, region, architecture, and upstream time budgets per
  service; do not inherit unrelated values without checking the workload.
- Record required metrics, alerts, tracing, log/data retention, and recovery ownership for critical workflows.
- Keep deployment actions separate from verification commands. Use the selected explicit stage and account for any
  deployment; do not rely on defaults when environment selection matters.

## 9. Testing and verification commands

- Test business outcomes and public contracts. Include relevant invalid input, ownership, boundary, conflict, duplicate,
  partial-failure, and recovery cases. Bug fixes SHOULD include meaningful regression coverage.
- Unit tests isolate external effects through adapters/repositories. Integration tests verify actual storage and
  boundary semantics against designated resources. End-to-end tests cover selected critical journeys where the project
  needs them.
- Control clocks, IDs, fixtures, cleanup, and mocks. Use synthetic data. Do not mirror implementation details solely to
  increase test counts.
- Inspect test setup and environment-loading precedence before executing integration paths. Test names, offline mode,
  and `.env.test` filenames are not guarantees that real services are isolated.
- Run the narrow relevant checks first; broaden to consumers when shared contracts or utilities change. Inspect the
  final diff. A hook passing is not evidence that tests ran unless the hook actually invokes them.

The project profile MUST record exact commands, working directories, selection syntax, and prerequisites. The following
are example invocations only; verify script existence and the actual package name before running them. Here `PACKAGE`
means the selected workspace's manifest name; replace it in the example command.

| Operation         | Example from repository root                              | Verify before use                                         |
| ----------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Install           | `pnpm install --frozen-lockfile`                          | Selected pnpm version, registry access, lifecycle scripts |
| Develop           | `pnpm --filter PACKAGE dev`                               | Script, ports, environment and external targets           |
| Format check      | `pnpm --filter PACKAGE format:check`                      | Script and included files                                 |
| Lint              | `pnpm --filter PACKAGE lint`                              | Script, configuration and scope                           |
| Typecheck         | `pnpm --filter PACKAGE type-check`                        | Script and included source/tests/configuration            |
| Targeted tests    | `pnpm --filter PACKAGE exec vitest run test/path.test.ts` | Runner availability, real test path, setup isolation      |
| Integration tests | Project-defined exact command                             | Dedicated resources, credentials, fixtures and cleanup    |
| Build             | `pnpm run build`                                          | Root script, dependency ordering, emitted files           |
| Generate/migrate  | Project-defined exact command                             | Tool, target environment, compatibility and recovery      |

| Change                     | Relevant verification                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| Documentation              | References, examples, Markdown formatting, consistency                            |
| Domain logic               | Targeted behavior/regression tests, affected lint and typecheck                   |
| Shared schema or utility   | Consumer checks, compatibility cases, dependency-aware build                      |
| Persistence                | Query/condition/transaction semantics and isolated integration cases              |
| Infrastructure or handlers | Configuration, registration, packaging and target review; relevant boundary tests |

Never claim an unrun check passed. Report the exact scope and any blocked prerequisites. Formatting checks may exclude
configuration, tests, or docs; inspect their globs rather than assuming repository-wide coverage.

## 10. Approved examples and coding preferences

Each adopting repository SHOULD supply one complete reviewed feature and focused examples. Link exact paths and symbols
in the project profile; for an empty repository, use inline code or an accessible pinned starter. Do not invent
references.

| Example               | Decisions it must demonstrate                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Complete feature      | Registration, authentication/authorization, schema, handler, service, repository/integration, tests |
| Typical service       | Signature, naming, guards, return contract, side-effect order                                       |
| Failure path          | Typed domain failure, public mapping, logging ownership                                             |
| Persistence operation | Keys, projections, conditions, mapping, pagination                                                  |
| Behavioral test       | Synthetic fixtures, boundary assertions, external seams, deterministic execution                    |

Use concrete preference examples where prose is ambiguous:

```text
Scenario: transition a request that may be processed by another worker.
Preferred: validate → conditional claim/update → persist consistent history and derived fields.
Avoid: read status → perform an unconditional overwrite.
Reason: another worker can change the state between the read and write.
```

```text
Scenario: compare quantities from different representations.
Preferred: validate units → convert through the shared helper → compare values in one unit.
Avoid: insert a magic multiplier into each caller.
Reason: conversion, precision, and supported-unit rules must remain consistent and testable.
```

Label deprecated examples explicitly. Reproduce their approved decisions, not unrelated business logic or known defects.

## 11. Agent workflow and empty-project bootstrap

### Existing project

1. Read instructions, this standard, and the project profile; inspect current work and acceptance criteria.
2. Trace the affected flow through callers, schemas, layers, tests, configuration, and external effects.
3. Identify compatibility, invariants, authorization, concurrency, and environment concerns relevant to the change.
4. Resolve consequential gaps; plan proportionately and implement the smallest complete change using approved patterns.
5. Verify function structure and JSDoc against section 5; add useful regression coverage, run relevant checks, and
   inspect the final diff.
6. Update affected contracts, domain context, examples, configuration documentation, and operational guidance.
7. Report outcome, checks, assumptions, and material limitations concisely.

### Empty project

1. Populate the project profile: purpose, scope, invariants, selected stack, structure, auth, persistence, commands,
   owner.
2. Use a documented pinned starter or scaffold the selected stack. Do not copy another project's resource identifiers,
   credentials, production targets, or domain-specific assumptions.
3. Configure workspaces, strict types, formatter/lint, tests, environment validation, and shared utilities actually
   needed.
4. Build one named vertical slice with explicit acceptance criteria: entrypoint, validation, business rule, persistence
   or integration, public response, and meaningful success/failure tests. Add authentication when the slice requires it.
5. Add setup instructions, configuration examples without secrets, and isolated test fixtures/resources.
6. Verify install, tests, types, and build. Record actual commands and approved examples in the profile.
7. Link the adopted standard and profile from `AGENTS.md`; remove unused alternatives and resolve essential choices.

## 12. Completion, exceptions, and maintenance

A task is complete when requested behavior works, applicable rules and contracts are satisfied, relevant checks pass,
and affected context/documentation is current. If implementation is finished but required verification is unavailable,
report **implementation complete; verification blocked** with the limitation. Do not call that fully verified.

Each repository maintains an exception/decision register with: rule or unresolved choice, scope, reason, responsible
owner, and review date. Record actual decisions rather than inheriting another repository's known gaps. Use explicit N/A
for unused concerns. Do not turn one-off implementation choices into global policy.

Before adopting this standard, complete the project profile, verify its commands and references, and record deviations.
Keep exact versions and infrastructure details in their authoritative configuration; avoid duplicating values that
drift. Update profile/examples when approved architecture, contracts, or workflows change. Review this baseline when
shared conventions change; adoption does not automatically rewrite existing code.
