# Dynamo Service Functions

## Dynamo Service Get Functions

```ts
import type { OptPrtEntity, QueriedEntities } from '@/repository';
import {
  getEntityById as getEntityByIdRepo,
  getEntityByQuery as getEntityByQueryRepo,
  getEntityTableDescription,
} from '@/repository';
import { TableDescription } from '@aws-sdk/client-dynamodb';
import { CustomError, logErrorMessage } from '@xmeta-secret/libs';
import { Entity } from '@xmeta-secret/schemas';
import { DynamoQueryRequest } from 'dynamo-command-builder';

/**
 * Retrieves the Entity table description.
 */
export async function getEntityTableDesc(): Promise<TableDescription> {
  try {
    const { Table } = await getEntityTableDescription();

    if (!Table) {
      throw new CustomError('Entity table description not found');
    }

    const { AttributeDefinitions, GlobalSecondaryIndexes, KeySchema, TableName } = Table;

    if (!AttributeDefinitions || !GlobalSecondaryIndexes || !KeySchema || !TableName) {
      throw new CustomError('Incomplete table description for Entity');
    }

    return {
      AttributeDefinitions,
      GlobalSecondaryIndexes,
      KeySchema,
      TableName,
    };
  } catch (error: unknown) {
    logErrorMessage(error, 'getEntityTableDesc');
    throw error;
  }
}

/**
 * Retrieves an Entity by its id.
 */
export async function getEntityById(id: string, proj?: string): Promise<OptPrtEntity> {
  try {
    return await getEntityByIdRepo(id, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'getEntityById');
    throw error;
  }
}

/**
 * Queries Entities based on provided conditions.
 */
export async function getEntitiesByQuery(query: DynamoQueryRequest, proj?: string): Promise<QueriedEntities> {
  try {
    return await getEntitiesByQueryRepo(query, proj);
  } catch (error: unknown) {
    logErrorMessage(error, 'getEntitiesByQuery');
    throw error;
  }
}

/**
 * Retrieves and validates an Entity by id, throwing if not found.
 */
export async function getValidatedEntity(id: string): Promise<Entity> {
  try {
    const entity = await getEntityById(id);

    if (!entity) {
      throw new CustomError('Entity with id ' + id + ' not found', 404);
    }

    return entity as Entity;
  } catch (error: unknown) {
    logErrorMessage(error, 'getValidatedEntity');
    throw error;
  }
}

/**
 * Retrieves an Entity by index.
 */
export async function getEntityByIndex(indexValue: string): Promise<OptPrtEntity> {
  try {
    const query: DynamoQueryRequest = {
      indexName: 'index',
      pKey: indexValue,
      pKeyType: 'S',
      pKeyProp: 'prop',
    };

    const { items } = await getEntityByQuery(query);
    return items.length > 0 ? items[0] : undefined;
  } catch (error: unknown) {
    logErrorMessage(error, 'getEntityByIndex');
    throw error;
  }
}
```

## Dynamo Service Update Functions

```ts
import type { PrtEntity } from '@/repository';
import {
  updateEntityByExpression as updateEntityByExpressionRepo,
  updateEntityDirectly as updateEntityDirectlyRepo,
} from '@/repository';
import { CustomError, logErrorMessage } from '@xmeta-secret/libs';

type GenericRecord = Record<string, unknown>;

type UpdateEntityWithConditionInput = {
  item: PrtEntity;
  condition?: string;
  extraAttributeValues?: GenericRecord;
  expectedUpdatedAt?: number;
};

/**
 * Updates Entity directly by passing partial item fields.
 */
export async function updateEntityDirectly(
  item: PrtEntity,
  condition?: string,
  extraAttributeValues?: GenericRecord,
): Promise<PrtEntity> {
  try {
    return await updateEntityDirectlyRepo(item, condition, extraAttributeValues);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateEntityDirectly');
    throw error;
  }
}

/**
 * Updates Entity using an update expression.
 */
export async function updateEntityWithExpression(
  id: string,
  updateExpression: string,
  condition?: string,
  extraAttributeValues?: GenericRecord,
): Promise<PrtEntity> {
  try {
    return await updateEntityByExpressionRepo(id, updateExpression, condition, extraAttributeValues);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateEntityWithExpression');
    throw error;
  }
}

/**
 * Updates Entity with a condition object and optional updatedAt version check.
 */
export async function updateEntityWithCondition(input: UpdateEntityWithConditionInput): Promise<PrtEntity> {
  try {
    const { item, condition, extraAttributeValues, expectedUpdatedAt } = input;

    if (!item.id) {
      throw new CustomError('Entity id is required for update', 400);
    }

    const mergedItem: PrtEntity = {
      ...item,
      updatedAt: Date.now(),
    };

    const conditions: string[] = [];

    if (condition) {
      conditions.push('(' + condition + ')');
    }

    if (expectedUpdatedAt) {
      conditions.push('updatedAt = :expectedUpdatedAt');
    }

    const finalCondition = conditions.length > 0 ? conditions.join(' AND ') : undefined;

    const ext: GenericRecord = {
      ...(extraAttributeValues ?? {}),
    };

    if (expectedUpdatedAt) {
      ext[':expectedUpdatedAt'] = expectedUpdatedAt;
    }

    return await updateEntityDirectlyRepo(mergedItem, finalCondition, Object.keys(ext).length > 0 ? ext : undefined);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateEntityWithCondition');
    throw error;
  }
}
```

## Dynamo Service Create Functions

```ts
import type { Entity } from '@xmeta-secret/schemas';
import { createEntity as createEntityRepo } from '@/repository';
import { logErrorMessage } from '@xmeta-secret/libs';

/**
 * Creates a new Entity.
 */
export async function createEntity(newItem: Entity): Promise<Entity> {
  try {
    return await createEntityRepo(newItem);
  } catch (error: unknown) {
    logErrorMessage(error, 'createEntity');
    throw error;
  }
}
```
