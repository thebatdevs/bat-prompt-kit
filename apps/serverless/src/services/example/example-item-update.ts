import { updateExampleItemDirectly } from '@/repository/example-repository';
import { CustomError } from '@/libs/error';
import type { ExampleItem, UpdateExampleItem } from '@/types';

export async function updateExampleItem(item: UpdateExampleItem): Promise<ExampleItem> {
  try {
    return (await updateExampleItemDirectly(item, 'attribute_exists(id)')) as ExampleItem;
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      throw new CustomError(`Item with id: ${item.id} not found`, 404);
    }
    throw error;
  }
}
