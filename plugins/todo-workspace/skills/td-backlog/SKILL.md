---
name: td-backlog
description: View and manage backlog items -- add, move to today, prioritize
model: sonnet
argument-hint: "[add \"task\"] [move \"keyword\"] [view]"
---

Base directory for this skill: ${SKILL_DIR}

# td-backlog

View and manage the backlog — tasks not yet scheduled for a specific day.

## Use When
- User says "td backlog", "td 백로그", "백로그"
- User wants to add items for later or pull backlog items into today

## Initialization

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. If not found: inform user to run `/todo-workspace:td-setup` first
3. Store resolved path as `$WS`

## Commands

Default (no subcommand) = `view`.

---

### `/td-backlog` or `/td-backlog view` — View Backlog

1. **Read** `$WS/backlog.md` and display contents.
2. **Display** via `AskUserQuestion` with `markdown` preview using the Backlog View template from `references/display-templates.md`.

   Options:
   - **Add to backlog** — switch to add flow
   - **Move to today** — switch to move flow
   - **Done** — exit

---

### `/td-backlog add "task" [P1|P2] [metadata...]` — Add to Backlog

1. **Parse arguments**: Extract task text, priority (default P2), metadata tokens.
2. **If priority not specified**: Ask via `AskUserQuestion` (P1/P2/Ideas).
3. **Write**: Append to `$WS/backlog.md` under the appropriate section.
4. **Confirm**: Show added task.

---

### `/td-backlog move "keyword"` — Move to Today

1. **Search**: Find matching tasks in `$WS/backlog.md` (case-insensitive substring).
2. **If multiple matches**: Use `AskUserQuestion` to let user select.
3. **Ask priority**: Use `AskUserQuestion` to ask priority for today (P0/P1/P2).
4. **Move**:
   - Remove the task block from `backlog.md`
   - Add to today's section in the current week file under selected priority
5. **Confirm**: Show moved task with new location.

---

## Final Checklist
- [ ] Backlog file read and displayed correctly
- [ ] Tasks added to correct priority section
- [ ] Move removes from backlog AND adds to today
- [ ] Subtask blocks preserved during move
