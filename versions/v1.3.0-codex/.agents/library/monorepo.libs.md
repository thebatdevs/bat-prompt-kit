# Monorepo package `libs`

- **Import:** `@motforex-monorepo-packages/libs`
- **Version:** 1.1.0
- **Source:**
  [packages/libs](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/libs)
- **Entry:** `src/index.ts` re-exports `auth`, `error`, `functions`, and `utility` barrels. All functions below are root
  exports.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

Core runtime helpers for handler factories, permissions, errors, configuration, and common utilities. Source paths below
are relative to this package.

## Permission functions — `src/auth/permission.ts`

`PermissionMap = Record<string, readonly string[]>` maps permission names to allowed Cognito groups.

| Function           | Input                                                                   | Output    | Behavior                                                                                     |
| ------------------ | ----------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `hasPermission`    | `groups: readonly string[]`, `permission: string`, `map: PermissionMap` | `boolean` | True when any caller group is allowed; undeclared permissions return false.                  |
| `assertPermission` | Same                                                                    | `void`    | Throws `CustomError` 500 for an undeclared permission or 403 (`errorForbidden`) when denied. |

## Runtime handler factories — `src/functions/function-gateway.ts`

| Function                         | Input                                                                   | Output                                               | Behavior                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `createHttpHandler<S>`           | Callback `(event: ValidatedAPIGatewayProxyEvent<S>) => Promise<object>` | `MiddyfiedHandler<ValidatedAPIGatewayProxyEvent<S>>` | JSON body middleware, success via `formatApiResponse`, callback errors via `handleApiFuncError`.        |
| `createI18nHttpHandler<S>`       | Same                                                                    | Same handler type                                    | Same success behavior; callback errors use `handleApiErrorWithI18n`.                                    |
| `createNoResponseHttpHandler<S>` | Callback `(event: ValidatedAPIGatewayProxyEvent<S>) => Promise<void>`   | Same handler type                                    | Returns `{ statusCode: 200, body: '' }` on success; callback errors use `handleApiFuncError`.           |
| `createTaskHandler<Req = void>`  | Callback `(request: Req) => Promise<object>`                            | `(request: Req) => Promise<LbdFuncResponse>`         | Direct/scheduled invocation wrapper; JSON-stringified body on success, `handleDefaultError` on failure. |

`HttpHandler<S>` is a public annotation alias for the HTTP factory result. JSON middleware disables content-type errors;
generic `S` is a TypeScript body type, not automatic Zod validation. Callback error catches do not wrap earlier
middleware execution.

## Serverless function-definition factories — `src/functions/function-define.ts`

These return configuration objects; they do not execute handlers.

| Function                             | Input               | Output / behavior                                                                                                              |
| ------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `generatePathname`                   | `context: string`   | `string`; removes a matching cwd prefix and normalizes backslashes.                                                            |
| `createDefaultFunction`              | `FuncParams`        | `{ handler, ...other }` for non-HTTP functions.                                                                                |
| `createDefaultApiFunc`               | `ApiFuncParams`     | Handler plus one REST `http` event, CORS configuration, and overrides.                                                         |
| `createCognitoAuthorizedApiFunction` | `CognitoFuncParams` | HTTP definition with a trimmed nonempty Cognito ARN and normalized `COGNITO_USER_POOLS` type; rejects another authorizer type. |

`FuncParams` contains `directory`, `handlerFn`, optional `handlerPath` (default `'handler'`) and `other`. API params add
`http: { method, path, cors?, more? }`; Cognito params require `http.authorizer: { arn, type?, name?, ... }`. Handler
strings become `<directory>/<handlerPath>.<handlerFn>` relative to cwd. CORS defaults to origin `*` and shared headers
including `Permission`; `cors: false` omits it. `other` and `http.more` are spread last and can override generated
fields. Public types also include `HttpMethod`, `HttpCorsConfig`, `ApiHttpConfig`, and `CognitoAuthorizerConfig`.

## API event extraction — `src/functions/api-event.ts`

Input for each function is `ValidatedAPIGatewayProxyEvent<unknown>`.

| Function                                           | Output                           | Behavior                                                                                                                         |
| -------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `extractMetadataFromEvent`                         | `HttpEventMetadata`              | IP, bearer token, headers, query params (default `{}`), and parsed body.                                                         |
| `extractMetadataAndAuthorizationFromEvent`         | `HttpEventMetadataWithAuth`      | Decodes token claims into `sub`, `email`, and groups (default `[]`), plus IP/headers/body. Does not populate token/query params. |
| `extractMetadataAndAuthorizationForAdminFromEvent` | `HttpEventMetadataWithAdminAuth` | Same authorized metadata plus required `Permission` / `permission` header.                                                       |

