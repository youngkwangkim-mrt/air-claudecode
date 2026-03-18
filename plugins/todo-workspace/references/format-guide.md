# Todo Format Guide

This document defines the markdown format conventions for the todo-workspace.

---

## File Structure

```
todo-workspace/
├── .td-config.json             # Global config (Jira, Slack, options)
├── templates/
│   └── weekly.md               # Template for new weekly files
├── recurring/
│   └── rules.json              # Recurring task definitions
├── metrics/
│   └── streaks.json            # Streak and productivity data
├── YYYY-WXX.md                 # Weekly files (ISO week, Sunday start)
├── backlog.md                  # Backlog items not yet scheduled
└── topics.md                   # Topic/project index
```

---

## Weekly File Format

### File Naming

`YYYY-WXX.md` where:
- `YYYY` = year
- `WXX` = week number (Sunday-start, zero-padded)

Example: `2026-W12.md`

### Header

```markdown
# YYYY-WXX (Sun MM-DD ~ Sat MM-DD)
```

### Daily Sections

Each day has a level-2 heading with three priority subsections:

```markdown
## {DayName} MM-DD

### P0

### P1

### P2

---
```

Days appear in order: Sun, Mon, Tue, Wed, Thu, Fri, Sat.
A horizontal rule (`---`) separates each day.

---

## Status Markers

| Marker | Meaning | When to Use |
|--------|---------|-------------|
| `[ ]` | Pending | Task not yet started |
| `[x]` | Completed | Task finished |
| `[>]` | In Progress | Actively working on it |
| `[!]` | Blocked | Cannot proceed (add `-- blocked: reason`) |

---

## Task Line Format

```
- [status] {task text} {metadata...}
```

### Metadata Tokens (all optional, space-separated after task text)

| Token | Purpose | Example |
|-------|---------|---------|
| `%topic-name` | Link to topic/project | `%my-project` |
| `#tag` | Category label | `#ops`, `#feat`, `#bug` |
| `@name` | Assignee | `@alice`, `@bob` |
| `~duration` | Time estimate | `~2d`, `~4h`, `~30m` |
| `YYYY-MM-DD` | Due date or created date | `2026-03-18` |
| `[text](url)` | Reference link | `[PROJ-123](https://jira.example.com/...)` |
| `<- {DayName}` | Carried from previous day | `<- Thu` |
| `<- W{XX}` | Carried from previous week | `<- W11` |
| `{recurring:rule}` | Recurring task marker | `{recurring:daily}`, `{recurring:weekday}` |

### Token Order Convention

```
- [status] {task text} {@assignee} {%topic} {#tag} {~duration} {YYYY-MM-DD} {recurring} {<- Day} {[links]}
```

---

## Subtasks

Indent with 2 spaces. Subtasks have their own status markers:

```markdown
- [>] API 설계 @alice %my-project #feat ~2d
  - [x] endpoint 정의
  - [ ] schema 설계
  - [ ] API 문서화
```

---

## Memo/Remark Format

Timestamped notes indented under a task using `>` prefix. Appended chronologically (oldest first):

```markdown
- [>] API 설계 @alice %my-project
  - [x] endpoint 정의
  - [ ] schema 설계
  > 03-16 09:30: kickoff 미팅에서 scope 확정
  > 03-16 14:20: payments endpoint 추가 논의 필요
  > 03-17 10:00: schema v2 draft 공유 완료
```

- Each memo: `> MM-DD HH:mm: {text}`
- Memos belong to the task they are indented under
- Placed after subtasks, before the next task

---

## Blocker Syntax

Append `-- blocked: {reason}` after the task text or subtask text:

```markdown
- [!] VPC 설정 @alice #ops -- blocked: VPN 승인 대기
```

---

## Carry-Over Markers

When a task is migrated from a previous day or week:
- `<- {DayName}` — carried from a previous day within the same week
- `<- W{XX}` — carried from a previous week

Placed after metadata, before links.

---

## Recurring Task Markers

Recurring tasks are marked with `{recurring:rule}` to identify them:

```markdown
- [ ] 코드 리뷰 @alice #review ~1h {recurring:daily}
- [ ] 주간 회의 #meeting ~1h {recurring:weekly:mon}
```

