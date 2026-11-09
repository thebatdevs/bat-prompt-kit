---
name: create-ts-monorepo-entity-utility-types
description:
  Create or migrate shared entity utility schemas and inferred types beside a user-provided canonical schema in this
  TypeScript monorepo. Generates entity.utility.types.ts with applicable request, response, summary, criteria,
  pagination, and service parameter contracts, following CustomConfig conventions without inventing domain fields or
  generating repositories, services, or routes.
---

# Create shared entity utility types

Create `<entity>.utility.types.ts` next to the provided `<entity>.types.ts` inside `packages/schemas/src/`, following
`packages/schemas/src/custom-config/custom-config.utility.types.ts`. Derive contracts from the existing canonical entity
schema; this workflow does not create or complete the domain model.

## Inputs and evidence

- Require the canonical schema path and identify the selected entity if the module contains multiple entities. Resolve
  repository-relative paths from the repository root. Derive the output directory from the schema's directory, not from
  the CustomConfig domain name or a selected stack.
- Inspect the canonical schema, referenced field schemas, inferred entity/partial/optional aliases, and public barrels.
  Require a complete user-defined schema; report missing domain definitions rather than inventing or modifying them.
  Preserve actual exported names and reuse existing Prt/Opt/OptPrt aliases where their guarantees fit.
- Read applicable `AGENTS.md`, `.agents/rules/ts.engineering-standard.md`, `.agents/rules/project-profile.md`, and
  relevant memory topics when present. Inspect the working tree and existing utility contracts/consumers before editing.
- Verify primary keys, their native types, mutable/server-owned fields, status rules, audit fields, update version
  semantics, defaults/transforms, collection projections, and pagination against configuration and explicit
  requirements. A schema field name or enum alone does not establish editability, state transitions, or concurrency
  policy.
- Infer a relevant stack from explicit context or an unambiguous consumer only when needed to verify those facts. Ask
  about consequential gaps before dependent contracts; generate independently established contracts without blocking on
  an optional summary or unsupported operation.

## Scope and ownership

- Create or update only the selected entity's utility module, required public exports, affected consumer imports, and
  existing documentation/context needed to explain the resulting contracts.
- A utility module contains schemas and types, plus small pure derivation helpers when useful. Do not generate
  repositories, services, API handlers/routes, table resources, IAM policies, tests, or unrelated entity utilities.
- Do not copy stack-private imports into shared code. Import canonical schemas and common schema primitives through
  package-local paths; consumers import the result through `@motforex-monorepo-packages/schemas`.
- Do not import the schemas package's own public root from inside the utility module; avoid barrel/self-import cycles.
  Do not introduce AWS clients, command execution, environment loading, or business side effects.
- This user-requested shared utility layout places applicable request/response/service contracts in the schemas package.
  It explicitly differs from the standard's usual stack-local API contract ownership. Record the selected entity's
  scoped ownership decision in the project profile; do not treat the CustomConfig exception as permission to migrate
  every entity. Do not silently rewrite the engineering standard or other generation skills.
- Keep source files readable and within the applicable 250-line limit. Avoid duplicating field rules, compressing
  formatting, or creating empty operation contracts merely to match the reference.

## Contract derivation

Use actual entity names in exports, following conventions such as `create<Entity>ReqSch`, `Create<Entity>Req`,
`patch<Entity>ReqSch`, `<entity>SummarySch`, `<entity>ResponseSch`, and `<entity>CriteriaSch`. Infer public types from
runtime schemas with `z.infer`/`z.input` as appropriate; distinguish transform input from parsed output when needed. Do
not manually widen enums, replace field validation with z.any, or promise fields that runtime schemas omit. Place
related inferred types next to their runtime schemas, matching the canonical package's conventions.

### Create and patch

- Derive creation inputs with `.omit()`/`.pick()` using confirmed writable fields. Exclude server-owned keys, creation
  and update audit fields, and status when initial status is service-owned. Retain canonical nullable requirements,
  normalization, and confirmed create defaults. Do not infer new defaults or ID strategies.
- Derive partial edits from writable fields, rejecting keys and immutable fields. Keep status separate when dedicated
  status operations are required. Remove create defaults from patch fields before making them optional so omission never
  resets a stored value; preserve explicit null only for canonical nullable fields.
