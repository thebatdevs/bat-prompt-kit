---
name: dynamo-command-builder
description:
  Use when implementing, reviewing, refactoring, or debugging AWS SDK v3 DynamoDB DocumentClient Get, Put, Query, Scan,
  or Update operations in a project that uses the dynamo-command-builder package.
---

# Dynamo Command Builder

Use `dynamo-command-builder` to create validated inputs for AWS SDK v3 commands from `@aws-sdk/lib-dynamodb`.

## When to use

Apply this skill when code:

- imports `dynamo-command-builder`
- uses `GetCommand`, `PutCommand`, `QueryCommand`, `ScanCommand`, or `UpdateCommand`
- builds DynamoDB key conditions, filters, projections, updates, or pagination
- parses HTTP query parameters into a DynamoDB query
- should replace manually constructed DocumentClient command inputs

Do not use this skill for:

- low-level `@aws-sdk/client-dynamodb` commands using `AttributeValue`
- batch or transaction operations not supported by this package
- table creation, indexes, streams, backups, or infrastructure
- business validation or authorization

## Imports

```ts
import {
  buildGetCommandInput,
  buildPutCommandInput,
  buildQueryCommandInput,
  buildScanCommandInput,
  buildUpdateCommandInput,
  extractQueryReqFromParams,
  generateDynamoFilterAttributes,
  QueryParseError,
} from 'dynamo-command-builder';
```

## Builder mapping

Always pair each builder with the matching SDK command:

| Builder                   | AWS command     |
| ------------------------- | --------------- |
| `buildGetCommandInput`    | `GetCommand`    |
| `buildPutCommandInput`    | `PutCommand`    |
| `buildQueryCommandInput`  | `QueryCommand`  |
| `buildScanCommandInput`   | `ScanCommand`   |
| `buildUpdateCommandInput` | `UpdateCommand` |

Example:

```ts
const result = await documentClient.send(
  new QueryCommand(
    buildQueryCommandInput({
      tableName,
      queryRequest,
    }),
  ),
);
```

## Required decisions

1. Prefer `Query` over `Scan` when a partition-key access pattern exists.
2. Keep table names, index selection, authorization, and business logic outside builders.
3. Use `extractQueryReqFromParams` at HTTP boundaries when query parameters control a DynamoDB query.
4. Pass pagination keys without changing their DynamoDB attributes.
5. Catch `QueryParseError` for invalid request input; rethrow unrelated errors.
6. Never invent builder properties that are not documented here or in `references/api.md`.

## Query rules

A query requires:

```ts
{
  pKey: string;
  pKeyType: 'S' | 'N' | 'B';
  pKeyProp: string;
}
```

Sort-key conditions require all relevant fields:

```ts
{
  sKey: string;
  sKeyType: 'S' | 'N' | 'B';
  sKeyProp: string;
  skComparator: '=' | '<' | '<=' | '>' | '>=' | 'BETWEEN' | 'BEGINS_WITH';
  skValue2?: string;
}
```

Rules:

- `BETWEEN` requires `skValue2`.
- Other comparators must not include `skValue2`.
- Any sort-key field requires `skComparator`.
- Use `sorting: 'ASC' | 'DESC'`.
- Use `lastEvaluatedKey` for pagination.
- Key conditions are generated from `queryRequest`.

Example:

```ts
const input = buildQueryCommandInput({
  tableName: 'Orders',
  queryRequest: {
    indexName: 'customerId-createdAt-index',
    pKey: customerId,
    pKeyType: 'S',
    pKeyProp: 'customerId',
    sKey: from,
    sKeyType: 'S',
    sKeyProp: 'createdAt',
    skComparator: 'BETWEEN',
    skValue2: to,
    sorting: 'DESC',
    limit: 25,
    lastEvaluatedKey,
  },
});
```

## Update rules

Choose one update strategy.

### Generated `SET` expression

Use `item` for normal field replacement:

