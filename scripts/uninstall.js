#!/usr/bin/env node
// uninstall.js — removes the opsx-codex skill from the Claude Code skills directory.
// Zero dependencies. Requires Node 18+.

import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SKILL_NAME = "opsx-codex";

const skillsRoot =
  process.env.CLAUDE_SKILLS_DIR ?? join(homedir(), ".claude", "skills");
const skillDest = join(skillsRoot, SKILL_NAME);

console.log(`\nUninstalling skill: ${SKILL_NAME}`);
console.log(`  path: ${skillDest}\n`);

if (!existsSync(skillDest)) {
  console.log(`  Skill directory not found — nothing to remove.\n`);
  process.exit(0);
}

try {
  rmSync(skillDest, { recursive: true, force: true });
} catch (err) {
  console.error(`\n✗ Uninstall failed: ${err.message}\n`);
  process.exit(1);
}

console.log(`✓ Skill removed.\n`);