---

## Priority Levels

| Level | Meaning | Usage |
|-------|---------|-------|
| P0 | Urgent | Must complete today, critical blockers |
| P1 | Important | Should complete today, scheduled work |
| P2 | Nice to have | Can defer, low priority |

---

## Comprehensive Example

```markdown
## Wed 03-18

### P0
- [>] 서버 인프라 구성 @alice %my-project #ops 2026-03-18 [PROJ-123](https://jira.example.com/browse/PROJ-123)
  - [!] DB 인스턴스 생성 -- blocked: VPC 설정 완료 후 진행 예정
  - [x] Redis 클러스터 설정
  - [ ] CDN 구성
  - [ ] 모니터링 대시보드 세팅 @bob
  > 03-18 09:30: CloudFront 사용 확정. 도메인: cdn.example.com
  > 03-18 14:24: Redis 클러스터 설정 완료

### P1
- [!] 결제 취소 타이밍 이슈 수정 @charlie #bug [slack](https://slack.example.com/...) -- blocked: QA 검증 대기
  - [ ] 결제 취소 미처리 건 수정
  - [ ] 배포 후 모니터링
  > 03-18 14:34: PG 취소는 정상. 주문 상태만 미반영
- [>] API 설계 @alice %my-project #feat ~2d
  - [ ] endpoint 정의
  - [ ] request/response schema
- [ ] 코드 리뷰 @alice #review ~1h {recurring:daily}
- [x] 스탠드업 미팅 #meeting {recurring:daily}
- [ ] API 문서화 %my-project <- Tue

### P2
- [ ] 테스트 코드 리팩토링 #refactor ~4h
```

---

## Topics File (`topics.md`)

```markdown
# Topics

> Active projects and areas of work. Tasks use %topic-name to link here.

## Active
- **my-project**: Backend API 리뉴얼 프로젝트
- **platform-migration**: 플랫폼 이관 프로젝트

## Archived
- **old-project**: 완료된 프로젝트
```

---

## Backlog File (`backlog.md`)

```markdown
# Backlog

## P1
- [ ] Task with details %topic #tag
  - [ ] Subtask

## P2
- [ ] Lower priority item

## Ideas
- [ ] Someday/maybe items
```

---

## Weekly Template (`templates/weekly.md`)

```markdown
# YYYY-WXX (Sun MM-DD ~ Sat MM-DD)

## Sun MM-DD

### P0

### P1

### P2

---

## Mon MM-DD

### P0

### P1

### P2

---

## Tue MM-DD

### P0

### P1

### P2

---

## Wed MM-DD

### P0

### P1

### P2

---

## Thu MM-DD

### P0

### P1

### P2

---

## Fri MM-DD

### P0

### P1

### P2

---

## Sat MM-DD

### P0

### P1

### P2
```

When creating a new week file, replace all `YYYY-WXX`, `MM-DD`, and day names with actual values.

---

## Global Config (`.td-config.json`)

```json
{
  "version": "0.1.0",
  "createdAt": "2026-03-18T14:00:00+09:00",
  "workspace": "/Users/me/Desktop/todo-workspace",
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

---

## Recurring Rules (`recurring/rules.json`)

```json
{
  "rules": [
    {
      "id": "daily-standup",
      "text": "스탠드업 미팅",
      "priority": "P1",
      "schedule": "weekday",
      "tags": ["#meeting"],
      "duration": "~15m",
      "enabled": true
    }
  ]
}
```

**Schedule types:**
- `daily` — every day (Sun-Sat)
- `weekday` — Mon-Fri only
- `weekly:day` — specific day of week (e.g., `weekly:fri`)
- `biweekly:day` — every other week
- `monthly:N` — Nth day of month

---

## Streak/Metrics (`metrics/streaks.json`)

```json
{
  "lastUpdated": "2026-03-18",
  "currentStreak": 5,
  "longestStreak": 12,
  "streakStartDate": "2026-03-13",
  "weeklyCompletionRates": {},
  "dailyHistory": []
}
```

A "streak day" = at least 1 task marked `[x]` on that date.
