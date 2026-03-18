---
name: tw-log
description: Add, view, or search work log entries for the current or specified ticket workspace
model: sonnet
argument-hint: "[add|view|today|summary] [PROJ-123] [details]"
---

# Work Log

Manage work log entries in a ticket workspace.

## Use When
- User says "작업 로그", "로그 추가", "work log", "add log"
- User wants to record what they did on a ticket
- User wants to view or summarize work done

## Commands

| Command | Description |
|---------|-------------|
| `add "entry"` | Add a timestamped log entry |
| `view [PROJ-123]` | View full work log for a ticket |
| `today [PROJ-123]` | Show today's log entries only |
| `summary [PROJ-123]` | Generate summary, optionally post to Jira |

## Steps

### Detect Workspace

1. If ticket ID provided as argument, use `{workspace-root}/{TICKET-KEY}/`
2. If no ticket ID, check cwd:
   - If inside a workspace folder, detect ticket from path or `.tw-config.json`
   - If not inside a workspace, ask user for ticket ID
3. Read workspace root from `~/.claude/CLAUDE.md` (`tw-workspace:` line)
4. Verify `work-log.md` exists in the workspace

### `add` -- Add Log Entry

1. Get current timestamp: `date +"%Y-%m-%d"` and `date +"%H:%M"`
2. Read existing `work-log.md`
3. Check if today's date section (`## YYYY-MM-DD`) exists
   - If not: append new date section
4. Append entry under today's section:
   ```markdown
   ### HH:mm - {entry title}
   - {detail bullet points}
   ```
5. If `--git-summary` flag: capture `git diff --stat` and append
6. Show confirmation

### `view` -- View Full Log

1. Read and display `work-log.md` content
2. Show ticket summary from `.tw-config.json`

### `today` -- Today's Entries

1. Read `work-log.md`
2. Extract only today's date section (`## YYYY-MM-DD`)
3. Display entries or "No entries for today"

### `summary` -- Generate Summary

1. Read `work-log.md`
2. Generate concise summary grouped by date
3. Ask via `AskUserQuestion`:
   - "이 요약을 Jira 코멘트로 게시할까요?"
   - Options: Post to Jira / Copy only / Cancel
4. If "Post to Jira":
   - `ToolSearch("+atlassian jira")`
   - `mcp__mcp-atlassian__jira_add_comment` with the summary

### `summary --standup` -- Standup Report

1. Scan all active workspaces in `{workspace-root}/`
2. For each workspace with entries in the last 24 hours, read work-log.md
3. Generate standup format:
   ```
   Standup Report - YYYY-MM-DD
   ===========================

   PROJ-123 (In Progress):
   - Implemented token rotation logic
   - Added unit tests

   PROJ-456 (Code Review):
   - Addressed review comments
   ```

## Log Format Guide

```markdown
## YYYY-MM-DD

### HH:mm - Short Title
- Detail bullet point
- Another detail
- Git: 3 files changed, 45 insertions(+), 12 deletions(-)
```

- Entries are chronological, grouped by date
- Each entry has a timestamp and short title
- Bullet points for details
- Optional git diff stat with `--git-summary`

## Final Checklist
- [ ] Workspace detected (from argument, cwd, or user input)
- [ ] work-log.md located and readable
- [ ] Entry appended under correct date section (for `add`)
- [ ] Timestamp is accurate
- [ ] Summary generated correctly (for `summary`)
- [ ] Jira comment posted if user chose to (for `summary`)
