---
name: generate-zod-entity-utilities
description:
  'Generate portable JHipster-style criteria, create, and update Zod schemas with inferred TypeScript types from an
  entity schema path and export name, in a sibling utility types file.'
---

# Generate Zod Entity Utilities

Derive utilities from the canonical Zod entity schema. Discover target-project conventions; require no
repository-specific paths, packages, metadata files, framework, database, or companion skill.

## Inputs and output

Required inputs:

- `schemaPath`: path to the existing TypeScript source file, relative to the target project or absolute.
- `schemaName`: exact exported Zod schema identifier, for example `productSch`.

Optional overrides: entity name, filename stem, criteria representation/operators, omissions, immutable fields,
caller-assigned identifiers, and update requirements. Precedence: explicit user choices, verified contracts for this
entity, then defaults below. Infer missing inputs when unambiguous; ask only for unresolved information.

Resolve a supplied barrel/re-export to its defining file as `sourcePath`; otherwise `sourcePath = schemaPath`. Write
`<entity>.utility.types.ts` in `dirname(sourcePath)`. Never redirect it to a central output directory.

Use the supplied entity name or remove a trailing `Sch`/`Schema` from the export. Use PascalCase `<Entity>` and
lowerCamelCase `<entity>` identifiers, following project acronym conventions; do not silently singularize plurals. For
the filename stem, use an explicit override, then established entity filename casing, otherwise kebab-case.

Export these values and output types:

| Value                 | Type               |
| --------------------- | ------------------ |
| `<entity>CriteriaSch` | `<Entity>Criteria` |
| `create<Entity>Sch`   | `Create<Entity>`   |
| `update<Entity>Sch`   | `Update<Entity>`   |

Use `z.infer<typeof schema>` for output types. When coercion, defaults, preprocessing, or transforms change input versus
output, also export the corresponding `<Entity>CriteriaInput`, `Create<Entity>Input`, or `Update<Entity>Input` using
`z.input`. Export actual schemas as well as types.

## Inspect the target project

- Read applicable project instructions, the defining schema, imports/base schemas, and nearby utilities. Identify
  fields, validators, wrappers, transforms, refinements, and ownership.
- Inspect the relevant manifest, lockfile, TypeScript configuration, and validation usage. Match installed Zod
  version/entry point, import extensions, style, and check commands; do not upgrade or add dependencies.
- Inspect related request contracts/callers for managed/immutable fields, filter semantics, and update identity. Do not
  import unrelated entities' business rules.
- Establish output naming, per-field operators, and write omissions before editing. Clarify consequential gaps, such as
  custom identifier ownership or faithful derivation from an opaque transformed schema.

Import the original schema directly using project-compatible syntax; avoid barrels that re-export the utility and create
cycles. Edit only the utility file unless integration changes are requested. Preserve unrelated existing exports, avoid
duplicates, and leave the canonical schema and barrel exports unchanged.

## Criteria contract

Default to JHipster-style operator objects per field:

```ts
// productCriteriaSch input, assuming these fields exist on productSch:
{
  name: { contains: 'desk' },
  price: { greaterThanOrEqual: 100, lessThan: 500 },
  status: { in: ['ACTIVE', 'DRAFT'] },
  deletedAt: { specified: false },
}
```

Use another representation only when requested or required by this entity's consumers, not merely used elsewhere.

Build optional filters for original fields, including identity/audit fields omitted from writes. Select operators by
semantic type through optional/nullable/default wrappers. Base operators: `equals`, `notEquals`, `in`, `notIn`,
`specified`.

| Semantic field kind                                          | Operators                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| String                                                       | Base plus `contains`, `doesNotContain`                                            |
| Number, bigint, date, verified timestamp/date representation | Base plus `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`      |
| Boolean, enum, literal, scalar union                         | Base                                                                              |
| Object, array, tuple, record, complex union, opaque value    | `specified` only; more require verified consumer semantics or an explicit request |

- Operators are optional, but each supplied filter object needs a defined operator; `{}` and `{ equals: undefined }`
  fail. Top-level `{}` means no filters and is valid. Check defined values, not truthiness: `false`, `0`, and `0n`
  count.
- Make criteria and operator objects strict; reject unknown fields and unsupported operators. Multiple operators and
  fields combine with AND. Do not generate query execution or promise database support.
- `in`/`notIn` require nonempty arrays of defined, non-null scalar operands. Equality/membership reuse canonical
  validation, including enum/literal restrictions and applicable coercion/transforms, without defaults or catch
  fallbacks. Ordering preserves comparable type and date/number representation; omit entity-only value bounds unless the
  query contract requires them. For example, a positive-valued field may accept `greaterThan: 0`. Reject null/undefined
  before operand coercion; invalid operands must not become filters through fallback values.
- `contains`/`doesNotContain` accept nonempty fragments without full-value format, regex, or length constraints (such as
  email/UUID/URL validation). Enums and string literals do not gain substring operators.
