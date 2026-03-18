---
name: tw-transition
description: Transition Jira ticket status with optional comment -- fetches available transitions and confirms before executing
model: sonnet
argument-hint: "[PROJ-123] [status-name] [--comment 'text']"
---

# Jira Status Transition

Transition a Jira ticket's status and update the local workspace.

## Use When
- User says "상태 변경", "transition", "트랜지션", "jira 상태"
- User wants to move a ticket to a different status

## Steps

1. **Detect workspace**

   Resolve ticket ID from argument, cwd, or ask user. Read `.tw-config.json`.

2. **Fetch current status**

   - `ToolSearch("+atlassian jira")`
   - `mcp__mcp-atlassian__jira_get_issue` to get current status
   - Display current status to user

3. **Fetch available transitions**

   - `mcp__mcp-atlassian__jira_get_transitions` with the ticket key
   - Present transitions via `AskUserQuestion`:
     ```
     Current status: In Progress

     Available transitions:
     Options:
     - Code Review
     - Done
     - Blocked
     - Cancel (don't transition)
     ```

4. **Ask for comment** (optional)

   ```
   Question: "전환과 함께 코멘트를 추가할까요?"
   Options:
   - Add comment (user types comment)
   - No comment
   ```

5. **Confirm and execute**

   Show confirmation via `AskUserQuestion` with preview:
   ```
   Ticket:     PROJ-123 - {summary}
   Transition: In Progress → Code Review
   Comment:    {comment or "none"}
   ```
   Options: Execute / Edit / Cancel

6. **Execute transition**

   - `mcp__mcp-atlassian__jira_transition_issue` with transition ID
   - If comment: `mcp__mcp-atlassian__jira_add_comment`

7. **Update local workspace**

   - Update `status.md` Jira Status in Current State table
   - Update `.tw-config.json` status field
   - Add entry to `work-log.md`: `### HH:mm - Status changed: {old} → {new}`

8. **Show result**

   Display updated status and Jira ticket URL.

## Final Checklist
- [ ] Ticket ID resolved
- [ ] Current status fetched from Jira
- [ ] Available transitions presented to user
- [ ] User confirmed transition
- [ ] Transition executed via MCP
- [ ] Comment added if requested
- [ ] status.md updated with new status
- [ ] work-log.md entry added
- [ ] .tw-config.json updated
