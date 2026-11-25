import { randomUUID } from 'node:crypto';
import type { TaskRepository } from './task-repository.ts';
import { parseTaskStatus, parseTaskTitle, TaskError } from './task.ts';
import type { Task } from './task.ts';

export function createTaskService(repository: TaskRepository) {
  function getTask(id: string): Task {
    const task = repository.findById(id);
    if (!task) throw new TaskError('Task not found.', 404);
    return task;
  }

  return {
    listTasks(status?: string): Task[] {
      const filter = status === undefined ? undefined : parseTaskStatus(status);
      return repository.list().filter((task) => filter === undefined || task.status === filter);
    },
    getTask,
    createTask(title: unknown): Task {
      const task: Task = {
        id: randomUUID(),
        title: parseTaskTitle(title),
        status: 'todo',
        createdAt: new Date().toISOString(),
      };
      repository.save(task);
      return task;
    },
    updateTaskStatus(id: string, status: unknown): Task {
      const task = { ...getTask(id), status: parseTaskStatus(status) };
      repository.save(task);
      return task;
    },
    deleteTask(id: string): void {
      getTask(id);
      repository.remove(id);
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;
