# Recurring Task Templates

Example recurring task configurations for common workflows.

---

## Daily Routines

### Standup Meeting
```json
{
  "id": "daily-standup",
  "text": "스탠드업 미팅",
  "priority": "P1",
  "schedule": "weekday",
  "tags": ["#meeting"],
  "duration": "~15m",
  "enabled": true
}
```

### Code Review
```json
{
  "id": "daily-code-review",
  "text": "코드 리뷰",
  "priority": "P1",
  "schedule": "weekday",
  "tags": ["#review"],
  "duration": "~1h",
  "enabled": true
}
```

### Email/Slack Check
```json
{
  "id": "daily-comms",
  "text": "메일/슬랙 확인 및 응답",
  "priority": "P2",
  "schedule": "weekday",
  "tags": ["#comms"],
  "duration": "~30m",
  "enabled": true
}
```

---

## Weekly Tasks

### Weekly Review
```json
{
  "id": "weekly-review",
  "text": "주간 회고 및 다음 주 계획",
  "priority": "P1",
  "schedule": "weekly:fri",
  "tags": ["#planning"],
  "duration": "~1h",
  "enabled": true
}
```

### 1:1 Meeting
```json
{
  "id": "weekly-1on1",
  "text": "1:1 미팅",
  "priority": "P1",
  "schedule": "weekly:wed",
  "tags": ["#meeting"],
  "duration": "~30m",
  "enabled": true
}
```

### Team Sync
```json
{
  "id": "weekly-team-sync",
  "text": "팀 동기화 미팅",
  "priority": "P1",
  "schedule": "weekly:mon",
  "tags": ["#meeting"],
  "duration": "~1h",
  "enabled": true
}
```

---

## Monthly Tasks

### Monthly Report
```json
{
  "id": "monthly-report",
  "text": "월간 업무 보고서 작성",
  "priority": "P1",
  "schedule": "monthly:1",
  "tags": ["#report"],
  "duration": "~2h",
  "enabled": true
}
```

---

## Schedule Types Reference

| Schedule | Pattern | Example | Matches |
|----------|---------|---------|---------|
| Every day | `daily` | `"schedule": "daily"` | Sun-Sat |
| Weekdays | `weekday` | `"schedule": "weekday"` | Mon-Fri |
| Specific day | `weekly:{day}` | `"schedule": "weekly:fri"` | Every Friday |
| Biweekly | `biweekly:{day}` | `"schedule": "biweekly:mon"` | Every other Monday |
| Monthly | `monthly:{N}` | `"schedule": "monthly:15"` | 15th of each month |

### Day Name Mapping

| Full Name | Abbreviation (for schedule) |
|-----------|---------------------------|
| Sunday | `sun` |
| Monday | `mon` |
| Tuesday | `tue` |
| Wednesday | `wed` |
| Thursday | `thu` |
| Friday | `fri` |
| Saturday | `sat` |

---

## Rule Schema

```json
{
  "id": "string (kebab-case, unique)",
  "text": "string (task text)",
  "priority": "P0 | P1 | P2",
  "schedule": "daily | weekday | weekly:{day} | biweekly:{day} | monthly:{N}",
  "tags": ["#tag1", "#tag2"],
  "duration": "~{N}h | ~{N}m | ~{N}d",
  "enabled": true | false
}
```

### Required Fields
- `id`: Unique identifier (auto-generated from text if not provided)
- `text`: Task description
- `schedule`: When to generate

### Optional Fields
- `priority`: Default `P1`
- `tags`: Default `[]`
- `duration`: Default none
- `enabled`: Default `true`
