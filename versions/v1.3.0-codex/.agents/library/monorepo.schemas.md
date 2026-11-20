# Monorepo package `schemas`

- **Import:** `@motforex-monorepo-packages/schemas`
- **Version:** 1.1.0
- **Source:**
  [packages/schemas](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/schemas)
- **Entry:** `src/index.ts` re-exports `main`, `custom-config`, and `payment` barrels.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

Use for shared Zod validation, inferred types, payment/wallet contracts, statuses, and configuration seed constants.
This package has one public standalone function. Schemas expose Zod methods such as `.parse()` and `.safeParse()`; they
are exported values rather than additional custom functions.

## Function — `src/main/util.types.ts`

| Function                    | Input           | Output                | Behavior                                                                                                                                 |
| --------------------------- | --------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `parseTwoDecimalMinorUnits` | `value: string` | `number \| undefined` | Converts a nonnegative decimal monetary string into safe integer minor units using BigInt; invalid format or overflow returns undefined. |

Accepts integers, one/two decimal digits, and correctly grouped thousands: `'1,234.50'` becomes `123450`; `'0'` becomes
`0`. Rejects whitespace, signs, exponent notation, malformed grouping, and excess decimal places. It does not enforce a
strictly positive business amount.

## General schemas — `src/main/util.types.ts`

