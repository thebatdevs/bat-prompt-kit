# [Project] — Engineering Standard

> TEMPLATE: replace [placeholders] and remove unused sections before activation.

- Owner: [name/team]
- Version: [version]
- Reviewed: [YYYY-MM-DD]
- Scope: [repository/applications/packages]

## 1. Instructions for coding agents

- Read this file before implementing code. Link it from AGENTS.md and require this step there.
- MUST = required; SHOULD = default with justified exceptions; MAY = optional.
- Placeholders are unresolved choices. Do not invent consequential architectural, security, data-integrity, or
  public-contract decisions; ask a focused question.
- Follow higher-priority agent instructions and explicit task requirements. Within engineering guidance: approved
  project exceptions → this standard → approved examples → nearby implementations.
- Inspect actual configuration; flag contradictions with this standard instead of silently choosing or changing it.
- Existing codebase: inspect affected implementations, callers, tests, and configuration. Preserve unrelated behavior;
  avoid spreading deprecated patterns.
- Empty codebase: follow section 11. Use approved examples or a pinned starter rather than unrelated architecture.
- Resolve minor reversible gaps using the nearest approved pattern and disclose assumptions.

## 2. Project and domain context

- Purpose/users: [short description]
- Scope/exclusions: [ownership boundaries]
- Vocabulary: [term → meaning; reuse exact names in code]
- Main flow: [entry point → validation → business operation → persistence → response/event]
- Invariants: [money, ownership, uniqueness, state transitions]
- Actors/permissions: [roles, tenant isolation, resource ownership]
- Detailed business context: [exact paths; summarize critical rules above]

## 3. Selected technology stack

Record actual choices and versions or authoritative version-file paths. Mark unused concerns N/A.

| Concern                        | Selection | Authoritative configuration / constraints |
| ------------------------------ | --------- | ----------------------------------------- |
| Language/runtime               | [value]   | [path]                                    |
| Package manager/workspaces     | [value]   | [manifest/lockfile/invocation]            |
| Framework/routing              | [value]   | [path]                                    |
| Build/formatter/lint/typecheck | [value]   | [paths]                                   |
| Validation/contracts           | [value]   | [usage]                                   |
| Database/SDK/ORM               | [value]   | [client/schema/migration paths]           |
| Authentication/authorization   | [value]   | [boundary]                                |
| Testing                        | [value]   | [config]                                  |
| Infrastructure/deployment      | [value]   | [IaC/pipeline]                            |
| Logs/metrics/tracing           | [value]   | [approved wrappers]                       |

- Approved internal utilities: [path/package → purpose → usage example]
- Dependencies: [when additions are justified; version/approval policy]
- Deprecated/disallowed technologies: [technology → replacement]

## 4. Structure and architecture

Replace this illustrative tree with the exact intended layout; remove unused layers.

```text
[application-root]/
  [entrypoints]/    # Transport, auth integration, response mapping
  [services]/      # Business rules and orchestration
  [repositories]/  # Persistence
  [schemas]/       # Validation and contracts
  [shared]/        # Approved reusable utilities
  [tests]/         # Or document colocated tests
```

- Organization: [feature-first/layer-first; placement rules]
- Allowed dependency direction: [e.g. entrypoint → service → repository]
- Forbidden dependencies: [specific prohibited imports/calls]
- Responsibilities: [what each selected layer owns and delegates]
- Dependency construction: [factories/instances/injection; lifecycle/test seams]
- Shared code: [extraction threshold; placement; allowed consumers]
- Imports/exports: [aliases, barrel policy, public package boundaries]
- File naming/test placement: [exact examples]

## 5. Coding behavior: implementation decisions

Choose concrete defaults and exceptions. Mechanical formatting belongs in executable configuration.

