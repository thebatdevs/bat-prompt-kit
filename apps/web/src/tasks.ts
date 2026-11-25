export const statuses = ['todo', 'in-progress', 'done'] as const;
export type TaskStatus = (typeof statuses)[number];

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

export const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

export function nextStatus(status: TaskStatus): TaskStatus {
  return statuses[(statuses.indexOf(status) + 1) % statuses.length]!;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${response.status}).`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
