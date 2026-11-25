import { beforeEach, expect, it, vi } from 'vite-plus/test';
import { createExampleItem, getExampleItemById, updateExampleItemDirectly } from '@/repository/example-repository';
import * as dynamo from '@/repository/dynamo-client';
import { exampleItemSch } from '@/types';

vi.mock('@/repository/dynamo-client', () => ({
  createRecordOnDynamo: vi.fn(),
  getRecordFromDynamo: vi.fn(),
  getTableDescFromDynamo: vi.fn(),
  queryRecordFromDynamo: vi.fn(),
  updateRecordOnDynamo: vi.fn(),
}));

const item = exampleItemSch.parse({ id: 'one', name: 'Example', description: 'A test item' });
beforeEach(() => vi.clearAllMocks());

it('uses the configured table and protects creates against duplicate IDs', async () => {
  expect(await createExampleItem(item)).toEqual(item);
  expect(dynamo.createRecordOnDynamo).toHaveBeenCalledWith({
    tableName: 'bat-peasant-test-example-table',
    item,
    conditionExpression: 'attribute_not_exists(id)',
  });
});

it('validates items before writing to DynamoDB', async () => {
  await expect(createExampleItem({ ...item, name: '' })).rejects.toThrow();
  expect(dynamo.createRecordOnDynamo).not.toHaveBeenCalled();
});

it('returns undefined when DynamoDB does not contain the item', async () => {
  vi.mocked(dynamo.getRecordFromDynamo).mockResolvedValue({ $metadata: {} });
  expect(await getExampleItemById('missing')).toBeUndefined();
  expect(dynamo.getRecordFromDynamo).toHaveBeenCalledWith({
    tableName: 'bat-peasant-test-example-table',
    key: { id: 'missing' },
    projectionExpression: undefined,
  });
});

it('updates mutable attributes and returns the stored item', async () => {
  vi.mocked(dynamo.updateRecordOnDynamo).mockResolvedValue({ Attributes: { ...item, name: 'Updated' }, $metadata: {} });
  expect(await updateExampleItemDirectly({ id: item.id, name: 'Updated' }, 'attribute_exists(id)')).toEqual({
    ...item,
    name: 'Updated',
  });
  expect(dynamo.updateRecordOnDynamo).toHaveBeenCalledWith({
    tableName: 'bat-peasant-test-example-table',
    key: { id: item.id },
    item: { name: 'Updated' },
    conditionExpression: 'attribute_exists(id)',
    extraExpAttributeValues: undefined,
    returnValues: 'ALL_NEW',
  });
});
