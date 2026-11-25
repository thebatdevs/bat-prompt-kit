import { expect, it } from 'vite-plus/test';
import { APIS_EXAMPLE } from '@/functions/api/example';
import config from '../serverless';

it('registers app-relative Lambda handlers and a route ID for updates', () => {
  for (const fn of Object.values(APIS_EXAMPLE)) {
    expect(fn.handler).toMatch(/^src\/functions\/api\/example\/handler\.[a-zA-Z]+$/);
  }
  expect(APIS_EXAMPLE.postCreateExampleItem.events[0]?.http.path).toBe('/v1/example/item');
  expect(APIS_EXAMPLE.putUpdateExampleItem.events[0]?.http.path).toBe('/v1/example/item/{id}');
});

it('declares the table, query index, and a matching runtime table name', () => {
  const table = config.resources?.Resources?.ExampleTable;
  expect(table).toMatchObject({
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: config.provider.environment?.EXAMPLE_TABLE_NAME,
      GlobalSecondaryIndexes: [
        {
          IndexName: 'status-createdAt-index',
          KeySchema: [
            { AttributeName: 'status', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' },
          ],
        },
      ],
    },
  });
});