```ts
const input = buildUpdateCommandInput({
  tableName,
  key: { pk, sk },
  item: {
    status: 'COMPLETED',
    updatedAt: new Date().toISOString(),
  },
  returnValues: 'ALL_NEW',
});
```

The package generates the `SET` expression and aliases reserved attribute names.

### Explicit expression

Use `updateExpression` for increments, list operations, removals, or functions:

```ts
const input = buildUpdateCommandInput({
  tableName,
  key: { id: 'daily' },
  updateExpression: 'SET #count = if_not_exists(#count, :zero) + :inc',
  expressionAttributeNames: {
    '#count': 'count',
  },
  expressionAttributeValues: {
    ':zero': 0,
    ':inc': 1,
  },
  returnValues: 'UPDATED_NEW',
});
```

When using an explicit expression, provide all aliases and values manually.

Do not provide both `item` and `updateExpression`.

## Expression rules

For manual expressions:

- alias reserved or uncertain attribute names
- provide every referenced name placeholder
- provide every referenced value placeholder
- use `extraExpAttributeNames` and `extraExpAttributeValues` when adding values to generated query/update expressions
- do not reuse placeholders for unrelated values

Example query filter:

```ts
const input = buildQueryCommandInput({
  tableName,
  queryRequest,
  filterExpression: '#status = :status',
  extraExpAttributeNames: {
    '#status': 'status',
  },
  extraExpAttributeValues: {
    ':status': 'ACTIVE',
  },
});
```

## Filter DSL

Use `generateDynamoFilterAttributes` for simple filters combined with `AND`.

```ts
const generated = generateDynamoFilterAttributes([
  {
    name: 'age',
    type: 'N',
    condition: 'GREATER_THAN_OR_EQUAL_TO',
    value: '18',
  },
  {
    name: 'title',
    type: 'S',
    condition: 'CONTAINS',
    value: 'engineer',
  },
]);
```

Use manual expressions for:

- `OR`
- grouped mixed `AND`/`OR`
- complex nested logic
- unsupported DynamoDB expressions

## Pagination

Input:

```ts
queryRequest: {
  ...queryRequest,
  lastEvaluatedKey: cursor,
}
```

Output:

```ts
{
  items: result.Items ?? [],
  lastEvaluatedKey: result.LastEvaluatedKey,
}
```

Do not modify the key structure. Application-level serialization such as base64 is acceptable only when explicitly
implemented outside this package.

## Error handling

```ts
try {
  const queryRequest = extractQueryReqFromParams(event.queryStringParameters, defaults);

  const input = buildQueryCommandInput({
    tableName,
    queryRequest,
  });

  return await documentClient.send(new QueryCommand(input));
} catch (error) {
  if (error instanceof QueryParseError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ message: error.message }),
    };
  }

  throw error;
}
```

## Scan restrictions

- Use `Scan` only when the access pattern cannot be expressed as a table or index query.
- Prefer a manual `filterExpression` in the current package version.
- `segment` and `totalSegments` must be supplied together.
- `segment` must be from `0` through `totalSegments - 1`.
- Do not use `consistentRead: true` when scanning a GSI.

## Known limitations

- `filtersAttributes` on scans should be treated as experimental.
- Explicit update expressions do not receive automatic reserved-word aliases.
- Query key conditions come from `queryRequest`; do not rely on custom `keyConditionExpression` overriding them.
- The package does not replace domain validation, authorization, or DynamoDB access-pattern design.
- Filters do not reduce items read before filtering and do not make scans efficient.

## Completion checklist

Before finishing DynamoDB code, verify:

- builder and SDK command match
- Query is used instead of Scan where possible
- table and index names are correct
- sort-key comparator fields are complete
- `BETWEEN` includes `skValue2`
- pagination key remains structurally unchanged
- reserved names are aliased
- update uses one strategy
- GSI reads do not request unsupported consistency
- `QueryParseError` is separated from AWS and application errors

Read `references/api.md` only when exact input fields, filter conditions, or extended examples are needed.