| Decision                 | Default / exception                                 | Example or exact reference |
| ------------------------ | --------------------------------------------------- | -------------------------- |
| Functions versus classes | [choice]                                            | [example]                  |
| Declaration/export style | [named/default; declaration/arrow]                  | [example]                  |
| Parameters               | [object/positional; threshold; defaults]            | [example]                  |
| Return contracts         | [annotation/inference; null/undefined/result/throw] | [example]                  |
| Types                    | [type/interface; inference; any/assertion policy]   | [example]                  |
| Naming                   | [functions, booleans, constants, schemas, IDs]      | [example]                  |
| Control flow             | [guard clauses; nesting; switch/exhaustiveness]     | [example]                  |
| Collections/mutation     | [loops/map/reduce; mutation policy]                 | [example]                  |
| Async work               | [await; bounded concurrency; failure semantics]     | [example]                  |
| Abstraction              | [when to extract; acceptable duplication]           | [example]                  |
| Configuration            | [env validation; defaults; initialization]          | [example]                  |
| Comments/documentation   | [when needed; rationale versus narration]           | [example]                  |
| Imports/formatting       | [type-only imports/order; config paths]             | [example]                  |

- Preferred traits: [3–5 observable preferences with reasons]
- Rejected patterns: [specific pattern → preferred alternative → reason]
- Generated files: [paths; generator command; direct-edit policy]

## 6. Validation, contracts, and error handling

- Validation boundaries: [transport, configuration, external data; trusted internal inputs]
- Schema/type ownership: [schema-first/type-first; paths]
- Input policy: [unknown fields, coercion, normalization, limits]
- Contracts: [response/event shapes; naming; dates; pagination; compatibility]
- Expected failures: [typed exceptions/results; error codes; approved constructors]
- Unexpected failures: [catch boundary; cause preservation; public-safe mapping]
- Error ownership: [which layer translates/logs/retries; avoid duplicate logs]
- Missing records: [not-found/null semantics by operation]
- External calls: [timeouts; cancellation; retryable failures; backoff; attempt limit]
- Idempotency: [operations; key scope; duplicate/replay behavior]
- Never swallow errors or expose secrets/internal traces in public responses.

## 7. Persistence and consistency

Delete unused database subsections. Select patterns rather than retaining alternatives.

### Shared

- Repository inputs/outputs and domain/storage mapping: [rules]
- IDs, timestamps, money: [generation; units/timezone; precision]
- Transactions/concurrency: [ownership; atomicity; conditions/versioning]
- Pagination/order/limits: [stable order; maximum page/batch size]
- Deletion/retention: [soft/hard delete; recovery; audit]

### RDS / relational

- Engine/client/connection lifecycle: [pooling; transaction ownership]
- Migrations: [tool; naming; compatibility; backfill/rollback]
- Queries: [parameterization; indexes; loading/joins; N+1 prevention]

### DynamoDB

- Tables/indexes/keys: [PK/SK formats; entities; supported access patterns]
- SDK representation: [DocumentClient/native values or low-level AttributeValue; conversion boundary]
- Reads/writes: [Query/Scan policy; consistency; conditions; transactions]
- Batches/indexes: [unprocessed-item retries; filters; capacity/item-size/TTL constraints]

### MongoDB

- Collections: [validation; embedding/reference rules; ID representation]
- Queries: [unique/compound indexes; projections; bounded pagination]
- Writes/evolution: [atomic operators; transactions; schema migrations]

## 8. Security and operational behavior

- Authentication/resource/tenant authorization: [exact enforcement points]
- Secrets: [approved storage/access]; never commit or log credentials.
- Sensitive data: [classification, redaction, encryption, retention]
- Logging: [logger, levels, structured fields, correlation IDs]
- Limits: [payload, concurrency, runtime/memory, external rate limits]
- Infrastructure: [environment separation, least privilege, health checks]
- Observability: [required metrics, alerts, audit events; N/A if unused]

## 9. Testing and verification commands

