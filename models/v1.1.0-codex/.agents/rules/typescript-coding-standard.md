# Coding Standard

Purpose: define how agents write, name, validate, document, and handle errors.

## Core Rules

- Write clear, explicit, searchable TypeScript.
- Prefer simple code over clever abstractions.
- Keep functions small, focused, typed, and testable.
- Use early returns; avoid deep nesting.
- Validate external input and important outputs.
- Throw meaningful errors.
- Avoid duplicated logic, hidden side effects, and unrelated changes.

## Naming

| Target    | Rule                     | Example                      |
| --------- | ------------------------ | ---------------------------- |
| Files     | `kebab-case`             | `withdraw-request-create.ts` |
| Functions | specific verb-based name | `createWithdrawRequest()`    |
| Schemas   | `camelCase` + `Sch`      | `withdrawRequestSch`         |
| Types     | `PascalCase`             | `WithdrawRequest`            |
| Constants | `SCREAMING_SNAKE_CASE`   | `KHAN_BANK_CODE`             |
| Booleans  | state/question           | `isActive`, `canWithdraw`    |
| Arrays    | plural noun              | `withdrawRequests`           |

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

Prefer:

```txt
action + domain + condition/key
```

Good:

```ts
getActiveWithdrawRequestsByEmail();
approveWithdrawRequest();
validateUserPaymentAddress();
```

Avoid vague names such as `data`, `item`, `process`, `handle`, `helper`, `utils`, and `common`.

## Function Rules

Exported functions MUST:

- Have explicit input and output types
- Perform one responsibility
- Include useful JSDoc
- Throw meaningful errors
- Avoid hidden side effects
- Return validated domain objects when appropriate

Use object parameters for multiple inputs. Do not use `any`; use `unknown` and narrow safely.

## Validation

Use Zod at trust boundaries:

- Request input
- Environment variables
- External API responses
- Important persistence or domain output

```ts
const input = inputSch.parse(rawInput);
return resultSch.parse(result);
```

Pure shape validation belongs in schemas. Repeated business validation, lookup, and guard logic MUST be extracted into
reusable focused functions:

```ts
const withdrawRequest = await getValidWithdrawRequestById(id);
```

## Errors and Logging

Errors MUST be meaningful and use stable machine-readable codes.

```ts
throw new CustomError('Withdraw request not found', 404, 'WITHDRAW_REQUEST_NOT_FOUND');
```

`CustomError` lives in the shared error utilities. Do not invent alternative error classes.

Use the shared logger from `src/libs` (or the shared package). Implement it once if missing.

MUST NOT:

- Duplicate logging helpers
- Log the same error in multiple layers
- Log secrets, tokens, credentials, or sensitive data
- Expose raw database, AWS, or provider errors

Use `try/catch` only when you need to log, translate, or recover:

```ts
try {
  // operation
} catch (error: unknown) {
  logErrorMessage(error, 'functionName');
  throw error;
}
```

Prefer fewer, well-placed try/catch blocks over wrapping every statement.

**Avoid nested try/catch blocks.** If additional error handling is needed inside or after an existing try/catch, extract
that logic into a separate independent function that owns its own try/catch.

### Traceable Business Logging

Any function that updates state, performs validation with side effects, or contains multiple meaningful steps MUST emit
clear, traceable logs using the shared logger.

Log important intermediate states so the flow can be reconstructed later.

Example (cancelling a deposit request):

```ts
logger.info(`Deposit request found: ${id} status: ${status}`);
logger.info(`Deposit request status ${id} status changed ${status} to ${newStatus}`);
```

Logs MUST be:

- Meaningful and human-readable
- Structured (include relevant IDs and before/after values)
- Free of sensitive data

## JSDoc

Exported functions MUST document:

- Purpose
- Parameters
- Return value
- Expected errors

Add a short process flow only for complex functions:

```ts
/**
 * Updates a withdraw request after validating its status transition.
 *
 * Process:
 * 1. Load and validate the existing request
 * 2. Check that the status transition is allowed
 * 3. Persist the update and return the validated result
 *
 * @param input - Status update input
 * @returns The validated updated request
 * @throws CustomError when the request is missing or the transition is invalid
 */
```

Do not write JSDoc that only repeats the function name or TypeScript types.

## Agent Checklist

Before completing changes, confirm:

- Names are specific and searchable
- Inputs and outputs are typed
- Exported functions have useful JSDoc
- External input is validated with Zod
- Errors are meaningful and logged once
- Multi-step / update / validation functions have meaningful traceable logs
- Nested try/catch is avoided by extracting into separate functions
- Repeated validation/guard logic is reused
- Domain output is validated when appropriate
- Handlers stay thin; services contain business logic
- No DynamoDB SDK or database access outside repositories
- No vague abstractions or unrelated changes were introduced
