# Tech Stack Standard

Purpose: define the strict, minimal TypeScript AWS serverless stack for this project. Agents must not introduce new
technologies without explicit approval.

## Approved Core Stack

- TypeScript with strict mode
- Node.js
- AWS Lambda
- Serverless Framework
- DynamoDB as the primary database
- Zod for runtime validation
- Vitest for testing

## TypeScript Rules

- Use strict TypeScript.
- Do not use `any` unless explicitly approved.
- Use `unknown` for untrusted input.
- Prefer `type` for object shapes.
- Use `interface` only for extension or declaration merging.
- Define explicit input and output types for exported functions.
- Keep domain types close to their Zod schemas.

## Runtime Validation

Use Zod for:

- API inputs: body, path params, query params
- external API responses
- DynamoDB items when returning domain objects
- important business input

Schema naming and type inference rules are defined in the Code Writing Standard.

## AWS Serverless Rules

- Lambda handlers must stay thin.
- Handlers parse and validate input, call services, and format responses.
- Handlers must not contain business logic.
- Handlers must not call repositories directly.

Required flow:

```txt
Handler -> Service -> Repository -> DynamoDB / External API
```

## DynamoDB Rules

Repositories own all DynamoDB access.

Repositories may:

- build DynamoDB queries and commands
- call DynamoDB clients
- handle pagination keys
- map raw output to typed domain objects

Repositories must not:

- contain business rules
- format API responses
- call service functions
- decide whether an operation is allowed

## Testing Rules

Use Vitest.

- Place tests in `/test/`.
- Mirror the `/src/` structure when practical.
- Test business rules, validation, repository query behavior, and error cases.
- Use clear behavior-based test names.

Example:

```ts
it('throws when withdraw request does not exist', async () => {});
```

## Dependency Rules

- Do not add runtime dependencies unless strictly necessary.
- Prefer TypeScript built-ins, AWS SDK, Zod, and small local helpers.
- Do not add heavy frameworks without explicit approval.
- Before adding a dependency, document the reason in the relevant context file.

Approved dependencies include:

- `typescript`
- `serverless`
- `zod`
- `vitest`
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`

## Forbidden Unless Explicitly Approved

- Express
- NestJS
- Prisma
- TypeORM
- Jest
- Mocha
- heavy frameworks
- unnecessary abstraction libraries

## Golden Rule

Keep the stack simple, predictable, typed, and serverless-first.

## Last Updated

2026-05-26