- `specified` accepts booleans only: `true` means present and non-null; `false` means absent or null. Use this for null
  checks instead of `equals: null`, including on required entity fields.
- Recognize date/timestamp strings or numbers only from verified schema meaning. Do not add string lexicographic
  ordering, nested filters, array membership, joins, pagination, sorting, OR/NOT groups, or transport decoding without a
  requirement.

Inputs are already-decoded objects. HTTP strings, comma-separated lists, and dotted keys such as `name.contains` need
boundary decoding when requested. Do not use `z.coerce.boolean()` for textual booleans: `'false'` is truthy.

## Create contract

- Omit actual server-managed identity/audit fields from the canonical object. Default `id`/`_id`, `createdAt`,
  `updatedAt`, `createdBy`, and `updatedBy` to managed; recognize snake_case and actual audit spellings such as
  `createdb`. Inspect deletion audit fields, generated sequences/versions, and computed values. Omit only existing keys;
  preserve caller-assigned identifiers when required by the user or verified contract.
- Preserve writable foreign keys such as `customerId`; an `Id` suffix or `.readonly()` alone does not establish server
  ownership. Do not remove status, owner, tenant, or domain fields without ownership evidence.
- Preserve writable fields' requiredness, nullability, defaults, transforms, constraints, and applicable object
  invariants. Do not make the create schema partial.
- Reject unknown keys, including omitted managed fields, by default. Explain any verified alternative policy; it must
  still prevent omitted managed fields from passing through.

## Update contract

- Default to PATCH: omit create's managed fields plus verified immutable fields; make other top-level fields optional
  using the shared writable shape where possible. Preserve supplied-value validation and nullability; optional does not
  mean nullable. Match create's unknown-key policy.
- Keep identity in a separate route/key contract without generating an ID parameter schema. Include a required
  identifier/concurrency token only when requested or required by the update contract; do not invent version fields,
  `expectedUpdatedAt`, or status-transition rules.
- Require a defined editable field. Reject `{}`, `{ name: undefined }`, and identity/concurrency-only bodies. `false`,
  `0`, and permitted empty strings or `null` count as edits.
- Omitted properties must stay absent after parsing. `.partial()` may retain insertion behavior from defaults,
  prefaults, catches, preprocessors, or transforms. Use supported APIs to remove insertion behavior or guard input
  presence so output retains only supplied, defined edit keys. Preserve validation/transforms for supplied values;
  inspect parsed output and inferred input/output types.
- Partial updates are shallow: nested objects retain their full schema and arrays are replacements. Use recursive
  partials or PUT semantics only when required.
- Preserve cross-field invariants when all needed edit fields are present. Explain that checks requiring omitted stored
  values belong on the merged entity in the application. Do not apply full-entity refinements blindly to partial data or
  claim PATCH validation proves the final stored entity valid.

## Composition and compatibility

Prefer supported `.omit()`, `.pick()`, `.partial()`, and canonical `.shape` validators with explicit filters and small
typed helpers. Do not build a generic runtime converter for one utility file.

Inspect public definitions for refined objects, Zod 3 effects, pipes, unions, intersections, lazy schemas, and
preprocessors before composing them. Reuse exported base objects and applicable refinements; adapt checks to
input/output semantics. Shape spreading can lose object refinements; `.omit()`/`.partial()` can reject refined schemas
in some versions. Do not discard checks, mutate internals, or mask incompatibility with `any`, double casts, private
`_def`/`_zod` access, or untyped helpers. If faithful derivation needs an out-of-scope source change, explain the
obstacle and request the needed decision.

Use the installed entry point's public APIs/types. Consult [Zod APIs](https://zod.dev/api) and
[migration notes](https://zod.dev/v4/changelog) when needed; verify against installed dependencies rather than assuming
latest documentation applies.

## Verify and report

Run available targeted type/lint and relevant existing checks for the owning package. Verify imports, schema
construction, and type inference. When safe and supported, use an existing runner for disposable parse checks; do not
add tests, fixtures, tooling, dependencies, or configuration unless requested.

Check valid/invalid operators, enum operands, `false`/zero, unknown keys, empty membership arrays/filter objects, `{}`
criteria, the chosen ordering-boundary policy, create required fields, managed-field rejection, empty updates, absent
defaulted fields, nullable edits, and source-specific transforms/refinements. Type checks do not prove runtime parsing
behavior; report unavailable checks.

Report the output path, schema exports, omitted/immutable fields, criteria/update semantics, actual checks, and material
assumptions or limitations.

Example invocation in any target project:

```text
Use $generate-zod-entity-utilities with schemaPath src/catalog/product.types.ts
and schemaName productSch.
```

With no naming override or conflicting project convention, that invocation writes `src/catalog/product.utility.types.ts`
with `productCriteriaSch`, `createProductSch`, and `updateProductSch`. The paths above are illustrative inputs, not
required project structure.
