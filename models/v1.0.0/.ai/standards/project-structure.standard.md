# Project Structure Standard

Purpose: define a minimal, language-agnostic structure so agents place files predictably.

## Core Rule

Organize code by layer and business domain.

```txt
Entry -> Service/Domain -> Repository/Data -> Storage/External API
```

Follow the existing project convention first. Do not restructure a project just because this file uses different folder
names.

## Standard Layers

| Layer           | Responsibility                                      | Common folders                        |
| --------------- | --------------------------------------------------- | ------------------------------------- |
| Entry           | HTTP handlers, events, CLI, workers                 | `functions`, `handlers`, `api`, `cmd` |
| Service/Domain  | business rules, workflows, validation               | `services`, `domain`, `usecases`      |
| Repository/Data | database queries, persistence, external data access | `repository`, `repositories`, `data`  |
| Models/Types    | entities, DTOs, schemas, types                      | `models`, `types`, `schemas`          |
| Config          | env, constants, feature flags                       | `config`                              |
| Shared          | truly generic helpers only                          | `shared`, `common`, `utils`           |

## Layout Guide

```txt
.bat-peasant/context/\*.business-logic.md
src/
<entry-layer>/
<service-layer>/
<repository-layer>/
<models-or-types>/
config/
test/ or tests/
scripts/
infra/ or deployments/
```

Language-specific names are allowed:

- TypeScript Serverless: `src/functions`, `src/services`, `src/repository`, `src/types`
- Python: `src/api`, `src/services`, `src/repositories`, `src/models`
- Go: `cmd`, `internal/<domain>/service`, `internal/<domain>/repository`
- Java/Kotlin: `controller`, `service`, `repository`, `model`

## Domain Grouping

Group files by business domain when it improves navigation.

Good:

```txt
withdraw-request
user-bank-deposit
payment-gateway
custom-config
```

Example:

```txt
src/services/withdraw-request/
withdraw-request-create.ts
withdraw-request-get.ts
withdraw-request-update.ts
```

## Naming Rules

- Use business-domain folder names.
- Use language-appropriate file naming.
- Prefer specific, searchable names.
- Avoid vague folders/files: `utils`, `helper`, `common`, `misc`, `manager`.
- Use shared/common/utils only for truly generic code.
- Never hide business logic in generic folders.

## Testing Rules

- Use `test/`, `tests/`, or the language-standard test location.
- Mirror source structure when practical.
- Co-locate tests only when idiomatic for the language.

## Forbidden

Do not:

- put business logic in entry handlers
- call repositories directly from handlers
- put business rules in repositories
- create generic dumping folders
- create deep nesting without clear reason
- fight existing project conventions

## Agent Checklist

Before creating or moving files, confirm:

- correct layer
- correct business domain
- specific searchable name
- existing project convention followed
- tests placed consistently
- no vague dumping folder created
- dependency flow preserved

## Golden Rule

The structure should make the correct location of code obvious to humans and AI agents.

## Last Updated

2026-05-26
