---
name: tw-list
description: List all ticket workspaces with status overview -- active, archived, and stale
model: sonnet
argument-hint: "[--active] [--archived] [--all]"
---

# List Workspaces

Show an overview of all ticket workspaces.

## Use When
- User says "워크스페이스 목록", "list workspace", "열린 티켓"
- User wants to see all active/archived workspaces

## Steps

1. **Read workspace root** from `~/.claude/CLAUDE.md` (`tw-workspace:` line)

2. **Scan workspace directories**

   ```bash
   ls -d {workspace-root}/*/  # active workspaces
   ls -d {workspace-root}/_archived/*/  # archived workspaces (if exists)
   ```

3. **Read metadata for each workspace**

   For each directory, read `.tw-config.json`:
   - ticket, summary, status, branch, workspaceStatus, createdAt

   If `.tw-config.json` is missing, skip or mark as "unknown".

4. **Classify workspaces**

   | Category | Condition |
   |----------|-----------|
   | Active | `workspaceStatus == "active"` |
   | Stale | Active but no file modified in 7+ days |
   | Closed | `workspaceStatus == "closed"` |
   | Archived | Located in `_archived/` |

   Check staleness:
   ```bash
   find {workspace-dir} -name "work-log.md" -mtime -7
   ```

5. **Display results** via `AskUserQuestion` with markdown preview

   ```
   Ticket Workspaces
   =================

   Active:
     PROJ-123  In Progress  feature/PROJ-123-jwt-refresh   3h ago
     PROJ-456  Code Review  fix/PROJ-456-login-timeout     1d ago

   Stale (7+ days inactive):
     PROJ-789  In Progress  feature/PROJ-789-user-profile  12d ago

   Archived:
     PROJ-100  Done         (archived 2026-03-10)

   ------------------
   Active: 2  |  Stale: 1  |  Archived: 1
   ```

6. **Offer actions** for stale workspaces

   If stale workspaces exist:
   ```
   Question: "오래된 워크스페이스를 정리할까요?"
   Options:
   - Archive stale workspaces
   - Leave as is
   ```

## Flags

| Flag | Behavior |
|------|----------|
| `--active` | Show only active workspaces (default) |
| `--archived` | Show only archived workspaces |
| `--all` | Show all workspaces |

## Final Checklist
- [ ] Workspace root resolved
- [ ] All workspace directories scanned
- [ ] .tw-config.json read for each workspace
- [ ] Workspaces classified (active/stale/closed/archived)
- [ ] Formatted table displayed
- [ ] Stale workspace cleanup offered
