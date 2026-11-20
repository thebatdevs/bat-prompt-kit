# Monorepo package `ssm`

- **Import:** `@motforex-monorepo-packages/aws-ssm`
- **Version:** 1.0.0
- **Source:**
  [packages/ssm](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/ssm)
- **Entry:** `src/index.ts` re-exports the named functions from `src/ssm-client.ts`.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

## Functions

| Function                  | Input                                                                                                | Output                      | Behavior                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `getParameterStoreVal`    | `paramName: string`, `isDecrypt = false`                                                             | `Promise<string undefined>` | Sends `GetParameterCommand` with `WithDecryption`; returns `Parameter?.Value`.      |
| `updateParameterStoreVal` | `paramName: string`, `paramValue: string`, `paramType: ParameterType = 'String'`, `overwrite = true` | `Promise<void>`             | Sends `PutParameterCommand`; supports AWS parameter types including `SecureString`. |

## Reuse details

- The private SSM client is created once on first use, using `getAwsRegion()` from `libs` (`AWS_REGION` or
  `ap-southeast-1`).
- Parameter values are **not cached**: every read sends a request. The package description claims in-memory caching, but
  the implementation only caches the SDK client.
- Both helpers log the original failure and throw a new `Error` naming the parameter. They do not preserve the original
  AWS error name or cause.
- Reading a `SecureString` requires `isDecrypt: true` when the plaintext value is needed. The default is false.
