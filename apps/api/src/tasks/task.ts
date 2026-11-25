export const taskStatuses = ['todo', 'in-progress', 'done'] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

export class TaskError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'TaskError';
    this.status = status;
  }
}

export function parseTaskStatus(value: unknown): TaskStatus {
  if (!taskStatuses.includes(value as TaskStatus)) {
    throw new TaskError('Status must be todo, in-progress, or done.');
  }
  return value as TaskStatus;
}

export function parseTaskTitle(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) {
    throw new TaskError('Title must contain between 1 and 120 characters.');
  }
  return value.trim();
}
