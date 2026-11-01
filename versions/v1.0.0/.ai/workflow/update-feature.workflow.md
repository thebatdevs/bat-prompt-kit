# Update Feature Workflow

Use this when changing, extending, or refactoring an existing feature.

## Core Principles

- Preserve existing patterns and strict layer boundaries
- Minimize changes — be surgical
- Always understand current behavior before changing it
- Plan first, then execute
- Business logic lives in `.bat-peasant/context/*.business-logic.md`

## Required Reading (Prioritize)

1. Relevant `.bat-peasant/context/` business logic files
2. `.bat-peasant/standards/code-writing.standard.md`
3. `.bat-peasant/standards/project-structure.standard.md`
4. Current implementation files (handler, service, repository, schema, tests)

If business behavior changes, also read the appropriate monorepo or single-project context standard.

## Example Patterns

Check `.bat-peasant/examples/` for similar patterns:

```txt
.bat-peasant/examples/dynamo-*.functions.md
.bat-peasant/examples/service-layer-functions.md
.bat-peasant/examples/project-structure*.example.md
```

Use them to maintain style consistency.

## Task History Rule

Before seeking approval, save the update plan to:

```txt
.bat-peasant/history/<kebab-task-name>/update-plan.md
```

Keep plans concise. Update the same file if requirements change. Skip for trivial one-line fixes unless requested.

## Workflow

1. Identify feature scope and read minimal relevant files.
2. Analyze current behavior.
3. Compare against requested behavior.
4. Create concise update plan and save to history.
5. Get user approval.
6. Implement using existing patterns and strict layering:
   - Handler: parsing, auth, validation, service call
   - Service: business logic & orchestration
   - Repository: data access only
7. Make minimal, targeted changes. Avoid unrelated refactors.
8. Update/add tests per testing plan.
9. Run tests, type check, lint.
10. Update `.bat-peasant/context/` business docs **only** if behavior changed.
11. Return concise summary.

## Update Plan Template Requirements

Must include:

- **Objective**
- **Current vs Target Behavior**
- **Affected Files**
- **Relevant Context & Examples**
- **Implementation Steps**
- **Data/Schema Impact**
- **Business Rules Impact**
- **Compatibility & Migration Needs**
- **Testing Plan**
- **Documentation Updates**

## Final Response

Include:

- What changed
- Previous vs new behavior
- Tests added/updated
- Key commands & results
- Business docs updated (if any)
- Examples followed
- History file location
- Any risks or unclear areas

Be concise and actionable.