- Add an expected-version field only when the entity's verified repository/service contract requires it. Reuse its
  canonical version schema and units; do not assume every entity has millisecond updatedAt concurrency.
- Reject unknown request fields consistently with the established contract. A patch must contain an actual editable
  value: a version-only object or editable fields supplied only as undefined must not count as an edit.
- If version-only service/request types are needed, derive them from existing utility contracts or package-local schema
  primitives. Never depend on a stack's common.ts just to reuse a version type.

### Responses and summaries

- Reuse the canonical schema for complete detail/create responses when the stored entity is the intended public shape;
  otherwise use the confirmed response projection. Do not expose private fields just to match a sample entity.
- Derive summary schemas with `.pick()` from the confirmed server-owned collection projection. Do not guess which fields
  should appear. Export a typed readonly summary-attribute tuple when used by consumers and keep it aligned with the
  summary schema's required fields.
- Preserve existing response and absence contracts. Do not use a full entity schema for a projected or partial update
  response; do not weaken required keys/audit values to a completely partial type.

### Criteria: original values or nonempty arrays

- Include every canonical entity field in the criteria schema. Each primary-key component accepts only its original
  single-value schema and remains optional for criteria; never widen a primary key to a membership array.
- Every non-key field accepts either its canonical value schema or a nonempty readonly array of values validated by that
  exact schema. This includes audit fields, enums, numeric fields, and nullable values where the original permits them.
  Do not special-case only status, hardcode string arrays, or widen an enum's allowed members.
- Make criteria optional field-by-field, reject unknown keys and empty arrays, and require at least one defined
  criterion. Remove default injection from criteria schemas when necessary so omitted inputs cannot manufacture filters.
- Preserve output inference: a numeric field stays numeric or a numeric array; a nullable field can support null or
  `[null, validValue]`; enum arrays retain the enum union. The primary key retains its verified native type.
- Prefer canonical field-schema references and a small typed scalar-or-array helper. The reference's explicit shape plus
  `satisfies Record<keyof typeof entitySch.shape, z.ZodType>` verifies full field coverage without unsafe shape casts.
  Check compatibility with installed Zod/TypeScript rather than copying unsupported generic patterns.
- The intended matching contract is AND across supplied fields and membership within an array criterion; undefined
  imposes no constraint. For canonical array/object fields, preserve the original value versus list-of-values types
  without flattening nested arrays. Check any existing matcher for scalar/array ambiguity and structural equality;
  report or update an affected matcher only as required to keep the changed contract functional.
- Criteria declare shapes, not retrieval/cardinality policy. Do not infer first-match/unique-match behavior, indexes,
  unbounded scans, locking, or persistence filters from the existence of a criteria schema.

### Pagination and service parameters

- Include collection query schemas only for verified access patterns and existing cursor contracts. Validate bounded
  limits and native continuation-key fields, including composite keys/index keys when configured.
- Do not copy CustomConfig's string-only idParamsSch into numeric-key entities. Derive native key validation from the
  selected entity and configuration. Reuse a shared key schema only when it actually matches that entity.
- Create update/status/delete parameter types only for supported operations. Preserve trusted actor provenance,
  expected-version units, separate status payloads, and real repository/service result shapes. A utility module does not
  imply that deletion, audit fields, or every CRUD operation exists for the entity.

## Migration and verification

When moving existing contracts, read the full source and preserve its exported names, runtime validation, defaults, and
public types unless a contract change is explicitly requested. Remove the old module only after all real callers are
updated. Avoid compatibility shims unless existing consumers require them. Export the new module through the nearest
domain barrel and verify that it reaches the public schemas root without duplicate export names or cycles.

Inspect the final imports for stack-private dependencies and search consumers for stale paths. Update relevant existing
stack documentation and the project profile's ownership decision; do not duplicate the canonical field specification.

Run the schemas package's declared type-check, affected consumers' type-checks, targeted lint/format checks, relevant
existing tests, and `git diff --check`. Inspect actual manifests/scripts first. Do not generate tests, fixtures, mocks,
snapshots, or type-test files unless the user explicitly requests them. Do not deploy or contact live AWS.

Report the input schema/entity, output module and public export path, generated contract groups, preserved versus
explicitly changed behavior, checks actually run, and unresolved decisions. An empty test run does not establish
behavioral coverage. Report missing prerequisites and unavailable verification accurately.
