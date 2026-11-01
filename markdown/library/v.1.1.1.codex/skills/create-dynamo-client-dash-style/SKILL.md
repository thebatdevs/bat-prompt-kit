---
name: create-dynamo-client-dash-style
description:
  Use when Codex needs to add or recreate a Dash-style TypeScript DynamoDB helper module named dynamo-client.ts using
  @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb, and dynamo-command-builder. Apply when the user asks to create a
  DynamoDB client, Dynamo client wrapper, dynamo-client.ts, or shared DynamoDB CRUD/query helper in a TypeScript
  repository or package, including monorepos.
---

# Create Dynamo Client Dash Style

Create a `dynamo-client.ts` file in the appropriate TypeScript package after confirming the project shape and required
dependencies.

## Workflow

1. Inspect the repository root:
   - Use
     `rg --files -g 'package.json' -g 'tsconfig*.json' -g 'pnpm-workspace.yaml' -g 'lerna.json' -g 'nx.json' -g 'turbo.json' -g 'rush.json'`.
   - Treat the repo as a monorepo when it has workspace config (`workspaces`, `pnpm-workspace.yaml`, `lerna.json`,
     `nx.json`, `turbo.json`, `rush.json`) or multiple package-level `package.json` files under common folders such as
     `apps/`, `packages/`, `services/`, or `libs/`.
   - If there is one obvious TypeScript package, use it. If multiple packages could own the Dynamo client and the user
     did not specify one, choose the package that already contains AWS, DynamoDB, database, repository, or service-layer
     code. Ask only when ownership is genuinely ambiguous.

2. Confirm TypeScript and dependency state in the target package:
   - Verify `typescript` is available through the package or root toolchain when the project is TypeScript.
   - Verify these runtime dependencies are installed in the target package or inherited workspace root:
     - `@aws-sdk/client-dynamodb`
     - `@aws-sdk/lib-dynamodb`
     - `dynamo-command-builder`
   - Check `package.json` files directly. Use the repo package manager if installation is needed:
     - `pnpm add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb dynamo-command-builder --filter <package>` for pnpm
       workspaces.
     - `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb dynamo-command-builder -w <workspace>` for npm
       workspaces.
     - `yarn workspace <package> add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb dynamo-command-builder` for Yarn
       workspaces.
     - Use the package directory without workspace flags for a non-monorepo.
   - Do not edit dependency manifests by hand unless the repo already manages dependencies that way or install commands
     are unavailable.

3. Choose the destination:
   - Prefer an existing shared utility or infrastructure folder in the target package, such as `src/lib/`, `src/libs/`,
     `src/utils/`, `src/infrastructure/`, `src/aws/`, or `src/clients/`.
   - If no convention exists, create `src/lib/dynamo-client.ts` in the target package.
   - Preserve existing path aliases and export-barrel patterns if present. Add a barrel export only when the package
     already uses one for similar modules.

4. Create or update `dynamo-client.ts` with the Dash-style implementation below. Preserve local formatter conventions,
   but do not alter behavior without a clear project-specific reason.

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

## Validation

- Run the target package's existing typecheck, lint, or focused test command when available.
- If no script exists, run the smallest viable TypeScript validation, such as `npx tsc --noEmit` from the target package
  or workspace command equivalent.
- Report the created file path, dependency action taken, and validation result.
