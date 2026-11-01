# Dynamo Client

```ts
import { DescribeTableCommand, DescribeTableCommandOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  buildGetCommandInput,
  buildPutCommandInput,
  buildQueryCommandInput,
  buildUpdateCommandInput,
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomUpdateCommandInput,
} from 'dynamo-command-builder';

const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
});

const docClient = DynamoDBDocumentClient.from(dynamoDb);

/**
 * Retrieves the description and metadata of a DynamoDB table.
 */
export async function getTableDescFromDynamo(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await docClient.send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error) {
    console.error(`Failed to retrieve table description for ${tableName}, error ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Retrieves a single record from DynamoDB using the Document Client.
 */
export async function getRecordFromDynamo(input: CustomGetCommandInput): Promise<GetCommandOutput> {
  try {
    const buildCommand = buildGetCommandInput(input);
    return await docClient.send(new GetCommand(buildCommand));
  } catch (error: unknown) {
    console.error(`Error retrieving record from table ${input.tableName}, DynamoDB: ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Queries records from DynamoDB based on partition key and optional sort key conditions.
 */
export async function queryRecordFromDynamo(input: CustomQueryCommandInput): Promise<QueryCommandOutput> {
  try {
    const buildCommand = buildQueryCommandInput(input);
    return await docClient.send(new QueryCommand(buildCommand));
  } catch (error: unknown) {
    console.error(`Error querying records from table ${input.tableName}, DynamoDB: ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Creates a new record in DynamoDB using the PutCommand.
 */
export async function createRecordOnDynamo(input: CustomPutCommandInput): Promise<PutCommandOutput> {
  try {
    const buildCommand = buildPutCommandInput(input);
    return await docClient.send(new PutCommand(buildCommand));
  } catch (error: unknown) {
    console.error(`Error creating record in table ${input.tableName}, DynamoDB: ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Updates an existing record in DynamoDB using UpdateCommand.
 */
export async function updateRecordOnDynamo(input: CustomUpdateCommandInput) {
  try {
    const updateCommand = buildUpdateCommandInput(input);
    return await docClient.send(new UpdateCommand(updateCommand));
  } catch (error: unknown) {
    console.error(`Error updating record in table ${input.tableName}, DynamoDB: ${JSON.stringify(error)}`);
    throw error;
  }
}
```
