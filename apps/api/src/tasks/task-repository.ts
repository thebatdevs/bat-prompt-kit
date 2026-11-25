import type { Task } from './task.ts';

export interface TaskRepository {
  list(): Task[];
  findById(id: string): Task | undefined;
  save(task: Task): void;
  remove(id: string): boolean;
}

// Each server instance owns its data. Copies prevent callers from mutating stored tasks.
export function createTaskRepository(): TaskRepository {
  const tasks = new Map<string, Task>();

  return {
    list: () => Array.from(tasks.values(), (task) => ({ ...task })),
    findById(id) {
      const task = tasks.get(id);
      return task ? { ...task } : undefined;
    },
    save(task) {
      tasks.set(task.id, { ...task });
    },
    remove: (id) => tasks.delete(id),
  };
}
