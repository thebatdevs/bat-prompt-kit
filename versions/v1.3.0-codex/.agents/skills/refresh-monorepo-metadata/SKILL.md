---
name: refresh-monorepo-metadata
description:
  'Discover a TypeScript serverless monorepo and populate or refresh monorepo.metadata.json with verified workspace
  paths, reusable capabilities, services, commands, and evidence. Use for onboarding or refreshing repository context.'
---

# Refresh Monorepo Metadata

Inspect the target codebase and write a compact capability index during this invocation. Discover actual paths,
packages, and services; require no particular aliases, layout, AWS services, or companion files.

## Resolve source and destination

- Optional inputs: `repoRoot`, `metadataPath`, and a limited refresh scope (packages/services/sections).
- Default `repoRoot` to the active source workspace, confirming its boundary from workspace configuration, manifests,
  and repository instructions. Honor an explicit root. Do not guess an external checkout from historical documentation.
  If no relevant source workspace is available, ask for its path before writing factual metadata.
- Default `metadataPath` to `monorepo.metadata.json` inside the `.agents` directory containing this skill. An explicit
  destination overrides it. In a normal installation this is `<repoRoot>/.agents/monorepo.metadata.json`; in a versioned
  bundle it remains inside that bundle unless overridden. Keep source root and destination separate.
- Read applicable instructions, current metadata, and the source working-tree state. Preserve unrelated edits. If
  existing JSON is malformed, report the error and request a correction rather than overwriting it.

This is repository discovery: do not install dependencies, execute application imports, run builds/checks, resolve
Serverless configuration through a command, deploy, or call cloud resources. Commands and imports can load credentials
or perform I/O. Read their definitions instead. Do not inspect secret-value files or record credentials, tokens, private
keys, connection strings, or environment values; configuration variable names are enough.

## Discover verified facts

1. Read the root manifest and actual workspace declarations (package-manager configuration, workspace manifests,
   task-runner configuration, and applicable TypeScript project references). Enumerate their real member packages,
   including services/apps outside a conventional `packages/` folder. Exclude dependency trees, caches, generated
   output, and unrelated checkouts. Do not assume pnpm or a fixed folder convention. Record partial discovery.
2. Read member manifests, dependency declarations, public exports/entrypoints, and relevant source. Derive exact package
   names, workspace-relative paths, internal dependency links, and importable API surfaces. Follow local re-exports to
   implementations; distinguish local APIs from dependency re-exports and private helpers. Inspect implementations
   before claiming behavior. Inventory useful capability groups, not every internal symbol.
3. Inspect serverless/service configuration as text: service boundaries, config files, handler roots, event types,
   persistence/integration clients, and shared tooling. Follow local config imports where needed, without evaluating
   config code or resolving remote variables. Separate statically declared resources from verified runtime behavior.
4. Inspect scripts and task definitions, including chained scripts, hooks, and referenced executables where available.
   Record exact runnable commands and working directories, purposes, prerequisites, and possible effects. Separate
   checks, development commands, and deployment/mutation commands. A script named `test` or `check` is not proof that it
   is safe or that it has passed; unresolved executable behavior has unknown effects.
5. Consult documentation/library indexes as navigation aids, then verify consequential facts against current files. Do
   not import stale API descriptions or another repository's package inventory as current facts. Record conflicts and
   gaps instead of inventing paths, tooling versions, capabilities, or business rules.

For capabilities, identify the owning package/service, public import path when one exists, useful exports, brief
behavior, and meaningful effects (for example local validation, external reads, writes, or unknown effects). Include
evidence paths so the next agent can inspect only the relevant files. Do not duplicate implementations, full signatures,
detailed domain policies, or large API catalogs; link existing maintained references where useful.

## Metadata contract

Write valid UTF-8 JSON, two-space indentation and a final newline. Use these core fields; preserve unrelated custom
fields. Paths use forward slashes. Except for `repositoryRoot`, path fields are relative to the discovered source root,
even when metadata lives outside it. Evidence consists of actual source/config paths, with optional symbols or headings
recorded separately; do not embed unstable line numbers into filesystem paths.

- `schemaVersion`: Integer `1` for this contract. If an existing file declares another version, inspect its contract and
  compatible consumers before changing it; do not silently migrate an unknown format.
- `name`: Root manifest's actual package name, otherwise the source directory name; never the bundle version merely
  because metadata lives there.
- `repositoryRoot`: Path from the metadata directory to the source root, normally `..` in an installed repository. No
  absolute machine-specific source path.
- `snapshot`: `{ verifiedAt, revision, dirty }`: actual inspection time as an ISO timestamp with timezone, source Git
  HEAD or `null`, and observed working-tree dirty state or `null` if unavailable. Capture source state before metadata
  writes; do not call a dirty checkout clean.
- `tooling`: Array of `{ name, declaredVersion, resolvedVersion, evidence }`. Version values are strings or `null`;
  distinguish manifest constraints from inspected lockfile resolutions and record conflicting resolutions as gaps.
  Include relevant Node/package-manager/TypeScript/Serverless/build tooling only when found.
- `requiredPackagesPaths`: Object mapping existing role keys or discovered package names to verified
  source-root-relative package directories, or `null` when unresolved. See merge rules below.
