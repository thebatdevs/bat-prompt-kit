---
name: update-readme-folder-structure
description:
  Update this repository's root README.md to reflect the v1.1.0-codex folder structure and activation contract.
---

# Update README Folder Structure

## Goal

Update the repository root `README.md` to match the Bat-Peasant `v1.1.0-codex` folder-structure contract.

This skill is intended for maintenance of this repository only. Do not apply it to other repositories unless the user
explicitly asks.

## Inputs

This skill takes no arguments.

If the user requests applying this to a different repository root or a different README path, stop and ask for
confirmation and the exact target path.

## Source of truth

Read these files before editing:

- `README.md` (the target to update)
- `markdown/v1.1.0-codex/requirements.md` (path contract)
- `markdown/v1.1.0-codex/README.md` (canonical wording and `.agents/` tree)

If any of these files are missing, do not guess. Report what is missing and ask the user how to proceed.

## Update requirements

When rewriting `README.md`:

1. Replace outdated references to legacy memory layouts (for example `code/.bat-peasant/`) with the `v1.1.0-codex`
   contract.
2. Ensure the documentation describes `.agents/` as the canonical persistent-context directory.
3. Ensure the activation marker is documented as the exact string `##bat-peasant`.
4. Update the README's folder structure section to show the `.agents/` tree as defined in
   `markdown/v1.1.0-codex/README.md`.

Keep the rest of `README.md` intact unless it directly contradicts these requirements.

## Validation checklist

Before finishing:

- Confirm `README.md` contains a `.agents/` tree.
- Confirm `README.md` mentions `AGENTS.md` as the entry point.
- Confirm `README.md` states the activation marker is exactly `##bat-peasant`.
- Confirm no remaining references to the legacy `code/.bat-peasant/` layout remain.
