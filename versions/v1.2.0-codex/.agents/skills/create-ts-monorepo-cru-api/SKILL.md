---
name: create-ts-monorepo-cru-api
description:
  Create or extend simple TypeScript monorepo Create, Read, and Update API handlers using CustomConfig as the reference.
  Generates create, table-description, detail, single-page query, and update handlers over existing services. Excludes
  delete, status routes, service generation, repositories, and infrastructure.
---

# Simple entity CRU API

Generate thin transport handlers over existing entity services. CRU means Create, Read, Update; never generate deletion
through this skill. Use the current CustomConfig API as a structural reference, adapting verified entity contracts
rather than copying its business rules or unfinished authorization.

## Inputs and prerequisites

Identify the repository root, target stack, entity, and requested subset of operations from the request or session. A
general CRU request covers the five operations below. Read applicable AGENTS.md, the engineering standard, project
profile, and relevant memory when present. Inspect the working tree and preserve existing work.

Before generating a handler, verify that the selected entity's corresponding service exists and implements the
operation. Read its signature, return shape, error semantics, and required schemas through their public exports. Missing
services or contracts block their dependent handlers; report the prerequisite, continue supported operations, and do not
invent services, domain fields, persistence, or success placeholders. Do not invoke service/repository generation skills
implicitly.

Read these repository-relative references at generation time:

- `stacks/admin-finance-config/src/functions/api/custom-config/`: handler and registration examples.
- `stacks/admin-finance-config/src/services/custom-config/`: service signatures and behavior.
- `packages/schemas/src/custom-config/custom-config.utility.types.ts`: derived request contracts.
- `packages/libs/src/functions/function-gateway.ts`: wrapper, JSON parsing, and error handling.
- `packages/libs/src/functions/api-event.ts` and `src/auth/permission.ts`: trusted identity prerequisites and
  permissions.
- `packages/dynamodb/src/utility.ts`: public query parser exports; follow re-exports to verify actual signatures.
- Target stack constants, serverless configuration, route registrations, and Postman collection.

## Operation names and files

Use the singular PascalCase entity token for `<Entity>` and kebab-case for `<entity>`. Honor the user's requested
lowercase `by` in the new detail handler export.

| Operation      | Handler export         | File under `src/functions/api/<entity>/` |
| -------------- | ---------------------- | ---------------------------------------- |
| Create         | `create<Entity>`       | `create-<entity>.ts`                     |
| Table metadata | `get<Entity>TableDesc` | `get-<entity>-table-desc.ts`             |
| Detail         | `get<Entity>byId`      | `get-<entity>-by-id.ts`                  |
| Query          | `query<Entity>`        | `query-<entity>.ts`                      |
| Update         | `update<Entity>`       | `update-<entity>.ts`                     |

For CustomConfig these exports are `createCustomConfig`, `getCustomConfigTableDesc`, `getCustomConfigbyId`,
`queryCustomConfig`, and `updateCustomConfig`. Existing reference names differ: `getCustomConfigById` and
`queryCustomConfigs`. For new APIs use the names above; preserve established external exports or migrate their callers
together only when that rename is in scope. Alias service imports with `Srv` where names collide; service names need not
match the handler spelling.

The user-selected per-operation handler layout is intentional for this skill; do not combine these handlers into
`handler.ts`. Record this scoped structural choice in the target project's profile if required by its standard. Keep
route definitions in `index.ts` and services in their existing operation-specific modules. Do not restructure unrelated
APIs. Keep source files within the repository's line limit.

## Handler behavior

Reuse `createHttpHandler`, explicitly annotate exports with `HttpHandler<unknown>` where supported, and validate
untrusted values with the existing runtime schemas. The wrapper already parses JSON and maps errors: do not add manual
JSON parsing, duplicate catches, or fabricated response envelopes.

Enforce the target entity's established authorization for every operation, including query and metadata reads. Use the
verified identity extractor and permission map before service effects. Pass authenticated email as the audit actor where
the service requires it; never accept an actor from the body. JWT decoding helpers assume an API Gateway Cognito
authorizer and do not verify tokens themselves. If the permission boundary is unknown, resolve it before generating
dependent exposed routes rather than copying commented checks.

- **Create:** Parse `event.body` with the existing canonical-derived create request schema; call the create service with
  its verified arguments and trusted actor. Keep ID, status, defaults, timestamps, and persistence in services.
- **Table metadata:** Call the existing table-description service and return its actual result. Inspect whether it
  returns an SDK envelope or Table metadata; preserve that contract and its missing-table behavior.
- **Detail:** Parse `event.pathParameters` with the entity's ID/key schema, then call the detail service. Preserve
  native key types and domain 404 behavior. Do not copy CustomConfig's string ID for numeric/composite-key entities.
- **Query:** Reuse the installed API Gateway query parser with its actual supported signature and pass parsed query
  options to the single-page service. Preserve items, counts, and continuation metadata. Use only verified table/GSI key
  conditions and configured defaults. Strip caller `projectionExpression`, `attributes`, and `select` when the parser
  exposes them; choose projections on the server and align them with the response schema. Do not fetch all pages, add an
  unbounded scan fallback, or invent indexes. CustomConfig's `status-createdAt-index` and ACTIVE default are
  entity-specific. Require caller key conditions where no confirmed server default exists.
- **Update:** Parse the path key and body with the existing patch schema, including `expectedUpdatedAt` when required;
  call the update service with key, request, and trusted actor in its verified parameter shape. Preserve omitted fields
  and the partial update response. Services/repositories retain editability and atomic version guards.

Await service calls and return their actual results. Do not implement business rules, DynamoDB commands, AWS clients,
conditions, or table-name resolution in handlers. Exclude status changes, deletion, query-all, criteria searches, new
dependencies, IAM, provisioning, and deployment.

## Route registration and documentation

A request for a complete CRU API includes wiring the requested handlers into the entity `index.ts` and verifying the
stack imports that registration. A request limited to handler functions does not authorize additional routes. Reuse
`createCognitoAuthorizedApiFunction`, verified handler paths/exports, and the proper authorizer. Use established methods
and paths; if no convention exists, use POST on the entity collection, GET on `/table-desc`, GET on `/{id}`, GET on the
collection for query, and PATCH on `/{id}` for edits under the chosen entity route prefix. Avoid path collisions and
preserve existing public contracts. Update the existing Postman collection and API documentation when routes or request
contracts change; keep tokens and base URLs placeholders.

Document exported handlers with responsibility, numbered process flow, event parameter, actual result, and relevant
errors. Comments must match executable authorization and response behavior.

## Reference findings and verification

At skill creation, CustomConfig had all five handler files, but only table description was registered in `index.ts`.
Create/update/detail permission checks were commented out; metadata/query handlers lacked permission checks. Several
comments still claimed checks occurred. These observations are not authorization exceptions. The query handler strips
client selection fields and uses a configured GSI default; retain that applicable transport pattern. Reinspect current
files rather than assuming these findings stay current.

Check each requested operation against its service, schema, permission, file/export name, and registration scope. Run
the target stack's declared type-check and lint, relevant existing tests where available, and `git diff --check`. Do not
generate tests, fixtures, mocks, or snapshots unless explicitly requested. Do not call live AWS or deploy for
verification. Report generated paths, operations, route wiring scope, actual checks/results, and blocked prerequisites.
A no-test-files result does not establish behavioral coverage.
