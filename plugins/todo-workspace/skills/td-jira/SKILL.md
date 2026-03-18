---
name: td-jira
description: Jira integration -- link tasks to issues, sync status, import/push
model: sonnet
argument-hint: "link \"keyword\" PROJ-123 | sync | import PROJ-123 | push \"keyword\""
---

Base directory for this skill: ${SKILL_DIR}

# td-jira

Jira integration for todo-workspace. Link tasks to Jira issues, sync status, import issues as tasks, and push tasks as new issues.

## Use When
- User says "td jira", "td 지라", "지라 연동", "jira link", "jira sync"
- User wants to connect tasks with Jira issues

## Prerequisites

Atlassian MCP must be available. Verify with `ToolSearch("+atlassian jira")`.
If not available, inform user and exit.

## Initialization

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. Read `$WS/.td-config.json` for Jira config (defaultProject, syncOnView)
3. Store resolved path as `$WS`

## Commands

---

### `/td-jira link "keyword" PROJ-123` — Link Task to Jira Issue

1. **Find task** by keyword in today's section (case-insensitive substring match)
2. **If multiple matches**: Let user select via `AskUserQuestion`
3. **Fetch Jira issue**: Use `mcp__mcp-atlassian__jira_get_issue` with the issue key
4. **Add link**: Append `[PROJ-123](https://jira.example.com/browse/PROJ-123)` to the task line
5. **Map Jira status to task marker** (optional, ask user):
   - "To Do" → `[ ]`
   - "In Progress" → `[>]`
   - "Done" → `[x]`
   - Custom blocked status → `[!]`
6. **Confirm**: Show updated task line

---

### `/td-jira sync` — Sync Jira-Linked Task Statuses

1. **Scan** today's section for tasks with Jira links (pattern: `[PROJ-\d+](url)`)
2. **For each linked task**:
   - Extract issue key from markdown link
   - Fetch current status via `mcp__mcp-atlassian__jira_get_issue`
   - Map Jira status to task marker:
     - "To Do", "Open", "Backlog" → `[ ]`
     - "In Progress", "In Review" → `[>]`
     - "Done", "Closed", "Resolved" → `[x]`
     - Statuses containing "block" → `[!]`
   - Update task marker if changed
3. **Report**: Show summary of changes (N tasks synced, M updated)

---

### `/td-jira import PROJ-123` — Import Jira Issue as Task

1. **Fetch issue**: Use `mcp__mcp-atlassian__jira_get_issue`
2. **Map fields**:
   - Summary → task text
   - Priority: Highest/High → P0, Medium → P1, Low/Lowest → P2
   - Assignee → @assignee
   - Issue key → `[PROJ-123](url)` link
3. **Ask confirmation** via `AskUserQuestion`: Show mapped task, ask priority override
4. **Write**: Add task to today's section under selected priority
5. **Confirm**: Show added task

---

### `/td-jira push "keyword"` — Create Jira Issue from Task

1. **Find task** by keyword in today's section
2. **If multiple matches**: Let user select
3. **Map fields**:
   - Task text → Summary
   - Priority: P0 → Highest, P1 → Medium, P2 → Low
   - Tags → Labels (optional)
   - Default project from `.td-config.json`
4. **Ask confirmation** via `AskUserQuestion`: Show preview of Jira issue to create
5. **Create**: Use `mcp__mcp-atlassian__jira_create_issue`
6. **Link back**: Add `[PROJ-123](url)` to the task line
7. **Confirm**: Show updated task with Jira link

---

## Rules

- All Jira write operations (create, transition) require explicit user confirmation
- Never auto-push task status to Jira (only explicit via sync or done flow)
- Default project from `.td-config.json` can be overridden per command
- Jira URL pattern extracted from the issue's `self` field

## Final Checklist
- [ ] Atlassian MCP availability verified before operations
- [ ] Task-to-Jira status mapping correct
- [ ] Links use markdown format `[KEY](url)`
- [ ] User confirmation before all Jira writes
- [ ] Config defaults used but overridable
