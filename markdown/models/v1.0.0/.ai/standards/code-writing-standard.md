# Code Writing Standard

Purpose: define how agents must write, name, structure, validate, and layer code in this project.

## Core Principles

- Write clear, explicit, searchable TypeScript.
- Prefer simple readable code over clever abstractions.
- Keep functions small, focused, typed, and easy to test.
- Use early returns. Avoid deep nesting.
- Validate external input and important business input.
- Throw meaningful errors.
- Keep business logic in the Service layer only.
- Log errors with context using the shared `logErrorMessage(error, '<functionName>')` when available, If not implement
  it and export it from `src/libs`; do not duplicate local logging helpers.
- Return validated domain objects with Zod `.parse()` when appropriate.
- Document intentional deviations in the relevant `.business-logic.md` file.

## Naming Rules

| Target       | Rule                       | Example                      |
| ------------ | -------------------------- | ---------------------------- |
| Files        | `kebab-case`               | `withdraw-request-create.ts` |
| Functions    | accurate verb-based names  | `createWithdrawRequest()`    |
| Services     | business behavior          | `approveWithdrawRequest()`   |
| Repositories | data access                | `getWithdrawRequestById()`   |
| Zod schemas  | `camelCase` + `Sch` suffix | `withdrawRequestSch`         |
| Types        | `PascalCase`               | `WithdrawRequest`            |
| Constants    | `SCREAMING_SNAKE_CASE`     | `KHAN_BANK_CODE`             |
| Booleans     | state/question names       | `isActive`, `canWithdraw`    |
| Arrays       | plural names               | `withdrawRequests`           |

Common type suffixes:

```txt
Input
Output
Body
Params
Query
Context
Config
```

Name formula:

```txt
action + domain + condition/key
```

Good:

```ts
getActiveWithdrawRequestsByEmail();
approveWithdrawRequest();
validateUserPaymentAddress();
```

Avoid:

```ts
getData();
processRequest();
handleUpdate();
```

Also avoid vague names like `data`, `item`, `process`, `handle`, `helper`, `utils`, and `common` unless the content is
truly generic.

## Function Rules

Every exported function should:

- have an accurate, specific name
- use explicit input and output types
- include JSDoc
- do one clear thing
- use one `try/catch` only when logging is needed
- throw meaningful business errors
- avoid hidden side effects
- return validated domain objects when possible

JSDoc should include:

- purpose
- process flow for complex functions
- params
- return value
- expected thrown errors

Preferred structure:

```ts
/**
 * Updates a withdraw request status after validating the current status transition.
 *
 * Process flow:
 * 1. Gets the existing withdraw request by id.
 * 2. Validates that the requested status transition is allowed.
 * 3. Persists the updated status.
 * 4. Returns the validated updated withdraw request.
 *
 * @param input - Status update input.
 * @returns The updated withdraw request.
 * @throws CustomError when the withdraw request does not exist.
 * @throws CustomError when the status transition is invalid.
 */
export async function updateWithdrawRequestStatus(input: UpdateWithdrawRequestStatusInput): Promise<WithdrawRequest> {
  try {
    const withdrawRequest = await getValidWithdrawRequestById(input.withdrawRequestId);

    validateWithdrawRequestStatusTransition({
      currentStatus: withdrawRequest.status,
      nextStatus: input.nextStatus,
    });

    const updatedWithdrawRequest = await updateWithdrawRequestStatusRepo({
      withdrawRequest,
      nextStatus: input.nextStatus,
      executor: input.executor,
      ipAddress: input.ipAddress,
    });

    return withdrawRequestSch.parse(updatedWithdrawRequest);
  } catch (error: unknown) {
    logErrorMessage(error, 'updateWithdrawRequestStatus');
    throw error;
  }
}
```

## File Structure and Size

- Keep a single source file under **300 lines**.
- Split large files by operation or responsibility.
- Use `index.ts` as the public export file for a folder.
- Prefer operation-based files.
- Avoid vague files like `utils.ts`, `helper.ts`, or `common.ts` unless truly generic.

Good:

```txt
src/services/withdraw-request/
  index.ts
  withdraw-request-create.ts
  withdraw-request-get.ts
  withdraw-request-update.ts
  withdraw-request-validation.ts
```

Bad:

```txt
withdraw-request-helper.ts
withdraw-request-utils.ts
withdraw-request-functions.ts
```

## Reusable Validation and Lookup Helpers

Extract repeated lookup, validation, or guard logic into focused service-layer functions.

Avoid repeating:

```ts
const withdrawRequest = await getWithdrawRequestById(withdrawRequestId);

if (!withdrawRequest) {
  throw new CustomError('Withdraw request not found', 404, 'WITHDRAW_REQUEST_NOT_FOUND');
}
```

Prefer:

```ts
const withdrawRequest = await getValidWithdrawRequestById(withdrawRequestId);
```

Validation and lookup helpers should stay in the Service layer unless they are purely schema-level validation.

## Layer Responsibilities

Code must follow this flow:

```txt
Entry / Handler / Route
  -> Service
  -> Repository
  -> Storage / External API
```

## Entry / Handler / Route

May:

- parse request body, path params, and query params
- validate request input
- extract request metadata
- call service functions
- format API responses

Must not:

- contain business logic
- call repositories directly
- build database queries
- perform complex workflow decisions

## Service Layer

May:

- validate business rules
- call repositories
- call other services
- orchestrate workflows
- throw business errors
- return validated domain objects

Must not:

- know about API Gateway, Express `req/res`, or HTTP response formatting
- build low-level database commands
- return raw database client responses

## Repository Layer

May:

- build database query commands
- call DynamoDB, PostgreSQL, S3, or external persistence APIs
- map raw database output into typed objects
- handle pagination keys

Must not:

- contain business rules
- format API responses
- call service functions
- decide whether an operation is allowed

## Dependency Direction

Imports must flow one way only:

```txt
Entry -> Service -> Repository -> Storage / External API
```

Allowed:

```txt
handler.ts    -> service.ts
service.ts    -> repository.ts
repository.ts -> database client
```

Forbidden:

```txt
repository.ts -> service.ts
repository.ts -> handler.ts
service.ts    -> handler.ts
handler.ts    -> repository.ts
```

## Agent Checklist

Before writing or changing code, confirm:

- names are specific and searchable
- exported functions have useful JSDoc
- business logic is only in the Service layer
- handlers only parse, validate, delegate, and format
- repositories only perform data access
- reusable validation or lookup logic is extracted
- files are focused and under 300 lines when possible
- errors are meaningful and logged with function context
- returned domain objects are validated with Zod when appropriate
- intentional deviations are documented in the relevant `.business-logic.md` file
