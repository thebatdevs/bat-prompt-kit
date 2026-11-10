# Using the TypeScript Serverless Monorepo Engineering Standard

Use the [engineering standard](./ts.engineering-standard.md) as a shared baseline for AI agents working on backend
TypeScript/Node.js monorepos with AWS Lambda, API Gateway, Serverless Framework, and pnpm. DynamoDB rules apply only
when DynamoDB is used.

The standard defines engineering behavior. A project profile supplies the repository-specific facts needed to apply it:
business rules, file paths, configuration, commands, approved examples, and exceptions.

## Test generation policy

Generate tests only when the user explicitly asks to write or add tests. Ordinary development, bug-fix, refactoring, and
verification prompts do not authorize test files, cases, fixtures, mocks, or snapshots. Do not routinely ask whether to
add tests. Run relevant existing checks and report material verification limits; missing coverage alone does not block
completion. Do not install or scaffold test tooling solely for unrequested tests.

## 1. Adopt it in an existing repository

1. Copy `AGENTS.md` and the `.agents/rules/`, `.agents/workflows/`, `.agents/templates/`, and `.agents/plans/` contents
   into the target repository, merging with existing instructions. The layout below matches this bundle; use established
   repository paths when available and update every link.
2. Inspect existing repository instructions, manifests, deployment configuration, and relevant implementations.
3. Complete the included project profile template. Link authoritative files instead of duplicating settings.
4. Add links to the standard and profile in the applicable `AGENTS.md`.
5. Verify that the links, commands, package names, and approved examples exist and apply to the intended scope.
6. Record incompatible conventions as explicit exceptions with a reason, owner, and review date. Flag unresolved
   conflicts before making changes that depend on them.

Included layout (paths are relative to the adopting repository root):

```text
AGENTS.md
.agents/rules/
  ts.engineering-standard.md
  project-profile.md
  usage.md
.agents/workflows/
  sequential-implementation.md
.agents/templates/
  task-record.template.md
.agents/plans/
  .gitkeep
```

Here, `ts.engineering-standard.md` is the linked standard and `usage.md` is this adoption guide. Copying them does not
authorize a repository migration or changes to unrelated code. Keep compatible existing structure and tooling.

## 2. Link it from AGENTS.md

For the example layout above, add this section to the root `AGENTS.md`. Adjust paths and scope before using it; retain
existing instructions.

```markdown
## Backend engineering guidance

Before changing backend application code:

1. Read [the engineering standard](.agents/rules/ts.engineering-standard.md).
2. Read [the project profile](.agents/rules/project-profile.md).
3. Inspect the affected implementation, callers, contracts, configuration, and tests.

Use repository-declared versions, scripts, and deployment targets. Flag conflicts with the standard before making
changes that depend on them. Preserve unrelated work and avoid unrelated migrations.

Create or add tests only when explicitly requested by the user. Run relevant existing checks.

If the profile is missing, incomplete, or marked as a template, use verified existing configuration and documentation.
Clarify consequential missing facts before dependent changes; create or update the profile when adoption or context
maintenance is in scope.
```

For an `AGENTS.md` in a subdirectory, adjust links relative to that file and state which packages or stacks it covers. A
Markdown link makes the guidance discoverable; the instruction to read it makes the intended workflow explicit.

## 3. Write the project profile

Complete the profile in the adopting repository. Replace every placeholder with verified information, mark unused
concerns as `N/A`, and label unresolved facts explicitly. Never put secrets or credentials in the profile.

Use the [project profile template](./project-profile.md) included alongside this guide. Keep its status marked as a
template until its facts and references have been verified.

Copy `.agents/skills/fill-project-profile/` with the bundle to use the
[fill-project-profile skill](../skills/fill-project-profile/SKILL.md). In the adopting repository, invoke it with:

```text
Use $fill-project-profile to complete .agents/rules/project-profile.md for this repository.
```

The skill fills verified facts, records unresolved items, and preserves existing project decisions. When invoking it
from the prompt-kit source repository, specify the adopting project's path and intended profile destination explicitly.

Commands in the profile must come from actual scripts or tool configuration. Inspect credentials, environment-loading
behavior, and resource targets before running integration checks. Keep deployment separate from verification.

## 4. Use it for everyday tasks

To build organized business context, copy `.agents/skills/build-business-memory/` with the bundle and use the
[build-business-memory skill](../skills/build-business-memory/SKILL.md):

```text
Use $build-business-memory to document this project's business rules and workflows under .agents/memory/.
```

The skill creates a reading index and topic files for evidenced domains, flows, decisions, and unresolved questions. It
links the index from the project profile when available. Read the index first and load only relevant topics for later
tasks. Refresh affected memory when business behavior changes.

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

Review the result against the affected contracts and invariants. Run relevant existing checks and report blocked checks
honestly. Under the included `AGENTS.md`, create or add tests only when the user explicitly requests them; the examples
and bootstrap steps in this guide follow that policy. A passing hook proves only the checks that hook actually ran.

If an existing project has no completed profile, the standard permits progress using verified context. Clarify missing
business, security, or data-integrity decisions before dependent changes; do not invent them or automatically expand a
small task into full adoption work.

## 5. Start a new project

1. Record purpose, invariants, selected tools, contracts, authentication, datastore, and minimal structure in the
   profile.
2. Use an accessible pinned starter or scaffold only the packages and layers needed. Do not inherit production targets.
3. Configure strict TypeScript, formatting/linting, environment validation, and isolated development resources.
   Configure new test tooling only when testing setup is explicitly requested; preserve existing test tooling.
4. Build one named vertical slice with observable acceptance criteria. Add meaningful success/failure tests only when
   explicitly requested by the user; otherwise run applicable existing checks and report material verification limits.
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

## Sequential execution

Use the [sequential workflow](../workflows/sequential-implementation.md) and
[task record template](../templates/task-record.template.md) for implementation, fixes, and refactoring. Create one
record per task under `.agents/plans/`. Pass behavioral and engineering review for one bounded item before continuing to
its dependents. Read the [bundle README](../../README.md) for tuning and migration.
