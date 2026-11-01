---
name: create-dynamo-repository-dash-style
description:
  Use when Codex needs to create or adapt a Dash-style TypeScript DynamoDB repository module for a user-provided item
  type. Apply when the user asks for a DynamoDB repository, repository wrapper, CRUD/query repository, or a repository
  file based on ExampleItem-style code using dynamo-client.ts, dynamo-command-builder, getRequiredEnvVar, and schema
  parsing.
---

# Create Dynamo Repository Dash Style

Create a TypeScript DynamoDB repository file by adapting the Dash-style `ExampleItem` repository pattern to the item
type and schema the user provides.

## Workflow

1. Inspect the target project:
   - Use
     `rg --files -g 'package.json' -g 'tsconfig*.json' -g 'pnpm-workspace.yaml' -g 'lerna.json' -g 'nx.json' -g 'turbo.json' -g 'rush.json'`.
   - Treat the repo as a monorepo when workspace config exists or when multiple package-level `package.json` files live
     under folders such as `apps/`, `packages/`, `services/`, or `libs/`.
   - Choose the package that owns the provided type, existing repositories, `dynamo-client.ts`, or service-layer code.
     Ask only when multiple packages are equally plausible.

2. Gather the item type inputs:
   - Require the item type name, for example `ExampleItem`.
   - Prefer an existing type and schema export, for example `ExampleItem` and `exampleItemSch` from `@/types`.
   - If the schema export is not provided, infer `<lowerCamelItemType>Sch`, then verify it exists before using it.
   - Identify the partition key field. Default to `id` only when the provided type or nearby repository conventions
     support it.
   - Choose the table env var. Default to `<SCREAMING_SNAKE_ITEM_TYPE>_TABLE_NAME`, for example
     `EXAMPLE_ITEM_TABLE_NAME`, unless the user provides a different env var or nearby code uses a different convention.

3. Confirm required local dependencies and helpers:
   - Verify the target package can import `DescribeTableCommandOutput` from `@aws-sdk/client-dynamodb`.
   - Verify `getRequiredEnvVar` from `@xmeta-secret/libs`, `DynamoQueryRequest`, and `omit` from
     `dynamo-command-builder` are available.
   - Verify a local `dynamo-client.ts` exists with `createRecordOnDynamo`, `getRecordFromDynamo`,
     `getTableDescFromDynamo`, `queryRecordFromDynamo`, and `updateRecordOnDynamo`.
   - If `dynamo-client.ts` is missing and the user wants it created, use the `create-dynamo-client-dash-style` skill
     first.

4. Choose the repository destination:
   - Prefer an existing repository/data-access folder in the target package, such as `src/repositories/`,
     `src/repository/`, `src/data/`, `src/db/`, `src/lib/`, or the folder containing `dynamo-client.ts`.
   - If the repo already has repository file naming conventions, follow them.
   - If no convention exists, create `src/repositories/<kebab-item-type>-repository.ts`, for example
     `src/repositories/example-item-repository.ts`.
   - Adjust the relative `./dynamo-client` import to the actual path from the repository file.

5. Generate the repository by replacing every `ExampleItem` placeholder from the template:
   - `ExampleItem` -> provided item type, for example `BookItem`.
   - `exampleItemSch` -> provided or verified schema export.
   - `ExampleItems` -> pluralized item type, preserving project naming conventions.
   - `PrtExampleItem` -> `Prt<ItemType>`.
   - `OptPrtExampleItem` -> `OptPrt<ItemType>`.
   - `OptExampleItem` -> `Opt<ItemType>`.
   - `getExampleItem...`, `createExampleItem...`, `updateExampleItem...` -> item-specific function names.
   - `TABLE_NAME` may stay generic inside the file, but its env var must match the selected table variable.
   - Replace key usage `{ id }` and `item.id` if the partition key is not `id`.

## Repository Template

Use this template as the behavior baseline. Adapt names, imports, env var, key fields, destination, and relative paths
to the project.