Authorization extractors **decode JWTs without verifying them**; use behind a validating Cognito authorizer. They accept
`Authorization` / `authorization` and remove a Bearer prefix case-insensitively. Parsing errors are logged and rethrown.

Related public schemas/types: `httpEventMetadataSch`, `httpEventMetadataWithAuthSch`,
`httpEventMetadataWithAdminAuthSch` and corresponding metadata types; `cognitoTokenClaimsSch` / `CognitoTokenClaims`;
`queryParamsSch` / `QueryParams`; `ValidatedAPIGatewayProxyEvent<S>` and `CustomAPIGatewayHandler<S>`. These live in
`api-event.types.ts` and `api-function.types.ts`.

## Error functions

| Function                 | Input                                                                   | Output                    | Behavior / source                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logErrorMessage`        | `error: unknown`, `func = 'Error'`                                      | `never`                   | Logs by error category and always rethrows the original value. `src/error/error-handling.ts`.                                                                                             |
| `handleApiFuncError`     | `error: unknown`                                                        | `APIGatewayProxyResultV2` | JSON/CORS error response; CustomError status/message, Zod 400 with field paths, DynamoCommandError 500, valid status-bearing error, otherwise generic 500. `src/error/error-handling.ts`. |
| `handleApiErrorWithI18n` | `error: unknown`                                                        | `APIGatewayProxyResultV2` | CustomError message passes through; Zod and other 4xx use validation locale key; other failures use unexpected key/500. `src/error/error-handling.ts`.                                    |
| `handleDefaultError`     | `error: unknown`                                                        | `LbdFuncResponse`         | Direct-Lambda error response using `formatResponse`; CustomError, Zod, status-bearing error, or generic 500. `src/error/error-handling.ts`.                                               |
| `isErrorWithStatusCode`  | `error: unknown`                                                        | Type predicate            | Accepts a non-null object with integer `statusCode` from 400 through 599. `src/error/error-utils.ts`.                                                                                     |
| `getErrorMessage`        | `error: unknown`                                                        | `string`                  | Uses a string or nonblank message; otherwise `'Unexpected error occurred'`. `src/error/error-utils.ts`.                                                                                   |
| `rethrow`                | `operation: string`, `tableName: string \| undefined`, `error: unknown` | `never`                   | Logs and throws `DynamoCommandError`, preserving an existing wrapper. `src/error/dynamo-error.ts`.                                                                                        |

Public classes: `CustomError(message, statusCode = 500, key: string | null = null)`;
`DynamoCommandError(operation, tableName, cause)` preserves the original AWS error name and cause plus operation/table.
`ERROR_KEYS` provides unexpected, validation, bad-path/query, not-found, unauthorized, forbidden, conflict, and
throttling locale keys. Error response formatters serialize `message`; they do not include `CustomError.key`
automatically.

## Environment and object utilities

| Function                      | Input                              | Output                                                 | Behavior / source                                                                                                                                             |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getRequiredEnvVar`           | `name: string`                     | `string`                                               | Trimmed nonempty env value; throws if absent/blank. `src/utility/env.ts`.                                                                                     |
| `getEnvVar`                   | `name: string`, `fallback: string` | `string`                                               | Trimmed env value or fallback. `src/utility/env.ts`.                                                                                                          |
| `getStage`                    | None                               | `string`                                               | `STAGE` or `'dev'`. `src/utility/env.ts`.                                                                                                                     |
| `isProdStage`                 | None                               | `boolean`                                              | Exact comparison with `'prod'`. `src/utility/env.ts`.                                                                                                         |
| `getAwsRegion`                | None                               | `string`                                               | `AWS_REGION` or `'ap-southeast-1'`. `src/utility/env.ts`.                                                                                                     |
| `lazySingleton<T>`            | `factory: () => T`                 | `() => T`                                              | Creates once on first successful call, even if result is undefined; caches result. `src/utility/lazy.ts`.                                                     |
| `omit<T, K>`                  | `obj: T`, `keys: K[]`              | `Omit<T, K>`                                           | Shallow copy excluding selected own enumerable string keys. `src/utility/omit.ts`.                                                                            |
| `parseLastKey`                | `lastKey: string \| undefined`     | `Record<string, unknown> \| undefined`                 | Empty input returns undefined; requires JSON object (not null/array), else CustomError 400. Does not validate entity key fields. `src/utility/pagination.ts`. |
| `generateConditionExpression` | `statuses: string[]`               | `{ condition: string; extra: Record<string, string> }` | One status uses equality; multiple use IN; empty input throws. Caller supplies `#status` name mapping. `src/utility/condition-expression.ts`.                 |

