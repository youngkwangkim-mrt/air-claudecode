#!/usr/bin/env node

/**
 * SessionStart hook:
 * 1. Injects agent catalog into Claude's context.
 * 2. Detects if cwd is inside a ticket workspace and injects context.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

async function detectWorkspaceContext(cwd) {
  if (!cwd) return null;

  try {
    // Check if cwd is inside a ticket workspace by looking for .tw-config.json
    // Walk up directories to find it
    let dir = cwd;
    for (let i = 0; i < 5; i++) {
      try {
        const configPath = join(dir, ".tw-config.json");
        const config = JSON.parse(await readFile(configPath, "utf-8"));
        if (config.ticket) {
          return {
            ticket: config.ticket,
            summary: config.summary || "",
            status: config.status || "",
            branch: config.branch || "",
            path: dir,
          };
        }
      } catch {
        // Not found at this level, go up
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
    // Ignore errors
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

  const cwd = data.cwd || data.directory || "";

  const [agents, wsContext] = await Promise.all([
    loadAgents(),
    detectWorkspaceContext(cwd),
  ]);

  const parts = [];

  if (agents.length > 0) {
    const catalog = agents
      .map((a) => `- **${a.name}** (${a.model}): ${a.description}`)
      .join("\n");

    parts.push(`# ticket-workspace Agents

Available agents:
${catalog}

Agent prompts are located at: ${AGENTS_DIR}/`);
  }

  if (wsContext) {
    parts.push(
      `[ticket-workspace] Active ticket: ${wsContext.ticket} - ${wsContext.summary}\nStatus: ${wsContext.status} | Branch: ${wsContext.branch}\nWorkspace: ${wsContext.path}`,
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
