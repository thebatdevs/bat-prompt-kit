# client.ts

Generate `client.ts` from the TypeScript code block below.

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let cachedClient: DynamoDBDocumentClient | undefined;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', 'host.docker.internal', 'dynamodb-local']);

// DynamoDB Local ignores credentials, but the SDK still requires a pair.
function isLocal(endpoint: string): boolean {
  try {
    const hostname = new URL(endpoint).hostname.replace(/^\[|\]$/g, '');
    return LOCAL_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

// Build on first use so environment configuration can load before construction.
export function getDocumentClient(): DynamoDBDocumentClient {
  if (!cachedClient) {
    const endpoint = process.env['DYNAMODB_ENDPOINT']?.trim();
    const base = new DynamoDBClient({
      region: process.env['AWS_REGION'] ?? 'ap-southeast-1',
      ...(endpoint ? { endpoint } : {}),
      ...(endpoint && isLocal(endpoint) ? { credentials: { accessKeyId: 'local', secretAccessKey: 'local' } } : {}),
    });
    cachedClient = DynamoDBDocumentClient.from(base, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }
  return cachedClient;
}

// Test hook. Pass undefined to reset before changing environment configuration.
export function setDocumentClient(client: DynamoDBDocumentClient | undefined): void {
  cachedClient = client;
}
```
