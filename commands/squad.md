---
description: Start or continue the opsx-codex dual-AI workflow (OpenSpec + Codex review)
argument-hint: '[change-name or problem description]'
---

Use the `opsx-codex` skill to run the spec-driven workflow for this request.

The argument after `/squad` is either:
- a problem description → start with `/opsx:explore`
- a change name → pick up from where it is (`/opsx:ff`, `/opsx:apply`, or status check)
- nothing → check `openspec list --json` for active changes and ask what to do

Raw argument: $ARGUMENTS
