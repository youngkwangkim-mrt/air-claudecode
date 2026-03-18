# Work Log Format Guide

## Structure

```markdown
# Work Log: {TICKET-KEY}

> {ticket summary}

---

## YYYY-MM-DD

### HH:mm - Short Title
- Detail bullet point
- Another detail

### HH:mm - Another Entry
- Work description
- Git: 3 files changed, 45 insertions(+), 12 deletions(-)
```

## Rules

1. **Date sections** (`## YYYY-MM-DD`): one per day, newest at bottom
2. **Entries** (`### HH:mm - Title`): timestamped, chronological within each day
3. **Details**: bullet points under each entry
4. **Git summary** (optional): append diff stat with `--git-summary` flag

## Entry Types

| Type | Example Title |
|------|---------------|
| Setup | Workspace created |
| Investigation | Reviewed auth module structure |
| Implementation | Added RefreshTokenService class |
| Testing | Added unit tests for token rotation |
| Review | Addressed code review comments |
| Deployment | Deployed to staging |
| Status change | Status changed: In Progress → Code Review |

## Adding Entries

When adding a new entry:
1. Check if today's date section exists -- create if not
2. Get current time in HH:mm format
3. Append entry under the correct date section
4. Keep entries chronological (newest at bottom within each day)
