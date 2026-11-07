---
name: create-ts-monorepo-stack-dynamodb-repository
description:
  Create or extend a single typed DynamoDB entity repository from a user-provided schema path in this monorepo. Requires
  a complete user-defined entity schema and its Prt, Opt, and OptPrt type exports; follows the CustomConfig repository
  pattern without generating schemas, services, or API routes.
---

# Create a TypeScript monorepo stack DynamoDB repository

Create `<target-stack>/src/repository/<kebab-case-entity>.repository.ts` using the provided canonical schema and the
public `@motforex-monorepo-packages/aws-dynamodb` package. This skill generates repository code, not a new domain model.

## Inputs and prerequisites

- Require the user to identify the schema file path. Resolve relative paths from the repository root.
- Identify the selected entity when the file defines multiple entities. Infer the target stack from explicit session
  context or an unambiguous existing consumer; otherwise ask for the target stack before writing the repository.
- Read the complete canonical schema, its referenced schemas, type exports, and package exports. The schema must be
  fully defined by the user. Do not invent fields, replace placeholders, or modify the canonical schema to enable
  generation.
- Require the complete entity type and `Prt<Entity>`, `Opt<Entity>`, and `OptPrt<Entity>` exports. Verify that they
  represent partial, optional complete, and optional partial records, respectively. Reuse actual names and absence
  unions; for example, the reference exports `CustomConfigs`, `PrtCustomConfigs`, `OptCustomConfigs`, and
  `OptPrtCustomConfigs`.
- If required schemas or aliases are absent or incomplete, identify the missing exports and request the user's completed
  schema. Do not synthesize them or bypass the prerequisite with local substitutes.
- Verify primary keys, key types, indexes, table environment binding, immutable fields, audit fields, defaults, update
  version semantics, and entity-specific guards against configuration and explicit requirements. Schema field names
  alone do not establish business rules. Resolve missing consequential decisions before implementing dependent
  operations.

## Repository evidence

Read applicable `AGENTS.md` instructions, `.agents/rules/ts.engineering-standard.md`, and
`.agents/rules/project-profile.md`. Read relevant `.agents/memory` topics only when present. Preserve existing user
work.

Use these repository-relative sources; resolve them from the repository root:

- `stacks/admin-finance-config/src/repository/custom-config.repository.ts`: reference for file organization, typed
  projections, conditional create/update, partial update results, and optional deletion.
- `packages/dynamodb/src/commands.ts` and `packages/dynamodb/src/index.ts`: installed command signatures and public
  exports. The directory is `packages/dynamodb`; the package import is `@motforex-monorepo-packages/aws-dynamodb`.
- The selected stack's `serverless.ts`, constants, manifests, existing repository consumers, and verification scripts:
  authoritative table bindings, provisioned access patterns, dependencies, and runnable checks.

Use the reference's mechanics, not its CustomConfig-specific ID type, READONLY rule, field names, or scan necessity.
Inspect installed command-builder types when their behavior matters. Do not import `dynamo-craft` or AWS SDK clients
into a stack merely to recreate helpers already exported by the shared package.

## Single-file organization

Keep the entity's repository types, runtime schemas, persistence functions, and local utilities in the one requested
file:

1. Imports, then **all module-level type definitions**, including exported request/result aliases.
2. Derived runtime schemas and constants. Type aliases may refer to runtime schemas declared later in the module.
3. Exported **get functions**: detail, applicable query/scan reads, and table description when in scope.
4. Exported **create functions**.
5. Exported **update functions**.
6. Optional delete functions only when requested or required by the entity's verified contract.
7. Utility functions last; export entity-specific utilities when they are part of the repository's intended interface.

Implement only applicable operations. A request limited to reads does not authorize writes. For an otherwise
unrestricted request to create a repository, include detail, create, and update operations when their prerequisites are
established; include collection and table-description reads as supported by the verified requirements and table access
patterns. Delete, batch, transaction, and automatically paginated operations are not mandatory boilerplate.

Use named exports and entity-specific function names, preserving existing public names when extending a repository. Use
`get` naming for new retrieval functions; retain established query/scan names when maintaining existing consumers. Do
not create a second helper/type file, combined multi-entity repository, service, handler, API route, or table resource
merely to complete this skill. Do not change IAM, provision indexes, or deploy.

The user-selected single-file layout takes precedence when it conflicts with the standard's file naming or line limit.
Keep the code readable rather than compressing it. Record a scoped exception in the project profile when needed; the
existing CustomConfig exception is not blanket approval for unrelated changes.

## Persistence contracts

- Import schemas and helpers through their public workspace packages. Use actual declared dependencies; add a workspace
  dependency only when needed through the repository's package-manager workflow.
- Resolve only this entity's table through its verified environment constant and `getRequiredEnvVar`, lazily within
  operations. Never accept a table name from the caller or invent an environment binding.
