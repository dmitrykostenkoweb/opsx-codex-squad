---
description: Start or continue the opsx-codex dual-AI workflow (OpenSpec + Codex review)
argument-hint: '[change-name or problem description]'
---

Use the `opsx-codex` skill. Follow these steps mechanically in order.
Do not skip steps. Do not present findings to the user before Codex responds.

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

## Step 3 — Send findings to Codex (MANDATORY, no exceptions)

Print exactly:

```
---
🤖 Claude → Codex
[your findings + candidate approaches, 5-10 lines]
---
```

Then launch Codex in background:

```
/codex:adversarial-review --background focus: [same content as above]
```

Tell the user:
> "Codex is reviewing in background. I'll fetch the result in a moment — check /codex:status if curious."

Then fetch the result using `/codex:result` once the job finishes.
Do NOT use sleep loops. Do NOT poll manually. Use `/codex:result` once when ready.

When you have Codex's response, print exactly:

```
---
🤖 Codex said
[paste key points from Codex output, 5-10 lines]
---
🤖 Claude → decision
[which approach, why in one sentence — or what you're escalating to the user]
---
```

---

## Step 4 — Present to user

Short summary:
- What you found
- What Codex challenged or confirmed
- Your decision or what you need from the user

The full dialogue above is already visible — keep this brief.

---

## Step 5 — Specify (if implementing)

```
/opsx:ff <change-name>
```

Then:

```
/codex:adversarial-review --background focus: proposal for <change-name>
```

Fetch result with `/codex:result` when done. Then print:

```
---
🤖 Claude → decision on proposal
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
Blocked after one genuine attempt → `/codex:rescue investigate: [specific issue + file:line]`

---

## Step 7 — Code review

```
/codex:review --background
```

Fetch result with `/codex:result` when done. Then print:

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
- Never present analysis to the user before Codex responds (Step 3)
- Never skip Step 3, even for obvious cases
- Never use sleep loops to wait for Codex — use /codex:result once when ready
- Escalate to user: architectural tradeoffs, unresolved Claude vs Codex disagreement, business context
