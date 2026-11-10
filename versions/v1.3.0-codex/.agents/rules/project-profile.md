# Project Profile

Status: template — repository context has not been verified.

Complete this profile in the adopting repository before treating it as authoritative. Replace placeholders with verified
facts, mark unused concerns as `N/A`, and identify unresolved facts explicitly. Never include secrets or credentials.
Until then, inspect actual configuration and documentation; clarify consequential gaps before dependent changes. A
placeholder is not an approved command, reference, or exception.

## Purpose and boundaries

- Purpose and ownership: <what the service does; responsible team>
- Scope: <covered packages/stacks; exclusions>
- Vocabulary: <domain terms and meanings>
- Actors and permissions: <roles, tenant boundaries, resource ownership>
- Critical invariants: <conditions that must always hold>

## Flows and data

- Request/event flows: <entry point → business operation → persistence/external effect>
- State transitions: <allowed transitions and guards>
- Sources of truth and external systems: <authoritative data and integration boundaries>
- Data semantics: <IDs, units, precision/rounding, timestamps, expiry, retention, deletion>

## Authoritative configuration

- Runtime, package manager, workspaces: <exact configuration paths>
- Compiler, bundler, formatter, lint, tests: <exact configuration paths>
- Deployment and environment bindings: <configuration paths; stage/account/resource mapping>
- Shared schemas, errors, logging, environment access, clients: <public exports and paths>

## Verification

| Purpose                           | Working directory | Exact command      | Prerequisites and target         |
| --------------------------------- | ----------------- | ------------------ | -------------------------------- |
| Targeted tests                    | <directory>       | <verified command> | <setup and resource scope>       |
| Lint and type checks              | <directory>       | <verified command> | <setup>                          |
| Build and consumer compatibility  | <directory>       | <verified command> | <affected packages>              |
| Integration checks, if applicable | <directory>       | <verified command> | <isolated resources and cleanup> |

## Approved references

- Feature flow: <exact paths and symbols for auth/schema/handler/service/repository/tests>
- Error translation and diagnostic logging owner: <exact paths and symbols>
- Conditional persistence and pagination, when used: <exact paths and symbols>

## Exceptions

| Rule            | Exception and scope  | Reason | Owner   | Review date  |
| --------------- | -------------------- | ------ | ------- | ------------ |
| <standard rule> | <approved deviation> | <why>  | <owner> | <YYYY-MM-DD> |