- Test observable behavior/contracts rather than private implementation details.
- Unit coverage: [business rules, transformations, failure cases]
- Integration coverage: [database semantics, transactions, API boundaries]
- End-to-end coverage: [critical journeys]
- Naming/layout: [conventions; approved test reference]
- Mock boundaries: [what may be mocked; what needs real/local dependencies]
- Determinism: [fixtures, clocks, IDs, isolation, cleanup]
- Bug fixes: meaningful regression test where practical; explain omissions.
- Checks by change type: [code/schema/UI/docs/infra → required checks]

| Operation                | Exact command                 | Working directory / prerequisites |
| ------------------------ | ----------------------------- | --------------------------------- |
| Install                  | [command]                     | [value]                           |
| Develop                  | [command]                     | [value]                           |
| Format check             | [command]                     | [value]                           |
| Lint                     | [command]                     | [value]                           |
| Typecheck                | [command]                     | [value]                           |
| Targeted tests           | [command including selection] | [value]                           |
| Integration tests        | [command]                     | [local services]                  |
| Build                    | [command]                     | [value]                           |
| Generate/migrate locally | [command]                     | [value]                           |

Never claim a check passed unless it ran successfully. Report blocked checks.

## 10. Approved examples: the engineer's coding fingerprint

Provide reviewed examples consistent with this standard. Empty projects need inline examples or an accessible pinned
starter. Unresolved links are not usable examples.

| Pattern                    | Exact path + symbol or inline example        | Decisions to reproduce                    |
| -------------------------- | -------------------------------------------- | ----------------------------------------- |
| Complete feature           | [entrypoint/service/repository/schema/tests] | [boundaries and flow]                     |
| Typical function/component | [reference]                                  | [signature, naming, control flow, return] |
| Validation/failure path    | [reference]                                  | [schema, error construction/mapping]      |
| Database operation         | [reference]                                  | [query, conditions, mapping, pagination]  |
| Test                       | [reference]                                  | [fixtures, assertions, mocking]           |

Repeat this block for important preferences:

```text
Scenario: [concrete decision]
Preferred: [small complete code snippet]
Avoid: [contrasting snippet]
Reason: [project constraint or observable benefit]
```

Label legacy examples explicitly. Reproduce decisions rather than unrelated business logic.

## 11. Agent workflow and empty-project bootstrap

### Existing project

1. Read this standard and applicable repository instructions.
2. Trace the affected flow; inspect contracts, examples, tests, and configuration.
3. Identify affected layers and compatibility; plan proportionately to complexity.
4. Implement the smallest complete change using approved patterns.
5. Run relevant checks; inspect the final diff for unintended edits.
6. Update affected contracts/context/examples when behavior or conventions change.
7. Report outcome, checks, assumptions, and material limitations concisely.

### Empty project

1. Populate stack, structure, coding defaults, applicable persistence rules, commands, and examples. Clarify
   consequential missing choices.
2. Use starter [location + pinned version], or scaffold the selected stack and minimal documented structure.
3. Configure package management, formatting, linting, typechecking, tests, and environment validation.
4. Build one working vertical slice: [named operation + acceptance criteria], including a failure path and meaningful
   test.
5. Add setup instructions and environment-variable examples without secrets.
6. Verify installation, relevant checks, and build; disclose unavailable prerequisites.
7. Avoid unrequested infrastructure, unused layers, and speculative features.

## 12. Completion, exceptions, and maintenance

Complete means requested behavior works, applicable rules are followed, relevant checks pass or blockers are disclosed,
and affected contracts/documentation are current.

| Exception / unresolved decision | Scope and reason | Owner   | Review date |
| ------------------------------- | ---------------- | ------- | ----------- |
| [value or none]                 | [value]          | [value] | [value]     |

Update this file when approved decisions change. Do not turn one-off choices into company rules without the designated
owner's approval. Resolve placeholders and remove unused sections and duplicated explanations before activation.
