# Admin Lottery Data-Access Layer Analysis

## Executive summary

The `admin-lottery/src/repository` data-access layer is generally strong, but it has two important weaknesses: full
reads are not schema-validated, and pagination returns `{}` instead of omitting the terminal cursor.

**Overall rating: 7.5/10.**

## DAL structure

The folder contains five repositories:

| Module                | Responsibility                                                     |
| --------------------- | ------------------------------------------------------------------ |
| `config.ts`           | Lottery configuration CRUD, optimistic updates, and table metadata |
| `items.ts`            | Individual lottery-item reads and writes                           |
| `items-allocation.ts` | Aggregate allocation reads and atomic config/item writes           |
| `prizes.ts`           | Prize reads, administrative updates, and table metadata            |
| `images.ts`           | S3 presigned upload access                                         |

The layer depends on shared AWS adapters instead of constructing SDK clients directly:

```text
admin-lottery repository
        │
        ▼
packages/aws-dynamodb or packages/aws-s3
        │
        ▼
AWS SDK DocumentClient / S3 client
```

This is a healthy separation between application persistence operations and low-level AWS client management.

## What is done well

### 1. Configuration is resolved lazily

Every operation reads its table or bucket name inside the function through `getRequiredEnvVar(...)`. This follows the
repository standard and avoids import-time Lambda failures.

### 2. Creates are protected against overwrite

Config and item creation use:

```ts
conditionExpression: 'attribute_not_exists(id)';
```

Conditional failures become HTTP 409 conflicts. This protects caller-supplied identifiers, including IDs preallocated
during image-upload flows.

### 3. Optimistic concurrency is implemented correctly

Config, item, and prize updates require both existence and a matching `updatedAt` value:

```ts
attribute_exists(id) AND updatedAt = :expectedUpdatedAt
```

The returned `ALL_NEW` record is parsed with the canonical Zod schema. This prevents accidental upserts, lost updates,
silent overwrites, and returning malformed updated records.

The monotonically increasing version logic in services also avoids two writes receiving the same millisecond timestamp.

### 4. Allocation writes use a DynamoDB transaction

`items-allocation.ts` atomically:

1. Checks that the parent config still has the expected version.
2. Requires the config to be active and not expired.
3. Advances the config version.
4. Creates or updates the item with its own conditions.
5. Commits both changes or neither.

This makes the config version a serialization token for allocation changes. Transaction conflicts and conditional
failures are translated to a meaningful 409 response.

### 5. Allocation reads are bounded

`getItemsForAllocation()` follows every GSI page but stops after 100 pages instead of potentially running forever.

It also:

- Projects only allocation-related attributes.
- Parses each projection with a derived Zod schema.
- Returns 503 rather than silently returning incomplete allocation data.

### 6. Infrastructure and query patterns agree

The required indexes are declared in `serverless.ts`:

- Config: `status-createdAt-index`
- Items: `status-createdAt-index`
- Items: `configId-createdAt-index`
- Prizes: `status-createdAt-index`
- Prizes: `userId-createdAt-index`

The allocation query uses the declared `configId-createdAt-index`, so its persistence assumption is visible in
infrastructure.

## Important findings

### High: Full records are not validated on reads

The config repository always casts the returned item:

```ts
return Item ? (Item as PrtConfig) : undefined;
```

The same pattern exists for items and prizes.

This is reasonable when a projection is supplied because projected records are intentionally partial. Full reads,
however, should be parsed:

```ts
if (!Item) return undefined;
return proj ? (Item as Partial<ConfigResponse>) : lotteryConfigSch.parse(Item);
```

The current services later convert the partial result to a complete entity with another type assertion. Consequences
include:

- Corrupted or legacy records entering business logic undetected.
- Required fields being `undefined` despite TypeScript claiming otherwise.
- Invalid status values bypassing compile-time assumptions.
- Errors occurring later and farther away from the data boundary.

This is the primary correctness gap in the DAL.

### Medium: Terminal pagination cursors become `{}`

Config, item, and prize queries return:

```ts
lastEvaluatedKey: LastEvaluatedKey ?? {};
```

But the declared property is optional:

