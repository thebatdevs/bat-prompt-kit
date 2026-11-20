# Monorepo package `sqs`

- **Import:** `@motforex-monorepo-packages/aws-sqs`
- **Version:** 1.0.0
- **Source:**
  [packages/sqs](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/sqs)
- **Entry:** `src/index.ts` re-exports `src/sqs-client.ts`.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

## Functions

| Function           | Input                                                                                                | Output             | Behavior                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `sendSqsMessage`   | `qUrl: string`, `payload: unknown`, `opts?: { groupId?: string; dedupId?: string }`                  | `Promise<void>`    | JSON-serializes one payload and sends it; logs and throws on failure.                                                   |
| `sendSqsMessages`  | `qUrl: string`, `items: Array<{ id: string; payload: unknown; groupId?: string; dedupId?: string }>` | `Promise<void>`    | Sends sequential chunks of up to 10 entries; throws if any batch reports failed entries. Empty input performs no sends. |
| `deleteSqsMessage` | `qUrl: string`, `receiptHandle: string`                                                              | `Promise<boolean>` | Deletes using the receipt handle; returns true only for HTTP 200. Logs errors and returns false.                        |

## Reuse details

- The private SQS client is lazy and cached, using `getAwsRegion()` from `libs` (`AWS_REGION` or `ap-southeast-1`). It
  is not exported.
- Both send helpers always set `MessageGroupId`, defaulting to `'default'`; `dedupId` becomes `MessageDeduplicationId`.
  Select settings that match the queue configuration. A shared default group serializes FIFO processing.
- Batch partial failure can occur after other entries have succeeded. The helper throws combined failure text and does
  not return successful/failed entry lists or retry failed entries.
- No receive or queue-creation helper is offered here. CloudFormation FIFO/DLQ builders live in
  [serverless-config](./monorepo.serverless-config.md).
