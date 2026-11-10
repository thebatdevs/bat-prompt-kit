---
name: fill-project-profile
description:
  Fill or refresh .agents/rules/project-profile.md using verified repository context when adopting the engineering
  standard or completing its project-profile placeholders.
---

# Fill Project Profile

Complete the adopting repository's project profile with traceable facts. Edit the profile itself; do not change
application code, tooling, permissions, or the engineering standard to make the repository fit the template.

## Locate the target

- Use the repository and profile path specified by the user. Otherwise use `.agents/rules/project-profile.md` relative
  to the adopting repository root, not the process working directory or this skill's directory.
- In this prompt-kit source repository, the bundled target is `versions/v1.3.0-codex/.agents/rules/project-profile.md`.
  Populate it only when the user requests that target and identifies the project it describes. Do not substitute the
  prompt-kit repository's tooling or domain for an adopting backend project's context.
- Read applicable `AGENTS.md` instructions, the target profile, and the linked engineering standard. Preserve verified
  content and unrelated changes. If the target project cannot be identified, ask for its path while inspecting the
  available template; do not populate facts from an arbitrary repository.
- If adoption is requested and the profile is absent, use the template shipped with this bundle at
  [../../rules/project-profile.md](../../rules/project-profile.md). Inspect it before copying; preserve any existing
  profile at the destination.

## Gather evidence

Inspect the relevant manifests, lockfiles, workspace configuration, runtime settings, compiler/lint/build/test
configuration, deployment definitions, maintained documentation, and representative implementations. Follow actual entry
points through schemas, authorization, services, repositories, and external adapters rather than inferring behavior from
filenames or plans.

Fill the existing sections with these distinctions:

- **Purpose, flows, and data:** distinguish implemented behavior from documented intent. Record identifiers, units,
  absence semantics, state guards, ownership, and recovery guarantees only where evidence supports them.
- **Configuration:** link authoritative files and public exports rather than duplicating settings. Record environment
  variable names or binding paths when useful; never copy credential values, tokens, or secrets.
- **Verification:** derive exact commands and working directories from actual scripts and configuration. Inspect script
  bodies and environment loading before execution. Record prerequisites and resource targets, and distinguish a command
  found in configuration from one actually run successfully. Do not run deployment or live integration commands merely
  to complete the profile.
- **References:** link existing paths and symbols. Label candidate examples as unreviewed unless their approval is
  established; do not declare legacy code approved merely because it exists.
- **Exceptions:** record only explicitly approved deviations with their scope, reason, owner, and review date. An
  existing deviation is evidence of a conflict, not approval. Do not invent owners, dates, or authorization exceptions.

Use links relative to the profile file. Cite the supporting file and symbol or section near each consequential claim.
When sources disagree, describe the conflict and its scope rather than silently choosing the convenient value.

## Replace placeholders honestly

- Replace each template value with a verified fact, `N/A — <evidence-based reason>`, or
  `Unresolved — <missing fact and evidence needed>` in plain prose. Absence of evidence alone does not justify `N/A`.
- Preserve the profile's sections. Remove the sample exception row if none is approved; state that no approved
  exceptions were found in the inspected sources, without claiming repository-wide compliance.
- Batch consequential questions about business rules, ownership, security, or data integrity after completing what
  available evidence supports. Leave dependent entries unresolved until answered; do not block independent entries.
- Use `Status: partial — unresolved items remain` while required facts or conflicts remain. Use
  `Status: verified — repository evidence reviewed on YYYY-MM-DD` only when applicable entries are supported, no
  required template values remain, and consequential conflicts are resolved. This status describes the profile's
  evidence review; it does not certify application correctness or imply checks were executed.
- Replace the template-only introductory instructions with a short scope/evidence note once populated. Keep unresolved
  items visible rather than declaring completion solely because angle-bracket placeholders are gone.

## Verify and report

Check local links, referenced symbols, command definitions, working directories, remaining placeholders, and consistency
with the applicable instructions. Run the repository's relevant documentation formatting check. Do not add tests for
this documentation task or execute recorded commands solely to mark them verified.

Report the profile path, completed areas, unresolved questions or conflicts, and checks actually run. Distinguish
documentation validation from application verification.
