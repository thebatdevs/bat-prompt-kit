---
name: create-ts-monorepo-dynamo-client
description:
  'Create a reusable TypeScript DynamoDB DocumentClient and validated dynamo-craft command wrappers in a monorepo or
  standalone Node.js repository, with dependency checks and an optional output path.'
---

# Create a TypeScript DynamoDB Client

Generate the bundled lazy AWS SDK v3 document client and validated command wrappers. Adapt paths, names, and tooling to
the target repository; require no fixed machine paths, framework, companion skill, or global package manager.

## Resolve the destination

Optional inputs:

- `outputPath`: exact directory for `client.ts`, `command.ts`, and `index.ts`, absolute or relative to the target root.
  Do not append `src` or `dynamodb` to a supplied path.
- `projectRoot`: target root when not inferable from the active workspace.
- `packageName`: name for a new workspace package; otherwise derive it from target-repository conventions.

Read applicable `AGENTS.md` instructions, manifests, workspace definitions, lockfiles, TypeScript/build settings,
neighboring packages, and existing DynamoDB utilities. Establish a monorepo from configured packages/projects; a
`packages` directory or Turbo configuration alone is insufficient.

Without `outputPath`, use these project-relative defaults without asking:

| Project    | Package                 | Source directory        |
| ---------- | ----------------------- | ----------------------- |
| Monorepo   | `packages/dynamodb`     | `packages/dynamodb/src` |
| Standalone | Existing owning package | `src/dynamodb`          |

Reuse an existing owning package, including `packages/dynamodb`; do not create nested manifests. Distinguish workspace
root manifests from source-owning packages. For a supplied path outside existing packages, create a package there with
`index.ts` as its source entry. Ask only if the target root or ownership remains ambiguous.

## Prepare package integration

For a new package, follow comparable target-repository manifest/build conventions:

- Default to private. Honor `packageName`; otherwise derive a unique local name, falling back to `dynamodb`. Reuse an
  organization scope only when established in the target repository.
- Register the **resolved package directory** in workspace globs when needed, including custom destinations. Establish
  the manifest and registration before installing dependencies.
- Configure usable exports and TypeScript build/typecheck integration. Match source-export or built-output conventions;
  `dist` exports require a build. Reuse existing shared configuration; never reference nonexistent config packages.
- Add only missing required Node typings/build tooling. Preserve unrelated code, configuration, and public exports.

Do not create tables, infrastructure, application-specific repositories, credentials, or publish packages.

## Check dependencies before generating source

The owning package must directly declare these **runtime dependencies**:

```text
@aws-sdk/client-dynamodb
@aws-sdk/lib-dynamodb
dynamo-craft
```

1. Identify the package manager from project instructions, `packageManager`, lockfiles, and workspace configuration. Use
   pinned/local tooling and preserve the manager and lockfile format.
2. Inspect the owning manifest, workspace catalogs/overrides, lockfile versions, and package resolution from that
   package. Transitive, sibling, or hoisted installations do not replace direct runtime declarations. New packages
   should reuse compatible workspace versions while declaring their own dependencies.
3. Keep compatible versions. For missing packages or API mismatches, inspect public npm metadata and published
   declarations:
   `npm view dynamo-craft@<candidate> version engines peerDependencies --json --registry=https://registry.npmjs.org` or
   the selected manager's equivalent. Align both AWS SDK packages with each other, `dynamo-craft` peers, Node engines,
   and repository version policy. Avoid blind `latest` installs or unrelated upgrades; explain any required version
   change.
4. Install missing or misclassified dependencies into the owning package's `dependencies`, using the selected manager's
   package/workspace targeting and configured registry; update the existing lockfile. Restore an absent declared
   install, but skip installation when everything resolves compatibly. Never install into the skill directory.
5. Verify every template import against installed declarations and, when needed,
   [published dynamo-craft documentation](https://www.npmjs.com/package/dynamo-craft). Adapt only to verified
   equivalents while preserving the public contract; do not invent exports. If registry access, installation, or
   compatibility fails, report the exact obstacle and unresolved checks rather than claiming successful verification.

## Generate from Markdown templates

Resolve these assets relative to this `SKILL.md`:

- [assets/client.md](assets/client.md) → `client.ts`: cached client and injection/reset hook.
- [assets/command.md](assets/command.md) → `command.ts`: validated wrappers and local error helper.
- [assets/index.md](assets/index.md) → `index.ts`: public exports.

Extract only each TypeScript fenced block into its target `.ts` file; omit Markdown prose/fences. Match project
formatting, type-only imports, and relative import extensions (`.js` for NodeNext ESM where required). Read existing
destination files and merge compatible changes without replacing unrelated code or duplicating exports. Preserve all
public names, input types, return types, and options defined in the templates.

### Client contract

- Construct and cache `DynamoDBDocumentClient` on the first `getDocumentClient()` call, never at import.
- Read environment configuration at construction: trim `DYNAMODB_ENDPOINT`; use `AWS_REGION` or `ap-southeast-1`.
- Supply dummy `local` credentials only for an explicit endpoint whose parsed hostname exactly matches the template's
  local-host set. Normalize IPv6 brackets (`http://[::1]:8000`). Invalid URLs and remote lookalikes must not receive
  dummy credentials; otherwise use the SDK credential provider chain.
- Enable `removeUndefinedValues` and `convertClassInstanceToMap` when marshalling.
- Keep `setDocumentClient(client | undefined)` for injection/reset; environment changes apply after reset. Do not add
  implicit dotenv loading or a second eager client.

### Command contract

- Validate document commands with their corresponding `dynamo-craft` builders before sending. DescribeTable uses
  `DescribeTableCommand` from the low-level SDK. Preserve SDK response metadata and validation errors.
- BatchGet and Scan return one response, including unprocessed keys/continuation keys; add no wrapper retries or
  pagination.
- `queryAllRecordsFromDynamo` starts at the supplied cursor and collects items through empty pages with continuation
  keys. Forward the current cursor on every request; never fall back to the original key. Stop on an absent or empty
  `LastEvaluatedKey`. Its `limit` applies per request, not to the total result.
- Keep the local `rethrow` helper: log only operation/table context and rethrow the original error with identity, name,
  and metadata intact. In `createRecordOnDynamo`, `expectedConditionalFailure` bypasses logging for
  `ConditionalCheckFailedException` and rethrows unchanged. Add no organization-specific error import or dependency.

## Verify and report

Run the owning package's targeted typecheck/build and relevant lint checks. With available test tooling:

- Inject a client to check command dispatch, validation failure without sending, original error identity, expected
  conditional-failure handling, and pagination through an empty page and an empty terminal key.
- Check lazy construction and endpoint credentials separately, before injection or with factory spies and resolved
  configuration. Verify caching, injection/reset, IPv6, and remote lookalikes without sending requests.

Do not contact live AWS services or add a test framework for scaffolding.

Report the resolved source directory/package, exports, dependency changes, checks actually run, and limitations. For new
workspace packages, include the public import path and endpoint/region defaults.

Examples:

```text
Use $create-ts-monorepo-dynamo-client with outputPath libs/storage/src/dynamodb.
Use $create-ts-monorepo-dynamo-client with the default destination for this project.
```
