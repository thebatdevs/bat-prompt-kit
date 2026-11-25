import './style.css';
import { apiRequest, nextStatus, statusLabels } from './tasks.ts';
import type { Task } from './tasks.ts';

const form = document.querySelector<HTMLFormElement>('#create-task')!;
const title = document.querySelector<HTMLInputElement>('#title')!;
const filter = document.querySelector<HTMLSelectElement>('#status')!;
const list = document.querySelector<HTMLUListElement>('#tasks')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const empty = document.querySelector<HTMLParagraphElement>('#empty')!;
const count = document.querySelector<HTMLSpanElement>('#count')!;

function renderTasks(tasks: Task[]): void {
  list.replaceChildren();
  count.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
  empty.hidden = tasks.length > 0;

  for (const task of tasks) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = task.title;
    label.className = task.status === 'done' ? 'completed' : '';

    const status = document.createElement('button');
    status.className = `status ${task.status}`;
    status.textContent = statusLabels[task.status];
    status.setAttribute('aria-label', `Move ${task.title} to ${statusLabels[nextStatus(task.status)]}`);
    status.addEventListener('click', () => {
      void runAction(() =>
        apiRequest(`/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus(task.status) }) }),
      );
    });

    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.addEventListener('click', () => {
      void runAction(() => apiRequest(`/tasks/${task.id}`, { method: 'DELETE' }));
    });
    item.append(label, status, remove);
    list.append(item);
  }
}

async function refreshTasks(): Promise<void> {
  const query = filter.value ? `?status=${encodeURIComponent(filter.value)}` : '';
  const result = await apiRequest<{ tasks: Task[] }>(`/tasks${query}`);
  renderTasks(result.tasks);
}

let busy = false;

async function runAction(action?: () => Promise<unknown>): Promise<void> {
  if (busy) return;
  busy = true;
  document
    .querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select')
    .forEach((control) => {
      control.disabled = true;
    });
  error.hidden = true;
  try {
    await action?.();
    await refreshTasks();
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'Something went wrong.';
    error.hidden = false;
  } finally {
    busy = false;
    document
      .querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select')
      .forEach((control) => {
        control.disabled = false;
      });
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void runAction(async () => {
    await apiRequest('/tasks', { method: 'POST', body: JSON.stringify({ title: title.value }) });
    form.reset();
  });
});

filter.addEventListener('change', () => {
  void runAction();
});

void runAction();
