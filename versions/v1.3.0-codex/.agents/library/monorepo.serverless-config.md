# Monorepo package `serverless-config`

- **Import:** `@motforex-monorepo-packages/serverless-config`
- **Version:** 1.1.0
- **Source:**
  [packages/serverless-config](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/serverless-config)
- **Entry:** `src/index.ts`; all functions below are root exports.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

Use at configuration time for Serverless stacks, naming, CloudFormation resources, Cognito references, and local ports.
Importing the environment module loads `dotenv/config`; this package is separate from runtime `libs` environment
helpers.

## Stack definition — `src/define-serverless-stack.ts`

| Function                | Input                                   | Output                              | Behavior                                                                                                                           |
| ----------------------- | --------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `defineServerlessStack` | `options: DefineServerlessStackOptions` | `AWS` from `@serverless/typescript` | Validates options, builds names/config, resolves VPC, injects referenced Cognito pool ARNs, and merges overrides. Does not deploy. |

Required options: `app`, nonempty `functions`. Optional options: `legacyServiceName`, `defaultStage`, `environment`,
`resources`, `vpc`, `env`, `offline`, `provider`, `plugins`, `custom`, `packagePatterns`.

- Use `app: buildAppName('<stack-directory>')`. If offline names a real stack directory, it must agree with app.
  Template keys containing `/` are exempt from that comparison.
- Strict top-level options reject unknown keys. Functions need a handler or image and Lambda-safe keys. Physical names
  are checked against the 64-character limit using `prod` for the `${sls:stage}` placeholder; arbitrary longer stages
  are not comprehensively checked.
- New functions default to `<stage>-<app>-<key>`; an explicit function name overrides this. `legacyServiceName`
  preserves the old service and framework function naming behavior.
- Defaults: stage dev, runtime Node.js 24, arm64, timeout 29 seconds, memory 512 MB, retention 365 days, regional API
  Gateway, Serverless v4 native esbuild, individual packaging, shared VPC, and serverless-offline plugin. Runtime env
  includes STAGE/REGION, referenced pools, optional local DYNAMODB_ENDPOINT, then caller environment.
- `environment` rejects Lambda-reserved env names (including AWS_REGION) and accepts string values or CloudFormation
  objects. Stack environment entries override inferred values; defined provider fields spread last and can replace whole
  nested sections. `custom` also spreads last. Plugins/package patterns append to defaults.
- `vpc: false` omits default placement; otherwise explicit VPC values override process env and shared defaults. A
  supplied env is validated, or `loadServerlessEnv()` loads deployment settings. Local offline HTTP port comes from the
  registry, Lambda port is HTTP + 100.

## Deployment environment — `src/env.ts`

| Function                   | Input                                                        | Output                                            | Behavior                                                                             |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `formatZodIssues`          | `error: z.ZodError`                                          | `string`                                          | Formats issue paths/messages, including nested invalid-key/element messages.         |
| `loadServerlessEnv<Shape>` | `extraShape?: Shape`, `env: NodeJS.ProcessEnv = process.env` | `BaseServerlessEnv & z.infer<z.ZodObject<Shape>>` | Extends shared Zod shape, validates settings, throws formatted configuration errors. |

Public `baseServerlessEnvSch` / `BaseServerlessEnv`: AWS_REGION defaults to ap-southeast-1; AWS_IAM_ROLE requires a full
IAM role ARN; optional AWS_PROFILE, SUBNET_IDS, SECURITY_GROUP_IDS, COGNITO_ADMIN_USER_POOL_ARN,
COGNITO_CLIENT_USER_POOL_ARN. Public `cognitoArn` validates user-pool ARN format. Additional stack-specific fields
require extraShape when loading.

## Naming — `src/naming.ts`

All functions below return strings except getMonorepoConfig. Default stage text is the Serverless variable
`${sls:stage}`. The inspected `monorepo.config.json` declares org `motcapital`, product `stock-finance`; helpers read
the file rather than hard-coding these values.

| Function                  | Input                                                                               | Result / behavior                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `getMonorepoConfig`       | None                                                                                | `MonorepoConfig` (`{ org, product }`), validated and cached from nearest monorepo.config.json at/above cwd.                 |
| `getOrg`                  | None                                                                                | Cached org slug.                                                                                                            |
| `getProduct`              | None                                                                                | Cached product slug.                                                                                                        |
| `buildAppName`            | `directory: string`                                                                 | `<product>-<directory>`; rejects an already product-prefixed directory.                                                     |
| `buildServiceName`        | `app: string`                                                                       | `<app>-service`.                                                                                                            |
| `buildDynamoTableName`    | `app: string`, `entity: string`, `options: { stage?: string } = {}`                 | `<stage>-<app>-<entity>`.                                                                                                   |
| `buildProjectTableName`   | `entity?: string`, `options: { stage?: string; prefix?: string \| undefined } = {}` | Default `<stage>-<product>[-<entity>]-table`; explicit prefix produces `<prefix>[-<entity>]` with no stage or table suffix. |
| `buildSqsQueueName`       | `app: string`, `queue: string`, `options: { stage?: string; fifo?: boolean } = {}`  | `<stage>-<app>-<queue>` plus `.fifo` when requested.                                                                        |
| `buildS3BucketName`       | `app: string`, `purpose: string`, `options: { stage?: string } = {}`                | `<stage>-<app>-<purpose>`.                                                                                                  |
| `buildSsmPath`            | `app: string`, `...segments: string[]`                                              | `/<org>/${sls:stage}/<app>/<segments joined by />`.                                                                         |
| `buildSsmReference`       | `app: string`, `...segments: string[]`                                              | `${ssm:<built path>}`.                                                                                                      |
| `buildSsmReferenceOrEnv`  | `envName: string`, `app: string`, `...segments: string[]`                           | `${ssm:<built path>, env:<envName>}` for local fallback.                                                                    |
| `buildLambdaFunctionName` | `app: string`, `handlerName: string`, `stage = '${sls:stage}'`                      | `<stage>-<app>-<handlerName>`.                                                                                              |

