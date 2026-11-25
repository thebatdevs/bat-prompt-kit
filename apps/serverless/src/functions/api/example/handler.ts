import { createHttpHandler, CustomError, extractMetadataFromEvent } from '@/libs';
import {
  createExampleItem,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  getExampleItemTableDesc as getExampleTableDescription,
  updateExampleItem,
} from '@/services/example';
import { exampleItemSch, updateExampleItemSch } from '@/types';
import { extractQueryReqFromParams } from 'dynamo-command-builder';

export const getHealth = createHttpHandler<null>(async () => ({ status: 'ok' }));

/**
 *  Get example table description
 */
export const getExampleTableDesc = createHttpHandler<null>(async (_event) => {
  return await getExampleTableDescription();
});

/**
 *  Get example item by ID
 */
export const getExampleItemById = createHttpHandler<null>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`, 400);
  const { id } = event.pathParameters;
  const response = await getExampleItemByIdService(id);
  if (!response) throw new CustomError(`Item with id: ${id} not found`, 404);
  return response;
});

/**
 *  Get example items by query
 */
export const getExampleItemsByQuery = createHttpHandler<object>(async (event) => {
  const { queryParams } = extractMetadataFromEvent(event);
  if (!queryParams) throw new CustomError('Query params are missing!');

  const queryRequest = extractQueryReqFromParams(event.queryStringParameters, {
    indexName: 'status-createdAt-index',
    pKey: `EXECUTED`,
    pKeyType: 'S',
    pKeyProp: 'status',
    limit: 20,
  });

  return await getExampleItemsByQueryService(queryRequest);
});

/**
 *  Create a new example item
 */
export const postCreateExampleItem = createHttpHandler<object>(async (event) => {
  const { body } = extractMetadataFromEvent(event);
  if (!body) throw new CustomError('Request body is missing', 400);
  const parsedBody = exampleItemSch.parse(body);
  return await createExampleItem(parsedBody);
});

/**
 *  Update an existing example item
 */
export const putUpdateExampleItem = createHttpHandler<object>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`, 400);
  const { body } = extractMetadataFromEvent(event);
  if (!body) throw new CustomError('Request body is missing', 400);
  const parsedBody = updateExampleItemSch.parse(body);
  return await updateExampleItem({ ...parsedBody, id: event.pathParameters.id });
});
