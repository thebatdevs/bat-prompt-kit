# Project structure standards example

This project follows a layered architecture designed to keep business logic isolated, testable, and reusable across
different entry points such as API handlers, scheduled jobs, queue consumers, and scripts.

## Core Architecture

```txt
Entry Layer → Service Layer → Repository Layer
```

Each layer has a clear responsibility:

| Layer            | Responsibility                                                                | Examples                                                   |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Entry Layer      | Accept external input, validate request shape, call services, return response | Lambda handler, Express route, Next.js route, cron handler |
| Service Layer    | Own business logic, workflow orchestration, domain validation, decisions      | create order, approve withdrawal, calculate fee            |
| Repository Layer | Own data access only                                                          | DynamoDB, PostgreSQL, S3, external persistence APIs        |

## Recommended Folder Structure

```txt
src/
  functions/              # Lambda/API/event entry definitions
    create-user/
      index.ts            # Function metadata/config
      handler.ts          # Lambda handler

  routes/                 # Express/Next.js route entries if used
    user.route.ts

  services/               # Business logic and application workflows
    user/
      create-user.service.ts
      get-user.service.ts
      update-user.service.ts

  repositories/           # Database and persistence access
    user.repository.ts
    dynamo-client.ts

  types/                  # Shared TypeScript types and zod schemas
    user.type.ts

  constants/              # Static constants only
    user.constant.ts

  utils/                  # Generic reusable utilities
    date.util.ts
    response.util.ts

  errors/                 # Custom errors if needed
    custom-error.ts
```

## Layer Rules

### 1. Entry Layer

The entry layer is the outside boundary of the application.

It may:

- parse request body, path parameters, and query parameters
- validate input using schemas
- extract metadata such as IP, user agent, auth user, or request ID
- call one service function
- format the final HTTP/event response

It must not:

- contain business decisions
- call repositories directly
- contain DynamoDB/PostgreSQL logic
- calculate domain-specific values unless it is only request transformation

Example:

```ts
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = createUserRequestSch.parse(JSON.parse(event.body ?? '{}'));

    const result = await createUser(body);

    return formatApiResponse(200, result);
  } catch (error: unknown) {
    return formatApiErrorResponse(error);
  }
}
```

## 2. Service Layer

The service layer owns the business workflow.

It may:

- call repositories
- call other services
- apply business rules
- validate entity state
- calculate values
- decide whether an operation is allowed
- throw domain/application errors

It must not:

- know about API Gateway, Express `req/res`, or HTTP response formatting
- directly parse raw request bodies
- contain low-level database command construction
- expose database-specific response objects to upper layers

Example:

```ts
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const existingUser = await getUserByEmail(input.email);

    if (existingUser) {
      throw new CustomError('User already exists', 409);
    }

    const now = Date.now();

    const newUser: User = userSch.parse({
      id: randomUUID(),
      email: input.email,
      name: input.name,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    return await createUserRepo(newUser);
  } catch (error: unknown) {
    logErrorMessage(error, 'createUser');
    throw error;
  }
}
```

## 3. Repository Layer

The repository layer owns persistence.

It may:

- build database query commands
- call DynamoDB/PostgreSQL/S3/etc.
- map raw database output into typed objects
- handle pagination tokens
- use database-specific helpers

It must not:

- contain business rules
- decide whether a user is allowed to perform an action
- format API responses
- call service functions
- perform unrelated orchestration

Example:

```ts
export async function getUserByEmail(email: string): Promise<Partial<User> | undefined> {
  const { Items } = await queryRecordFromDynamo({
    tableName: TABLE_NAME,
    queryRequest: {
      indexName: 'email-index',
      pKey: email,
      pKeyType: 'S',
      pKeyProp: 'email',
    },
  });

  return Items?.[0] ? (Items[0] as Partial<User>) : undefined;
}
```

## Dependency Direction

Dependencies must flow inward.

```txt
Entry Layer
  ↓
Service Layer
  ↓
Repository Layer
  ↓
External Infrastructure
```

Allowed imports:

```txt
handler.ts       → services
service.ts       → repositories, schemas, utils, constants
repository.ts    → database clients, schemas, utils
```

Forbidden imports:

```txt
repository.ts    → services
repository.ts    → handlers
service.ts       → handlers
types/schemas    → services with runtime logic
```
