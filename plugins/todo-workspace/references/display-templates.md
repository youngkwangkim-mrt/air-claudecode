# Display Templates

Templates for rendering todo data to users via `AskUserQuestion` with `markdown` preview.

All templates use monospace-friendly formatting for consistent rendering.

---

## Today View

Used by: `/td`, `/td today`

```
{DayName} {MM-DD} — Week {XX}
══════════════════════════════

{if carried items exist}
↳ {N} items carried from {PrevDayName}
{/if}

▌ P0 — Urgent
  ✓ Completed task text
  ▶ In progress task @assignee [PROJ-123]
    ✓ Done subtask
    ○ Pending subtask
    > 03-18 09:30: memo text here
  ! Blocked task -- blocked: reason
  ○ Pending task %topic #tag ~2d

▌ P1 — Important
  ○ Task description %topic #tag <- Thu
    ○ Subtask 1
    ○ Subtask 2
  ○ 코드 리뷰 #review ~1h {daily}
  ✓ 스탠드업 미팅 #meeting {daily}

▌ P2 — Nice to Have
  (empty)

─────────────────────────────
✓ {done}/{total} completed | 🔥 {streak} day streak
```

### Symbol Mapping

| File Marker | Display Symbol | Meaning |
|-------------|----------------|---------|
| `[x]` | `✓` | Completed |
| `[>]` | `▶` | In progress |
| `[!]` | `!` | Blocked |
| `[ ]` | `○` | Pending |

### Rendering Rules

- Priority sections always shown, even if empty (display `(empty)`)
- Subtasks indented with 2 additional spaces
- Memos shown inline under tasks (with `>` prefix)
- Carry marker `<- DayName` shown inline
- Blocker reason shown inline after `--`
- Metadata tokens shown as-is: `%topic`, `#tag`, `@name`, `~duration`
- Recurring markers shown shortened: `{recurring:daily}` → `{daily}`
- Jira links shown as `[PROJ-123]`
- Streak shown in footer

---

## Week View

Used by: `/td-report`, `/td-report week`

```
Week {XX} (Sun {MM-DD} ~ Sat {MM-DD})
══════════════════════════════════════

Day        P0         P1         P2         Total
─────────  ─────────  ─────────  ─────────  ─────────
Sun {DD}   ✓2         ✓1 ○1      ○1         ✓3 ○2
Mon {DD}   ✓1 ▶1      ✓2 !1      ○2         ✓3 ▶1 !1 ○2
Tue {DD}   ○1         ▶2         -          ▶2 ○1
Wed {DD}   ○1         ▶2         -          ▶2 ○1     ← today
Thu {DD}   -          -          -          (empty)
Fri {DD}   -          -          -          (empty)
Sat {DD}   -          -          -          (empty)
─────────  ─────────  ─────────  ─────────  ─────────
Total      ✓3 ▶1 ○1  ✓3 ▶2 !1 ○4  ○3       ✓6 ▶3 !1 ○8

Overall: ████████░░░░░░░░ {pct}% ({done}/{total})
```

### Column Rules

- Each cell shows count by status: `✓N ▶N !N ○N` (omit zero counts)
- `-` for completely empty sections
- `← today` marker on current day row
- Footer row sums all days
- Overall progress bar at bottom

---

## Progress View

Used by: `/td-report progress`

```
Week {XX} Progress
═══════════════════

Overall: ████████░░░░░░░░ {pct}% ({done}/{total})
🔥 Streak: {current} days (longest: {longest})
📈 Trend: {+/-pct}% vs last week ({prev}% → {curr}%)

By Status:
  ✓ Completed    {n}  {bar}
  ▶ In Progress  {n}  {bar}
  ! Blocked      {n}  {bar}
  ○ Pending      {n}  {bar}

By Priority:
  P0: {bar} {pct}% ({done}/{total})
  P1: {bar} {pct}% ({done}/{total})
  P2: {bar} {pct}% ({done}/{total})

{if blocked items exist}
Blocked:
  ! {task text} -- {reason}
  ! {task text} -- {reason}
{/if}
```

### Progress Bar Rendering

Use 16-character bars with block characters:

```
100%  ████████████████
 75%  ████████████░░░░
 50%  ████████░░░░░░░░
 25%  ████░░░░░░░░░░░░
  0%  ░░░░░░░░░░░░░░░░
```

Characters: `█` (filled), `░` (empty)

### Counting Rules

- Count **top-level tasks only** (not subtasks) for overall/priority/day metrics
- A task counts in the day where it currently appears
- Carried tasks count in their destination day (today), not origin

---

## Backlog View

Used by: `/td-backlog`

```
Backlog
═══════

▌ P1 — Important
  ○ Task description %topic #tag {due date}
    ○ Subtask 1
    ○ Subtask 2

▌ P2 — Lower Priority
  ○ Another task

▌ Ideas
  ○ Someday item

─────────────────
{total} items in backlog
```

---

## Add Confirmation

Used by: `/td add`

```
Task Added
══════════

{DayName} {MM-DD} / P{n}:
  ○ {task text} {%topic} {#tag} {@assignee} {~duration}
    ○ Subtask 1
    ○ Subtask 2
```

---

## Done Confirmation

Used by: `/td done`

```
Task Completed ✓
════════════════

{DayName} {MM-DD} / P{n}:
  ✓ {task text}
    ✓ Subtask 1 (was ○)
    ✓ Subtask 2 (was ▶)

🔥 Streak: {current} days
```

---

## Memo Confirmation

Used by: `/td memo`

```
Memo Added
══════════

{task text}:
  > {MM-DD HH:mm}: {memo text}

({total} memos on this task)
```

---

## Search Results

Used by: `/td search`

```
Search: "{query}"
═════════════════

W{XX} {DayName} {DD} / P{n}:
  ▶ {matching task text} %topic
    > {matching memo if --memo}

W{XX} {DayName} {DD} / P{n}:
  ○ {another match}

Backlog / P{n}:
  ○ {backlog match}

─────────────────
{count} results found
```

---

## Slack Digest Format

Used by: `/td-slack digest`

```
📋 Daily Todo Digest - {YYYY-MM-DD}

*Completed ({n}):*
✅ Task 1
✅ Task 2

*In Progress ({n}):*
▶️ Task 3 (PROJ-123)

*Blocked ({n}):*
🚫 Task 4 -- reason

*Pending ({n}):*
🔘 Task 5

📊 Progress: {done}/{total} ({pct}%)
```

---

## Slack Standup Format

Used by: `/td-slack standup`

```
🌅 Standup - {YYYY-MM-DD}

*Yesterday:*
- Task A 완료
- Task B 완료

*Today:*
- Task C 계속 (PROJ-123)
- Task D
- Task E

*Blockers:*
- Task F -- reason

────
📊 Progress: {pct}% | 🔥 {streak}d streak
```

---

## General Rendering Rules

1. **Double-line headers** (`═══`) for main titles
2. **Single-line separators** (`───`) for section dividers
3. **Vertical bar** (`▌`) for priority section markers
4. **Consistent indentation**: 2 spaces per nesting level
5. **Status symbols** always use the symbol mapping (not raw `[x]` markers)
6. **Empty sections** show `(empty)` rather than being hidden
7. **Today marker** (`← today`) on relevant day in weekly/progress views
8. **Metadata inline**: `%topic`, `#tag`, `@name`, `~duration` shown as-is
9. **Streak** shown in footer of today view and done confirmation
