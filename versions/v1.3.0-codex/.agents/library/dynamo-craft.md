# `dynamo-craft` description

- **Version:** 0.1.3
- **Description:** Type-safe command builders for the AWS SDK for JavaScript v3 DynamoDB DocumentClient.
- **License:** MIT
- **Author:** theDashpuntsag
- **Repository:** [https://github.com/thedashpuntsag/dynamo-craft](https://github.com/thedashpuntsag/dynamo-craft)
- **Homepage:**
  [https://github.com/thedashpuntsag/dynamo-craft#readme](https://github.com/thedashpuntsag/dynamo-craft#readme)

## What this package offers

`dynamo-craft` validates custom DynamoDB inputs with Zod and converts them into AWS SDK v3 DocumentClient command
inputs. It supports item reads and writes, queries, scans, batch operations, transactions, structured conditions, and
structured updates. Builders return input objects; callers create and send the AWS commands with their own client.

Command builders preserve native JavaScript values for items, keys, and expression values. The output types below come
from `@aws-sdk/lib-dynamodb`. Invalid builder inputs throw validation errors.

## Command builders

| Function name                          | Input                                              | Output                      | Description                                                                                                      |
| -------------------------------------- | -------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `buildValidatedGetCommand`             | `CustomGetCmdInput`                                | `GetCommandInput`           | Builds a single-item read with optional consistency and projection settings.                                     |
| `buildValidatedPutCommand`             | `CustomPutCmdInput`                                | `PutCommandInput`           | Builds an item create or replacement request with optional write conditions and return settings.                 |
| `buildValidatedUpdateCommand`          | `CustomUpdateCmdInput`                             | `UpdateCommandInput`        | Builds an update from structured operations or an update expression, with optional conditions.                   |
| `buildValidatedDeleteCommandInput`     | `unknown`, validated as `CustomDeleteCmdInput`     | `DeleteCommandInput`        | Builds a delete by primary key with optional conditions and return settings.                                     |
| `buildValidatedQueryCommand`           | `CustomQueryCmdInput`                              | `QueryCommandInput`         | Builds key conditions, sort conditions, filters, projections, and pagination options for a table or index query. |
| `buildValidatedScanCommand`            | `CustomScanCmdInput`                               | `ScanCommandInput`          | Builds a table or index scan with filters, projection, pagination, and parallel scan settings.                   |
| `buildValidatedBatchGetCommand`        | `CustomBatchGetCmdInput`                           | `BatchGetCommandInput`      | Builds reads for multiple item keys across tables and validates batch limits and duplicate keys.                 |
| `buildValidatedBatchWriteCommandInput` | `unknown`, validated as `CustomBatchWriteCmdInput` | `BatchWriteCommandInput`    | Builds batched puts and deletes, derives keys from table key schemas, and rejects duplicate item targets.        |
| `buildValidatedTransactGetCommand`     | `CustomTransactGetCmdInput`                        | `TransactGetCommandInput`   | Builds a transactional read of multiple items with per-item projection options.                                  |
| `buildValidatedTransactWriteCommand`   | `CustomTransactWriteCmdInput`                      | `TransactWriteCommandInput` | Builds a transaction containing puts, updates, deletes, and condition checks.                                    |
| `buildQueryCommandInput`               | `CustomQueryCmdInput`                              | `QueryCommandInput`         | Compatibility alias for `buildValidatedQueryCommand`.                                                            |

## Query request conversion

| Function name                                     | Input                                                            | Output                                                         | Description                                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getCustomQueryInputFromApiGatewayEvent`          | `ApiGatewayQueryEvent`, `defaultInput: CustomQueryCmdInput`      | `CustomQueryCmdInput`                                          | Converts API Gateway query parameters into full query input. Validates and returns the default when parameters are missing, empty, or contain only `undefined` values.                                 |
| `getCustomQueryInputFromApiGatewayEvent`          | `ApiGatewayQueryEvent`, `defaultInput: CustomBriefQueryCmdInput` | `CustomBriefQueryCmdInput`                                     | Converts event parameters into query input without `tableName`. The default selects brief mode, and the caller supplies the table separately.                                                          |
| `convertDynamoReadQueryRequest`                   | `unknown`: raw or parsed query parameters                        | `CustomQueryCmdInput` or `CustomBriefQueryCmdInput` at runtime | Decodes typed keys and filter values, generates filter expressions, and copies query options. Includes `tableName` when the request has `table`; otherwise returns brief input. Rejects SCAN requests. |
| `convertDynamoReadQueryRequestToCustomQueryInput` | Same as `convertDynamoReadQueryRequest`                          | Same as `convertDynamoReadQueryRequest`                        | Deprecated compatibility alias; prefer `convertDynamoReadQueryRequest`.                                                                                                                                |
| `validateDynamoReadQueryRequest`                  | `DynamoReadQueryRequest`, `DynamoTargetMetadata`                 | `DynamoReadQueryRequest`                                       | Validates query keys, their order and types, and index restrictions against caller-provided table/index metadata. Returns the validated request; SCAN requests pass through.                           |

`CustomBriefQueryCmdInput` contains query options without a table name. Add `tableName` before passing it to
`buildValidatedQueryCommand`. See [query request examples](./query-request.md).

## Value and expression utilities

| Function name                            | Input                                                     | Output                           | Description                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `decodeDynamoValue`                      | `value: string \| undefined`, `valueType: DynamoAttrType` | `unknown`                        | Decodes a typed DynamoDB value into a native value, including numeric, binary, collection, and null values, with validation.                          |
| `parseTypedJson`                         | JSON text: `string`                                       | `unknown`                        | Parses JSON and rejects numeric literals outside the safe integer range.                                                                              |
| `parseDynamoKeyValue`                    | Encoded value: `string`, type code: `string`              | `unknown`                        | Legacy value conversion for scalar, JSON, and comma-separated collection formats. Uses permissive conversions; set codes return arrays.               |
| `marshall`                               | `Record<string, unknown>`                                 | `Record<string, AttributeValue>` | Converts native attributes into low-level DynamoDB attribute values. Sets become lists (`L`); this differs from DocumentClient's native set handling. |
| `extractExpAttributeNamesFromExpression` | Expression: `string`                                      | `Record<string, string>`         | Infers name mappings from hash-prefixed tokens, such as `#status` to `status`.                                                                        |
| `extractExpAttributeNamesFromUpdateExp`  | Simple SET expression: `string`                           | `Record<string, string>`         | Infers aliases from assignment targets in simple comma-separated SET expressions.                                                                     |
| `replaceReservedKeywordsFromUpdateExp`   | Update expression: `string`                               | `string`                         | Prefixes matching reserved assignment targets with `#`. Does not generate alias mappings.                                                             |
| `replaceReservedKeywordsFromProjection`  | Projection expression: `string`                           | `string`                         | Prefixes matching reserved projection names with `#`. Does not generate alias mappings.                                                               |
| `omit`                                   | Object: `T`, excluded keys: `K[]`                         | `Omit<T, K>`                     | Returns a shallow copy without the specified own enumerable string properties.                                                                        |

## Schema validation helpers

These exported helpers support custom Zod validation. They record issues through the supplied refinement context and
return `void`.

| Function name                    | Input                                                            | Output | Description                                                                   |
| -------------------------------- | ---------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `validatePositions`              | `Array<{ position: number }>`, path: `string`, `z.RefinementCtx` | `void` | Checks that positions are consecutive and start at one.                       |
| `validateParallelScanParams`     | `DynamoScanRequest`, `z.RefinementCtx`                           | `void` | Checks paired segment settings and valid segment bounds for a parallel scan.  |
| `validateQueryKeyPositions`      | `DynamoQueryRequest`, `z.RefinementCtx`                          | `void` | Checks partition-key and sort-key positions.                                  |
| `validateQuerySortKeyConditions` | `DynamoQueryRequest`, `z.RefinementCtx`                          | `void` | Requires an inequality sort condition to be the last supplied sort condition. |
| `validateQueryFilterKeyUsage`    | `DynamoQueryRequest`, `z.RefinementCtx`                          | `void` | Rejects filters on attributes already used in query key conditions.           |

The package also exports TypeScript input types, Zod schemas such as `customQueryCmdInputSch` and
`customBriefQueryCmdInputSch`, structured condition and update types, and `RESERVED_KEYWORDS_SET`.
