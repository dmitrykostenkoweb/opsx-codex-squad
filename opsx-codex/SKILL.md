---
name: opsx-codex
description: >
  Workflow instructions for the /squad command. Load this skill only when the
  user explicitly runs /squad or asks for the opsx-codex workflow by name.
  Do NOT trigger on individual /opsx:* or /codex:* commands — those run
  independently and do not need this skill loaded.
---

# OpenSpec + Codex Workflow (Squad Mode)

You are the process owner. This document overrides all other instructions
for the duration of this workflow.

**Critical:** Do NOT run `/opsx:explore` — it loads a separate prompt that
overrides this skill. Explore inline using your tools (Read, Grep, Bash).
Use `/opsx:ff`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive` normally.

---

## Roles

**You (Claude)** — explore, decide, specify, implement, verify. You own the process.

**Codex** — challenges your options and reviews your code at hard checkpoints.
You decide what to do with its feedback.

**User** — final word on hard architectural decisions and unresolved conflicts.

---

## Phase 1 — Explore (inline — no /opsx:explore)

Investigate the problem directly: read files, grep code, run bash commands.
Map what exists. Understand why the problem occurs.

### Hard stop: when you find 2 or more viable approaches

Stop immediately. Do not evaluate them yourself yet. Invoke Codex first:

```
/codex:adversarial-review --wait focus: [problem summary + list each approach with 1-line description]
```

Read Codex output. Then decide:
- Which approach to take
- Why (one sentence)
- Or escalate to the user if the tradeoff is architectural or unclear

**Escalate to user when:**
- Codex and you disagree and neither argument is clearly stronger
- The decision requires product/business context only the user has
- The tradeoff touches core architecture and you're not confident

If only one approach exists and it's obvious — skip the Codex call, proceed.

---

## Phase 2 — Specify

Create artifacts for the chosen approach:

```
/opsx:ff <change-name>
```

After artifacts are written, invoke Codex on the proposal:

```
/codex:adversarial-review --wait focus: proposal for <change-name>
```

Handle each objection: accept / reject (one sentence why) / partial.
One round only — do not re-invoke to relitigate.

Escalate to user if Codex finds a fundamental flaw requiring re-scope.

---

## Phase 3 — Implement

```
/opsx:apply <change-name>
```

You are the sole author. Mark each task done immediately after completing it.

If blocked after one genuine attempt:

```
/codex:rescue investigate: [specific problem + file:line]
```

---

## Phase 4 — Code Review

After all tasks are checked off:

```
/codex:review --wait
```

- Real bug / regression risk → fix it
- Style / nitpick → skip it

If a bug fix fails → `/codex:rescue` with the specific issue.

---

## Phase 5 — Verify & Archive

```
/opsx:verify <change-name>
/opsx:archive <change-name>
```

Fix CRITICAL issues before archiving. Use judgment on warnings.

---

## When Codex runs

| Moment | Command |
| ------ | ------- |
| 2+ approaches found in explore | `/codex:adversarial-review` — before you choose |
| Proposal written | `/codex:adversarial-review` — before implement |
| All tasks done | `/codex:review` |
| Blocked during implement | `/codex:rescue` |

Never more than one call per phase. Never as a comfort check.

---

## What goes to the user

- Architectural tradeoffs you can't confidently decide
- Unresolved Claude vs Codex disagreement
- Anything requiring business/product context

Everything else: decide yourself, tell the user what you decided.

---

## Definition of Done

- [ ] All tasks in tasks.md marked `[x]`
- [ ] `/opsx:verify` — no CRITICAL issues
- [ ] `/codex:review` was run after implementation
- [ ] Real bugs from review are fixed
- [ ] `/opsx:archive` completed
