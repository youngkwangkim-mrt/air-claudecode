---
name: td-setup
description: Configure todo-workspace -- workspace root, Jira/Slack integration, prerequisites check
model: sonnet
argument-hint: "[--check] [--force] [--jira] [--slack]"
---

Base directory for this skill: ${SKILL_DIR}

# td-setup

Configure the todo-workspace plugin. Creates workspace directory structure, scaffold files, and writes the CLAUDE.md configuration block.

## Use When
- User says "td setup", "td 설정", "todo workspace setup"
- First-time setup of todo-workspace
- Reconfiguring workspace path or integrations

## Flags
- `--check`: Show current status without making changes
- `--force`: Overwrite existing configuration
- `--jira`: Configure Jira integration during setup
- `--slack`: Configure Slack integration during setup

## Workflow

### 1. Pre-flight Checks

Run these checks and report status:

```bash
# Check prerequisites
which git 2>/dev/null && echo "git: OK" || echo "git: MISSING"
which gh 2>/dev/null && echo "gh: OK" || echo "gh: OPTIONAL (not installed)"
```

Also check MCP tool availability:
- **Atlassian MCP**: Use `ToolSearch("+atlassian jira")` — report available/unavailable
- **Slack MCP**: Use `ToolSearch("+slack")` — report available/unavailable

If `--check` flag: show status report and exit.

### 2. Read Existing Config

Read `~/.claude/CLAUDE.md` and look for `td-workspace:` line inside `<!--todo-workspace:start-->` block.

If found and `--force` not specified:
- Show current workspace path
- Ask: "Reconfigure?" via `AskUserQuestion`
- If no: exit

### 3. Ask Workspace Root

Use `AskUserQuestion` to ask workspace location:
- Default: `~/Desktop/todo-workspace`
- Let user provide custom path

### 4. Create Directory Structure

```bash
ls {workspace}  # verify parent exists
```

Create if not exists:
```
{workspace}/
├── templates/
│   └── weekly.md
├── recurring/
│   └── rules.json
├── metrics/
│   └── streaks.json
├── backlog.md
├── topics.md
└── .td-config.json
```

**File contents:**

**`templates/weekly.md`**: Copy from `references/format-guide.md` (Weekly Template section)

**`backlog.md`**:
```markdown
# Backlog

## P1

## P2

## Ideas
```

**`topics.md`**:
```markdown
# Topics

> Active projects and areas of work. Tasks use %topic-name to link here.

## Active

## Archived
```

**`recurring/rules.json`**:
```json
{
  "rules": []
}
```

**`metrics/streaks.json`**:
```json
{
  "lastUpdated": "",
  "currentStreak": 0,
  "longestStreak": 0,
  "streakStartDate": "",
  "weeklyCompletionRates": {},
  "dailyHistory": []
}
```

**`.td-config.json`**: Generate with current timestamp:
```json
{
  "version": "0.1.0",
  "createdAt": "{ISO timestamp}",
  "workspace": "{workspace path}",
  "jira": {
    "enabled": false,
    "defaultProject": "",
    "syncOnView": false
  },
  "slack": {
    "enabled": false,
    "digestChannel": "",
    "standupChannel": "",
    "autoDigest": false
  },
  "recurring": {
    "enabled": true
  },
  "autoCarry": {
    "enabled": true,
    "skipWeekends": false
  },
  "locale": "ko"
}
```

### 5. Optional: Configure Jira (if `--jira` or asked)

If Atlassian MCP is available:
1. Ask for default Jira project key (e.g., "PROJ")
2. Ask if sync-on-view should be enabled
3. Update `.td-config.json` with `jira.enabled: true`, `jira.defaultProject`, `jira.syncOnView`

### 6. Optional: Configure Slack (if `--slack` or asked)

If Slack MCP is available:
1. Ask for digest channel name (e.g., "#daily-standup")
2. Ask for standup channel name (can be same)
3. Update `.td-config.json` with `slack.enabled: true`, channels

### 7. Write CLAUDE.md Block

Read `~/.claude/CLAUDE.md` and manage the `<!--todo-workspace:start-->` block:

**If block already exists**: Replace entire block content between markers.

**If block doesn't exist**: Append at end of file.

**If file doesn't exist**: Create with just the block.

**Block content**:
```markdown
<!--todo-workspace:start-->
<!-- todo-workspace v0.1.0 -- auto-generated, do not edit manually -->
<!-- To update: /todo-workspace:td-setup --force -->
td-workspace: {workspace-path}
td-trigger: When user mentions "td", "투두", "할일", or "todo tasks", invoke /todo-workspace:td skill.
<!--todo-workspace:end-->
```

**Rules**:
- Never write outside the `<!--todo-workspace:start-->` / `<!--todo-workspace:end-->` markers
- Never modify other plugin blocks (air-claudecode, ticket-workspace, etc.)

### 8. Show Status Report

Display via `AskUserQuestion` with markdown preview:

```
todo-workspace Setup Complete
══════════════════════════════

Workspace: {path}
Status: ✓ Ready

Prerequisites:
  ✓ git
  {✓|○} gh CLI
  {✓|○} Atlassian MCP (Jira)
  {✓|○} Slack MCP

Integrations:
  Jira: {enabled/disabled} {project if enabled}
  Slack: {enabled/disabled} {channel if enabled}

Files Created:
  ✓ templates/weekly.md
  ✓ recurring/rules.json
  ✓ metrics/streaks.json
  ✓ backlog.md
  ✓ topics.md
  ✓ .td-config.json
  ✓ ~/.claude/CLAUDE.md block

Next Steps:
  /td              View today's tasks
  /td add "task"   Add your first task
  /td help         See all commands
```

## Final Checklist
- [ ] Workspace directory created with all scaffold files
- [ ] `.td-config.json` generated with correct settings
- [ ] `~/.claude/CLAUDE.md` block written (inside markers only)
- [ ] Other plugin blocks in CLAUDE.md not modified
- [ ] Status report shown with prerequisites and next steps
