---
name: td
description: Daily todo management -- view, add, complete, memo, search, help
model: sonnet
argument-hint: "[today|add|done|memo|search|help] [args]"
---

Base directory for this skill: ${SKILL_DIR}

# td

Main skill for daily todo management. Handles viewing today's tasks, adding/completing tasks, attaching memos, searching, and help.

## Use When
- User says "td", "투두", "할일", "todo", "today tasks"
- User wants to view, add, complete, or manage daily tasks
- User wants to search tasks or see help

## Do Not Use When
- User wants weekly report or progress (use td-report)
- User wants to manage backlog (use td-backlog)
- User wants Jira/Slack integration (use td-jira, td-slack)
- User wants recurring rules management (use td-recurring)
- User wants setup/config (use td-setup)

## Initialization

**Run on every invocation before any command:**

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. Extract the workspace path (e.g., `td-workspace: /Users/me/Desktop/todo-workspace`)
3. If path not found: inform user to run `/todo-workspace:td-setup` first and exit
4. Verify workspace path exists on disk. If deleted: inform user and exit.
5. Store the resolved workspace path as `$WS` for use in all subsequent steps.

## Date Calculation

**CRITICAL**: All date calculations must use `bash date` only.

```bash
# Get all date info in a single call
date +"%Y %m %d %A %u"    # e.g., 2026 03 18 Wednesday 3
```

**ISO Week with Sunday start**: This system uses Sunday as the first day of the week.

```bash
# Sunday-start week number
DOW=$(date +%u)  # 1=Mon..7=Sun
if [ "$DOW" -eq 7 ]; then
  WEEK_ID=$(date -v+1d +"%G-W%V")
else
  WEEK_ID=$(date +"%G-W%V")
fi
echo "$WEEK_ID"
```

```bash
# Get week start (Sunday) and end (Saturday) dates
if [ "$DOW" -eq 7 ]; then
  SUN_DATE=$(date +"%m-%d")
else
  SUN_DATE=$(date -v-${DOW}d +"%m-%d")
fi
```

```bash
# Get today and yesterday info
TODAY_NAME=$(date +"%a")       # e.g., "Wed"
TODAY_DATE=$(date +"%m-%d")    # e.g., "03-18"
YESTERDAY_NAME=$(date -v-1d +"%a")
```

Use `$WEEK_FILE` to refer to `$WS/$WEEK_ID.md`.

**Day name mapping for sections**: Sun, Mon, Tue, Wed, Thu, Fri, Sat

## Commands

Parse the first argument to determine the command. Default (no argument) = `today`.

---

### `/td` or `/td today` — View Today

1. **Resolve week file**: Calculate `$WEEK_FILE`. If it doesn't exist, create it from `$WS/templates/weekly.md` with correct dates filled in.

2. **Generate recurring tasks**: Read `$WS/recurring/rules.json` (if `recurring.enabled` in config):
   - For each enabled rule, check if today matches the schedule
   - Check if a task with matching text and `{recurring:rule}` marker already exists in today's section
   - If not present: add task under the configured priority level
   - Schedule matching:
     - `daily`: always
     - `weekday`: Mon-Fri (dow 1-5)
     - `weekly:fri`: only if today is Friday
     - `biweekly:mon`: Monday on even ISO weeks
     - `monthly:15`: 15th of the month

3. **Auto-carry**: Read the previous day's section:
   - Determine previous day: yesterday, or Saturday→Sunday for week start
   - For cross-week carry (Sunday): read previous week's Saturday section
   - Find all top-level tasks with status `[ ]`, `[>]`, or `[!]`
   - For each, check if today's section already has this task (match by task text, ignoring status/carry markers)
   - If NOT already carried:
     - Copy entire task block (task line + all subtasks + memos) to today's section under same priority
     - Append `<- {DayName}` after task metadata on the carried line
     - Preserve all subtask states, metadata, and memos
     - **Do NOT modify the original** — keep history intact
   - If tasks were carried, note how many in the output

4. **Display**: Read today's section and show via `AskUserQuestion` with `markdown` preview.
   Use the Today View template from `references/display-templates.md`.

   Options:
   - **Add task** — switch to add flow
   - **Done** — exit

---

### `/td add "task description"` — Add Task

1. **Parse arguments**: Extract from the argument string:
   - Task text (required)
   - `%topic-name` — topic link (optional)
   - `#tag` — category tag (optional)
   - `@assignee` — person (optional)
   - `~duration` — estimate (optional)
   - `P0`/`P1`/`P2` — priority (optional)
   - `--jira PROJ-123` — Jira link (optional)
   - `--sub "a, b, c"` — subtasks (optional)
   - `--day Mon` — target day (optional, default today)

2. **If `--jira` provided**: Use `ToolSearch("+atlassian jira get_issue")` to fetch issue details, create markdown link `[PROJ-123](url)`.

3. **If priority not specified**: Use `AskUserQuestion` to ask:
   - P0 (urgent, must do today)
   - P1 (important, should do today) — default
   - P2 (nice to have)

4. **If subtasks provided via `--sub`**: Format each as indented `- [ ] subtask`

5. **Write**: Open `$WEEK_FILE`, find target day section → priority subsection, append the task:
   ```
   - [ ] {task text} {@assignee} {%topic} {#tag} {~duration} {[PROJ-123](url)}
     - [ ] subtask 1
     - [ ] subtask 2
   ```

6. **Confirm**: Show the added task via `AskUserQuestion` markdown preview using Add Confirmation template.