| Export                    | Validated shape / behavior                                                                                                                                                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LbdFuncResponseSchema`   | `{ statusCode: number; body: any }`; does not decode a JSON-string body.                                                                                                                                                                                                                       |
| `genericRecordSch`        | String-keyed unknown values.                                                                                                                                                                                                                                                                   |
| `requiredStrSch`          | Nonempty string; no trimming.                                                                                                                                                                                                                                                                  |
| `positiveIntSch`          | Strictly positive integer; zero is rejected.                                                                                                                                                                                                                                                   |
| `optionalStrSch`          | Nonempty string, null, or undefined.                                                                                                                                                                                                                                                           |
| `unixTimestampSch`        | Positive integer from `1000000000000` through `9999999999999` (13-digit milliseconds).                                                                                                                                                                                                         |
| `twoDecimalsNumSch`       | Number or string transformed using `Number(Number(value).toFixed(2))`; rounds rather than requiring two-decimal input. Does not explicitly reject nonnumeric strings before transformation.                                                                                                    |
| `customStrTimezoneSchema` | Trimmed timezone accepted by `Intl.DateTimeFormat`.                                                                                                                                                                                                                                            |
| `optionsSch`              | `{ label: string; value: string }`.                                                                                                                                                                                                                                                            |
| `auditFieldsSch`          | createdAt/updatedAt millisecond timestamps and nonempty createdBy/updatedBy.                                                                                                                                                                                                                   |
| `amountSch`               | `{ amount: positiveIntSch; currency: requiredStrSch }`.                                                                                                                                                                                                                                        |
| `commissionSch`           | Required type/currency strings and positive integer value/amount.                                                                                                                                                                                                                              |
| `valueTypeSch`            | Literal names string, number, boolean, object, array, null.                                                                                                                                                                                                                                    |
| `editTypeSch`             | EDITABLE or READONLY.                                                                                                                                                                                                                                                                          |
| `idParamsSch`             | Strict `{ id: nonempty string }`.                                                                                                                                                                                                                                                              |
| `versionSch`              | Strict `{ expectedUpdatedAt: unixTimestampSch }`.                                                                                                                                                                                                                                              |
| `paginationSch`           | Required positive-integer number or digit-string limit, optional nullable lastKey, optional filterBy STATUS/PAYMENT_METHOD and nullable filterVal; filterBy requires a truthy filterVal. No upper bound; the digit-string branch does not reapply positive-number validation after conversion. |

Inferred types: `LbdFuncResponse`, `GenericRecord`, `RequiredStr`, `PositiveInt`, `OptionalStr`, `UnixTimestamp`,
`TwoDecimalsNum`, `CustomStrTimezone`, `Option`, `AuditFields`, `Amount`, `Commission`, `ValueType`, `EditType`,
`IdParams`, `Version`, `Pagination`.

Type-only contracts: `GenericFuncResponse<T> = { statusCode: number; body: T }`, `QueryParams`,
`UpdateResponse<T> = { previous: T; updated: T }`,
`CollectionQuery = { limit: number; exclusiveStartKey?: GenericRecord }`,
`CollectionPage<T> = { items: T[]; lastKey: string | null }`.

## S3 schemas — `src/main/s3.types.ts`

| Export                          | Shape                                                                                                   | Inferred type                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `s3UploadSignedUrlRequestSch`   | bucketName/filePath/contentType; optional string-record metadata and positive integer expiresIn seconds | `S3UploadSignedUrlRequest`   |
| `s3DownloadSignedUrlRequestSch` | bucketName/filePath; optional positive integer expiresIn seconds                                        | `S3DownloadSignedUrlRequest` |
| `s3SignedUrlResponseSch`        | `{ filePath: string; signedUrl: string }`                                                               | `S3SignedUrlResponse`        |

## Custom configuration schemas

| Export                           | Purpose / source                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `customConfigStatusSch`          | ACTIVE/INACTIVE enum. `src/custom-config/custom-config.types.ts`.                                                                                                                        |
| `customConfigsSch`               | Canonical configuration: string ID/value, nullable positive-integer numValue, valueType, parent/additional codes, status, editType, description/postDate, and audit fields. Same source. |
| `createCustomConfigReqSch`       | Strict canonical input omitting status and audit fields; caller supplies ID. `src/custom-config/custom-config.utility.types.ts`.                                                         |
| `patchCustomConfigReqSch`        | Strict partial editable fields excluding ID, plus required expectedUpdatedAt; requires at least one defined edit. Same source.                                                           |
| `customConfigSummarySch`         | ID, value, parentCode, editType, status, updatedAt. Same source.                                                                                                                         |
| `customConfigResponseSch`        | Alias of canonical configuration schema. Same source.                                                                                                                                    |
| `customConfigCriteriaSch`        | Strict nonempty criteria; ID is optional scalar, other fields accept canonical value or nonempty readonly list of values. Same source.                                                   |
| `customConfigCollectionQuerySch` | Strict limit 1–100, optional strict string-ID exclusiveStartKey. Same source.                                                                                                            |

Public types: `CustomConfigs`, `PrtCustomConfigs`, `OptCustomConfigs`, `OptPrtCustomConfigs`, `CreateCustomConfigReq`,
`PatchCustomConfigReq`, `CustomConfigSummary`, `CustomConfigResponse`, `CustomConfigCriteria`,
`UpdateCustomConfigParams`, `UpdateCustomConfigStatusParams`, `DeleteCustomConfigParams`.
`CUSTOM_CONFIG_SUMMARY_ATTRIBUTES` is the summary field list.

## Payment-method schemas

| Export                            | Purpose / source                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `payMTypeSch`                     | DEPOSIT, WITHDRAWAL, INTERNAL_TRANSFER, EXTERNAL_TRANSFER. `src/custom-config/payment-method.types.ts`.                                                             |
| `txnTypeSch`                      | MANUAL/AUTOMATIC. Same source.                                                                                                                                      |
| `payMStatusSch`                   | ACTIVE/INACTIVE. Same source.                                                                                                                                       |
| `formFieldSch`                    | fieldName/title; type text/number/checkbox/multi-select; widget input/checkbox/select/multi-select; nullable optionsSource/options. Same source.                    |
| `paymentMethodSch`                | Canonical numeric-ID method, presentation, limits, proof/metadata settings, currency/commission, transaction mode, exclusions, status, and audit data. Same source. |
| `createPaymentMethodReqSch`       | Strict input omitting ID, status, and audit fields. `src/custom-config/payment-method.utility.types.ts`.                                                            |
| `patchPaymentMethodReqSch`        | Strict partial create fields plus expectedUpdatedAt; requires a defined edit. Same source.                                                                          |
| `paymentMethodSummarySch`         | ID, title, status, updatedAt. Same source.                                                                                                                          |
| `paymentMethodResponseSch`        | Alias of canonical method schema. Same source.                                                                                                                      |
| `paymentMethodIdParamsSch`        | Strict positive decimal string ID converted to a safe integer; rejects leading zeroes. Same source.                                                                 |
| `paymentMethodCriteriaSch`        | Strict nonempty criteria with scalar numeric ID and canonical equality/membership alternatives for other fields. Same source.                                       |
| `paymentMethodCollectionQuerySch` | Strict limit 1–100 with optional strict numeric-ID exclusiveStartKey. Same source.                                                                                  |

Public types: `PayMType`, `TxnType`, `PayMStatus`, `FormField`, `PaymentMethod`, `PrtPaymentMethod`, `OptPaymentMethod`,
`OptPrtPaymentMethod`, `CreatePaymentMethodReq`, `CreatePaymentMethodInput`, `PatchPaymentMethodReq`,
`PatchPaymentMethodInput`, `PaymentMethodSummary`, `PaymentMethodResponse`, `PaymentMethodCriteria`,
`PaymentMethodCriteriaInput`, `PaymentMethodCollectionQuery`, `UpdatePaymentMethodParams`,
`UpdatePaymentMethodStatusParams`, `DeletePaymentMethodParams`. Input/output type pairs matter because numeric schemas
transform strings. `PAYMENT_METHOD_SUMMARY_ATTRIBUTES` is the summary field list.

## Payment and wallet schemas

| Export                       | Purpose / source                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updateHistorySch`           | Nonempty email/change/ipAddress/postDate/message strings. `src/payment/payment-request.types.ts`.                                                                                                        |
| `paymentRequestSch`          | Canonical request identity, client/wallet, amounts, method snapshot, proof/metadata, messages, execution/expiry, and audit fields. Same source.                                                          |
| `depositRequestStatusSch`    | PENDING, PENDING_REVIEW, EXECUTED, EXECUTING, HALTED, FAILED, REJECTED, CANCELLED. `src/payment/deposit-request.types.ts`.                                                                               |
| `depositRequestSch`          | Canonical payment request plus deposit status; chargeAmount and amountWithCommission permit positive numbers with at most two decimal places via the minor-unit parser check. Same source.               |
| `depositRequestCriteriaSch`  | Strict nonempty criteria across canonical deposit fields; ID scalar, other fields equality/membership alternatives. `src/payment/deposit-request.utility.types.ts`.                                      |
| `withdrawRequestStatusSch`   | PENDING, PROCESSING, PAYOUT, HALTED, FAILED, REJECTED, EXECUTED and AUTO_PROCESSING/AUTO_SOLVED/AUTO_PAYOUT/AUTO_FAILED/AUTO_REJECTED/AUTO_EXECUTED. `src/payment/withdraw-request.types.ts`.            |
| `withdrawRequestSch`         | Canonical payment request plus withdrawal status. Its base amount objects still use positive integers. Same source.                                                                                      |
| `withdrawRequestCriteriaSch` | Strict nonempty criteria across canonical withdrawal fields. `src/payment/withdraw-request.utility.types.ts`.                                                                                            |
| `walletSch`                  | Strict settlement wallet: client/currency/number/status, balance, operation eligibility/reasons, optional USD instant limits, group data, and BANK/CFD withdrawal limits. `src/payment/wallet.types.ts`. |
| `walletListLdbResponseSch`   | Strict `{ statusCode: number; body: { wallets: Wallet[] } }`; does not require statusCode 200 by itself. Same source.                                                                                    |