```ts
lastEvaluatedKey?: Record<string, unknown>
```

An empty object is truthy, so consumers may interpret it as another page. It also creates an inconsistent contract
because the property is technically optional but always present.

The safer response is:

```ts
return {
  items: (Items ?? []) as Partial<Entity>[],
  ...(LastEvaluatedKey ? { lastEvaluatedKey: LastEvaluatedKey } : {}),
};
```

This should be normalized across all three repositories.

### Medium: Allocation validation relies on an eventually consistent GSI

The transaction serializes writers using the parent config version, but it cannot prove the preceding allocation query
saw all recent item writes.

A possible sequence is:

```text
Writer A reads allocation → writes item and advances config version
Writer B reloads config   → GSI still misses A's item
Writer B validates stale allocation → transaction succeeds
```

The config version prevents simultaneous stale writers, but not a retry performed while the GSI is lagging.

If allocation probability is a strict financial or fairness invariant, stronger options include:

- Store aggregate allocation totals on the config and update them transactionally.
- Use a base-table model that supports strongly consistent reads.
- Store allocation records under a shared partition key in a purpose-built table.
- Add an authoritative allocation/version record included in every transaction.

The current model reduces concurrency risk substantially but does not completely enforce the aggregate invariant.

### Medium: `updateItemDirectly()` is a public persistence footgun

`updateItemDirectly()` accepts an optional condition expression. Without a condition, DynamoDB `UpdateItem` can create a
partial record. The subsequent Zod parse would fail, but the malformed record might already have been persisted.

Current callers appear to use the guarded wrapper, but the repository API makes unsafe usage easy.

Safer options are:

- Keep the raw update helper private.
- Export only named guarded operations.
- Always require `attribute_exists(id)` and accept only additional conditions.

### Medium: Persistence errors are coupled to HTTP errors

Repositories throw `CustomError(..., 409)` directly. This is convenient but couples DynamoDB behavior to HTTP semantics.
The repositories are also called by task handlers, where an HTTP status code is not inherently meaningful.

A cleaner boundary would be:

```text
repository throws domain conflict
        ↓
HTTP service/handler maps it to 409
task handler decides retry/dead-letter behavior
```

This is not an immediate defect, but it reduces reuse and makes asynchronous error policies harder to express.

### Low: Repeated repository types and CRUD code

`QueryOutput<T>`, partial entity aliases, optional partial aliases, and similar read/query/describe/update structures
are independently declared in multiple files.

Some consolidation would help, but a fully generic repository could make DynamoDB projections and schema typing harder.
It would be reasonable to extract only:

- A shared `QueryOutput<T>`.
- Cursor response construction.
- Full-read-versus-projection validation helpers.

Entity-specific repository functions should remain explicit.

### Low: Unused exported types

Types such as `OptConfig`, `OptItem`, and `OptPrize` appear unnecessary or inconsistently used. They add vocabulary
without improving safety.

### Low: S3 repository assumes ACL support

The image repository signs uploads with:

```ts
acl: 'public-read';
```

This requires the target bucket to permit ACLs. Many modern S3 buckets use Bucket Owner Enforced object ownership, which
disables ACLs. This may be intentional for `web-assets-mot`, but the assumption should be verified and documented at the
infrastructure boundary.

## Recommended priority

1. Validate full reads with canonical schemas while preserving partial projections.
2. Omit `lastEvaluatedKey` when DynamoDB does not return one.
3. Make unguarded `updateItemDirectly()` private or force an existence condition.
4. Decide whether eventually consistent allocation validation is acceptable for the business invariant.
5. Separate persistence conflicts from HTTP-specific error representation.
6. Consolidate the small amount of repeated cursor and type machinery.

## Final assessment

This layer is not simple CRUD. It contains good concurrency controls, careful transaction usage, bounded pagination,
schema validation after updates, and clearly documented persistence behavior.

Its biggest inconsistency is that **writes are validated more strictly than reads**. Fixing read validation and cursor
semantics would move the repository layer close to **8.5/10**.

## Review scope

This report was produced from a read-only structural and code review. No files in the analyzed repository were changed,
and its test suite was not executed as part of this analysis.
