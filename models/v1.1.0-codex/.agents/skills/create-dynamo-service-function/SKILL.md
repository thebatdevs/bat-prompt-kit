---
name: create-dynamo-service-function
description: Use when Codes needs to create a dynamo service functions
---

***

name: dynamo-service-functions description: Creates standardized DynamoDB service functions for a Bat-Peasant TypeScript
project.

---

# Dynamo Service Functions

Create the service layer for a DynamoDB entity using existing repository functions.

This skill follows the Bat-Peasant project structure and coding standards.

## Activation

Use this skill when the task requests DynamoDB service functions for an entity.

Example requests:

```text
Create Dynamo service functions for User.
Create the service layer for DepositRequest.
Generate Dynamo CRUD service files for transaction-history.
```

## Required Input

Determine the following values from the task and repository:

| Placeholder        | Meaning                | Example            |
| ------------------ | ---------------------- | ------------------ |
| `{{Entity}}`       | PascalCase entity name | `WithdrawRequest`  |
| `{{entity}}`       | camelCase entity name  | `withdrawRequest`  |
| `{{Entities}}`     | PascalCase plural name | `WithdrawRequests` |
| `{{entities}}`     | camelCase plural name  | `withdrawRequests` |
| `{{entity-kebab}}` | kebab-case entity name | `withdraw-request` |

Use the exact entity, schema, type, and repository export names already defined in the project.

Do not invent alternative names when matching exports already exist.

## Required Output Structure

Create exactly three service files:

```text
service/
└── {{entity-kebab}}/
    ├── {{entity-kebab}}-get.ts
    ├── {{entity-kebab}}-update.ts
    └── {{entity-kebab}}-create.ts
```

Example:

```text
service/
└── withdraw-request/
    ├── withdraw-request-get.ts
    ├── withdraw-request-update.ts
    └── withdraw-request-create.ts
```

Do not combine get, update, and create functions into one file.

## General Rules

- Service functions may call repository functions.
- Service functions must not access DynamoDB directly.
- Alias repository functions using the `Repo` suffix.
- Every exported service function must use `try/catch`.
- Catch errors as `unknown`.
- Call `logErrorMessage(error, '<functionName>')`.
- The logged function name must exactly match the exported function name.
- Rethrow the original error after logging.
- Use `CustomError` for service-level validation errors.
- Use `import type` for type-only imports.
- Use explicit return types.
- Add a short JSDoc description above every exported function.
- Preserve existing repository and schema types.
- Do not duplicate repository implementation inside the service.
- Do not add handlers, controllers, repositories, schemas, or unrelated changes.
- Do not update barrel exports unless the task explicitly requests it.
- Keep functions small, explicit, and independently testable.

## Repository Inspection

Before generating the service files:

1. Inspect the entity schema.
2. Inspect the entity repository files.
3. Identify the exact repository export names.
4. Identify partial and query result types.
5. Identify the entity primary key.
6. Identify available indexes.
7. Reuse project utilities such as:
   - `CustomError`
   - `logErrorMessage`
   - `DynamoQueryRequest`

Do not assume that every entity uses `id` as its primary key. Adapt function parameters and validation to the repository
contract when necessary.

## Get File

Create:

```text
service/{{entity-kebab}}/{{entity-kebab}}-get.ts
```

Use this structure:

