# Standard Compliance Scan

Scan the current project and report where the codebase does not follow the repository standards in
`/.bat-peasant/standard`.

## Goal

Detect violations of existing `/.bat-peasant/standard` standards and create a precise compliance report.

## Required Input

Read first:

```txt
AGENTS.md
/.bat-peasant/standard/**
/.bat-peasant/context/**
/.bat-peasant/workflow/**
/.bat-peasant/examples/**
```

Then inspect the relevant source code.

Do not guess standards. Only report violations against documented standards.

## Task

1. Read all standards in `/.bat-peasant/standard`.
2. Extract the concrete rules from each standard.
3. Scan the repository for code that violates those rules.
4. Ignore generated files, build outputs, dependencies, and irrelevant artifacts.
5. Create a report at:

```txt
/.bat-peasant/output/scan-result-YYYY-MM-DD.md
```

Use the current date for `YYYY-MM-DD`.

## What To Detect

Report only actionable issues:

- Architecture/layer violations
- Invalid folder or file placement
- Missing validation
- Missing or incorrect error handling
- Wrong repository/service/handler responsibilities
- TypeScript rule violations
- DynamoDB access pattern violations
- Zod/schema violations
- Test standard violations
- Naming or formatting violations
- Security issues such as logging secrets
- Duplicated patterns that standards prohibit
- Code that conflicts with documented examples

Do not report personal preferences unless they are written in the standards.

## Report Rules

The report must be short, precise, and useful for fixing code.

For each issue include:

- Standard violated
- File path
- Problem
- Required fix
- Severity: `high`, `medium`, or `low`

Do not include long explanations.

Do not paste large code blocks.

Use small snippets only when necessary.

## Output Format

```txt
# Standard Compliance Scan Result

Date: YYYY-MM-DD

## Summary

- Standards checked: N
- Files scanned: N
- Issues found: N
- High: N
- Medium: N
- Low: N

## Issues

### 1. [severity] Issue title

- Standard: `/.bat-peasant/standard/<file>.md`
- File: `path/to/file.ts`
- Problem: ...
- Required fix: ...

## Clean Areas

- ...

## Recommended Fix Order

1. ...
2. ...
3. ...
```

## Important Rules

- Be evidence-based.
- Do not invent standards.
- Do not rewrite files unless explicitly asked.
- Do not create new standards.
- Do not include generic advice.
- Prefer fewer high-quality findings over many weak findings.
- If no violations are found, still create the report and state that no actionable violations were detected.