```ts
import type { ExampleItem } from '@/types';
import { exampleItemSch } from '@/types';
import { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import { getRequiredEnvVar } from '@xmeta-secret/libs';
import { DynamoQueryRequest, omit } from 'dynamo-command-builder';
import {
  createRecordOnDynamo,
  getRecordFromDynamo,
  getTableDescFromDynamo,
  queryRecordFromDynamo,
  updateRecordOnDynamo,
} from './dynamo-client';

export type QueryOutput<T> = {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
};

export type QueriedExampleItems = QueryOutput<PrtExampleItem>;
export type PrtExampleItem = Partial<ExampleItem>;
export type OptPrtExampleItem = Partial<ExampleItem> | undefined;
export type OptExampleItem = ExampleItem | undefined;

type GenericRecord = Record<string, unknown>;

const TABLE_NAME = getRequiredEnvVar('EXAMPLE_TABLE_NAME');

/**
 * Retrieves the description of the ExampleItem table from DynamoDB.
 */
export async function getExampleItemTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescFromDynamo(TABLE_NAME);
}

/**
 * Retrieves an ExampleItem from DynamoDB by its ID.
 */
export async function getExampleItemById(id: string, proj?: string): Promise<OptPrtExampleItem> {
  const params = {
    tableName: TABLE_NAME,
    key: { id },
    projectionExpression: proj,
  };

  const { Item } = await getRecordFromDynamo(params);
  return Item ? (Item as PrtExampleItem) : undefined;
}

/**
 * Retrieves ExampleItems from DynamoDB based on the provided query conditions.
 */
export async function getExampleItemsByQuery(query: DynamoQueryRequest, proj?: string): Promise<QueriedExampleItems> {
  const { Items, LastEvaluatedKey } = await queryRecordFromDynamo({
    tableName: TABLE_NAME,
    queryRequest: query,
    projectionExpression: proj,
  });

  return {
    items: Items ? (Items as PrtExampleItem[]) : [],
    lastEvaluatedKey: LastEvaluatedKey ?? {},
  };
}

/**
 * Creates a new ExampleItem in DynamoDB.
 */
export async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  await createRecordOnDynamo({
    tableName: TABLE_NAME,
    item: newItem,
    conditionExpression: 'attribute_not_exists(id)',
  });

  return exampleItemSch.parse(newItem);
}

/**
 * Updates an existing ExampleItem in DynamoDB directly.
 */
export async function updateExampleItemDirectly(
  item: PrtExampleItem,
  con?: string,
  ext?: GenericRecord,
): Promise<PrtExampleItem> {
  await updateRecordOnDynamo({
    tableName: TABLE_NAME,
    key: { id: item.id },
    item: omit(item, ['id']),
    conditionExpression: con,
    extraExpAttributeValues: ext,
    returnValues: 'NONE',
  });

  return item;
}

/**
 * Updates an existing ExampleItem in DynamoDB using an update expression.
 */
export async function updateExampleItemByExpression(
  id: string,
  updateExp: string,
  con?: string,
  ext?: GenericRecord,
): Promise<PrtExampleItem> {
  const updatedResponse = await updateRecordOnDynamo({
    tableName: TABLE_NAME,
    key: { id },
    updateExpression: updateExp,
    conditionExpression: con,
    extraExpAttributeValues: ext,
    returnValues: 'ALL_NEW',
  });

  return updatedResponse.Attributes ? (updatedResponse.Attributes as PrtExampleItem) : ({} as PrtExampleItem);
}
```

## Validation

- Search the created file for leftover `ExampleItem`, `exampleItemSch`, and `EXAMPLE_TABLE_NAME`; none should remain
  unless the provided type is actually `ExampleItem`.
- Run the target package's typecheck, lint, or focused test command when available.
- If no script exists, run the smallest viable TypeScript validation, such as `npx tsc --noEmit` from the target package
  or equivalent workspace command.
- Report the repository file path, item type mapping, env var used, and validation result.