```ts
import type { OptPrt{{Entity}}, Queried{{Entities}} } from '@/repository';
import {
  get{{Entity}}ById as get{{Entity}}ByIdRepo,
  get{{Entities}}ByQuery as get{{Entities}}ByQueryRepo,
  get{{Entity}}TableDescription,
} from '@/repository';
import type { TableDescription } from '@aws-sdk/client-dynamodb';
import { CustomError, logErrorMessage } from '@xmeta-secret/libs';
import type { {{Entity}} } from '@xmeta-secret/schemas';
import type { DynamoQueryRequest } from 'dynamo-command-builder';

/**
 * Retrieves the {{Entity}} table description.
 */
export async function get{{Entity}}TableDesc(): Promise<TableDescription> {
  try {
    const { Table } = await get{{Entity}}TableDescription();

    if (!Table) {
      throw new CustomError('{{Entity}} table description not found');
    }

    const { AttributeDefinitions, GlobalSecondaryIndexes, KeySchema, TableName } = Table;

    if (!AttributeDefinitions || !GlobalSecondaryIndexes || !KeySchema || !TableName) {
      throw new CustomError('Incomplete table description for {{Entity}}');
    }

    return {
      AttributeDefinitions,
      GlobalSecondaryIndexes,
      KeySchema,
      TableName,
    };
  } catch (error: unknown) {
    logErrorMessage(error, 'get{{Entity}}TableDesc');
    throw error;
  }
}

/**
 * Retrieves a {{Entity}} by its id.
 */
export async function get{{Entity}}ById(id: string, proj?: string): Promise<OptPrt{{Entity}}> {
  try {
    return await get{{Entity}}ByIdRepo(id, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'get{{Entity}}ById');
    throw error;
  }
}

/**
 * Queries {{Entities}} based on provided conditions.
 */
export async function get{{Entities}}ByQuery(
  query: DynamoQueryRequest,
  proj?: string,
): Promise<Queried{{Entities}}> {
  try {
    return await get{{Entities}}ByQueryRepo(query, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'get{{Entities}}ByQuery');
    throw error;
  }
}

/**
 * Retrieves and validates a {{Entity}} by id, throwing if not found.
 */
export async function getValidated{{Entity}}(id: string): Promise<{{Entity}}> {
  try {
    const {{entity}} = await get{{Entity}}ById(id);

    if (!{{entity}}) {
      throw new CustomError('{{Entity}} with id ' + id + ' not found', 404);
    }

    return {{entity}} as {{Entity}};
  } catch (error: unknown) {
    logErrorMessage(error, 'getValidated{{Entity}}');
    throw error;
  }
}
```

### Index Getters

Add index-based getter functions only for indexes required by the task or already exposed by the repository.

Use this structure:

```ts
/**
 * Retrieves a {{Entity}} by {{indexProperty}}.
 */
export async function get{{Entity}}By{{IndexProperty}}(
  {{indexProperty}}: string,
): Promise<OptPrt{{Entity}}> {
  try {
    const query: DynamoQueryRequest = {
      indexName: '{{index-name}}',
      pKey: {{indexProperty}},
      pKeyType: 'S',
      pKeyProp: '{{indexProperty}}',
    };

    const { items } = await get{{Entities}}ByQuery(query);

    return items.length > 0 ? items[0] : undefined;
  } catch (error: unknown) {
    logErrorMessage(error, 'get{{Entity}}By{{IndexProperty}}');
    throw error;
  }
}
```

Replace all index placeholders with the actual DynamoDB index configuration.

Do not leave placeholder index values in generated code.

## Update File

Create:

```text
service/{{entity-kebab}}/{{entity-kebab}}-update.ts
```

Use this structure:

