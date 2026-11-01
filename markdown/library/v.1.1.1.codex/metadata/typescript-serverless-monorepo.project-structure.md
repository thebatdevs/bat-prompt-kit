# TypeScript Serverless Monorepo Project Structure

Applies to repositories based on:

```text
typescript-serverless-monorepo-template
```

## Required Flow

```text
Function Definition → Handler → Service → Repository → Database
```

Dependencies flow inward only:

```text
Handler → Service → Repository
```

Never bypass, reverse, or merge these layers.

## Root Structure

```text
.
├── packages/
├── stacks/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

### `stacks/`

Contains independently deployable Serverless applications.

Each stack owns its:

- Lambda functions
- Business logic
- Repositories
- Domain types
- Infrastructure configuration
- Environment configuration

### `packages/`

Contains reusable, stack-independent code.

Examples:

- Shared libraries
- HTTP clients
- Lambda invocation utilities
- Schemas
- AWS utilities
- TypeScript configuration

Do not place stack-specific business logic in `packages/`.

## Stack Structure

```text
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
    │   └── jobs/
    ├── services/
    ├── repository/
    └── types/
```

Optional directories must be created only when required.

## Function Definition

Location:

```text
src/functions/<trigger>/<domain>/index.ts
```

Responsibilities:

- Define Serverless function metadata
- Define handler name
- Define trigger configuration
- Define route and HTTP method
- Define timeout, memory, and other Lambda settings
- Export a function map for `serverless.ts`

Forbidden:

- Runtime logic
- Input parsing
- Business logic
- Repository access
- Database access

`index.ts` contains metadata only.

## Handler

Location:

```text
src/functions/<trigger>/<domain>/handler.ts
```

Responsibilities:

- Receive Lambda events
- Parse transport input
- Validate request schemas
- Extract authentication and request metadata
- Call service functions
- Return transport responses
- Use shared error and response handlers

Forbidden:

- Business logic
- Direct repository calls
- Direct database access
- Direct DynamoDB SDK usage
- Reimplementing service rules

API handlers must use the established shared HTTP handler wrapper.

Handlers must remain thin.

## Service

Location:

```text
src/services/<domain>/<entity>-<operation>.ts
```

Examples:

```text
example-item-create.ts
example-item-get.ts
example-item-update.ts
```

Responsibilities:

- Execute one business operation
- Apply business rules
- Enforce domain conditions
- Coordinate repositories
- Transform domain data
- Call required external integrations
- Return transport-independent results

Forbidden:

- Lambda event parsing
- HTTP response formatting
- Serverless configuration
- Direct database access
- Direct DynamoDB SDK usage

Prefer one operation per file.

Use:

```text
src/services/<domain>/index.ts
```

only to export service operations.

## Repository

Location:

```text
src/repository/<domain>-repository.ts
```

Responsibilities:

- Access one database or domain aggregate
- Execute persistence operations
- Use the shared database client
- Return typed persistence results
- Map database records when necessary

Forbidden:

- Business rules
- Request parsing
- Response formatting
- Calling handlers
- Calling services
- External API orchestration

Prefer one repository file per domain aggregate.

## DynamoDB Client

Location:

```text
src/repository/dynamo-client.ts
```

Responsibilities:

- Wrap low-level DynamoDB commands
- Centralize database client configuration
- Provide reusable typed database operations

Domain repositories must use this client.

Do not duplicate AWS SDK command logic across repository files.

## Types and Schemas

Stack-specific types and schemas belong in:

```text
src/types/
```

Cross-stack reusable types and schemas belong in the shared schemas package.

Rules:

- Transport schemas validate handler input.
- Services enforce business conditions.
- Repositories return typed persistence data.
- Do not move stack-specific schemas into shared packages.
- Do not duplicate shared schemas across stacks.

## Shared Packages

Location:

```text
packages/<package-name>/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

A shared package must be:

- Reusable by multiple stacks or packages
- Independent from one stack's business logic
- Independently buildable
- Exported through its public entry point

Do not create a package for code used by only one stack.

Do not import stack code into a shared package.

## `serverless.ts`

Responsibilities:

- Define service and provider configuration
- Define runtime environment variables
- Define infrastructure resources
- Import function maps
- Register functions
- Configure packaging
- Configure plugins and deployment settings

Forbidden:

- Handler implementation
- Business logic
- Database operations
- Runtime request processing

Register functions by importing and spreading exported function maps.

## `env.ts`

Responsibilities:

- Validate deployment-time environment variables
- Fail immediately when required values are missing or invalid
- Export typed configuration values

Do not read unvalidated deployment configuration throughout the stack.

## Environment Variables

Runtime resource names and configuration must be declared in `serverless.ts`.

Repositories must read resource names through the established environment utility.

Never hardcode:

- DynamoDB table names
- Resource names
- AWS regions
- Deployment stages
- Secrets
- Environment-specific URLs

## Dependency Rules

Allowed:

```text
handler → service
service → repository
repository → database client
stack → shared package
shared package → another shared package
```

Forbidden:

```text
handler → repository
handler → database client
service → handler
service → DynamoDB SDK
repository → service
repository → handler
shared package → stack
```

## Strict Rules

- Function definition files contain metadata only.
- Handlers call services only.
- Services own business logic.
- Services use repositories for persistence.
- Repositories own database access only.
- DynamoDB SDK operations remain in repository infrastructure.
- Stack-specific logic remains inside its stack.
- Shared packages contain reusable infrastructure only.
- Preserve established naming and folder conventions.
- Do not introduce another architectural layer without explicit approval.
- Do not bypass a layer for convenience.
- Do not perform unrelated restructuring.
