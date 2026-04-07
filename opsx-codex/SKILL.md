---
name: opsx-codex
description: >
  Workflow instructions for the /squad command. Load this skill only when the
  user explicitly runs /squad or asks for the opsx-codex workflow by name.
  Do NOT trigger on individual /opsx:* or /codex:* commands — those run
  independently and do not need this skill loaded.
---

# OpenSpec + Codex Workflow

## Purpose

Run a spec-driven development loop in which Claude owns the process end-to-end
and Codex acts as a sharp, independent critic at defined checkpoints. The goal
is to catch bad assumptions early, get implementation reviewed by a model that
didn't write it, and close the work cleanly — without creating an AI debate club
or doubling the work.

---

## Roles

### Claude — Process Owner

Claude drives the workflow from start to finish. Claude:

- Runs all OpenSpec commands (`/opsx:explore`, `/opsx:ff`, `/opsx:apply`,
  `/opsx:verify`, `/opsx:archive`)
- Creates and maintains all spec artifacts (proposal, design, specs, tasks)
- Makes every go/no-go decision at each checkpoint
- Decides whether to accept, reject, or partially incorporate Codex's feedback
- Records the rationale when overriding a Codex objection
- Is the only AI writing application code during the apply phase

Claude is **not** a passive summarizer. When Codex raises a concern, Claude
evaluates it and decides — it does not escalate endlessly or defer.

### Codex — Independent Critic

Codex has one job: tell Claude what looks wrong, fragile, or mistaken from the
outside. Codex:

- Reviews proposals and design decisions via `/codex:adversarial-review`
- Reviews applied code changes via `/codex:review`
- Executes targeted rescue work via `/codex:rescue` **only when Claude has
  identified a specific problem it can't resolve alone**

Codex is **not** a co-owner of the plan. It does not drive the workflow,
does not get to veto Claude's final decision, and does not write code unless
explicitly invoked for rescue.

---

## Workflow

### Phase 0 — Orient

Before starting, establish what kind of work this is:

| Type                          | Entry point                       |
| ----------------------------- | --------------------------------- |
| Unclear / open-ended problem  | `/opsx:explore` first             |
| Well-understood change        | `/opsx:ff` directly               |
| Continuing in-progress change | `/opsx:apply` or `/opsx:continue` |

Run `openspec list --json` to check for active changes. If one is relevant,
read its artifacts before proceeding.

---

### Phase 1 — Explore & Diagnose

**Claude runs:** `/opsx:explore <problem or idea>`

Use this phase to understand the problem, map the relevant codebase, surface
unknowns, and form a hypothesis about the right approach. Do not implement
anything here.

**Checkpoint A — Exit Explore**

Exit explore when you can answer:

1. What is the actual problem or goal?
2. What are the plausible approaches and their tradeoffs?
3. What is the recommended approach and why?
4. What are the top 2–3 risks or unknowns?

If you cannot answer these, keep exploring. If the problem is too unclear to
answer #1, ask the user directly before proceeding.

**Adversarial review is optional at this phase.** Use it when:

- The diagnosis is surprising or non-obvious
- You're about to propose a significant architectural change
- The user explicitly requests it

---

### Phase 2 — Specify & Plan

**Claude runs:** `/opsx:ff <change-name>` or `/opsx:new <change-name>`

Generate all artifacts required for implementation: proposal, design (if
applicable), specs, tasks. Read each dependency artifact before writing the
next one.

After all artifacts are written, verify the plan is internally consistent:

- Proposal scope matches the tasks list
- Design decisions are reflected in the specs
- Tasks are concrete and ordered sensibly

**Checkpoint B — Mandatory Adversarial Review**

After artifacts are created and before applying:

```
/codex:adversarial-review --wait focus: proposal and design decisions for <change-name>
```

Use `--wait` for small changes (1–2 files). Use `--background` for larger ones.

Codex will challenge the approach, assumptions, and design choices — not just
hunt for implementation bugs. That is its purpose here.

**Handling Codex feedback:**

For each objection Codex raises, do one of:

1. **Accept** — update the relevant artifact to reflect the change. Record
   what changed and why.
2. **Reject** — write one sentence in the proposal or a comment explaining why
   the objection does not apply. Move on.
3. **Partially accept** — update the artifact to address the valid part. Record
   which part you accepted and which you dismissed.

Maximum one round of back-and-forth. If Codex's output is unclear or
contradictory, pick the interpretation that seems most useful, act on it, and
move forward. Do not re-invoke adversarial review to re-litigate the same point.

**If Codex raises a CRITICAL concern** (fundamental flaw in the approach, data
loss risk, security issue, wrong abstraction that will cause real downstream
pain), stop and update the proposal before proceeding. "Critical" means the
plan would likely need to be partially re-done after implementation if ignored.

**If Codex raises only minor concerns or stylistic preferences**, log them in
the proposal as acknowledged tradeoffs and proceed to apply.

---

### Phase 3 — Implement

**Claude runs:** `/opsx:apply <change-name>`

