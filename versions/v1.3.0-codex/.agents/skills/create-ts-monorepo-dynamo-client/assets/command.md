# command.ts

Generate `command.ts` from the TypeScript code block below.

```typescript
import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import type {
  BatchGetCommandOutput,
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  TransactWriteCommandOutput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
  CustomBatchGetCmdInput,
  CustomDeleteCmdInput,
  CustomGetCmdInput,
  CustomPutCmdInput,
  CustomQueryCmdInput,
  CustomScanCmdInput,
  CustomTransactWriteCmdInput,
  CustomUpdateCmdInput,
  GenericRecord,
} from 'dynamo-craft';
import {
  buildValidatedBatchGetCommand,
  buildValidatedDeleteCommandInput,
  buildValidatedGetCommand,
  buildValidatedPutCommand,
  buildValidatedQueryCommand,
  buildValidatedScanCommand,
  buildValidatedTransactWriteCommand,
  buildValidatedUpdateCommand,
} from 'dynamo-craft';
import { getDocumentClient } from './client';

// Keep AWS error identity and metadata available to callers without logging item data.
function rethrow(operation: string, tableName: string | undefined, error: unknown): never {
  console.error('DynamoDB command failed', { operation, tableName });
  throw error;
}

export async function getTableDescFromDynamo(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await getDocumentClient().send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error: unknown) {
    return rethrow('DescribeTable', tableName, error);
  }
}

export async function getRecordFromDynamoByKey(input: CustomGetCmdInput): Promise<GetCommandOutput> {
  const commandInput = buildValidatedGetCommand(input);
  try {
    return await getDocumentClient().send(new GetCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('GetItem', input.tableName, error);
  }
}

// Return unprocessed keys to the caller; this wrapper does not retry batches.
export async function getBatchRecordsFromDynamo(input: CustomBatchGetCmdInput): Promise<BatchGetCommandOutput> {
  const commandInput = buildValidatedBatchGetCommand(input);
  try {
    return await getDocumentClient().send(new BatchGetCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('BatchGetItem', input.tables.map((table) => table.tableName).join(', '), error);
  }
}

export async function queryRecordFromDynamo(input: CustomQueryCmdInput): Promise<QueryCommandOutput> {
  const commandInput = buildValidatedQueryCommand(input);
  try {
    return await getDocumentClient().send(new QueryCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('Query', input.tableName, error);
  }
}

// Follow every continuation key. A per-request limit does not cap the total result.
export async function queryAllRecordsFromDynamo(input: CustomQueryCmdInput): Promise<GenericRecord[]> {
  const commandInput = buildValidatedQueryCommand(input);
  const items: GenericRecord[] = [];
  let cursor = commandInput.ExclusiveStartKey;

  try {
    do {
      const page = await getDocumentClient().send(new QueryCommand({ ...commandInput, ExclusiveStartKey: cursor }));
      items.push(...(page.Items ?? []));
      cursor = page.LastEvaluatedKey;
    } while (cursor && Object.keys(cursor).length > 0);
  } catch (error: unknown) {
    return rethrow('Query (paginated)', input.tableName, error);
  }

  return items;
}

// Return one page and its continuation key; do not automatically scan the full table.
export async function scanRecordsFromDynamo(input: CustomScanCmdInput): Promise<ScanCommandOutput> {
  const commandInput = buildValidatedScanCommand(input);
  try {
    return await getDocumentClient().send(new ScanCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('Scan', input.tableName, error);
  }
}

export async function createRecordOnDynamo(
  input: CustomPutCmdInput,
  options?: { expectedConditionalFailure?: boolean },
): Promise<PutCommandOutput> {
  const commandInput = buildValidatedPutCommand(input);
  try {
    return await getDocumentClient().send(new PutCommand(commandInput));
  } catch (error: unknown) {
    if (
      options?.expectedConditionalFailure &&
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      throw error;
    }
    return rethrow('PutItem', input.tableName, error);
  }
}

export async function updateRecordOnDynamo(input: CustomUpdateCmdInput): Promise<UpdateCommandOutput> {
  const commandInput = buildValidatedUpdateCommand(input);
  try {
    return await getDocumentClient().send(new UpdateCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('UpdateItem', input.tableName, error);
  }
}

export async function deleteRecordOnDynamo(input: CustomDeleteCmdInput): Promise<DeleteCommandOutput> {
  const commandInput = buildValidatedDeleteCommandInput(input);
  try {
    return await getDocumentClient().send(new DeleteCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('DeleteItem', input.tableName, error);
  }
}

export async function transactWriteOnDynamo(input: CustomTransactWriteCmdInput): Promise<TransactWriteCommandOutput> {
  const commandInput = buildValidatedTransactWriteCommand(input);
  try {
    return await getDocumentClient().send(new TransactWriteCommand(commandInput));
  } catch (error: unknown) {
    return rethrow('TransactWrite', undefined, error);
  }
}
```
