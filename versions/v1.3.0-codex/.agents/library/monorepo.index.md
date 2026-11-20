# Monorepo package memory index

Coverage: **11 packages, 106 locally implemented callable exports**, plus 29 dependency callables re-exported through
DynamoDB and documented in the existing dynamo-craft reference. TypeScript configuration provides three JSON exports and
no functions.

Purpose: help coding agents find existing functions and contracts before adding code. Load this index, then only the
package references relevant to the task.

## Source and freshness

- **Source repository:** `/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo`
- **Inspected directory:** `packages/` — all 11 package directories.
- **Source HEAD:** `08a96f226e3fc9be19cdc4768d24f6dbc11521b7`.
- **Verified date:** 2026-11-21 (Asia/Ulaanbaatar).
- **Working-tree state:** no package changes reported by `git status --short packages` during inspection.
- **Evidence:** package manifests, public entry points and re-export chains, implementation files, JSON configurations,
  and installed `dynamo-craft` 0.1.3 declarations.

These documents describe a source snapshot. Current implementation takes precedence; verify the relevant source before
modifying behavior or relying on a contract. This is a static API inventory, not evidence that deployments or runtime
checks passed. Source links are absolute local paths for this workspace; paths inside each reference are relative to
that source package.

## Package lookup

| Need                                                                                                | Source folder       | Import                                                             | Reference                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| HTTP requests, Axios errors, auth headers, Chat webhooks                                            | `axios`             | `@motforex-monorepo-packages/axios`                                | [Axios](./monorepo.axios.md)                                |
| DynamoDB client and executed commands, dynamo-craft re-exports                                      | `dynamodb`          | `@motforex-monorepo-packages/aws-dynamodb`                         | [DynamoDB](./monorepo.dynamodb.md)                          |
| Lambda invocation, remote permission checks, settlement wallet calls, index allocation              | `lambda`            | `@motforex-monorepo-packages/aws-lambda`                           | [Lambda](./monorepo.lambda.md)                              |
| Handler factories, local permissions, errors, env, logging, crypto, pagination, payment projections | `libs`              | `@motforex-monorepo-packages/libs`                                 | [Runtime library](./monorepo.libs.md)                       |
| S3 presigned PUT/GET and object metadata                                                            | `s3`                | `@motforex-monorepo-packages/aws-s3`                               | [S3](./monorepo.s3.md)                                      |
| Zod contracts, payment/config/wallet types, money parser, statuses/constants                        | `schemas`           | `@motforex-monorepo-packages/schemas`                              | [Schemas](./monorepo.schemas.md)                            |
| Serverless stack/config/resource builders, naming, VPC, Cognito, ports                              | `serverless-config` | `@motforex-monorepo-packages/serverless-config`                    | [Serverless configuration](./monorepo.serverless-config.md) |
| Send/batch/delete SQS messages                                                                      | `sqs`               | `@motforex-monorepo-packages/aws-sqs`                              | [SQS](./monorepo.sqs.md)                                    |
| Read/write SSM parameters                                                                           | `ssm`               | `@motforex-monorepo-packages/aws-ssm`                              | [SSM](./monorepo.ssm.md)                                    |
| Shared compiler options; no functions                                                               | `ts-configs`        | `@motforex-monorepo-packages/ts-configs/{base,library,stack}.json` | [TypeScript configuration](./monorepo.ts-configs.md)        |
| Shared test configuration                                                                           | `vitest-config`     | `@motforex-monorepo-packages/vitest-config`                        | [Vitest configuration](./monorepo.vitest-config.md)         |

## Usage rules

- Use exact manifest import names, especially the `aws-` prefix for AWS runtime packages. TypeScript packages expose
  their src/index.ts entry; ts-configs exposes explicit JSON subpaths.
- Function tables cover package-root callable exports implemented in these packages. Classes, schemas, constants, and
  useful types are listed separately. Internal helpers are not consumer APIs.
- DynamoDB additionally re-exports the external dependency API; consult the existing
  [dynamo-craft reference](./dynamo-craft.md) for builders and utilities. That file is maintained separately.
- Handler factories do not validate business input automatically. Apply the appropriate schema and authorization in the
  consuming flow.
- Prefer libs for local permission-map checks and aws-lambda for remote permission ownership. Prefer single-page
  DynamoDB helpers for bounded collections.
- Settlement wrappers use integer minor units; deposit entity amounts and general decimal transforms have their own
  schemas. Check the exact contract before converting money.
- AWS helpers and allocation/wallet wrappers can perform external reads or mutations when invoked. This inspection did
  not invoke them.

## Refresh procedure

When packages change, inspect the affected manifest, root export chain, implementation, and consumer contracts. Update
signatures, behavior, configuration requirements, and source paths in that package reference; update this index if
packages/imports change. Record the new source revision/date and any relevant working-tree changes. Compare exported
function names against the references to catch missing APIs, including explicit named exports and callable singleton
accessors.
