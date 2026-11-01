# TypeScript Serverless Tech Stack

## Core

- **Runtime:** Node.js
- **Language:** TypeScript with strict mode
- **Framework:** Serverless Framework v4
- **Cloud:** AWS
- **Package Manager:** pnpm

## AWS Services

Primary services:

- AWS Lambda
- API Gateway
- DynamoDB
- Systems Manager Parameter Store
- CloudFormation

Use AWS SDK v3 only.

## Application Libraries

- **Validation:** Zod
- **Middleware:** Middy
- **HTTP Client:** Axios
- **Logging:** Winston

Use established wrappers and utilities before accessing these libraries directly.

## Tooling

- **Build:** esbuild
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Git Hooks:** Husky
- **Local Development:** Serverless Offline

## Technical Rules

- Enable strict TypeScript.
- Avoid `any`; use `unknown` when input type is not trusted.
- Validate external input with Zod.
- Use AWS SDK v3 modular clients.
- Use async/await for asynchronous operations.
- Keep infrastructure configuration in `serverless.ts`.
- Keep environment-specific values outside source code.
- Do not introduce new frameworks or libraries without explicit approval.
