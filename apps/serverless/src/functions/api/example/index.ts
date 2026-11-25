import { createDefaultApiFunc } from '@/libs';

export const APIS_EXAMPLE = {
  getHealth: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'getHealth',
    http: { method: 'GET', path: '/v1/health' },
  }),
  getExampleTableDesc: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'getExampleTableDesc',
    http: {
      method: 'GET',
      path: '/v1/example/table-desc',
    },
  }),
  getExampleItemById: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'getExampleItemById',
    http: {
      method: 'GET',
      path: '/v1/example/item/{id}',
    },
  }),
  getExampleItemsByQuery: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'getExampleItemsByQuery',
    http: {
      method: 'GET',
      path: '/v1/example/items',
    },
  }),
  postCreateExampleItem: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'postCreateExampleItem',
    http: {
      method: 'POST',
      path: '/v1/example/item',
    },
  }),
  putUpdateExampleItem: createDefaultApiFunc({
    directory: import.meta.dirname,
    handlerFn: 'putUpdateExampleItem',
    http: {
      method: 'PUT',
      path: '/v1/example/item/{id}',
    },
  }),
};
