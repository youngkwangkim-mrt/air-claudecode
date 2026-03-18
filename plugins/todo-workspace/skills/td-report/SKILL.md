---
name: td-report
description: Weekly overview, progress visualization, streaks, and productivity metrics
model: sonnet
argument-hint: "[week|progress] [YYYY-WXX] [--new] [--streaks]"
---

Base directory for this skill: ${SKILL_DIR}

# td-report

Weekly overview and progress visualization. Combines week summary table and progress/streak tracking.

## Use When
- User says "td report", "td week", "td progress", "주간 현황", "진행 현황"
- User wants to see weekly overview or progress metrics
- User wants to create a new week file

## Initialization

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. If not found: inform user to run `/todo-workspace:td-setup` first
3. Store resolved path as `$WS`

## Date Calculation

Use `bash date` only. See `/td` skill for Sunday-start week calculation.

## Commands

Default (no subcommand) = `week`.

---

### `/td-report` or `/td-report week [YYYY-WXX]` — Weekly Overview

1. **Read** the week file (`$WS/$WEEK_ID.md` or specified `YYYY-WXX`).
   If file doesn't exist, inform user and exit.

2. **Build summary**: For each day (Sun–Sat), count top-level tasks by status per priority:
   - `[x]` = ✓ (completed)
   - `[>]` = ▶ (in progress)
   - `[!]` = ! (blocked)
   - `[ ]` = ○ (pending)

3. **Display** via `AskUserQuestion` with `markdown` preview using the Week View template from `references/display-templates.md`.

   Options:
   - **View day** — ask which day, then show that day's detailed tasks
   - **Progress** — switch to progress view
   - **Done** — exit

### `/td-report week --new` — Create Next Week File

1. **Calculate** the next week's dates (next Sunday through Saturday).

2. **Check** if file already exists. If yes, inform and exit.

3. **Generate** from `$WS/templates/weekly.md`:
   - Replace `YYYY-WXX` with actual week identifier
   - Replace `Sun MM-DD` through `Sat MM-DD` with actual dates

4. **Carry-over prompt**: Read current week's remaining incomplete tasks.
   - If any exist, use `AskUserQuestion`:
     - **Carry all** — copy all incomplete to the new week's Sunday section
     - **Select** — let user pick which to carry
     - **None** — start clean
   - Carried items get `<- W{XX}` marker

5. **Write** the new file and confirm.

---

### `/td-report progress [--week] [--month] [--streaks]` — Progress & Streaks

1. **Read** the week file and `$WS/metrics/streaks.json`.

2. **Count** all task checkboxes (top-level only, not subtasks):
   - `[x]` = completed
   - `[>]` = in progress
   - `[!]` = blocked
   - `[ ]` = pending

3. **Calculate**:
   - Overall completion rate
   - Per-priority completion rates (P0/P1/P2)
   - Per-day completion rates
   - Current streak and longest streak from `streaks.json`
   - Trend: compare this week's rate to last week's (from `weeklyCompletionRates`)

4. **If `--month`**: Read all week files for the current month, aggregate metrics.

5. **Render** using the Progress View template from `references/display-templates.md`:
   - Progress bars (16 chars: `█` filled, `░` empty)
   - Streak count with fire emoji
   - Trend with arrow emoji
   - Blocked items list

6. **Display** via `AskUserQuestion` with `markdown` preview.

---

## Final Checklist
- [ ] Week file read and parsed correctly
- [ ] Task counts accurate per day/priority/status
- [ ] Progress bars rendered with correct percentages
- [ ] Streak data read from metrics/streaks.json
- [ ] Trend calculated vs previous week
- [ ] New week file created with correct dates when --new
- [ ] Carry-over from previous week works with user selection
