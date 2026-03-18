---
name: tw-status
description: View or update work status for the current or specified ticket workspace
model: sonnet
argument-hint: "[view|update|sync] [PROJ-123]"
---

# Work Status

View or update the status tracking file for a ticket workspace.

## Use When
- User says "작업 상태", "상태 확인", "work status", "진행 상황"
- User wants to update progress checklist
- User wants to sync status from Jira/git/PR

## Commands

| Command | Description |
|---------|-------------|
| `view [PROJ-123]` | Show current status (default) |
| `update [PROJ-123]` | Update progress checklist items |
| `sync [PROJ-123]` | Sync status from Jira, git, and PR |

## Steps

### Detect Workspace

Same as `tw-log`: resolve from argument, cwd, or ask user.

### `view` -- Show Status

1. Read `status.md` and `.tw-config.json`
2. Display formatted status with progress percentage
3. Show any blockers

### `update` -- Update Progress

1. Read current `status.md`
2. Show checklist items via `AskUserQuestion` with `multiSelect: true`:
   ```
   Question: "완료된 항목을 선택하세요."
   Options:
   - [ ] Repository cloned
   - [ ] Branch created
   - [ ] Implementation
   - [ ] Tests
   - [ ] Code review
   - [ ] Deployed
   ```
3. Update selected items to `[x]` in `status.md`
4. Ask if any items should be marked `[>]` (in progress) or `[!]` (blocked)
5. Update `Last Activity` timestamp
6. Show updated status

### `sync` -- Sync from Live Sources

1. **Jira status**: `ToolSearch("+atlassian jira")` → `mcp__mcp-atlassian__jira_get_issue`
2. **Branch info**: read `.tw-config.json` for repo path, then:
   ```bash
   cd {repo-dir} && git branch --show-current
   ```
3. **PR status** (if gh CLI available):
   ```bash
   cd {repo-dir} && gh pr list --head {branch-name} --json number,state,title --limit 1
   ```
4. Update `status.md` Current State table with live data
5. Update `.tw-config.json` with latest status
6. Show updated status

## Status Markers

| Marker | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[>]` | In progress |
| `[!]` | Blocked |

## Final Checklist
- [ ] Workspace detected correctly
- [ ] status.md read and parsed
- [ ] Checklist updated with user selections (for `update`)
- [ ] Live data fetched from Jira/git/PR (for `sync`)
- [ ] status.md and .tw-config.json updated
- [ ] Last Activity timestamp updated
