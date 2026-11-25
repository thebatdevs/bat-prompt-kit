import { expect, it } from 'vite-plus/test';
import { createTaskRepository } from '../src/tasks/task-repository.ts';

it('keeps repository state isolated from callers and other instances', () => {
  const repository = createTaskRepository();
  const task = { id: 'one', title: 'Original', status: 'todo' as const, createdAt: '2026-01-01T00:00:00.000Z' };
  repository.save(task);
  task.title = 'Mutated input';
  repository.findById('one')!.title = 'Mutated result';
  repository.list()[0]!.title = 'Mutated list';
  expect(repository.findById('one')!.title).toBe('Original');
  expect(createTaskRepository().list()).toEqual([]);
});
