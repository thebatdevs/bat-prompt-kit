# Monorepo package `lambda`

- **Import:** `@motforex-monorepo-packages/aws-lambda`
- **Version:** 2.0.0
- **Source:**
  [packages/lambda](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/lambda)
- **Entry:** `src/index.ts`; functions below are package-root exports.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

Use for direct Lambda invocation, remote permission checks, and settlement wallet operations.

## Invocation and authorization

| Function                 | Input                                                                    | Output                                                                                                                                | Behavior / source                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `invokeLambdaFn<T>`      | `fnName: string`, non-null `payload: unknown`, optional invocation type  | Default / `RequestResponse`: `Promise<GenericFuncResponse<T>>`; `Event`: `Promise<void>`; `DryRun`: `Promise<GenericFuncResponse<T>>` | Serializes payload and invokes a lazy Lambda client. Decodes JSON and an optional stringified response body. `src/invoke.ts`.                                                                         |
| `verifyPermission`       | `token: string`, `requiredPermission: string[]`, `lambdaEnvName: string` | `Promise<void>`                                                                                                                       | Resolves the function name from the named env var; invokes with `{ body: { token, requiredPermission } }`. Requires status 200, valid response, and `isAuthorized: true`. `src/verify-permission.ts`. |
| `getIndexConfigByLambda` | `id: string`                                                             | `Promise<{ id: number }>`                                                                                                             | Allocates an index from the hard-coded `prod-stock-finance-admin-config-getIndexConfigByCode` Lambda; requires nonempty input and a positive safe integer result. `src/custom-config.ts`.             |

`GenericFuncResponse<T>` is `{ statusCode: number; body: T }` from `schemas`.

- Invocation defaults to `RequestResponse`. `Event` returns no body; `DryRun` returns transport status with
  `body: null as T`. Empty synchronous payload also returns a null body. Non-JSON payloads throw.
- Invocation uses `AWS_REGION` or `ap-southeast-1`. Errors are logged and rethrown. The implementation does not
  explicitly inspect AWS `FunctionError`; callers must validate the returned application status and body.
- `verifyPermission` throws `CustomError` 500 for an absent binding and 401 for a non-200, invalid, or denied result.
  Transport errors propagate.
- Index allocation is a production-bound mutation and is not idempotent. The wrapper adds no retries; do not replay
  uncertain allocations.

## Wallet functions — `src/wallet.ts`

All functions below invoke synchronously and log/rethrow failures. Types are exported at the package root.

| Function                     | Input                                  | Resolved output            | Environment variable for target Lambda         |
| ---------------------------- | -------------------------------------- | -------------------------- | ---------------------------------------------- |
| `getAvailableWalletsForUser` | `clientId: string`, `currency: string` | `Wallet`                   | `LAMBDA_SETTLEMENT_LEDGER_LIST_WALLETS`        |
| `getHeadroom`                | `HeadroomRequest`                      | `HeadroomResponse`         | `LAMBDA_SETTLEMENT_ADMIN_CUSTODY_GET_HEADROOM` |
| `chargeWallet`               | `ChargeWalletRequest`                  | `ChargeWalletResponse`     | `LAMBDA_SETTLEMENT_LEDGER_CHARGE_WALLET`       |
| `withdrawWallet`             | `WithdrawWalletRequest`                | `WithdrawWalletResponse`   | `LAMBDA_SETTLEMENT_LEDGER_WITHDRAW_WALLET`     |
| `withdrawalResult`           | `WithdrawalResultRequest`              | `WithdrawalResultResponse` | `LAMBDA_SETTLEMENT_LEDGER_WITHDRAWAL_RESULT`   |

### Contracts

- `getAvailableWalletsForUser` sends `{ clientId, currency }` and validates `walletListLdbResponseSch`. It inspects
  **only the first wallet**, requiring matching currency, `ACTIVE` status, and a wallet number. It does not search later
  wallets or enforce `canDeposit` / `canWithdraw`.
- `HeadroomRequest` is `{ depositUsd: number }`, a positive safe integer in USD minor units. Response includes
  `headroomUsd`, `minimumUsd`, `buyingPaused`, a required `deposit` decision, `asOf`, and `av` reachability/cash data.
  Only `deposit.allowed` authorizes proceeding; this call reserves no funds. Denial reasons are `AV_UNREACHABLE`,
  `NO_HEADROOM`, or `EXCEEDS_HEADROOM`.
- `ChargeWalletRequest` requires `clientId`, an 18-character `MOT`-prefixed `walletNumber`, currency `MNT | USD`,
  positive safe integer minor-unit `amount`, `chargeId`, `depositId`, and `source: { kind: string }`. Optional
  audit/payment fields: `method`, `fee`, `currencyRate`, `reference`, `comment`, `paidAt`. Charge amount excludes fees.
  Response is `CREDITED` with deposit ID, `PENDING_REVIEW` with deposit ID and waiting amount, or `REJECTED` with
  reason. Non-rejected deposit IDs must match the request.
- `WithdrawWalletRequest` shares movement fields and requires `withdrawalId`, `mode: 'DEBIT' | 'HOLD'`, and a
  destination: BANK with bank code/account number/holder name, or CFD with login. CFD requires USD; fee cannot exceed
  amount; `requestedAt` is optional. The full amount includes fees. Response is `EXECUTED`, `HELD`, or `REJECTED` with
  withdrawal ID; the wrapper verifies ID and mode/result consistency.
- `WithdrawalResultRequest` requires `withdrawalId`, UTC datetime `at`, and status `COMPLETED | FAILED | RETURNED`.
  FAILED requires `{ code, message? }` failure data; RETURNED permits it; COMPLETED forbids it. Response is
  `{ result: 'APPLIED' | 'DUPLICATE', status: 'EXECUTED' | 'RELEASED' | 'REVERSED' | 'RETURNED' }`.

The four settlement decision wrappers require HTTP/application status 200 before parsing success bodies. For other
statuses they parse `{ message, code? }` and throw `CustomError(message, statusCode, code ?? null)`. An invalid error
body fails schema parsing instead.

### Mutation and retry semantics

The wrapper comments specify replay only for 503/timeouts with identical IDs and content; these wrappers add no
application retries. Invocation failure can leave mutation outcome uncertain. A deposit can be credited once; a hold
remains locked until a withdrawal result is applied. Withdrawal-result idempotency uses withdrawal ID plus status;
conflicts require manual resolution. These are remote settlement contracts, not local ledger implementations.

## Other public exports

- `AuthorizationCheckResponseSchema` and `AuthorizationCheckResponse` describe
  `{ isAuthorized: boolean; response: { message: string; statusCode: number } }`.
- `chargeWalletRequestSch` is the **only wallet-contract schema** exported by the package root. The other
  request/response schemas in `src/wallet-contracts.ts` are internal to that entry point, even though the file declares
  them with `export`.
- Root exports all eight wallet request/response types listed above. `Wallet` itself comes from `schemas`.
