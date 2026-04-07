---
description: Start or continue the opsx-codex dual-AI workflow (OpenSpec + Codex review)
argument-hint: '[change-name or problem description]'
---

Use the `opsx-codex` skill. Follow these steps mechanically in order.
Do not skip steps. Do not present findings to the user before Codex runs.

Raw argument: $ARGUMENTS

---

## Step 1 — Orient

Run `openspec list --json`. If active changes exist, ask the user which to continue.
If no active changes and no argument: ask what to work on.

---

## Step 2 — Explore (inline, no /opsx:explore)

Investigate using Read, Grep, Bash. Understand the problem fully.
Do NOT write your findings to the user yet.

---

## Step 3 — Codex review of your findings (MANDATORY, no exceptions)

You have finished exploring. Before you write anything to the user, run:

```
/codex:adversarial-review --wait focus: [problem description + your candidate approaches]
```

This is not optional. It does not matter if you think the answer is obvious.
It does not matter if there is only one approach. Run it anyway.

---

## Step 4 — Present to user

Now you may write your findings. Include:
- What you found
- What Codex said
- Your decision or recommendation
- What you need from the user (if anything)

---

## Step 5 — Specify (if implementing)

```
/opsx:ff <change-name>
```

Then immediately:

```
/codex:adversarial-review --wait focus: proposal for <change-name>
```

Handle feedback: accept / reject (one sentence why) / partial. One round only.

---

## Step 6 — Implement

```
/opsx:apply <change-name>
```

Sole author. Mark tasks done as you go.
Blocked after one attempt → `/codex:rescue investigate: [specific issue + file:line]`

---

## Step 7 — Code review

```
/codex:review --wait
```

Real bug → fix. Style → skip.

---

## Step 8 — Close

```
/opsx:verify <change-name>
/opsx:archive <change-name>
```

---

Hard rules:
- Never present analysis to the user before Step 3 runs
- Never skip Step 3, even for obvious cases
- Escalate to user: architectural tradeoffs, unresolved Claude vs Codex conflict, business context needed
