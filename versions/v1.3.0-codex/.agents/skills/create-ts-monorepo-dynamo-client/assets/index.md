# index.ts

Generate `index.ts` from the TypeScript code block below.

```typescript
export { getDocumentClient, setDocumentClient } from './client';
export {
  createRecordOnDynamo,
  deleteRecordOnDynamo,
  getBatchRecordsFromDynamo,
  getRecordFromDynamoByKey,
  getTableDescFromDynamo,
  queryAllRecordsFromDynamo,
  queryRecordFromDynamo,
  scanRecordsFromDynamo,
  transactWriteOnDynamo,
  updateRecordOnDynamo,
} from './command';
```