- `packages`: Array of `{ name, path, kind, entryPoints, workspaceDependencies, evidence }`. `name` is the exact
  manifest name, `path` the package directory; `kind` is `shared`, `service`, `app`, `tooling`, or `unknown`. Other
  fields are string arrays. A root workspace package may use `.`.
- `capabilities`: Array of `{ id, owner, summary, importPath, exports, origin, effects, evidence }`. Stable `id`;
  `owner` is a package name or service ID present in this file. `importPath` is a verified public specifier or `null`;
  `exports` is a string array. `origin` is `local` or `dependency-reexport`; `effects` is a string array, including
  `unknown` when needed. Never recommend private helpers as public imports.
- `services`: Array of `{ id, path, configFiles, handlerRoots, eventTypes, evidence }`. Stable ID, source-relative
  directory and file/directory arrays, statically observed event types. Include only discovered services; do not invent
  AWS infrastructure or runtime resolution.
- `commands`: Array of `{ id, cwd, command, purpose, category, prerequisites, effects, evidence, execution }`. `cwd` is
  source-relative; `category` is `check`, `development`, `build`, `deployment`, or `other`.
  Prerequisites/effects/evidence are string arrays. Commands must match discovered tooling and script names. Set
  `execution` to `not-run` for this inspection; do not imply success.
- `contextReferences`: Array of `{ path, purpose }` for relevant existing project instructions, architecture notes, or
  maintained API references. Source-relative paths only; do not require a project-profile or library file that does not
  exist.
- `coverage`: `{ workspaceDiscovery, capabilityInspection, scope, exclusions }`. Discovery is `complete`, `partial`, or
  `not-applicable`; inspection is `complete` or `partial`. `scope`/`exclusions` are string arrays describing actual
  coverage. A limited refresh or inaccessible implementation cannot claim complete overall coverage.
- `unresolved`: Array of `{ field, reason, evidence }`; `field` is a JSON pointer to a missing, ambiguous, stale, or
  unchecked fact; `evidence` is a string array, possibly empty. These entries are not verified facts.

Use `null` for unknown scalar values and empty arrays for inspected absence. When an empty array instead reflects
uninspected or inaccessible data, explain that in `coverage`/`unresolved`. Each discovered tooling/package/
capability/service/command record needs nonempty evidence that was actually read. Version resolutions must be
attributable to the relevant workspace importer, not an arbitrary installed copy. Names in command prerequisites may
describe environment variables; their values must never be copied.

## Merge and refresh

- Retain custom fields and existing role keys. The starter's `./` values are placeholders, not verified package
  locations. Resolve each role from manifests and public exports; do not infer aliases solely from similar names. An
  actual root package can legitimately map to `.`. Unresolved roles become `null` plus an `unresolved` entry. Do not
  require every starter role to exist or copy a fixed list of packages into another project.
- Use package names/paths and stable capability/service/command IDs to reconcile entries. Refresh inspected facts, avoid
  duplicate aliases/records, and remove obsolete generated entries only when current evidence proves removal. Preserve
  custom fields on retained records. If an existing consumer requires another layout, reconcile that contract before
  restructuring its data; do not change application consumers as part of discovery.
- If existing `repositoryRoot` resolves to another codebase, do not mix inventories. An explicitly requested new root
  requires fresh discovery of generated sections; a limited refresh cannot carry old project records across.
- For a limited refresh, retain untouched records and original evidence, mark them unchecked in `unresolved`, and set
  coverage to partial. A new snapshot does not reverify untouched records.
- Reconcile prior gaps: remove an `unresolved` entry only when this refresh verifies it resolved, or confirms its
  subject was removed and the gap no longer applies. Retain unchecked or still-open gaps; do not replace facts with
  guesses.
- Sort maps and record arrays by stable keys before building `unresolved` pointers. Remap retained array pointers by
  package name/path or record ID after insertions/removals; escape `~` and `/` as `~0` and `~1` in object-key tokens.
  Validate pointer syntax and intended targets, explicitly identifying intentionally missing targets. Keep one current
  snapshot without run logs, speculative lists, source excerpts, or duplicate API descriptions.

## Verify and finish

Before replacing the destination, parse the complete candidate with an available JSON parser. Check core types, unique
IDs, owner/dependency links, path resolution, public import paths, evidence files, command definitions, and coverage
consistency. Validate `unresolved` pointers against final record ordering and reconciled gap status. Verify refreshed
records against source; retain unchecked records only with explicit gaps. Recheck the source and destination for
intervening changes; merge again if necessary rather than overwriting concurrent edits. Write the validated candidate
through a same-directory temporary file and atomic replacement when available; leave existing metadata intact if
validation or writing fails.

Review the final diff for accidental secret values, unrelated changes, and unsupported facts. Do not install validation
tooling or generate tests for this task. Report destination/source root, package/service/capability counts, sections
refreshed, unresolved mappings, coverage, checks actually performed, and that recorded commands were inspected but not
executed. Metadata guides discovery; current source and project instructions retain authority.

Example invocation after copying the skill into a target repository:

```text
Use $refresh-monorepo-metadata to populate the current monorepo's metadata.
```

For a bundle maintained separately from the source checkout, supply `repoRoot` explicitly; metadata still defaults to
the `.agents` directory containing the invoked skill. Refresh after relevant workspace/API/config changes or when task
context reveals stale entries; no recurring or background job is implied.
