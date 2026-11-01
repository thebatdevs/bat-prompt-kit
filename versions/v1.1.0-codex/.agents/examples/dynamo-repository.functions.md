# DynamoDB Repository

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
