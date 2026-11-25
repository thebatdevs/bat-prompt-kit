import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createTaskRepository } from './tasks/task-repository.ts';
import { createTaskService } from './tasks/task-service.ts';
import type { TaskService } from './tasks/task-service.ts';
import { TaskError } from './tasks/task.ts';

async function readBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  if (request.headers['content-type']?.split(';')[0]?.trim() !== 'application/json') {
    throw new TaskError('Content-Type must be application/json.', 415);
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) throw new TaskError('Request body is too large.', 413);
    chunks.push(chunk);
  }
  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new TaskError('Request body must be valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new TaskError('Request body must be a JSON object.');
  }
  return body as Record<string, unknown>;
}

function sendJson(response: ServerResponse, status: number, data?: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(data === undefined ? undefined : JSON.stringify(data));
}

export function createApp(service: TaskService = createTaskService(createTaskRepository())) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const method = request.method;

      if (url.pathname === '/api/health' && method === 'GET') {
        return sendJson(response, 200, { status: 'ok' });
      }
      if (url.pathname === '/api/tasks') {
        if (method === 'GET') {
          return sendJson(response, 200, { tasks: service.listTasks(url.searchParams.get('status') ?? undefined) });
        }
        if (method === 'POST') {
          const body = await readBody(request);
          return sendJson(response, 201, { task: service.createTask(body.title) });
        }
        response.setHeader('Allow', 'GET, POST');
        return sendJson(response, 405, { error: 'Method not allowed.' });
      }

      const match = /^\/api\/tasks\/([^/]+)$/.exec(url.pathname);
      if (match) {
        const id = match[1]!;
        if (method === 'GET') return sendJson(response, 200, { task: service.getTask(id) });
        if (method === 'PATCH') {
          const body = await readBody(request);
          return sendJson(response, 200, { task: service.updateTaskStatus(id, body.status) });
        }
        if (method === 'DELETE') {
          service.deleteTask(id);
          return sendJson(response, 204);
        }
        response.setHeader('Allow', 'GET, PATCH, DELETE');
        return sendJson(response, 405, { error: 'Method not allowed.' });
      }
      sendJson(response, 404, { error: 'Route not found.' });
    } catch (error) {
      if (error instanceof TaskError) return sendJson(response, error.status, { error: error.message });
      console.error(error);
      sendJson(response, 500, { error: 'Internal server error.' });
    }
  });
}
