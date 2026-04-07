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

## Step 3 — Ask the user (with Codex offer)

Whenever you want to ask the user a question during explore — about direction,
approach, tradeoffs, or anything unclear — always append this at the end:

> 💬 Chcesz żebym to najpierw omówił z Codexem?

If the user says yes → launch Codex before continuing:

```
/codex:adversarial-review --background focus: [your question + context, 5-10 lines]
```

Tell the user:
> "Codex analizuje w tle — sprawdź /codex:status. Pobiorę wynik gdy będzie gotowy."

Fetch result with `/codex:result` once done. Then print:

```
---
🤖 Codex said
[key points from Codex, 5-10 lines]
---
🤖 Claude → decision
[your decision or what you're escalating to the user]
---
```

If the user says no → continue without Codex.

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
