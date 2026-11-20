# Monorepo package `dynamodb`

- **Import:** `@motforex-monorepo-packages/aws-dynamodb` (folder name differs from import name).
- **Version:** 1.0.0
- **Source:**
  [packages/dynamodb](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/dynamodb)
- **Entry:** `src/index.ts`; exports client helpers, command helpers, and everything from `dynamo-craft`.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

Use for executing validated DynamoDB DocumentClient operations. `dynamo-craft` builds command inputs; this package sends
them.

## Client functions — `src/client.ts`

| Function            | Input                                         | Output                   | Behavior                                                                        |
| ------------------- | --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `getDocumentClient` | None                                          | `DynamoDBDocumentClient` | Lazily creates and caches the shared document client.                           |
| `setDocumentClient` | `client: DynamoDBDocumentClient \| undefined` | `void`                   | Injects a client; pass `undefined` to reset the cache. Intended as a test hook. |

The client uses `AWS_REGION` or `ap-southeast-1`, optional trimmed `DYNAMODB_ENDPOINT`, and dummy credentials for
recognized local endpoint hosts. Marshalling removes undefined values and converts class instances to maps.
Configuration changes take effect only after resetting the cached client.

## Executing commands — `src/commands.ts`

All functions below are async. Output names refer to AWS SDK v3 types; `Custom*` inputs and `GenericRecord` come from
`dynamo-craft`.

| Function                    | Input                         | Resolved output              | Behavior                                                                   |
| --------------------------- | ----------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `getTableDescFromDynamo`    | `tableName: string`           | `DescribeTableCommandOutput` | Describes a table.                                                         |
| `getRecordFromDynamoByKey`  | `CustomGetCmdInput`           | `GetCommandOutput`           | Reads one item; inspect `Item` for absence.                                |
| `getBatchRecordsFromDynamo` | `CustomBatchGetCmdInput`      | `BatchGetCommandOutput`      | Executes one batch-get request across supplied tables.                     |
| `queryRecordFromDynamo`     | `CustomQueryCmdInput`         | `QueryCommandOutput`         | Executes one query page, including continuation metadata.                  |
| `queryAllRecordsFromDynamo` | `CustomQueryCmdInput`         | `GenericRecord[]`            | Follows `LastEvaluatedKey` until exhausted and aggregates `Items`.         |
| `scanRecordsFromDynamo`     | `CustomScanCmdInput`          | `ScanCommandOutput`          | Executes one scan page; no automatic pagination.                           |
| `createRecordOnDynamo`      | `CustomPutCmdInput`           | `PutCommandOutput`           | Executes a put; create-only behavior requires a caller-supplied condition. |
| `updateRecordOnDynamo`      | `CustomUpdateCmdInput`        | `UpdateCommandOutput`        | Executes a validated update.                                               |
| `deleteRecordOnDynamo`      | `CustomDeleteCmdInput`        | `DeleteCommandOutput`        | Executes a delete.                                                         |
| `transactWriteOnDynamo`     | `CustomTransactWriteCmdInput` | `TransactWriteCommandOutput` | Executes an atomic transaction of structured write operations.             |

## Repository option types

`DynamoGetOptions`, `DynamoQueryOptions`, `DynamoScanOptions`, `DynamoPutOptions`, `DynamoUpdateOptions`, and
`DynamoDeleteOptions` omit `tableName` from their corresponding custom inputs so repositories can own the table binding.

`DynamoBatchGetTableOptions` omits one batch table's name; `DynamoBatchGetOptions` omits the `tables` collection.
`DynamoTransactWriteItemOptions` omits each operation's table name while preserving its discriminated fields;
`DynamoTransactWriteOptions` omits `transactItems`.

## Dependency re-exports

The root also exports the installed `dynamo-craft` 0.1.3 API: validated command builders, request conversion,
value/expression utilities, validation helpers, schemas, and types. See [dynamo-craft reference](./dynamo-craft.md) for
that function list. These builders return command inputs and perform no database calls.

## Reuse details

- Command failures caught by these wrappers go through `libs.rethrow`, producing `DynamoCommandError` with operation,
  table, original cause, and original AWS error name. Validation occurs outside the catch for several helpers and can
  propagate directly.
- Batch-get returns `UnprocessedKeys` to the caller; the wrapper does not retry them. There is no locally implemented
  batch-write or transactional-read executor; use the re-exported builders with an appropriate client command when
  needed.
- `queryAllRecordsFromDynamo` can read an entire result set into memory. Use the single-page helper for bounded API
  collections.
