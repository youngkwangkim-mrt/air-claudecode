---
name: td-slack
description: Slack integration -- daily digest, standup report, custom messages
model: sonnet
argument-hint: "digest [--channel #name] | standup [--channel #name] | send \"message\""
---

Base directory for this skill: ${SKILL_DIR}

# td-slack

Slack integration for todo-workspace. Post daily digests, standup reports, and custom messages.

## Use When
- User says "td slack", "td 슬랙", "슬랙 전송", "slack digest", "slack standup"
- User wants to share task status via Slack

## Prerequisites

Slack MCP must be available. Verify with `ToolSearch("+slack")`.
If not available, inform user and exit.

## Initialization

1. Read `~/.claude/CLAUDE.md` and find the `td-workspace:` line
2. Read `$WS/.td-config.json` for Slack config (digestChannel, standupChannel)
3. Store resolved path as `$WS`

## Commands

---

### `/td-slack digest [--channel #name]` — Post Daily Digest

1. **Read** today's section from week file
2. **Group tasks by status**: completed, in progress, blocked, pending
3. **Format** using Slack Digest template from `references/display-templates.md`:
   - Use Slack emoji: ✅, ▶️, 🚫, 🔘
   - Include Jira issue keys if linked
   - Show progress count at bottom
4. **Determine channel**: `--channel` flag > `slack.digestChannel` in config > ask user
5. **Preview**: Show formatted message via `AskUserQuestion`
6. **Confirm**: "Post to #{channel}?" — user must approve
7. **Post**: Use Slack MCP tool to send message
8. **Confirm**: Show success with channel and timestamp

---

### `/td-slack standup [--channel #name]` — Post Standup Report

1. **Read** yesterday's section for completed tasks
2. **Read** today's section for planned tasks
3. **Identify** blocked items
4. **Format** using Slack Standup template:
   - *Yesterday:* completed items
   - *Today:* in progress + pending items
   - *Blockers:* blocked items with reasons
   - Footer: progress % and streak
5. **Determine channel**: `--channel` flag > `slack.standupChannel` in config > ask user
6. **Preview**: Show via `AskUserQuestion`
7. **Confirm**: User must approve before posting
8. **Post**: Use Slack MCP tool
9. **Confirm**: Show success

---

### `/td-slack send "message" [--channel #name]` — Send Custom Message

1. **Format** the message with optional task context
2. **Determine channel**: `--channel` flag > ask user
3. **Preview**: Show via `AskUserQuestion`
4. **Confirm**: User must approve
5. **Post**: Use Slack MCP tool
6. **Confirm**: Show success

---

## Rules

- **All Slack posts require explicit user confirmation** before sending
- Never auto-post (even if `autoDigest` is configured — reserved for future cron)
- Always show preview before posting
- Default channels from `.td-config.json` can be overridden per command
- Slack formatting uses Slack mrkdwn syntax (`*bold*`, not `**bold**`)

## Final Checklist
- [ ] Slack MCP availability verified
- [ ] Message formatted with Slack mrkdwn syntax
- [ ] Preview shown to user before posting
- [ ] User confirmation obtained before every post
- [ ] Channel resolved from flag > config > ask
