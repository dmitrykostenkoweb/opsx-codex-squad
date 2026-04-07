# opsx-codex-squad

A Claude Code skill that integrates OpenSpec and the Codex plugin into a
spec-driven, checkpoint-based development workflow.

**Claude owns the process. Codex is the critic.**

---

## What This Is

A skill file (`SKILL.md`) that Claude Code loads into context and uses to
orchestrate a dual-AI workflow:

- **Claude** drives the full OpenSpec cycle: explore → specify → implement → verify → archive
- **Codex** acts as an independent adversarial reviewer at defined checkpoints
  and as an optional rescue agent when Claude is genuinely blocked

The workflow is structured around checkpoints, not continuous debate. One
adversarial review of the plan. One code review after implementation. Claude
decides what to do with the feedback. Done.

---

## Why It Exists

Using OpenSpec and Codex separately is straightforward. Using them together
without a clear protocol produces:

- duplicate work (both AIs reasoning about the same things)
- "AI review theater" (endless re-reviews that don't converge)
- unclear ownership (neither AI commits to a decision)
- false confidence (consensus between two AIs is not evidence of correctness)

This skill defines the protocol: who does what, when, and how disagreements
are resolved.

---

## Role Separation

| Role               | Tool   | Responsibility                                          |
| ------------------ | ------ | ------------------------------------------------------- |
| Process owner      | Claude | Drives OpenSpec, creates artifacts, implements, decides |
| Independent critic | Codex  | Challenges plan, reviews code, investigates blockers    |
| Final authority    | You    | Approves direction, owns the outcome                    |

Claude is not a passive stenographer. Codex is not a co-owner.
When Codex raises an objection, Claude evaluates it, makes a decision,
records the rationale, and moves forward.

---

## Workflow Summary

```
Phase 0  Orient        — pick entry point (explore vs ff vs continue)
Phase 1  Explore       — /opsx:explore  (optional, for unclear problems)
Phase 2  Specify       — /opsx:ff or /opsx:new
         Checkpoint B  — /codex:adversarial-review  ← mandatory for arch changes
Phase 3  Implement     — /opsx:apply
Phase 4  Code Review   — /codex:review  ← always
Phase 5  Verify        — /opsx:verify
Phase 6  Archive       — /opsx:archive
```

### MVP Loop (most changes)

```
/opsx:ff <change-name>
/codex:adversarial-review --wait
/opsx:apply <change-name>
/codex:review --wait
/opsx:verify <change-name>
/opsx:archive <change-name>
```

See [`examples/usage.md`](examples/usage.md) for detailed scenarios including
architectural refactors, blocked-mid-implementation rescue, and small hotfixes.

---

## Dependencies (Required — Not Included)

> **This skill is not self-contained.**
> It requires the following tools to already be installed and working
> in your Claude Code environment:

### 1. Claude Code

The skill runs inside Claude Code. Without it, none of this applies.
Install: https://claude.ai/code

### 2. OpenSpec

Provides the `openspec` CLI and the `/opsx:*` slash commands:
`/opsx:explore`, `/opsx:ff`, `/opsx:new`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`

OpenSpec manages change artifacts (proposal, design, specs, tasks) inside your repo
under `openspec/changes/<change-name>/`.

Install OpenSpec per its own documentation and ensure `openspec` is on your `$PATH`.
The `/opsx:*` commands must be available in your Claude Code project
(typically via `.claude/commands/opsx/`).

### 3. Codex Plugin for Claude Code (`codex-plugin-cc`)

Provides the `/codex:*` slash commands:
`/codex:adversarial-review`, `/codex:review`, `/codex:rescue`

Install via Claude Code's plugin system:

```
/install codex
```

Or follow the instructions at: https://github.com/openai/codex-plugin-cc

---

## Installation

### Option A — npx (no global install)

```bash
npx opsx-codex-squad
```

Copies the skill into `~/.claude/skills/opsx-codex/` and prints next steps.

### Option B — Global npm install

```bash
npm install -g opsx-codex-squad
opsx-codex-squad-install
```

After installing globally, `opsx-codex-squad-install` and `opsx-codex-squad-uninstall`
are available as shell commands.

### Option C — Manual from GitHub

```bash
git clone https://github.com/YOUR_USERNAME/opsx-codex-squad.git
cd opsx-codex-squad
node scripts/install.js
```

### Custom install path

If your Claude Code skills directory is not `~/.claude/skills/`:

```bash
CLAUDE_SKILLS_DIR=/path/to/skills npx opsx-codex-squad
# or
CLAUDE_SKILLS_DIR=/path/to/skills node scripts/install.js
```

### Default install path

The installer targets `~/.claude/skills/opsx-codex/` by default.
This is the standard Claude Code user-level skills directory.
Override with `CLAUDE_SKILLS_DIR` if needed.

---

## Verification

After installing, start Claude Code and check the skill is loaded:

```
/skills
```

You should see `opsx-codex` in the list. The skill auto-triggers when you
start spec-driven work — no manual `/opsx-codex` invocation needed.

To verify the external dependencies are working:

```
/opsx:explore test
/codex:status
```

If both respond, the full workflow is available.

---

## Uninstall

```bash
# If installed via npm globally:
opsx-codex-squad-uninstall

# If installed manually:
node scripts/uninstall.js

# Manual removal:
rm -rf ~/.claude/skills/opsx-codex
```

---

## Decision Rules (Short Version)

**When adversarial review is mandatory:**

- Architectural changes (new abstractions, module boundaries, state flow changes)
- Changes touching security, auth, or data integrity
- Any change estimated at more than ~1–2 hours of work

**When to trigger rescue:**

- Only when Claude has tried to fix a specific issue and failed at least once
- Not as a "second opinion just in case"

**When to stop iterating:**

- One adversarial review + one code review = full loop
- Max two review cycles per change total
- Remaining stylistic feedback: log and skip

**How Codex disagreements are resolved:**
Claude evaluates the objection, picks accept / reject / partial, records one
sentence of rationale, and moves forward. Codex does not get a veto.

---

## Anti-Patterns This Workflow Prevents

| Pattern                         | Prevention                                                     |
| ------------------------------- | -------------------------------------------------------------- |
| AI review theater               | Max one adversarial review, one code review per change         |
| Passive stenography             | Claude decides; it doesn't relay Codex output and ask the user |
| Codex hijacking the flow        | One round of updates per review, then proceed                  |
| False confidence from agreement | Explicitly called out — agreement ≠ correctness                |
| Rescue as default               | Rescue is gated behind a genuine failed-fix attempt            |
| Overengineering the spec        | Judgment-based: small changes don't need elaborate artifacts   |

---

## Limitations

- **Requires external tools.** The skill itself is a single Markdown file. The
  actual functionality depends entirely on OpenSpec and the Codex plugin being
  installed and working.
- **Codex availability.** `/codex:*` commands require an active Codex API
  subscription and the plugin being installed in Claude Code.
- **OpenSpec setup per repo.** OpenSpec typically needs to be initialized in
  each repository (`openspec init`). The skill assumes this has been done.
- **Not a guaranteed outcome.** This skill structures how two AI tools collaborate.
  It does not guarantee correct code. The developer remains responsible for
  reviewing and approving all changes.

---

## Publishing (npm)

Replace `YOUR_USERNAME` in `package.json` and `README.md`, then:

```bash
# First publish
npm login
npm publish --access public

# Updates
npm version patch   # or minor / major
npm publish
```

---

## Contributing

Bug reports and improvements welcome. Open an issue or PR on GitHub.

If you extend the skill for a different OpenSpec schema or a different
review-model combination, consider keeping it in a fork with a distinct name
so users know what they're installing.

---

## License

MIT — see [LICENSE](LICENSE).