```ts
import type { Prt{{Entity}} } from '@/repository';
import {
  update{{Entity}}ByExpression as update{{Entity}}ByExpressionRepo,
  update{{Entity}}Directly as update{{Entity}}DirectlyRepo,
} from '@/repository';
import { CustomError, logErrorMessage } from '@xmeta-secret/libs';

type GenericRecord = Record<string, unknown>;

type Update{{Entity}}WithConditionInput = {
  item: Prt{{Entity}};
  condition?: string;
  extraAttributeValues?: GenericRecord;
  expectedUpdatedAt?: number;
};

/**
 * Updates {{Entity}} directly by passing partial item fields.
 */
export async function update{{Entity}}Directly(
  item: Prt{{Entity}},
  condition?: string,
  extraAttributeValues?: GenericRecord,
): Promise<Prt{{Entity}}> {
  try {
    return await update{{Entity}}DirectlyRepo(item, condition, extraAttributeValues);
  } catch (error: unknown) {
    logErrorMessage(error, 'update{{Entity}}Directly');
    throw error;
  }
}

/**
 * Updates {{Entity}} using an update expression.
 */
export async function update{{Entity}}WithExpression(
  id: string,
  updateExpression: string,
  condition?: string,
  extraAttributeValues?: GenericRecord,
): Promise<Prt{{Entity}}> {
  try {
    return await update{{Entity}}ByExpressionRepo(
      id,
      updateExpression,
      condition,
      extraAttributeValues,
    );
  } catch (error: unknown) {
    logErrorMessage(error, 'update{{Entity}}WithExpression');
    throw error;
  }
}

/**
 * Updates {{Entity}} with a condition object and optional updatedAt version check.
 */
export async function update{{Entity}}WithCondition(
  input: Update{{Entity}}WithConditionInput,
): Promise<Prt{{Entity}}> {
  try {
    const { item, condition, extraAttributeValues, expectedUpdatedAt } = input;

    if (!item.id) {
      throw new CustomError('{{Entity}} id is required for update', 400);
    }

    const mergedItem: Prt{{Entity}} = {
      ...item,
      updatedAt: Date.now(),
    };

    const conditions: string[] = [];

    if (condition) {
      conditions.push('(' + condition + ')');
    }

    if (expectedUpdatedAt !== undefined) {
      conditions.push('updatedAt = :expectedUpdatedAt');
    }

    const finalCondition =
      conditions.length > 0 ? conditions.join(' AND ') : undefined;

    const mergedAttributeValues: GenericRecord = {
      ...(extraAttributeValues ?? {}),
    };

    if (expectedUpdatedAt !== undefined) {
      mergedAttributeValues[':expectedUpdatedAt'] = expectedUpdatedAt;
    }

    const finalAttributeValues =
      Object.keys(mergedAttributeValues).length > 0
        ? mergedAttributeValues
        : undefined;

    return await update{{Entity}}DirectlyRepo(
      mergedItem,
      finalCondition,
      finalAttributeValues,
    );
  } catch (error: unknown) {
    logErrorMessage(error, 'update{{Entity}}WithCondition');
    throw error;
  }
}
```

Adapt `id`, `updatedAt`, and repository parameters when the entity repository uses a different key or update contract.

Do not change the repository contract merely to match this template.

## Create File

Create:

```text
service/{{entity-kebab}}/{{entity-kebab}}-create.ts
```

Use this structure:

```ts
import { create{{Entity}} as create{{Entity}}Repo } from '@/repository';
import { logErrorMessage } from '@xmeta-secret/libs';
import type { {{Entity}} } from '@xmeta-secret/schemas';

/**
 * Creates a new {{Entity}}.
 */
export async function create{{Entity}}(
  newItem: {{Entity}},
): Promise<{{Entity}}> {
  try {
    return await create{{Entity}}Repo(newItem);
  } catch (error: unknown) {
    logErrorMessage(error, 'create{{Entity}}');
    throw error;
  }
}
```

Use the repository input and return types when they differ from the complete schema type.

## Existing Files

When one or more target files already exist:

- Preserve valid existing functions.
- Add only missing requested functions.
- Correct functions that violate this skill.
- Preserve established entity-specific logic.
- Do not overwrite custom business validation without evidence that it is incorrect.
- Do not move functions between get, update, and create files unless they are currently in the wrong category.

## Validation

After implementation:

1. Confirm all three files exist.
2. Confirm filenames use kebab-case.
3. Confirm functions are placed in the correct file.
4. Confirm repository imports resolve.
5. Confirm schema and repository types resolve.
6. Confirm every exported function logs and rethrows errors.
7. Confirm `logErrorMessage` receives the exact function name.
8. Confirm no DynamoDB client is called directly.
9. Confirm no unresolved template placeholders remain.
10. Run the narrowest available TypeScript validation for the affected package.

## Final Response

Report:

```text
Created:
- service/{{entity-kebab}}/{{entity-kebab}}-get.ts
- service/{{entity-kebab}}/{{entity-kebab}}-update.ts
- service/{{entity-kebab}}/{{entity-kebab}}-create.ts

Validation:
- <command and result>
```

Mention repository functions or required types that were missing.

Do not claim validation passed when it was not executed or failed.