**Examples:**
```
/td add "API 설계" @alice %my-project #feat P0 ~2d --sub "endpoint 정의, schema 설계, 문서화"
/td add "배포 스크립트 세팅" %my-project #ops
/td add "코드 리뷰" --jira PROJ-123
/td add "코드 리뷰"
```

---

### `/td done "task keyword"` — Complete Task

1. **Search**: Read today's section in `$WEEK_FILE`. Find tasks matching the keyword (case-insensitive substring match on task text).

2. **If multiple matches**: Use `AskUserQuestion` to let user select which task.

3. **If task has subtasks**:
   - Show subtasks and their current status
   - Ask via `AskUserQuestion`: "Complete all subtasks too?" with options:
     - **All** — mark parent + all subtasks as `[x]`
     - **Parent only** — mark only the parent as `[x]`
     - **Select** — let user pick which subtasks to complete

4. **Update**: Change `[ ]` or `[>]` to `[x]` for selected items using the Edit tool.

5. **If task has Jira link**: Ask via `AskUserQuestion`:
   - "Transition Jira issue too?"
   - If yes: use `ToolSearch("+atlassian jira transition")` to transition

6. **Update streak**: Read `$WS/metrics/streaks.json`:
   - Get today's date
   - Check if `dailyHistory` has an entry for today; if so update counts, else add new entry
   - Recalculate `currentStreak` (consecutive days with `hasActivity: true`)
   - Update `longestStreak` if current exceeds it
   - Write back

7. **Show result**: Display using Done Confirmation template.

---

### `/td memo "keyword" "text"` — Add Memo

**Subcommands**: `(default)`, `view`, `search`

**`/td memo "keyword" "text"`** or **`/td memo add "keyword" "text"`** — Add memo
1. Find task in today's section by keyword (case-insensitive substring match)
2. If multiple matches: let user select
3. Get current time: `date +"%m-%d %H:%M"`
4. Append `> {MM-DD HH:mm}: {text}` indented under the task
   - Place after subtasks (if any), at end of task block
   - Before the next top-level task (`- [`)
5. Show Memo Confirmation template

**`/td memo view "keyword"`** — View memos
1. Find task by keyword
2. Collect all `>` lines under it
3. Display with task context

**`/td memo search "query"`** — Search memos
1. Read `$WEEK_FILE`
2. Find all `>` lines containing query (case-insensitive)
3. For each match, show parent task + memo line with day context
4. Display grouped results

---

### `/td search "query"` — Search Tasks & Memos

1. **Determine scope**:
   - Default: current week file + backlog
   - `--week YYYY-WXX`: specific week file
   - `--memo`: search only memo lines (`>` prefix)
   - `--jira`: search only Jira-linked tasks
   - `--topic %name`: filter by topic
   - `--tag #tag`: filter by tag

2. **Search**: Use `Grep` to search across files for matching content.

3. **Group results**: By source file and day section.

4. **Display**: Use Search Results template from `references/display-templates.md`.

---

### `/td help` — Show Help

Display this command reference:

```
todo-workspace — Daily todo manager
════════════════════════════════════

CORE:
  /td                      View today's todos (auto-carries + recurring)
  /td add "task" [opts]    Add a new task to today
  /td done "keyword"       Mark a task as completed
  /td memo "kw" "text"     Add a timestamped memo to a task
  /td memo view "kw"       View memos on a task
  /td search "query"       Search tasks and memos

REPORTING:
  /td-report               Weekly overview table
  /td-report progress      Progress bars, streaks, trends
  /td-backlog              View and manage backlog

INTEGRATIONS:
  /td-jira link "kw" KEY   Link task to Jira issue
  /td-jira sync            Sync Jira-linked task statuses
  /td-jira import KEY      Create task from Jira issue
  /td-slack digest         Post daily digest to Slack
  /td-slack standup        Post standup report to Slack
  /td-recurring list       View recurring task rules
  /td-recurring add "text" Add a recurring rule

SETUP:
  /td-setup                Configure workspace
  /td-setup --check        Check current status

TASK FORMAT:
  - [status] task text @assignee %topic #tag ~duration [JIRA-123](url) {recurring:rule} <- Day

  Status:  [ ] pending   [x] completed   [>] in progress   [!] blocked
  Tokens:  @assignee  %topic  #tag  ~duration  P0/P1/P2  --sub "a, b"
           --jira PROJ-123  --day Mon

EXAMPLE WORKFLOW:
  /td                            # Morning: check today (auto-carries yesterday)
  /td add "API 설계" P0 ~2d      # Add a task
  /td memo "API" "schema 확정"   # Add a memo
  /td done "API"                 # Complete a task
  /td-report progress            # Check weekly progress
  /td-slack standup              # Post standup to Slack
```

---

## Format Reference

Refer to `references/format-guide.md` for the full format specification.

## Display Reference

Refer to `references/display-templates.md` for output rendering templates.

## Final Checklist
- [ ] Workspace path resolved from `~/.claude/CLAUDE.md` (inside todo-workspace block)
- [ ] Correct week file identified/created with Sunday-start weeks
- [ ] Recurring tasks generated for today (if enabled)
- [ ] Auto-carry executed for today view (incomplete items from yesterday)
- [ ] Tasks displayed using `AskUserQuestion` with `markdown` preview
- [ ] File edits use the `Edit` tool (not Bash sed/awk)
- [ ] Subtask hierarchy preserved in all operations
- [ ] Memos timestamped with `> MM-DD HH:mm: text` format
- [ ] Carry markers (`<- DayName`) added to migrated tasks
- [ ] Original tasks in previous day NOT modified (history preservation)
- [ ] Streak data updated on task completion
