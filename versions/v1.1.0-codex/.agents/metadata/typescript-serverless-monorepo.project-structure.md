# TypeScript Serverless Monorepo Architecture

Applies to `typescript-serverless-monorepo-template`.

## Architecture

```txt
Function Definition → Handler → Service → Repository → Database
```

Dependencies flow right only.

**MUST NOT:**

- Bypass, reverse, merge, or replace layers
- Add architectural layers without approval
- Perform unrelated restructuring

### Dependencies

Allowed:

```txt
function definition → handler path
handler → service
service → service
service → repository
repository → database client
stack → shared package
shared package → shared package
```

Forbidden:

```txt
function definition → runtime logic
handler → repository / database client / DynamoDB SDK
service → handler / DynamoDB SDK
repository → service / handler
shared package → stack
```

## Root Structure

```txt
.
├── packages/
├── stacks/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

- `stacks/`: independently deployable applications and their domain logic
- `packages/`: reusable, stack-independent code

Shared packages MUST NOT contain stack-specific logic or import from `stacks/`.

## Stack Structure

```txt
stacks/<stack-name>/
├── serverless.ts
├── env.ts
├── package.json
├── tsconfig.json
├── scripts/
└── src/
├── functions/
│   ├── api/
│   ├── workers/
│   └── tasks/
├── services/
├── repository/
└── types/
```

Create optional directories only when required.

## Function Definition

Location:

```txt
src/functions/<trigger>/<domain>/index.ts
```

**MUST:**

- Define function metadata
- Define handler path and trigger
- Define route, timeout, memory, and Lambda settings
- Export a function map for `serverless.ts`

**MUST NOT:**

- Contain runtime or business logic
- Parse input
- Call services or repositories
- Access databases

## Handler

Location:

```txt
src/functions/<trigger>/<domain>/handler.ts
```

**MUST:**

- Receive Lambda events
- Parse and validate transport input
- Extract authentication and request metadata
- Call services
- Format transport responses
- Use the shared HTTP wrapper for API handlers

**MUST NOT:**

- Contain business rules
- Call repositories
- Access databases
- Import the DynamoDB SDK
- Reimplement Service rules

Handlers remain thin and transport-focused.

## Service

Location:

```txt
src/services/<domain>/<entity>-<operation>.ts
```

**MUST:**

- Execute one business operation
- Apply business rules and domain conditions
- Coordinate repositories and other services
- Orchestrate workflows and integrations
- Transform domain data
- Throw business errors
- Return transport-independent results

**MUST NOT:**

- Parse Lambda events
- Depend on API Gateway or Express request objects
- Format HTTP responses
- Access databases directly
- Import the DynamoDB SDK

Prefer one operation per file.

Repeated business lookups, guards, and validations belong in focused Service functions.

Examples:

```ts
getValidExampleItemById();
validateExampleItemStatusTransition();
```

Pure data-shape validation belongs in schemas.

Use `src/services/<domain>/index.ts` only as the domain's public export entry point.

## Repository

Location:

```txt
src/repository/<domain>-repository.ts
```

**MUST:**

- Build domain-specific persistence requests
- Execute them through the shared database client
- Access DynamoDB, PostgreSQL, S3, or other persistence systems
- Handle pagination
- Map raw records to typed results

**MUST NOT:**

- Contain business rules or authorization decisions
- Parse requests or format responses
- Call handlers or services

Prefer one repository per domain aggregate.

## DynamoDB Client

Location:

```txt
src/repository/dynamo-client.ts
```

Centralises DynamoDB configuration and reusable typed operations.

Domain repositories MUST use it. Do not duplicate AWS SDK command logic.

## Types and Schemas

Stack-specific types and schemas:

```txt
src/types/
```

Cross-stack reusable types and schemas belong in a shared package.

- Transport schemas validate Handler input
- Services enforce business conditions
- Repositories return typed persistence data
- Move schemas to shared packages only when genuinely reusable
- Do not duplicate shared schemas across stacks

## Shared Packages

```txt
packages/<package-name>/
├── package.json
├── tsconfig.json
└── src/
└── index.ts
```

A shared package MUST:

- Be reusable across stacks or packages
- Be independent from stack-specific logic
- Be independently buildable
- Export through its public entry point

Do not create a shared package for single-stack code.

## Configuration

### `serverless.ts`

Defines:

- Service and provider configuration
- Infrastructure resources
- Runtime environment variables
- Function registration
- Packaging and plugins

MUST NOT contain runtime, business, or database logic.

### `env.ts`

Validates deployment-time environment variables and exports typed configuration.

Fail immediately when required values are missing or invalid.

Never hardcode:

- Table or resource names
- AWS regions
- Deployment stages
- Secrets
- Environment-specific URLs

Repositories read resource names through the established environment utility.

## File and Naming Rules

- Use `kebab-case` filenames
- Prefer one operation or responsibility per file
- Split files exceeding 300 lines unless declarative or generated
- Use `index.ts` only for public exports or function metadata
- Do not import from a module's own `index.ts`
- Avoid vague names such as `utils`, `helper`, `common`, and `functions`

Preferred:

```txt
src/services/withdraw-request/
├── index.ts
├── withdraw-request-create.ts
├── withdraw-request-get.ts
├── withdraw-request-update.ts
└── withdraw-request-validation.ts
```

Use specific names following:

```txt
action + domain + condition/key
```

Good:

```ts
approveWithdrawRequest();
getWithdrawRequestById();
getActiveWithdrawRequestsByEmail();
```

Avoid:

```ts
getData();
processRequest();
handleUpdate();
helper();
```

## Canonical Vertical Slice

```txt
src/functions/api/example-item/
├── index.ts
└── handler.ts

src/services/example-item/
├── index.ts
├── example-item-create.ts
└── example-item-validation.ts

src/repository/example-item-repository.ts
src/types/example-item.ts
```

Flow:

```ts
handler validates input
→ service applies business rules
→ repository performs persistence
→ database client executes commands
```
