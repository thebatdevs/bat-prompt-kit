---
name: generate-stack-postman
description:
  Generate or refresh an importable Postman collection JSON from a user-named Serverless stack's registered HTTP APIs,
  handlers, and validated request contracts. Writes to that stack's utility/postman folder without calling APIs or
  changing application code.
---

# Generate stack Postman collection

Convert the selected stack's actual HTTP API registrations into a Postman Collection v2.1 JSON file. The user supplies a
stack name, for example `admin-finance-config`. Resolve it to the existing `stacks/<stack-name>/` directory from the
repository root; accept an explicit existing stack path too. Ask only when the stack is absent or ambiguous. Do not
select a similarly named stack silently.

## Output and scope

Write the collection to:

```text
stacks/<stack-name>/utility/postman/<stack-name>.postman_collection.json
```

Create `utility/postman/` when missing. Reuse an existing collection in that folder when it clearly serves the same
stack, preserving its filename and useful customizations rather than producing competing collections. An explicit user
filename takes precedence, within the requested stack's `utility/postman/` folder. Existing collections elsewhere are
reference material; do not relocate, delete, or overwrite them implicitly. Do not change handlers, schemas, routes,
service code, infrastructure, IAM, or deployment configuration. Do not create a separate environment file unless
requested; use collection variables for reusable placeholders.

## Discover actual APIs

Read applicable AGENTS.md, project profile, relevant engineering rules, and relevant memory when present. Inspect the
working tree and preserve unrelated work. Locate the stack manifest and Serverless configuration, then trace its
registered `functions`, imports/spreads, route definitions, and handler exports. Inspect the registration helpers if
needed to resolve method, path, authorizer, or handler path defaults.

Generate requests only for registered HTTP/API Gateway events, including test or diagnostic routes when registered. Do
not infer an endpoint from a handler/service file alone or generate standard CRUD routes from entity names. Exclude
workers, schedules, streams, and other non-HTTP triggers. Preserve exact route prefixes, methods, case, path parameters,
and meaningful query parameters. If registration is conditional, document the known condition rather than representing a
deployment-specific branch as universally available. Report unresolved dynamic registration values. Never guess an
endpoint. If no HTTP routes exist, report that fact without generating a misleading empty collection.

Prefer static source inspection. Do not run Serverless resolution, import environment-loading stack modules, read secret
values, or contact AWS merely to discover routes. A configuration defines potential routes; do not claim that a route is
deployed or reachable.

## Derive requests from implementation

For each registered route, inspect its handler, runtime input schemas, and directly relevant service contract. Use the
canonical-derived request schema actually parsed at the boundary; do not use the entire stored entity as a create/patch
body. Follow transforms, strict unknown-field behavior, required nullable fields, enums, defaults, nested objects,
amount representations, timestamp units, version fields, and cross-field constraints. Use public contract exports to
locate the actual definitions. Do not invent business values or validation rules.

- Supply a small schema-valid example body when required, including all required fields and explicit nulls where needed.
  Omit server-owned IDs, status, and audit values when rejected by the request contract.
- Use JSON raw bodies with `Content-Type: application/json` for JSON endpoints. Preserve multipart, form, or binary
  transport when the implementation requires it; do not force every endpoint into JSON.
- Convert path parameters to named collection variables or Postman path variables. Preserve native numeric IDs in JSON
  bodies/cursors; route interpolation remains text. Keep version placeholders unquoted when numeric.
- Include required query parameters. Put optional parameters in structured URL `query` entries, disabled by default when
  no input is needed. Explain supported ranges, cursor encoding, defaults, and index/key requirements in request
  descriptions. Do not double-encode JSON cursors or add filters/projections the handler rejects.
- Reflect actual authorization per request. Use bearer token variables for Cognito routes and `noauth` for public routes
  when overriding inherited authentication. Preserve required custom headers. For IAM-signed routes use Postman's AWS
  signing auth with placeholder variables, never bearer auth or real credentials. Describe any unresolved custom
  authorizer contract without inventing its token format.
- Describe observed response shapes, notable validation/permission/conflict failures, and pagination only as supported
  by the implementation. Do not fabricate response examples or claim HTTP success verification.

## Collection structure and reusable values

Set `info.name` to a readable stack-specific API name and `info.schema` to
`https://schema.getpostman.com/json/collection/v2.1.0/collection.json`. Group requests by route domain/entity; give each
an operation-specific name. Use deterministic ordering so refreshes produce a readable diff. Preserve custom
descriptions, scripts, examples, and variables that still apply; update stale generated route contracts. Remove stale
generated requests only when registration evidence shows they no longer exist, preserving clearly user-maintained
entries or reporting ambiguity.

Use `{{baseUrl}}` for the API origin and deployment stage prefix as applicable; put a clearly marked placeholder in its
collection variable and explain whether it includes the stage. Do not duplicate the stage in request paths. Use
placeholders for tokens, actor-independent IDs, versions, and other reusable inputs. Never read `.env` or copy secrets,
production access tokens, account credentials, personal data, or deployed hostnames into examples. Prefer non-sensitive
sample values and example.com URLs.

When existing response contracts make it reliable, add minimal Postman post-response scripts to capture created entity
IDs and update versions in collection variables. Inspect the HTTP response formatter to find the correct response
nesting and success status. Guard captures on success and field presence; collection summaries must not overwrite detail
versions. Never add scripts that automatically send another request, execute deletion, or run the collection. Do not
generate test assertions or test cases unless explicitly requested by the user; variable capture scripts are request
workflow helpers, not behavioral verification.

## Verify and report

Parse the final JSON with an available local JSON parser. Compare collection requests with discovered registrations for
route/method coverage and duplicates; check handler/export resolution, authorization, path/query variables, body
examples against available schemas, and variable references. Substitute non-sensitive sample values locally when
checking templated JSON bodies. Use installed validation tools when available; do not install tooling solely for this
task or pretend JSON syntax validation establishes full Postman schema compliance.

Inspect the final diff and run `git diff --check` for changed tracked output. Do not generate application tests, invoke
live endpoints, run a collection/Newman, deploy, or fetch credentials. Report the output path, included request count,
any unresolved routes or example requirements, and the checks actually run. Distinguish complete source-derived coverage
from any unverified deployed behavior.
