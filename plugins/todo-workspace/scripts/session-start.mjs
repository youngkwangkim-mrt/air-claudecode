#!/usr/bin/env node

/**
 * SessionStart hook:
 * 1. Injects agent catalog into Claude's context.
 * 2. Detects if todo-workspace is configured and injects workspace path.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(__dirname, "..");
const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
  }
  return meta;
}

async function loadAgents() {
  try {
    const files = await readdir(AGENTS_DIR);
    const agents = [];
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const content = await readFile(join(AGENTS_DIR, file), "utf-8");
      const meta = parseFrontmatter(content);
      if (meta.name) {
        agents.push({
          name: meta.name,
          description: meta.description || "",
          model: meta.model || "sonnet",
        });
      }
    }
    return agents;
  } catch {
    return [];
  }
}

async function detectWorkspaceConfig() {
  try {
    const claudeMd = await readFile(
      join(homedir(), ".claude", "CLAUDE.md"),
      "utf-8",
    );
    const match = claudeMd.match(/td-workspace:\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch {
    // CLAUDE.md not found or no td-workspace line
  }
  return null;
}

async function main() {
  const input = await readStdin();
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    data = {};
  }

  const [agents, workspacePath] = await Promise.all([
    loadAgents(),
    detectWorkspaceConfig(),
  ]);

  const parts = [];

  if (agents.length > 0) {
    const catalog = agents
      .map((a) => `- **${a.name}** (${a.model}): ${a.description}`)
      .join("\n");

    parts.push(`# todo-workspace Agents

Available agents:
${catalog}

Agent prompts are located at: ${AGENTS_DIR}/`);
  }

  if (workspacePath) {
    parts.push(
      `[todo-workspace] Workspace configured at: ${workspacePath}`,
    );
  }

  if (parts.length === 0) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  console.log(JSON.stringify({ continue: true, message: parts.join("\n\n") }));
}

main().catch(() => {
  console.log(JSON.stringify({ continue: true }));
});
