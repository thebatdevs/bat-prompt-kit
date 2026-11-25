# Serverless example

A workspace app adapted from
[`thedashpuntsag/typescript-serverless-template`](https://github.com/thedashpuntsag/typescript-serverless-template/tree/bd124c709be67c2e4841c1973df2784d55fd6c49)
at commit `bd124c709be67c2e4841c1973df2784d55fd6c49`. The original template is by thedashpuntsag and declares the ISC
license.

The app keeps the template's Lambda handlers, service/repository layers, Zod schemas, DynamoDB command builder, Middy
middleware, and Axios, Lambda, SSM, and logging utilities. Formatting, linting, tests, and TypeScript use the
workspace's tools. There is no nested workspace, lockfile, or Git repository.

```text
apps/serverless-example/
├── src/
│   ├── functions/api/example/   # API Gateway handlers and function registrations
│   ├── libs/                    # Middleware, function builders, errors, and integration utilities
│   ├── repository/              # DynamoDB client and example item repository
│   ├── services/example/        # Example item business operations
│   └── types/                   # Zod schemas and inferred types
├── test/                       # Handler/service, repository, and configuration tests
├── .env.example
├── env.ts                      # Deployment configuration defaults and validation
├── serverless.ts               # Lambda, API Gateway, DynamoDB table/index, and IAM configuration
├── tsconfig.json
└── vite.config.ts              # Test configuration and @/ alias
```

## Build and test

From the repository root:

```sh
pnpm install
pnpm --filter @bat-peasant/serverless-example type-check
pnpm --filter @bat-peasant/serverless-example test
pnpm --filter @bat-peasant/serverless-example build
```

The root `pnpm check`, `pnpm test`, and `pnpm build` commands also include this app. The build checks types and bundles
the Lambda handler exports into `dist/handler.mjs`. Tests mock the DynamoDB boundary and make no AWS calls.

## Run with Serverless Offline

Serverless v4 commands require a Serverless login or an access/license key when authentication is requested. Configure
it with `pnpm --filter @bat-peasant/serverless-example exec serverless login`, or supply your key through the
environment. Builds and unit tests do not use the Serverless CLI and do not need that login.

The default region is `ap-southeast-1`; `AWS_PROFILE` is optional. To customize these values, copy `.env.example` to
`.env` inside this app and edit the values. The app uses AWS's default credential chain when no profile is specified.

```sh
pnpm dev:serverless
curl http://127.0.0.1:3003/dev/v1/health
```

The health endpoint works without DynamoDB. The data endpoints use real DynamoDB and need AWS credentials plus the table
for the selected stage; Serverless Offline emulates the HTTP/Lambda layer only. It does not create or emulate DynamoDB.
Offline uses ports 3003 and 3004 to coexist with `apps/api` and `apps/web`.

The root `pnpm dev` runs the local task tracker apps. Start this app explicitly with `pnpm dev:serverless` or
`pnpm --filter @bat-peasant/serverless-example dev`.

## API

Paths below are prefixed with `/dev` in Serverless Offline's default stage.

| Method | Path                     | Behavior                                      |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/v1/health`             | Health check without AWS calls                |
| GET    | `/v1/example/table-desc` | Describe the example DynamoDB table           |
| GET    | `/v1/example/item/{id}`  | Get an item; 404 if absent                    |
| GET    | `/v1/example/items`      | Query the status/createdAt index              |
| POST   | `/v1/example/item`       | Create an item; 409 for an existing ID        |
| PUT    | `/v1/example/item/{id}`  | Update supplied mutable fields; 404 if absent |

Example create payload:

```json
{
  "id": "example-1",
  "name": "Test an agent skill",
  "description": "Implement another operation using the existing layers"
}
```

Creation defaults `status` to `EXECUTED` and `createdAt` to an ISO timestamp. Status may be `PENDING` or `EXECUTED`.
Listing queries `EXECUTED` items by default through `dynamo-command-builder`'s query parameters. Updates accept one or
more of `name`, `description`, and `status`; the route supplies the ID. They preserve omitted fields. There is no
authorizer configured on these example endpoints.

## Package and deploy

```sh
pnpm --filter @bat-peasant/serverless-example run package --stage dev
pnpm --filter @bat-peasant/serverless-example deploy --stage dev
```

`package` creates CloudFormation and Lambda artifacts in `.serverless/` without deploying. `deploy` creates AWS
resources and can incur charges. The service declares a stage-specific on-demand DynamoDB table and a
`status-createdAt-index`, with the execution role scoped to that table and its indexes. The repository reads the same
table name from `EXAMPLE_TABLE_NAME`. No existing IAM role ARN is required.

Local build output in `dist/` is for inspection; Serverless uses its own built-in esbuild pipeline to package the source
handlers for deployment.
