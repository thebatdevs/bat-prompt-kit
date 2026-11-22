# Create monorepo metadata discovery skill

## Scope and acceptance

One bounded item: add `refresh-monorepo-metadata` under the versioned bundle's `.agents/skills/`. When invoked, it
discovers a target TypeScript serverless workspace and populates the containing `.agents/monorepo.metadata.json` with
verified paths, capabilities, commands, evidence, freshness, and coverage gaps. Preserve custom metadata and avoid
hardcoded source-project paths, package names, or architecture assumptions.

Add a small `AGENTS.md` routing instruction so existing metadata is consumed as a discovery index. Creating this skill
does not invoke it against an unspecified external monorepo. Preserve the user's metadata rename and its existing
placeholder contents. The linked workflow and task-record template are absent; record gates here.

## Item T1

- Status: complete; structural checks passed with the validator limitation below.
- Behavioral review: passed manual review of source-root/destination separation, verified-source discovery, metadata
  record shapes, command non-execution, placeholder mappings, evidence and coverage semantics, partial refresh,
  custom-field preservation, concurrent-edit handling, and AGENTS consumer routing.
- Engineering review: passed YAML/frontmatter, name/folder consistency, UI description/prompt, placeholders, fences,
  whitespace, newline, portability, and final diff inspection. The skill depends only on available source files and a
  JSON parser, not this bundle's library index, aliases, or an external project path.
- Repair attempts: 1 of 2; disallowed inventory merging across source-root changes and clarified that retained unchecked
  records remain explicit gaps during validation.

## Verification

No backend application changes, generated tests, external integrations, or deployment are in scope. Use local structural
checks and manual review; do not populate factual metadata from the bundle's historical library snapshot.

- Bundled `quick_validate.py` was attempted and could not start because Python lacks PyYAML. No dependency was
  installed. Ruby/Psych passed equivalent applicable YAML/name/description checks plus UI metadata, placeholders,
  fences, whitespace, final newline, and portability checks.
- `git diff --check` passed. New skill files were checked directly, since untracked files are absent from that diff.
- The existing metadata's template contents and the user's repository.metadata.json deletion/rename were preserved.
- No target source workspace was supplied for executing the new skill. This task creates the reusable population
  workflow and context-loading instruction; it does not claim that the current template is populated or verified.
- No runtime discovery, application import, generated tests, cloud calls, deployment, or application checks ran.