Claude is the sole author of code changes during this phase. Implement tasks
in order. Mark each task done immediately after completing it.

If implementation reveals a problem not covered in the artifacts:

1. Pause and update the relevant artifact (tasks, design, or spec)
2. Continue implementation

Do not invoke Codex during implementation unless you are blocked (see
Escalation Rules).

---

### Phase 4 — Code Review

After apply is complete (all tasks checked off), invoke Codex review:

```
/codex:review --wait
```

Use `--background` if the change is large (more than ~5 files changed).

**Handling review output:**

Apply the same accept/reject/partial logic from Checkpoint B. This review is
focused on implementation quality — correctness, edge cases, code patterns —
not on re-litigating the design.

If the review finds a genuine bug or regression risk:

1. Fix it directly (Claude implements the fix)
2. Or invoke `/codex:rescue` if the fix is unclear (see Escalation Rules)

If the review finds only style issues or nitpicks with no real risk, acknowledge
and move forward. Do not re-implement to satisfy aesthetic preferences.

---

### Phase 5 — Verify

**Claude runs:** `/opsx:verify <change-name>`

Verify that the implementation matches the artifacts: all tasks complete, specs
covered, design decisions followed.

If verify reports CRITICAL issues: fix them before archiving.
If verify reports only WARNINGs or SUGGESTIONs: use judgment. Architectural
changes warrant fixing warnings. Bugfixes may not.

---

### Phase 6 — Archive

**Claude runs:** `/opsx:archive <change-name>`

Archive the change. If delta specs exist, sync them. If there are incomplete
tasks or warnings, confirm with the user before archiving.

---

## Decision Rules

### When to use adversarial review vs standard review

| Situation                                         | Use                                |
| ------------------------------------------------- | ---------------------------------- |
| Reviewing the plan/proposal before implementation | `/codex:adversarial-review`        |
| Reviewing code after implementation               | `/codex:review`                    |
| Both a design review and code review wanted       | Both, in sequence                  |
| Small change, high confidence, user wants speed   | Skip adversarial review (MVP mode) |

### When adversarial review is mandatory

- Architectural changes (new abstraction, new module boundary, changing how
  state flows through the system)
- Changes that touch security, auth, or data integrity
- Changes where the explore phase revealed significant uncertainty about the
  right approach
- Changes estimated at more than 1–2 hours of work

### When to trigger `/codex:rescue`

Only invoke rescue when:

1. Claude has tried to fix a specific issue and failed
2. The review identified a bug or problem that Claude cannot diagnose alone
3. The verify phase found a correctness issue that requires deeper investigation

Do **not** invoke rescue as a "second pass just in case." Rescue is for real
blockers, not comfort.

### When to stop iterating

Stop when any of:

- All CRITICAL issues from review/verify are resolved
- One full round of adversarial review + one full round of code review are done
- Remaining feedback is stylistic or speculative

Do not go beyond two review cycles on the same change. If the second review
still finds fundamental problems, pause, re-scope the change, and start a new
OpenSpec change for the rework.

### How to handle Codex/Claude disagreement

When Codex disagrees with a design decision Claude made:

1. Read the concern carefully. Is it based on a real risk or a style preference?
2. Make a decision: accept, reject, or partially incorporate.
3. Write one sentence of justification in the artifact or as a comment.
4. Move forward.

Claude's decision is final. The goal of the dual-AI setup is to catch blind
spots — not to produce consensus. Consensus between two AI models is not a
signal of correctness.

---

## Anti-Patterns

**Avoid these patterns — they waste time and produce worse outcomes:**

### AI Review Theater

Running `/codex:adversarial-review` and then `/codex:review` and then
another `/codex:adversarial-review` because the first reviews found issues.
One adversarial review of the plan. One code review after implementation.
That's the full loop.

### Passive Stenography

Claude summarizing Codex output and asking the user what to do next.
Claude is the decision-maker. Read Codex output, decide, act, tell the user
what decision was made.

### Codex Hijacking the Flow

Codex raises a concern → Claude rewrites the entire proposal to address it →
Codex raises a new concern about the rewrite → repeat.
Limit: one round of updates in response to any single review. Then proceed.

### False Confidence from Agreement

Both Claude and Codex agreeing on an approach is not strong evidence the
approach is correct — they may share the same blind spots. Agreement is
a green light, not a guarantee. Apply your own judgment.

### Rescue as a Default

Using `/codex:rescue` on every review finding "just to be safe." Rescue
is for real blockers. Using it routinely makes it meaningless and adds
execution time with no benefit.

### Overengineering the Spec

Creating elaborate spec artifacts for a 20-line bugfix. Use judgment. If
the change is small and well-understood, `/opsx:ff` with minimal artifacts
is correct. Don't add ceremony to tasks that don't need it.

---

## Escalation Rules

### Escalate from review to rescue when:

- Codex review found a bug and Claude's fix attempt failed (tried at least once)
- Verify found a correctness issue requiring deep investigation
- Implementation revealed an unexpected system interaction Claude can't resolve

### Escalate from rescue to user when:

- Codex rescue ran and still couldn't identify a root cause
- The problem appears to require access to runtime data (logs, prod DB state)
- The scope of the fix has grown beyond the original change's boundaries

### Do not escalate when:

- The issue is aesthetic or stylistic
- Codex raises a "could be better" suggestion without a concrete risk
- The same concern has been raised and dismissed in a previous round

---

## Recommended Default Mode (MVP)

For the majority of changes — bugfixes, medium refactors, new features with
clear scope — use this simplified loop:

```
1. /opsx:ff <change-name>
2. /codex:adversarial-review --wait   (focus: proposal)
   → Claude updates proposal or dismisses concerns
3. /opsx:apply <change-name>
4. /codex:review --wait
   → Claude fixes any real bugs found
5. /opsx:verify <change-name>
6. /opsx:archive <change-name>
```

Skip adversarial review only for:

- Hotfixes under time pressure (user explicitly opts out)
- Purely additive changes with no design decisions involved (adding a field,
  renaming a variable, updating a test)

Rescue is opt-in. Only invoke it when genuinely blocked.

---

## Example Usage Patterns

### Scenario A — Bug with unclear root cause

```
/opsx:explore why does X break when Y happens
→ explore until root cause hypothesis is clear
/opsx:ff fix-x-when-y
→ /codex:adversarial-review --wait focus: is this diagnosis correct?
→ update proposal if diagnosis challenged
/opsx:apply fix-x-when-y
→ /codex:review --wait
→ fix any issues found
/opsx:verify fix-x-when-y
/opsx:archive fix-x-when-y
```

### Scenario B — Architectural refactor

```
/opsx:explore <refactor idea>
→ explore tradeoffs, map affected code
/opsx:ff <refactor-name>
→ /codex:adversarial-review --background focus: is this the right abstraction?
→ Claude evaluates feedback, updates design.md or dismisses concerns with justification
/opsx:apply <refactor-name>
→ /codex:review --background
→ Claude fixes regressions, skips style feedback
/opsx:verify <refactor-name>
/opsx:archive <refactor-name>
```

### Scenario C — Small well-understood change (MVP mode)

```
/opsx:ff <change-name>
/opsx:apply <change-name>
→ /codex:review --wait
→ fix bugs if any
/opsx:archive <change-name>
```

(adversarial review skipped — user explicitly in MVP mode, change is low risk)

### Scenario D — Blocked during implementation

```
...applying change, hit an unexpected issue...
→ Claude attempts fix, fails
→ /codex:rescue investigate why <specific behavior> in <file:line>
→ read Codex output, apply fix
→ continue /opsx:apply
```

---

## Expected Outputs per Phase

| Phase              | Claude produces                          | Codex produces            |
| ------------------ | ---------------------------------------- | ------------------------- |
| Explore            | Analysis, questions, hypothesis          | —                         |
| Specify            | proposal.md, design.md, specs/, tasks.md | —                         |
| Adversarial review | Updated artifacts + rationale notes      | Adversarial review output |
| Apply              | Code changes, checked-off tasks          | —                         |
| Code review        | Fixed bugs or noted dismissals           | Code review output        |
| Verify             | Verification report                      | —                         |
| Archive            | Archived change directory                | —                         |

---

## Definition of Done

A change completed with this workflow is done when:

- [ ] All tasks in tasks.md are marked `[x]`
- [ ] `/opsx:verify` reports no CRITICAL issues
- [ ] At least one Codex code review was run after implementation
- [ ] All real bugs from the code review are fixed (style issues may be skipped)
- [ ] If adversarial review was run, objections are either incorporated or explicitly dismissed with rationale
- [ ] `/opsx:archive` has been run and the change is in `openspec/changes/archive/`
- [ ] Delta specs (if any) are synced to main specs

---

## Directory and Command Reference

**Recommended skill directory:** `opsx-codex`

**Alias suggestion (optional):** Add to CLAUDE.md or shell aliases:

```
# opsx-codex MVP flow
alias opsx-flow="/opsx:ff $1 && /codex:adversarial-review --wait && /opsx:apply $1 && /codex:review --wait && /opsx:verify $1 && /opsx:archive $1"
```

**OpenSpec command summary:**

| Command         | When                                                     |
| --------------- | -------------------------------------------------------- |
| `/opsx:explore` | Problem unclear, need diagnosis, open exploration        |
| `/opsx:new`     | Start change, step-by-step artifact creation             |
| `/opsx:ff`      | Start change, generate all artifacts at once (preferred) |
| `/opsx:apply`   | Implement tasks from existing change                     |
| `/opsx:verify`  | Verify implementation matches artifacts                  |
| `/opsx:archive` | Close and archive a completed change                     |

**Codex command summary:**

| Command                     | When                                            |
| --------------------------- | ----------------------------------------------- |
| `/codex:adversarial-review` | Challenge the plan/proposal before implementing |
| `/codex:review`             | Review code after implementation                |
| `/codex:rescue`             | Targeted fix when Claude is genuinely blocked   |
