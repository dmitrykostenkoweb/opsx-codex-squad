#!/usr/bin/env node
// install.js — installs the opsx-codex skill and /squad command into Claude Code.
// Zero dependencies. Requires Node 18+.

import { cpSync, copyFileSync, existsSync, mkdirSync, lstatSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// ─── Resolve paths ────────────────────────────────────────────────────────────

const SKILL_NAME = "opsx-codex";

const skillSrc    = resolve(__dirname, "..", "opsx-codex");
const commandSrc  = resolve(__dirname, "..", "commands", "squad.md");

const claudeDir   = join(homedir(), ".claude");
const skillsRoot  = process.env.CLAUDE_SKILLS_DIR ?? join(claudeDir, "skills");
const commandsDir = process.env.CLAUDE_COMMANDS_DIR ?? join(claudeDir, "commands");

const skillDest   = join(skillsRoot, SKILL_NAME);
const commandDest = join(commandsDir, "squad.md");

// ─── Pre-flight checks ────────────────────────────────────────────────────────

if (!existsSync(skillSrc))   fatal(`Source skill directory not found: ${skillSrc}`);
if (!existsSync(commandSrc)) fatal(`Source command file not found: ${commandSrc}`);

if (!process.env.CLAUDE_SKILLS_DIR && !existsSync(claudeDir)) {
  fatal(
    `~/.claude directory not found.\n` +
    `  Claude Code does not appear to be installed on this machine.\n` +
    `  Install Claude Code first: https://claude.ai/code\n` +
    `  Or set CLAUDE_SKILLS_DIR / CLAUDE_COMMANDS_DIR to custom paths and retry.`
  );
}

// ─── Install skill ────────────────────────────────────────────────────────────

const skillVerb = existsSync(skillDest) ? "Updating" : "Installing";
console.log(`\n${skillVerb} skill: ${SKILL_NAME}`);
console.log(`  from : ${skillSrc}`);
console.log(`  to   : ${skillDest}`);

// If skillDest is already a symlink pointing at skillSrc, skip the copy.
const isSymlink = existsSync(skillDest) && lstatSync(skillDest).isSymbolicLink();
const alreadyLinked = isSymlink && realpathSync(skillDest) === realpathSync(skillSrc);

if (alreadyLinked) {
  console.log(`✓ Skill is symlinked to source — skipping copy\n`);
} else {
  try {
    mkdirSync(skillsRoot, { recursive: true });
    cpSync(skillSrc, skillDest, { recursive: true, force: true });
  } catch (err) {
    fatal(`Skill copy failed: ${err.message}`);
  }
  console.log(`✓ Skill installed\n`);
}

// ─── Install /squad command ───────────────────────────────────────────────────

const cmdVerb = existsSync(commandDest) ? "Updating" : "Installing";
console.log(`${cmdVerb} command: /squad`);
console.log(`  from : ${commandSrc}`);
console.log(`  to   : ${commandDest}`);

try {
  mkdirSync(commandsDir, { recursive: true });
  copyFileSync(commandSrc, commandDest);
} catch (err) {
  fatal(`Command copy failed: ${err.message}`);
}

console.log(`✓ Command installed\n`);

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log(`Ready. How to use:`);
console.log(`  /squad <problem or change-name>   — start or continue the workflow`);
console.log(`\nDependencies required in Claude Code:`);
console.log(`  • OpenSpec  (opsx:explore, opsx:ff, opsx:apply, opsx:verify, opsx:archive)`);
console.log(`  • Codex plugin  (codex:adversarial-review, codex:review, codex:rescue)\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fatal(msg) {
  console.error(`\n✗ Install failed:\n  ${msg}\n`);
  process.exit(1);
}
