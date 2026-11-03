# AGENTS.md

## Scope and required context

These instructions apply to backend TypeScript/Node.js work using AWS Lambda, API Gateway, Serverless Framework, and
pnpm. DynamoDB guidance applies only when DynamoDB is used. Follow applicable instructions in the affected directories.

Before changing backend application code:

1. Read [the engineering standard](.agents/rules/ts.engineering-standard.md).
2. Read [the project profile](.agents/rules/project-profile.md) for business rules, configuration paths, verification
   commands, approved examples, and documented exceptions.
3. Inspect the working tree and the affected implementation, callers, contracts, configuration, and tests. Preserve
   unrelated work.

When `.agents/memory/index.md` exists, read it and load only the topic files relevant to the task. Treat memory as
supplementary business context; verify affected behavior against current implementation and authoritative requirements.

If the standard is missing, report the missing path and use available repository instructions; clarify decisions that
depend on unavailable guidance. If the profile is missing, incomplete, or marked as a template, inspect relevant
existing configuration and documentation. Continue work supported by verified context. Clarify consequential business,
security, or data-integrity gaps before dependent changes. Create or update the profile when adoption or context
maintenance is in scope.

## Plan and implement

- Identify acceptance criteria, relevant failure cases, affected layers, and external effects.
- Use repository-declared versions, scripts, package names, paths, and deployment targets. Flag conflicts with the
  standard before making dependent changes; do not silently rewrite tooling or perform unrelated migrations.
- Use approved examples and documented exceptions within their stated scope. Do not copy unrelated business logic or
  legacy defects.
- Implement the smallest complete change. Preserve existing contracts unless a contract change is in scope. Avoid
  unrelated cleanup, speculative abstractions, and unnecessary dependencies.
- Follow the standard's architecture, validation, JSDoc, error-handling, persistence, security, and recovery rules as
  applicable. Keep detailed engineering rules in the standard rather than duplicating them here.

## Verify and maintain context

- Do not generate test files, test cases, test fixtures, mocks, or snapshots unless the user explicitly asks to write or
  add tests. A request to implement, fix, refactor, or verify code does not authorize test generation. Do not ask
  whether to add tests as a routine development step; complete the requested work using relevant existing checks.
- Run relevant existing tests, lint, type checks, and builds when available. Do not install or scaffold test tooling
  solely for unrequested tests. Missing test coverage alone does not block completion or require new tests. Report
  verification limits accurately. This policy applies to the engineering standard, guides, and skills in this bundle.
- Inspect actual scripts and prerequisites; use exact commands and working directories from the verified project profile
  or configuration. Do not assume a root test task exists.
- Run targeted checks first. Broaden verification for affected consumers when shared contracts or behavior change.
- Before integration checks, inspect environment-loading behavior, credentials, and resource targets. Keep deployment
  separate from verification and identify the intended environment explicitly.
- Check relevant behavior and failure cases, documentation/reference consistency, and the final diff. Update affected
  contracts, comments, and project context.
- Do not claim an unrun check passed or treat a passing hook as evidence for checks it did not run.

## Completion report

Report the outcome, relevant checks actually run and their results, material assumptions, and unresolved blockers. If
implementation is complete but required verification is unavailable, report **implementation complete; verification
blocked**, rather than claiming the change is fully verified.
