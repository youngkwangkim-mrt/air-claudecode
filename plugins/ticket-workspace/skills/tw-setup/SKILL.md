---
name: tw-setup
description: ticket-workspace setup wizard -- configure workspace root, prerequisites check, CLAUDE.md block management
model: sonnet
argument-hint: "[--check] [--force] [--help]"
---

# Ticket Workspace Setup

Configure the ticket-workspace plugin. Sets the workspace root directory and verifies prerequisites.

## Use When
- First time using ticket-workspace
- User says "tw setup", "워크스페이스 설정", "workspace setup"

## Do Not Use When
- User wants to open a specific ticket workspace -- use `tw-open`

## Steps

1. **Pre-flight checks** (run in parallel)

   ```bash
   # Atlassian MCP check
   ToolSearch("+atlassian jira")

   # git check
   which git && echo "GIT_INSTALLED=true" || echo "GIT_INSTALLED=false"

   # gh CLI check
   which gh && gh auth status 2>&1
   ```

2. **Read current config**

   Check `~/.claude/CLAUDE.md` for existing `<!--ticket-workspace:start-->` block.
   Extract `tw-workspace:` path if present.

3. **Ask workspace root** via `AskUserQuestion`

   If no existing config:
   ```
   Question: "워크스페이스 루트 경로를 지정해주세요."
   Default suggestion: ~/Desktop/ticket-workspace
   ```

   If existing config found:
   ```
   Question: "기존 워크스페이스 경로가 있습니다: {path}. 유지할까요?"
   Options: Keep / Change / Cancel
   ```

4. **Create workspace root** if it does not exist
   ```bash
   mkdir -p {workspace-root}
   ```

5. **Write CLAUDE.md block**

   Create or replace the `<!--ticket-workspace:start-->` / `<!--ticket-workspace:end-->` block:

   ```markdown
   <!--ticket-workspace:start-->
   <!-- ticket-workspace v0.1.0 -- auto-generated, do not edit manually -->
   <!-- To update: /ticket-workspace:tw-setup -->
   tw-workspace: {workspace-root}
   <!--ticket-workspace:end-->
   ```

   - File doesn't exist: create `~/.claude/CLAUDE.md` with just the block
   - Block doesn't exist: append at end
   - Block exists: replace entire block

6. **Show status report** via `AskUserQuestion`

   ```
   ticket-workspace Setup (v0.1.0)
   ================================

   Prerequisites
     git              OK
     gh CLI           OK   authenticated as @username
     Atlassian MCP    OK   connected

   Workspace
     Path             {workspace-root}
     CLAUDE.md        OK   block written

   Ready to use: /ticket-workspace:tw-open PROJ-123
   ```

## Flags

| Flag | Behavior |
|------|----------|
| `--check` | Show status only, no changes |
| `--force` | Skip existing config detection |
| `--help` | Show help text |

## Final Checklist
- [ ] Prerequisites checked (git, gh CLI, Atlassian MCP)
- [ ] Workspace root path confirmed by user
- [ ] Directory created if needed
- [ ] CLAUDE.md block written/updated
- [ ] Status report shown