Public types include `UpdateHistory`, `PaymentRequest`, `DepositRequest`, `WithdrawRequest`, `DepositRequestStatus`,
`WithdrawRequestStatus`, `DepositRequestCriteria`, `DepositRequestCriteriaInput`, `WithdrawRequestCriteria`,
`WithdrawRequestCriteriaInput`, `Wallet`, and `WalletListLdbResponse`. Payment/deposit/withdrawal request entities also
export `Prt*`, `Opt*`, and `OptPrt*` variants for partial and/or nullable/undefined values.

Criteria schemas validate values only. They do not execute queries, enforce ownership, or define permitted status
transitions. Nested arrays/objects retain canonical shapes; a membership list wraps that canonical value.

## Constants

`src/main/status.schemas.ts` exports string constants (not Zod enums):

- `STATUS_INITIAL`, `STATUS_ACTIVE`, `STATUS_INACTIVE`, `STATUS_UNFOLLOWED`.
- `STATUS_PENDING`, `STATUS_PROCESSING`, `STATUS_PROCESSED`, `STATUS_ARCHIVED`, `STATUS_PAYOUT`,
  `STATUS_PENDING_APPROVAL`, `STATUS_PENDING_REVIEW`.
- `STATUS_SUSPENDED`, `STATUS_CANCELLED`, `STATUS_EXPIRED`, `STATUS_FAILED`, `STATUS_REJECTED`, `STATUS_HALTED`.
- `STATUS_COMPLETED`, `STATUS_CONFIRMED`, `STATUS_SETTLED`, `STATUS_EXECUTED`, `STATUS_EXECUTING`, `STATUS_APPROVED`,
  `STATUS_SOLVED`.
- `STATUS_AUTO_PROCESSING`, `STATUS_AUTO_PAYOUT`, `STATUS_AUTO_SOLVED`, `STATUS_AUTO_FAILED`, `STATUS_AUTO_REJECTED`,
  `STATUS_AUTO_EXECUTED`.
- `OUTCOME_SUBMITTED`, `OUTCOME_FAILED_VALIDATION`, `OUTCOME_RESUBMITTED` identify attempt outcomes.

`src/main/util.types.ts` also exports `TYPE_EDITABLE` and `TYPE_READONLY`.

`src/custom-config/custom-config.constants.ts` exports:

- Index IDs: `DEPOSIT_REQUEST_INDEX`, `WITHDRAWAL_REQUEST_INDEX`, `EXTERNAL_TRANSFER_INDEX`, `INTERNAL_TRANSFER_INDEX`,
  `PAYMENT_METHOD_INDEX`, `TEST_INDEX`; collected in `AVAILABLE_INDEX_CONFIG_IDS`.
- Initial counter objects: `DEPOSIT_REQUEST_INDEX_CONFIG`, `WITHDRAWAL_REQUEST_INDEX_CONFIG`,
  `EXTERNAL_TRANSFER_INDEX_CONFIG`, `INTERNAL_TRANSFER_INDEX_CONFIG`, `PAYMENT_METHOD_INDEX_CONFIG`,
  `TEST_INDEX_CONFIG`. Initial counters are 1000; allocation belongs to a remote/atomic implementation.
- Rate IDs and seed objects: `USD_MNT_BUY`, `USD_MNT_SELL`, `USD_MNT_BUY_CONFIG`, `USD_MNT_SELL_CONFIG`. Rate seeds are
  INACTIVE/UNCONFIGURED and have null numValue.

`PAYMENT_METHOD_INDEX` currently has literal value `'PAYMENT_REQUEST_INDEX'`; preserve this distinction when referring
to stored IDs. General `twoDecimalsNumSch` rounding, decimal deposit amounts, and integer minor-unit settlement
contracts in [lambda](./monorepo.lambda.md) are different contracts.
