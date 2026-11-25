import type { Context } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { CustomError } from '@/libs/error';
import type { HttpHandler } from '@/libs/functions/function-gateway';
import type { ValidatedAPIGatewayProxyEvent } from '@/libs/functions/api-function.types';
import * as repository from '@/repository/example-repository';
import {
  getExampleItemById,
  getHealth,
  postCreateExampleItem,
  putUpdateExampleItem,
} from '@/functions/api/example/handler';

vi.mock('@/repository/example-repository', () => ({
  createExampleItem: vi.fn(),
  getExampleItemById: vi.fn(),
  getExampleItemsByQuery: vi.fn(),
  getExampleItemTableDescription: vi.fn(),
  updateExampleItemDirectly: vi.fn(),
}));

const item = {
  id: 'example-1',
  name: 'Try a skill',
  description: 'An example item',
  status: 'EXECUTED' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
};

async function invoke<S>(handler: HttpHandler<S>, body: string | null = null, id?: string) {
  const event = {
    body,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/json' },
    pathParameters: id ? { id } : null,
    queryStringParameters: null,
    requestContext: { identity: { sourceIp: '127.0.0.1' } },
  } as unknown as ValidatedAPIGatewayProxyEvent<S>;
  return await handler(event, { getRemainingTimeInMillis: () => 30_000 } as Context);
}

beforeEach(() => vi.clearAllMocks());

describe('example API handlers and services', () => {
  it('provides a health endpoint without calling DynamoDB', async () => {
    const response = await invoke(getHealth);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: 'ok' });
    expect(repository.getExampleItemById).not.toHaveBeenCalled();
  });

  it('parses and validates JSON before creating an item', async () => {
    vi.mocked(repository.createExampleItem).mockResolvedValue(item);
    const response = await invoke(postCreateExampleItem, JSON.stringify(item));
    expect(response.statusCode).toBe(200);
    expect(response.headers?.['Content-Type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(response.body)).toEqual(item);
    expect(repository.createExampleItem).toHaveBeenCalledWith(item);
  });

  it.each(['{}', 'null', JSON.stringify({ ...item, name: '' })])('rejects invalid input %s', async (body) => {
    const response = await invoke(postCreateExampleItem, body);
    expect(response.statusCode).toBe(400);
    expect(repository.createExampleItem).not.toHaveBeenCalled();
  });

  it('formats the JSON parser error for malformed bodies', async () => {
    const response = await invoke(postCreateExampleItem, '{');
    expect(response.statusCode).toBe(415);
    expect(JSON.parse(response.body).message).toContain('malformed JSON');
    expect(repository.createExampleItem).not.toHaveBeenCalled();
  });

  it('returns a conflict when the item already exists', async () => {
    vi.mocked(repository.createExampleItem).mockRejectedValue(
      Object.assign(new Error('duplicate'), { name: 'ConditionalCheckFailedException' }),
    );
    expect((await invoke(postCreateExampleItem, JSON.stringify(item))).statusCode).toBe(409);
  });

  it('gets an item and returns 404 for a missing item', async () => {
    vi.mocked(repository.getExampleItemById).mockResolvedValueOnce(item).mockResolvedValueOnce(undefined);
    expect(JSON.parse((await invoke(getExampleItemById, null, item.id)).body)).toEqual(item);
    expect((await invoke(getExampleItemById, null, 'missing')).statusCode).toBe(404);
  });

  it('uses the route ID for updates and prevents accidental item creation', async () => {
    vi.mocked(repository.updateExampleItemDirectly).mockResolvedValue({ ...item, name: 'Updated' });
    const response = await invoke(putUpdateExampleItem, JSON.stringify({ name: 'Updated' }), item.id);
    expect(response.statusCode).toBe(200);
    expect(repository.updateExampleItemDirectly).toHaveBeenCalledWith(
      { id: item.id, name: 'Updated' },
      'attribute_exists(id)',
    );

    vi.mocked(repository.updateExampleItemDirectly).mockRejectedValue(
      Object.assign(new Error('missing'), { name: 'ConditionalCheckFailedException' }),
    );
    expect((await invoke(putUpdateExampleItem, '{"name":"Updated"}', 'missing')).statusCode).toBe(404);
  });

  it('rejects empty updates, body IDs, and missing route IDs', async () => {
    expect((await invoke(putUpdateExampleItem, '{}', item.id)).statusCode).toBe(400);
    expect((await invoke(putUpdateExampleItem, '{"id":"other","name":"Updated"}', item.id)).statusCode).toBe(400);
    expect((await invoke(putUpdateExampleItem, '{"name":"Updated"}')).statusCode).toBe(400);
    expect(repository.updateExampleItemDirectly).not.toHaveBeenCalled();
  });

  it('formats known errors and hides unexpected infrastructure errors', async () => {
    vi.mocked(repository.getExampleItemById).mockRejectedValueOnce(new CustomError('Unavailable', 503));
    expect((await invoke(getExampleItemById, null, item.id)).statusCode).toBe(503);
    vi.mocked(repository.getExampleItemById).mockRejectedValueOnce(new Error('private infrastructure detail'));
    const response = await invoke(getExampleItemById, null, item.id);
    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('private infrastructure detail');
  });
});
