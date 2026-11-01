# Bat-Peasant v1.1.0-codex Requirements

## Persistent-context path contract

- `.agents/` is the only canonical persistent-context directory for this version.
- `AGENTS.md` is the activation and routing entry point.
- Activated tasks read detailed workflow guidance from `.agents/info.md`.
- Complex-task plans target `.agents/plans/<task-name>.plan.md`.
- Other directory names must not be presented as aliases or alternative sources of authority.
- Required `.agents/` subdirectories must either ship with the package or have an explicit, documented creation step.

## Activation compatibility

- Bat-Peasant activates only when a task contains the exact marker `##bat-peasant`.
- Tasks without the marker use normal agent behavior.
- Path-contract changes must preserve this activation behavior.
