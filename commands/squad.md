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

You have finished exploring. Before you write anything to the user, print exactly:

```
---
🤖 Claude → Codex
[write your findings and candidate approaches here, 5-10 lines max]
---
```

Then immediately run:

```
/codex:adversarial-review --wait focus: [same content as above]
```

This is not optional. It does not matter if you think the answer is obvious.
It does not matter if there is only one approach. Run it anyway.

When Codex responds, its output appears verbatim in the chat automatically.
After it appears, print exactly:

```
---
🤖 Claude → decision
[your decision: which approach, why in one sentence, or what you're escalating to the user]
---
```

---

## Step 4 — Present to user

Now write a short summary for the user:
- Problem found
- What Codex challenged or confirmed
- Your decision
- What you need from the user (if anything)

Keep it brief — the full AI dialogue above is already visible.

---

## Step 5 — Specify (if implementing)

```
/opsx:ff <change-name>
```

Then immediately:

```
/codex:adversarial-review --wait focus: proposal for <change-name>
```

When Codex responds, print:

```
---
🤖 Claude → decision on proposal review
[accept / reject / partial — one sentence per point]
---
```

One round only.

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

When Codex responds, print:

```
---
🤖 Claude → decision on code review
[for each finding: fix / skip — one sentence why]
---
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
