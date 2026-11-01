# Using the TypeScript Serverless Monorepo Engineering Standard

Use the [engineering standard](./typescript-serverless-monorepo.engineering-standard.optimal.md) as a shared baseline
for AI agents working on backend TypeScript/Node.js monorepos with AWS Lambda, API Gateway, Serverless Framework, and
pnpm. DynamoDB rules apply only when DynamoDB is used.

The standard defines engineering behavior. A project profile supplies the repository-specific facts needed to apply it:
business rules, file paths, configuration, commands, approved examples, and exceptions.

## 1. Adopt it in an existing repository

1. Copy the standard into a maintained documentation location in the target repository. The example layout below is
   optional; use established repository paths when available.
2. Inspect existing repository instructions, manifests, deployment configuration, and relevant implementations.
3. Create a short project profile using the outline below. Link authoritative files instead of duplicating settings.
4. Add links to the standard and profile in the applicable `AGENTS.md`.
5. Verify that the links, commands, package names, and approved examples exist and apply to the intended scope.
6. Record incompatible conventions as explicit exceptions with a reason, owner, and review date. Flag unresolved
   conflicts before making changes that depend on them.

Example layout in the adopting repository:

```text
AGENTS.md
docs/engineering/
  engineering-standard.md
  project-profile.md
```

Here, `engineering-standard.md` is a copy of the linked standard. Copying it does not authorize a repository migration
or changes to unrelated code. Keep compatible existing structure and tooling.

## 2. Link it from AGENTS.md

For the example layout above, add this section to the root `AGENTS.md`. Adjust paths and scope before using it; retain
existing instructions.

```markdown
## Backend engineering guidance

Before changing backend application code:

1. Read [the engineering standard](docs/engineering/engineering-standard.md).
2. Read [the project profile](docs/engineering/project-profile.md).
3. Inspect the affected implementation, callers, contracts, configuration, and tests.

Use repository-declared versions, scripts, and deployment targets. Flag conflicts with the standard before making
changes that depend on them. Preserve unrelated work and avoid unrelated migrations.

If no profile is available, use verified existing configuration and documentation. Clarify consequential missing facts
before dependent changes; create or update the profile when adoption or context maintenance is in scope.
```

For an `AGENTS.md` in a subdirectory, adjust links relative to that file and state which packages or stacks it covers. A
Markdown link makes the guidance discoverable; the instruction to read it makes the intended workflow explicit.

## 3. Write the project profile

Use this outline in the adopting repository. Replace every placeholder with verified information, mark unused concerns
as `N/A`, and label unresolved facts explicitly. Never put secrets or credentials in the profile.

```markdown
# Project Profile

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
```

Commands in the profile must come from actual scripts or tool configuration. Inspect credentials, environment-loading
behavior, and resource targets before running integration checks. Keep deployment separate from verification.

## 4. Use it for everyday tasks

Give the agent a concrete task and acceptance criteria. The `AGENTS.md` entry supplies the standard and profile; the
task supplies the behavior to implement.

Example task prompt, with placeholders to replace:

```text
Implement <requested behavior> in <affected package or stack>.
Read the applicable AGENTS.md, engineering standard, and project profile first.

Acceptance criteria:
- <observable successful behavior>
- <important failure or boundary behavior>
- <compatibility or security constraint>

Follow verified repository patterns and preserve unrelated work. Run relevant checks from the project profile.
Report the result, checks actually run, material assumptions, and any blocked verification.
```

Review the result against the affected contracts and invariants. Require relevant observable tests and honest reporting
of blocked checks. A passing hook proves only the checks that hook actually ran.

If an existing project has no linked profile, the standard permits progress using verified context. Clarify missing
business, security, or data-integrity decisions before dependent changes; do not invent them or automatically expand a
small task into full adoption work.

## 5. Start a new project

1. Record purpose, invariants, selected tools, contracts, authentication, datastore, and minimal structure in the
   profile.
2. Use an accessible pinned starter or scaffold only the packages and layers needed. Do not inherit production targets.
3. Configure strict TypeScript, formatting/linting, tests, environment validation, and isolated development resources.
4. Build one named vertical slice with observable acceptance criteria and meaningful success/failure tests.
5. Verify installation, tests, types, and build using actual project commands. Link the standard and completed profile
   from `AGENTS.md`, and record approved paths and symbols as examples.

If no reviewed implementation exists yet, use inline examples or a pinned starter and replace them with approved project
references when available. The standard's payment-method example is illustrative; its types and validators must come
from the adopting project.

## 6. Maintain the adopted guidance

- Update the profile when commands, contracts, configuration paths, or approved examples change.
- Keep changing versions and settings in authoritative configuration, linked from the profile.
- Review documented exceptions on their recorded dates.
- Review upstream standard changes before updating an adopted copy; reconcile project exceptions deliberately.
- Check links and formatting after documentation changes. Do not expand untouched code merely for documentation
  uniformity.
- Assess claimed agent-performance improvements through comparable task trials. A documentation review alone does not
  establish improved real-world performance.