Naming validates lower-kebab-case slugs. App must begin with product and its remaining tokens must omit reserved stages,
service, stack, and the org prefix. `buildAppName` validates the directory slug and duplicate product prefix; complete
app validation occurs in the app-consuming helpers. Public constants: `SLUG_PATTERN`, `SERVICE_SUFFIX`.

## CloudFormation resources — `src/resources.ts`

These build objects only; they create no AWS resources until deployed by a consumer.

| Function                          | Input                                 | Output                        | Behavior                                                                                                                      |
| --------------------------------- | ------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `createDynamoTableResource`       | `DynamoTableOptions`                  | `CfnResource`                 | PAY_PER_REQUEST table, PITR, Retain deletion/replacement policies; optional range key, GSIs, TTL, and stream.                 |
| `createFifoQueueWithDlqResources` | `FifoQueueOptions`                    | `Record<string, CfnResource>` | Main FIFO queue plus `<logicalId>DLQ`; content deduplication, default visibility 120s, max receives 5, DLQ retention 14 days. |
| `createPrivateBucketResource`     | `PrivateBucketOptions`                | `CfnResource`                 | Private AES256-encrypted bucket retained on deletion/replacement; optional GET/PUT CORS and prefix expiration.                |
| `createSqsEvent`                  | `logicalId: string`, `batchSize = 10` | SQS event object              | Queue ARN via Fn::GetAtt and ReportBatchItemFailures.                                                                         |
| `createQueueUrlReference`         | `logicalId: string`                   | `{ Ref: string }`             | CloudFormation queue URL reference.                                                                                           |

Public option types:

- `DynamoKeyType = 'S' | 'N' | 'B'`; `DynamoKey = { name, type }`; `DynamoIndex` has name, hashKey (one key or tuple of
  2–4), optional rangeKey, optional ALL/KEYS_ONLY projection (default ALL).
- `DynamoTableOptions` requires tableName/hashKey, optionally rangeKey/indexes/ttlAttribute/stream.
- `FifoQueueOptions` requires logicalId, queueName, deadLetterQueueName; optional
  visibilityTimeoutSeconds/maxReceiveCount. Supply physical FIFO names with `.fifo`.
- `PrivateBucketOptions` requires bucketName; optional corsOrigins and expireAfterDays `{ prefix, days }`.

## Authorizers, alerts, and VPC

| Function                      | Input                                                                       | Output                  | Behavior / source                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `buildCognitoPoolEnvironment` | `functions: NonNullable<AWS['functions']>`, `env: BaseServerlessEnv`        | Partial pool-env record | Finds HTTP authorizer ARNs referencing provider env and injects only used admin/client pool ARNs; missing required pool throws. `src/authorizers.ts`.              |
| `buildAlertSsmPrefix`         | None                                                                        | `string`                | `/<org>/${sls:stage}/alerts`. `src/alerts.ts`.                                                                                                                     |
| `buildAlertWebhookReference`  | `channel: string`                                                           | `string`                | `${ssm:<alert prefix>/<channel>, env:ALERT_WEBHOOK_URL}`. `src/alerts.ts`.                                                                                         |
| `resolveVpc`                  | `override: Partial<VpcConfig> = {}`, `env: NodeJS.ProcessEnv = process.env` | `VpcConfig`             | Explicit arrays, then comma-separated SUBNET_IDS/SECURITY_GROUP_IDS (legacy SECURITY_GROUP_ID fallback), then defaults. Empty resolved arrays throw. `src/vpc.ts`. |
| `getOfflinePort`              | `stack: StackDirectory`                                                     | `number`                | HTTP port from checked-in registry. `src/offline-ports.ts`.                                                                                                        |

Public values/types:

- `adminAuthorizer`, `clientAuthorizer`, `COGNITO_POOL_ENV`, `Audience`, `CognitoAuthorizer` (`src/authorizers.ts`). ARN
  values reference provider environment; they are not runtime authorization functions.
- `ALERT_SSM.operations` getter builds the operations webhook reference lazily.
- `VPC_ID`, `PRIVATE_SUBNETS`, `LAMBDA_SECURITY_GROUP_ID`, `DEFAULT_VPC`, `VpcConfig` (`src/vpc.ts`); shared placement
  is in ap-southeast-1. Check source before overriding infrastructure identifiers.
- `OFFLINE_HTTP_PORTS`, `StackDirectory` (`src/offline-ports.ts`). New keys must be registered; `pnpm new:stack`
  maintains them.
- Defaults (`src/defaults.ts`): `RUNTIME`, `BUILD_TARGET`, `ARCHITECTURE`, `API_TIMEOUT_SECONDS`, `MEMORY_SIZE_MB`,
  `LOG_RETENTION_DAYS`, `API_GATEWAY_DEFAULTS`, `ESBUILD_DEFAULTS`, `PACKAGE_EXCLUDE_PATTERNS`, `PLUGINS`,
  `PRUNE_DEFAULTS`, `SHARED_RUNTIME_ENV`, `FRAMEWORK_VERSION`.
