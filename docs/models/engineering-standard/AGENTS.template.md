# Backend Agent Instructions

<!-- Adoption: copy or merge this file into the target repository's root AGENTS.md. Preserve existing instructions.
Place the adopted standard at docs/engineering/engineering-standard.md and the project profile at
docs/engineering/project-profile.md, or adjust the links below to verified repository paths before activation.
Remove this comment after adoption. -->

## Scope and required context

These instructions apply to backend TypeScript/Node.js work using AWS Lambda, API Gateway, Serverless Framework, and
pnpm. DynamoDB guidance applies only when DynamoDB is used. Follow applicable instructions in the affected directories.

Before changing backend application code:

1. Read [the engineering standard](docs/engineering/engineering-standard.md).
2. Read [the project profile](docs/engineering/project-profile.md) for business rules, configuration paths, verification
   commands, approved examples, and documented exceptions.
3. Inspect the working tree and the affected implementation, callers, contracts, configuration, and tests. Preserve
   unrelated work.

If the standard is missing, report the missing path and use available repository instructions; clarify decisions that
depend on unavailable guidance. If no profile is available, inspect relevant existing configuration and documentation.
Continue work supported by verified context. Clarify consequential business, security, or data-integrity gaps before
dependent changes. Create or update the profile when adoption or context maintenance is in scope.

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

- Do not create or add tests unless explicitly requested by the user. This overrides the standard's test-generation
  requirements; continue running relevant existing checks.
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
