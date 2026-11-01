# TypeScript Serverless Project Structure

Applies to repositories based on:

```text
typescript-serverless-template
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
├── src/
│   ├── functions/
│   ├── services/
│   ├── repository/
│   ├── libs/
│   └── types/
├── test/
├── scripts/
├── serverless.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Function Structure

```text
src/functions/
├── api/<domain>/
│   ├── index.ts
│   └── handler.ts
├── workers/<domain>/
│   ├── index.ts
│   └── handler.ts
└── jobs/<domain>/
    ├── index.ts
    └── handler.ts
```

Create optional trigger directories only when required.

## Function Definition

Location:

```text
src/functions/<trigger>/<domain>/index.ts
```

Responsibilities:

- Define Serverless function metadata
- Define handler name
- Define triggers, routes, and HTTP methods
- Define timeout, memory, and Lambda configuration
- Export a function map for `serverless.ts`

Forbidden:

- Runtime logic
- Input parsing
- Business logic
- Service calls
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
- Use shared response and error handlers

Forbidden:

- Business logic
- Direct repository calls
- Direct database access
- Direct DynamoDB SDK usage
- Duplicating service rules

API handlers must use the established HTTP handler wrapper.

Handlers must remain thin.

## Service

Location:

```text
src/services/<domain>/<entity>-<operation>.ts
```

Examples:

```text
user-create.ts
user-get.ts
user-update.ts
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

Prefer one operation per service file.

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
- Centralize DynamoDB client configuration
- Provide reusable typed database operations

Domain repositories must use this client.

Do not duplicate AWS SDK command logic across repository files.

## Libraries

Location:

```text
src/libs/
```

Use for reusable technical utilities such as:

- API Gateway helpers
- HTTP clients
- Error handling
- Function configuration builders
- Lambda invocation
- AWS SSM access
- Logging
- Generic utilities

Library code must:

- Be reusable across multiple domains
- Remain free of domain-specific business logic
- Expose a clear public entry point
- Avoid importing from handlers, services, or repositories

Do not create shared abstractions for one-time use.

## Types and Schemas

Location:

```text
src/types/
```

Use for:

- Domain types
- Request and response schemas
- Persistence models
- Shared TypeScript types

Rules:

- Handlers validate transport input.
- Services enforce business conditions.
- Repositories return typed persistence data.
- Keep schemas close to the owning domain.
- Do not duplicate types already defined in the repository.

## `serverless.ts`

Responsibilities:

- Define service and provider configuration
- Define runtime environment variables
- Define infrastructure resources
- Import function maps
- Register functions
- Configure packaging, plugins, and deployment

Forbidden:

- Handler implementation
- Business logic
- Database operations
- Runtime request processing

Register functions by importing and spreading exported function maps.

## Environment Variables

Runtime resource names and configuration must be declared in `serverless.ts`.

Read required values through the established environment utility.

Never hardcode:

- DynamoDB table names
- Resource names
- AWS regions
- Deployment stages
- Secrets
- Environment-specific URLs

## Tests

Location:

```text
test/
```

The test structure should mirror `src/`.

Example:

```text
src/services/user/user-create.ts
test/services/user/user-create.test.ts
```

Test business logic at the service layer by mocking repositories.

Test handlers separately for parsing, validation, and response behavior.

## Dependency Rules

Allowed:

```text
handler → service
service → repository
repository → database client
handler/service/repository → libs
handler/service/repository → types
```

Forbidden:

```text
handler → repository
handler → database client
service → handler
service → DynamoDB SDK
repository → service
repository → handler
libs → domain layers
```

## Strict Rules

- Function definition files contain metadata only.
- Handlers call services only.
- Services own business logic.
- Services use repositories for persistence.
- Repositories own database access only.
- DynamoDB SDK operations remain in repository infrastructure.
- Shared libraries contain reusable technical code only.
- Preserve established naming and folder conventions.
- Do not introduce another architectural layer without explicit approval.
- Do not bypass a layer for convenience.
- Do not perform unrelated restructuring.
