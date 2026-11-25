import { afterEach, expect, it, vi } from 'vite-plus/test';
import { apiRequest, nextStatus } from '../src/tasks.ts';

afterEach(() => vi.unstubAllGlobals());

it('cycles through the task workflow', () => {
  expect(nextStatus('todo')).toBe('in-progress');
  expect(nextStatus('in-progress')).toBe('done');
  expect(nextStatus('done')).toBe('todo');
});

it('sends task mutations as JSON to the API', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ task: { id: 'one' } }, { status: 201 }));
  vi.stubGlobal('fetch', fetchMock);
  const body = JSON.stringify({ title: 'Try skills' });
  expect(await apiRequest('/tasks', { method: 'POST', body })).toEqual({ task: { id: 'one' } });
  expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
    method: 'POST',
    body,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
});

it('handles an empty delete response', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  expect(await apiRequest('/tasks/one', { method: 'DELETE' })).toBeUndefined();
});

it('surfaces API validation errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Invalid title.' }, { status: 400 })));
  await expect(apiRequest('/tasks')).rejects.toThrow('Invalid title.');
});

it('handles a proxy error without a JSON body', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));
  await expect(apiRequest('/tasks')).rejects.toThrow('Request failed (502).');
});
