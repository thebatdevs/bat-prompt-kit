import { createExampleItem as createExampleItemRepo } from '@/repository/example-repository';
import { CustomError } from '@/libs/error';
import type { ExampleItem } from '@/types';

export async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  try {
    return await createExampleItemRepo(newItem);
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      throw new CustomError(`Item with id: ${newItem.id} already exists`, 409);
    }
    throw error;
  }
}
