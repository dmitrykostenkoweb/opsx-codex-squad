#!/usr/bin/env node
// install.js — copies the opsx-codex skill into the Claude Code skills directory.
// Zero dependencies. Requires Node 18+.

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// ─── Resolve paths ────────────────────────────────────────────────────────────

const SKILL_NAME = "opsx-codex";

// Source: the skill/ directory bundled with this package.
const skillSrc = resolve(__dirname, "..", "skill");

// Target: configurable via env var, falls back to ~/.claude/skills/
const skillsRoot =
  process.env.CLAUDE_SKILLS_DIR ?? join(homedir(), ".claude", "skills");
const skillDest = join(skillsRoot, SKILL_NAME);

// ─── Pre-flight checks ────────────────────────────────────────────────────────

if (!existsSync(skillSrc)) {
  fatal(`Source skill directory not found: ${skillSrc}`);
}

// The skills root doesn't have to exist — we'll create it if CLAUDE_SKILLS_DIR
// was explicitly set. But if using the default path and ~/.claude doesn't exist,
// that likely means Claude Code isn't installed.
const claudeDir = join(homedir(), ".claude");
if (!process.env.CLAUDE_SKILLS_DIR && !existsSync(claudeDir)) {
  fatal(
    `~/.claude directory not found.\n` +
      `  Claude Code does not appear to be installed on this machine.\n` +
      `  Install Claude Code first: https://claude.ai/code\n` +
      `  Or set CLAUDE_SKILLS_DIR to a custom path and retry.`
  );
}

// ─── Install ──────────────────────────────────────────────────────────────────

const isUpdate = existsSync(skillDest);
const verb = isUpdate ? "Updating" : "Installing";

console.log(`\n${verb} skill: ${SKILL_NAME}`);
console.log(`  from : ${skillSrc}`);
console.log(`  to   : ${skillDest}\n`);

try {
  mkdirSync(skillsRoot, { recursive: true });
  cpSync(skillSrc, skillDest, { recursive: true, force: true });
} catch (err) {
  fatal(`Copy failed: ${err.message}`);
}

console.log(`✓ Skill installed at: ${skillDest}\n`);
console.log(`Next steps:`);
console.log(`  1. Make sure OpenSpec commands are available in your repo`);
console.log(`     (opsx:explore, opsx:ff, opsx:apply, opsx:verify, opsx:archive)`);
console.log(`  2. Make sure the Codex plugin is installed in Claude Code`);
console.log(`     (codex:adversarial-review, codex:review, codex:rescue)`);
console.log(`  3. Start a session with Claude Code — the skill auto-triggers`);
console.log(`     when you say "let's use opsx-codex" or begin spec-driven work.\n`);
console.log(`  See examples/ in the repo for sample workflows.\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fatal(msg) {
  console.error(`\n✗ Install failed:\n  ${msg}\n`);
  process.exit(1);
}
