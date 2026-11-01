# Dynamo Command Builder API Reference

Package version documented: `0.2.2`.

## Installation

```bash
pnpm add dynamo-command-builder @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

## `buildGetCommandInput`

```ts
type CustomGetCommandInput = {
  tableName: string;
  key: Record<string, unknown>;
  projectionExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  consistentRead?: boolean;
  returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
};
```

```ts
const input = buildGetCommandInput({
  tableName: 'Users',
  key: { pk: 'USER#123', sk: 'PROFILE' },
  projectionExpression: 'pk, sk, name, status',
  consistentRead: true,
});

const result = await documentClient.send(new GetCommand(input));
```

## `buildPutCommandInput`

```ts
type CustomPutCommandInput = {
  tableName: string;
  item: Record<string, unknown>;
  conditionExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, unknown>;
  returnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
  returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  returnItemCollectionMetrics?: 'SIZE' | 'NONE';
};
```

```ts
const input = buildPutCommandInput({
  tableName: 'Users',
  item,
  conditionExpression: 'attribute_not_exists(#pk)',
  expressionAttributeNames: {
    '#pk': 'pk',
  },
  returnValues: 'NONE',
});

await documentClient.send(new PutCommand(input));
```

## `buildQueryCommandInput`

```ts
type CustomQueryCommandInput = {
  tableName: string;
  queryRequest: DynamoQueryRequest;
  keyConditionExpression?: string;
  filterExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, unknown>;
  extraExpAttributeNames?: Record<string, string>;
  extraExpAttributeValues?: Record<string, unknown>;
  projectionExpression?: string;
  scanIndexForward?: boolean;
  returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
};
```

```ts
type DynamoQueryRequest = {
  pKey: string;
  pKeyType: 'S' | 'N' | 'B';
  pKeyProp: string;

  sKey?: string;
  sKeyType?: 'S' | 'N' | 'B';
  sKeyProp?: string;
  skValue2?: string;
  skComparator?: '=' | '<' | '<=' | '>' | '>=' | 'BETWEEN' | 'BEGINS_WITH';

  indexName?: string;
  limit?: number;
  lastEvaluatedKey?: Record<string, unknown>;
  sorting?: 'ASC' | 'DESC';
};
```

Validation:

- `pKey`, `pKeyType`, and `pKeyProp` are required.
- `limit` is coerced to a positive integer by the query request schema.
- `lastEvaluatedKey` may be an object or stringified JSON object during parsing.
- `BETWEEN` requires `skValue2`.
- `skValue2` is rejected for non-`BETWEEN` comparators.
- sort-key fields require `skComparator`.

## `buildScanCommandInput`

```ts
type CustomScanCommandInput = {
  tableName: string;
  indexName?: string;
  filtersAttributes?: DynamoFilter[];
  filterExpression?: string;
  projectionExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, unknown>;
  extraExpAttributeNames?: Record<string, string>;
  extraExpAttributeValues?: Record<string, unknown>;
  limit?: number;
  exclusiveStartKey?: Record<string, unknown>;
  consistentRead?: boolean;
  segment?: number;
  totalSegments?: number;
  returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  returnItemCollectionMetrics?: 'SIZE' | 'NONE';
};
```

```ts
const input = buildScanCommandInput({
  tableName: 'Products',
  filterExpression: '#price BETWEEN :min AND :max',
  expressionAttributeNames: {
    '#price': 'price',
  },
  expressionAttributeValues: {
    ':min': 10,
    ':max': 100,
  },
  limit: 100,
});

const result = await documentClient.send(new ScanCommand(input));
```

## `buildUpdateCommandInput`

```ts
type CustomUpdateCommandInput = {
  tableName: string;
  key: Record<string, unknown>;
  item?: Record<string, unknown>;
  updateExpression?: string;
  conditionExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, unknown>;
  extraExpAttributeNames?: Record<string, string>;
  extraExpAttributeValues?: Record<string, unknown>;
  returnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
  returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  returnItemCollectionMetrics?: 'SIZE' | 'NONE';
};
```

At least one of these is required:

- a non-empty `item`
- `updateExpression`

Generated `item` updates create a `SET` expression. Explicit expressions require manual aliases.

## `extractQueryReqFromParams`

Normalizes HTTP query strings against a default `DynamoQueryRequest`.

Supported behavior includes:

- `index` or `indexName` normalization
- positive integer `limit` coercion
- object or JSON-string `lastEvaluatedKey`
- sort-key comparator validation

```ts
const queryRequest = extractQueryReqFromParams(event.queryStringParameters, {
  indexName: 'status-createdAt-index',
  pKey: 'ACTIVE',
  pKeyType: 'S',
  pKeyProp: 'status',
  limit: 20,
});
```

## `generateDynamoFilterAttributes`

```ts
type DynamoFilter = {
  name: string;
  type: 'S' | 'N' | 'BOOL' | 'NULL' | 'SS' | 'NS';
  condition:
    | 'EQUAL_TO'
    | 'NOT_EQUAL_TO'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL_TO'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL_TO'
    | 'EXISTS'
    | 'NOT_EXISTS'
    | 'BEGINS_WITH'
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'BETWEEN';
  value?: string;
  value2?: string;
  values?: string[];
};
```

Validation:

- `BETWEEN` requires `value` and `value2`.
- `EXISTS` and `NOT_EXISTS` forbid value fields.
- `SS` and `NS` require a non-empty `values` array.
- ordinary comparisons require `value`.
- a maximum of 50 filters is accepted.

Output:

```ts
{
  filterExpression: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues: Record<string, unknown>;
}
```

Generated filters are joined with `AND`.

## Complete Lambda query example

```ts
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { buildQueryCommandInput, extractQueryReqFromParams, QueryParseError } from 'dynamo-command-builder';

export async function handler(event: { queryStringParameters: Record<string, string> | null }) {
  try {
    const queryRequest = extractQueryReqFromParams(event.queryStringParameters, {
      indexName: 'status-createdAt-index',
      pKey: 'ACTIVE',
      pKeyType: 'S',
      pKeyProp: 'status',
      limit: 20,
    });

    const result = await documentClient.send(
      new QueryCommand(
        buildQueryCommandInput({
          tableName: process.env.TABLE_NAME!,
          queryRequest,
        }),
      ),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items ?? [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    if (error instanceof QueryParseError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          message: error.message,
        }),
      };
    }

    throw error;
  }
}
```