- Construct and validate native keys from the canonical schema and provisioned key definition; support composite keys
  only when configured. Use shared commands rather than direct SDK calls.
- Reuse `DynamoGetOptions`, `DynamoQueryOptions`, `DynamoScanOptions`, `DynamoPutOptions`, `DynamoUpdateOptions`, and
  `DynamoDeleteOptions` where applicable. These omit `tableName`; narrow them further for repository-owned keys,
  attributes, write construction, and mandatory conditions. Do not expose unrestricted command options that bypass
  guards.
- Document exported functions, absence semantics, pagination, expected conflicts, and partial effects. Await writes
  inside the error boundary; preserve original errors and causes when translating conditional failures to `CustomError`.
  Do not swallow errors or manufacture successful results.

### Reads and projections

- Full detail reads return the validated entity or `undefined` when absent. Use an accurate absence type; do not promise
  `null` unless returned. Do not use an optional-partial alias when a complete or precisely selected record is
  guaranteed.
- Derive a selected-record type from an attribute-array generic using const type parameters: no selection means the full
  entity; a fixed tuple means `Pick<Entity, Attributes[number]>`; a dynamically sized array means
  `Partial<Pick<Entity, Attributes[number]>>`. Use `number extends Attributes['length']` to distinguish dynamic arrays.
  This avoids promising every member of a key union when only some occur at runtime.
- Permit nonempty arrays of canonical top-level attribute keys. Validate the selection before persistence access, derive
  its `.pick()` schema, and require each selected field at runtime. Full reads use the complete schema. Return parsed
  values, not the original unvalidated SDK items. Reject raw projection expressions unless an equally precise validation
  and typing contract is explicitly in scope. Do not silently accept unknown, empty, or unsupported nested selections.
- Keep assertions localized to connecting a runtime-validated projection mask to its generic selected-record type;
  assertions must not replace runtime validation. Avoid broad `any` returns or weakening strict TypeScript.
- Collection functions return a typed SDK envelope with parsed `Items`; preserve cursors, count, capacity, and request
  metadata. Put result aliases such as `Queried<Entity><Selection>` at the top. COUNT responses may omit `Items`.
- Query only real partition/index key patterns. Never invent indexes or use Query for arbitrary non-key filtering. For
  tables without a collection query pattern, justify one bounded Scan and preserve its continuation cursor. Adapt limits
  to the verified contract; the CustomConfig reference uses default 20 and range 1–100.
- Do not automatically fetch every page. Empty filtered pages can still have a continuation key. Preserve this
  distinction. Table-description functions retain the existing SDK administrative response convention unless the task
  requires another.

### Creates and updates

- Create accepts a complete service-owned record, validates it, conditionally rejects an existing key, awaits
  persistence, and returns the validated saved entity. ID allocation, initial status, actor selection, and timestamps
  belong to the service; never generate or infer these business values in the repository.
- Derive update schemas from the canonical schema. Exclude keys and immutable creation fields; preserve omitted values,
  distinguish null from omission, and remove creation defaults before making editable fields optional when applicable.
- Prefer one object parameter containing the key/item, expected version, and optional structured condition. Separate
  keys before strictly parsing changes. Require the verified service-owned audit fields and validate version advancement
  when the entity uses updatedAt concurrency. Do not add version or audit fields absent from the user-defined model.
- Atomically AND mandatory existence/version/entity guards with an optional condition typed from
  `DynamoUpdateOptions['condition']`. Keep additional conditions trusted and service-owned; do not forward raw HTTP
  input. Never allow caller spreading, OR joins, or extra options to replace mandatory guards. Apply READONLY only when
  the selected entity has that confirmed rule.
- Build updates from supplied validated fields only. Use `UPDATED_NEW`, validate returned attributes, add the validated
  key, and return changed fields plus the entity's required key/version/update-audit fields. Define an exported result
  alias matching the runtime schema; other entity fields remain optional. Do not return a complete entity type for a
  partial response or weaken required output keys to a fully partial alias.
- If deletion is in scope, conditionally enforce applicable existence/version/entity guards and return `Promise<void>`
  after success. Align its documentation. Do not add a delete command to every repository.

## Verification and completion

Inspect the final repository and its callers for import/path, runtime-schema/type, and documentation consistency. Keep
all type declarations at the top and utilities at the bottom. Update moved imports and affected reference links.
Document material return-contract changes in existing stack documentation rather than generating unrelated
documentation.

Run the selected stack's declared type-check and targeted lint/format checks, relevant existing tests, and
`git diff --check`. Inspect actual scripts first. Do not generate test files, test cases, fixtures, mocks, snapshots, or
type-test files unless the user explicitly requests tests. Do not invoke deployments or live AWS calls as verification.

Report the schema/entity, created repository path, implemented operations, table/access-pattern evidence, checks
actually run, and unresolved decisions. An empty test run is not behavioral coverage. Do not assign a verified quality
score based solely on static checks; report implementation complete with verification limits when relevant.
