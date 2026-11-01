# TypeScript Serverless Monorepo Tech Stack

## Core

- **Runtime:** Node.js
- **Language:** TypeScript with strict mode
- **Framework:** Serverless Framework v4
- **Cloud:** AWS
- **Monorepo:** pnpm workspaces
- **Task Runner:** Turbo

## AWS Services

Primary services:

- AWS Lambda
- API Gateway
- DynamoDB
- Systems Manager Parameter Store
- CloudFormation

Use AWS SDK v3 only.

## Shared Packages

Reusable infrastructure belongs in `packages/`, including:

- Shared libraries
- Schemas and types
- HTTP clients
- Lambda invocation utilities
- AWS service utilities
- Shared TypeScript configuration

Stack-specific business logic must remain inside `stacks/`.

## Application Libraries

- **Validation:** Zod
- **Middleware:** Middy
- **HTTP Client:** Axios
- **Logging:** Winston

Use existing internal packages and wrappers before importing third-party libraries directly.

## Tooling

- **Build and orchestration:** Turbo
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Git hooks:** Husky
- **Local development:** Serverless Offline
- **Package manager:** pnpm

## Technical Rules

- Enable strict TypeScript in every workspace.
- Avoid `any`; use `unknown` for untrusted input.
- Validate external input with Zod.
- Use AWS SDK v3 modular clients.
- Keep deployable applications under `stacks/`.
- Keep reusable, stack-independent code under `packages/`.
- Run root scripts through Turbo.
- Keep infrastructure configuration inside each stack’s `serverless.ts`.
- Do not introduce new frameworks, packages, or workspace layers without explicit approval.
