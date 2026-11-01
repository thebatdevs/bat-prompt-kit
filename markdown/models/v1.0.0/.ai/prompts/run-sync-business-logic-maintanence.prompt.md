# Run maintenance: Sync business logic context files

Run `.ai/maintenance/sync-business-logic.md` exactly.

Read the sync file, then read the correct standard from `.ai/standards/` based on repo shape. Scan the project, identify
business scopes, and create/update the required `.ai/context/*.business-logic.md` files.

Rules:

- Business logic only.
- Keep context compact.
- Do not create `.ai/context/business-logic/`.
- Do not guess; use `Unknown from current code`.
- Preserve useful existing context.

Return only files created, files updated, key business rules found, and unclear areas.