## Responses, payments, and metadata

| Function                         | Input                                                        | Output                                                        | Behavior / source                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatResponse`                 | `response: object`, `statusCode = 200`, `other: object = {}` | `LbdFuncResponse`                                             | JSON-stringifies body; spreads `other` last. `src/utility/response-format.ts`.                                                                                                  |
| `formatApiResponse`              | Same                                                         | `APIGatewayProxyResultV2`                                     | Adds wildcard CORS headers, then spreads `other` last. `src/utility/response-format.ts`.                                                                                        |
| `convertPaymentRequestForClient` | `item?: DepositRequest \| WithdrawRequest`                   | `Partial<ClientPaymentRequest>`                               | Copies `PAYMENT_REQUEST_CLIENT_ATTRIBUTES`; absent input gives `{}`. Shallow projection only; nested metadata must already be client-visible. `src/utility/payment-request.ts`. |
| `createDynamicMetadataSchema`    | `formSchema: FormField[]`                                    | `z.ZodObject<any>`                                            | Builds text/number/checkbox/multi-select validators keyed by field name. `src/utility/validate.ts`.                                                                             |
| `validateMetadataWithFormSchema` | `md: GenericRecord`, `form?: FormField[] \| null`            | `{ isValid: boolean; parsedMetadata: GenericRecord \| null }` | Missing/empty form accepts original metadata; otherwise validates and strips unknown fields, returning null on validation failure. `src/utility/validate.ts`.                   |

The dynamic validator's `multi-select` widget refinement uses `allowedValues.includes(val)` on the entire value. It does
not check each array member; do not assume normal array membership validation. Projection exports also include
`PAYMENT_REQUEST_CLIENT_ATTRIBUTES` and `ClientPaymentRequest`. `logger` is a public Winston console logger with label
`CUSTOM-APPLICATION`, timestamp, and uppercase level (`src/utility/winston.ts`).

## Cryptography and numeric helpers

| Function                 | Input                                                     | Output    | Behavior / source                                                                                                                                |
| ------------------------ | --------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `encryptCredential`      | `plaintext: string`, `keyEnvName = 'CRED_ENCRYPTION_KEY'` | `string`  | AES-256-GCM with random 12-byte IV; returns Base64 `iv.authTag.ciphertext`. Env key must decode to 32 bytes. `src/utility/crypto.ts`.            |
| `decryptCredential`      | `stored: string`, same key-env default                    | `string`  | Decrypts and verifies the GCM tag; malformed input/key/tag throws. `src/utility/crypto.ts`.                                                      |
| `encryptSecret`          | `number: number`, `key: string`                           | `string`  | AES-256-CTR with hex key and random 16-byte IV; returns hex `iv:ciphertext`. `src/utility/secret.ts`.                                            |
| `decryptSecret`          | `encryptedText: string`, `key: string`                    | `number`  | CTR decryption followed by `parseFloat`; incompatible with credential format. `src/utility/secret.ts`.                                           |
| `validateSecret`         | `secret: string`, `key: string`                           | `boolean` | Decrypts timestamp and checks `Date.now() - timestamp <= 3000`; errors are rethrown. Does not reject future timestamps. `src/utility/secret.ts`. |
| `generateSha256Checksum` | `sKey: string`, `args: string[]`                          | `string`  | HMAC-SHA256 hex over concatenated nonempty arguments, without separators. `src/utility/uuid.ts`.                                                 |
| `roundDownToTwoDecimals` | `amount: number`                                          | `number`  | `Math.floor(amount * 100) / 100`; rounds toward negative infinity. `src/utility/uuid.ts`.                                                        |
| `getCrypto`              | None                                                      | `Crypto`  | Global Web Crypto or Node webcrypto fallback. `src/utility/uuid.ts`.                                                                             |
| `generateUuidV4`         | None                                                      | `string`  | Node randomUUID, global randomUUID, or random-byte RFC 4122 v4 fallback. `src/utility/uuid.ts`.                                                  |

Use credential GCM helpers for authenticated reversible credential storage. The numeric CTR secret helpers provide no
authentication tag and have a separate timestamp-oriented contract.
