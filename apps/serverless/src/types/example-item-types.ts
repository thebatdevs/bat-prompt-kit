import { z } from 'zod';

const exampleItemStatusSch = z.enum(['PENDING', 'EXECUTED']);

export const exampleItemSch = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string(),
  status: exampleItemStatusSch.default('EXECUTED'),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type ExampleItem = z.infer<typeof exampleItemSch>;

export const updateExampleItemSch = exampleItemSch
  .pick({ name: true, description: true, status: true })
  .extend({ status: exampleItemStatusSch })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be supplied');

export type UpdateExampleItem = z.infer<typeof updateExampleItemSch> & { id: string };
