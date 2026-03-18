---
name: td-recurring
description: Manage recurring task rules -- list, add, enable, disable, delete (generation in /td today)
model: sonnet
argument-hint: "[list] [add \"text\" --schedule daily|weekday|weekly:day] [enable|disable|delete id]"
---

Base directory for this skill: ${SKILL_DIR}

# td-recurring

Manage recurring task rules. Rules define tasks that are automatically generated when `/td today` runs. This skill only manages the rules — generation happens in the `/td` skill.

## Use When
- User says "td recurring", "td 반복", "반복 할일", "recurring task"
- User wants to add, view, or manage recurring task rules

## Initialization

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. Store resolved path as `$WS`
3. Read `$WS/recurring/rules.json`

## Commands

Default (no subcommand) = `list`.

---

### `/td-recurring` or `/td-recurring list` — List Rules

1. **Read** `$WS/recurring/rules.json`
2. **Display** all rules with status:

```
Recurring Tasks
═══════════════

ID                  Schedule      Priority  Status    Task
──────────────────  ────────────  ────────  ────────  ────────────────────
daily-standup       weekday       P1        ✓ active  스탠드업 미팅 #meeting ~15m
weekly-review       weekly:fri    P1        ✓ active  주간 코드 리뷰 #review ~1h
daily-review        daily         P1        ○ off     코드 리뷰 #review ~1h

──────────────────
{total} rules ({active} active, {disabled} disabled)
```

3. **Options** via `AskUserQuestion`:
   - **Add rule** — switch to add flow
   - **Toggle** — enable/disable a rule
   - **Done** — exit

---

### `/td-recurring add "text" --schedule <schedule> [--priority P1] [--tags "#tag1,#tag2"] [--duration ~1h]` — Add Rule

1. **Parse arguments**: Extract text, schedule, priority, tags, duration.

2. **If schedule not specified**: Ask via `AskUserQuestion`:
   - `daily` — every day
   - `weekday` — Mon-Fri
   - `weekly:___` — specific day (ask which)
   - `monthly:___` — specific date (ask which)

3. **If priority not specified**: Ask (default P1).

4. **Generate ID**: kebab-case from task text (e.g., "스탠드업 미팅" → "standup-meeting" or use first significant words).

5. **Check for duplicates**: Warn if a rule with same text already exists.

6. **Write**: Append to `$WS/recurring/rules.json`:
   ```json
   {
     "id": "generated-id",
     "text": "task text",
     "priority": "P1",
     "schedule": "weekday",
     "tags": ["#meeting"],
     "duration": "~15m",
     "enabled": true
   }
   ```

7. **Confirm**: Show added rule.

---

### `/td-recurring enable <id>` — Enable Rule

1. Find rule by ID in `rules.json`
2. Set `enabled: true`
3. Write back
4. Confirm

### `/td-recurring disable <id>` — Disable Rule

1. Find rule by ID in `rules.json`
2. Set `enabled: false`
3. Write back
4. Confirm

### `/td-recurring delete <id>` — Delete Rule

1. Find rule by ID in `rules.json`
2. Ask confirmation via `AskUserQuestion`
3. Remove from array
4. Write back
5. Confirm

---

## Schedule Types Reference

| Schedule | Matches | Example |
|----------|---------|---------|
| `daily` | Every day (Sun-Sat) | `daily` |
| `weekday` | Mon-Fri only | `weekday` |
| `weekly:day` | Specific day of week | `weekly:fri` |
| `biweekly:day` | Every other week on day | `biweekly:mon` |
| `monthly:N` | Nth day of month | `monthly:15` |

## How Generation Works (in `/td today`)

When `/td today` runs:
1. Reads `recurring/rules.json` for enabled rules
2. For each rule, checks if today matches the schedule
3. Checks if task with matching text + `{recurring:rule}` marker exists in today's section
4. If not present: adds `- [ ] {text} {tags} {duration} {recurring:schedule}` under configured priority
5. Completed recurring tasks stay `[x]` for that day; next applicable day generates a fresh `[ ]`

## Final Checklist
- [ ] Rules stored in `recurring/rules.json` with correct schema
- [ ] List displays all rules with status
- [ ] Add generates unique ID and validates schedule
- [ ] Enable/disable/delete modify rules correctly
- [ ] Duplicate detection warns user
