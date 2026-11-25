import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { createApp } from '../src/app.ts';
import type { Task } from '../src/tasks/task.ts';

describe('Task API', () => {
  let server: ReturnType<typeof createApp>;
  let baseUrl: string;

  beforeEach(async () => {
    server = createApp();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Expected TCP address.');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (!server.listening) return;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  });

  function request(path: string, method = 'GET', body?: unknown) {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) options.body = JSON.stringify(body);
    return fetch(`${baseUrl}${path}`, options);
  }

  it('creates, retrieves, filters, updates, and deletes a task', async () => {
    const created = await request('/api/tasks', 'POST', { title: '  Try a skill  ' });
    expect(created.status).toBe(201);
    const { task } = (await created.json()) as { task: Task };
    expect(task).toMatchObject({ title: 'Try a skill', status: 'todo' });
    expect(task.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);

    expect(await (await request(`/api/tasks/${task.id}`)).json()).toEqual({ task });
    expect(await (await request('/api/tasks?status=done')).json()).toEqual({ tasks: [] });

    const updated = await request(`/api/tasks/${task.id}`, 'PATCH', { status: 'done' });
    expect(updated.status).toBe(200);
    expect(await updated.json()).toEqual({ task: { ...task, status: 'done' } });
    expect(await (await request('/api/tasks?status=done')).json()).toEqual({
      tasks: [{ ...task, status: 'done' }],
    });

    expect((await request(`/api/tasks/${task.id}`, 'DELETE')).status).toBe(204);
    expect((await request(`/api/tasks/${task.id}`)).status).toBe(404);
    expect(await (await request('/api/tasks')).json()).toEqual({ tasks: [] });
  });

  it.each([undefined, null, '', '   ', 42, 'x'.repeat(121)])('rejects invalid title %j', async (title) => {
    expect((await request('/api/tasks', 'POST', { title })).status).toBe(400);
    expect(await (await request('/api/tasks')).json()).toEqual({ tasks: [] });
  });

  it('rejects an invalid update without changing the task', async () => {
    const { task } = (await (await request('/api/tasks', 'POST', { title: 'Keep me' })).json()) as { task: Task };
    expect((await request(`/api/tasks/${task.id}`, 'PATCH', { status: 'invalid' })).status).toBe(400);
    expect(await (await request(`/api/tasks/${task.id}`)).json()).toEqual({ task });
    expect((await request('/api/tasks?status=invalid')).status).toBe(400);
  });

  it('handles malformed JSON, non-object payloads, content types, and size limits', async () => {
    const malformed = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    expect(malformed.status).toBe(400);
    expect((await request('/api/tasks', 'POST', [])).status).toBe(400);
    expect((await request('/api/tasks', 'POST', null)).status).toBe(400);
    expect((await fetch(`${baseUrl}/api/tasks`, { method: 'POST', body: '{}' })).status).toBe(415);
    expect((await request('/api/tasks', 'POST', { title: 'x'.repeat(20_000) })).status).toBe(413);
  });

  it('returns health, not-found, and method-not-allowed responses', async () => {
    expect(await (await request('/api/health')).json()).toEqual({ status: 'ok' });
    expect((await request('/missing')).status).toBe(404);
    expect((await request('/api/tasks/missing', 'DELETE')).status).toBe(404);
    const response = await request('/api/tasks', 'PUT');
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, POST');
  });
});
