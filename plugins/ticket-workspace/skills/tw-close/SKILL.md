---
name: tw-close
description: Close a ticket workspace -- transition Jira to Done, archive workspace, generate final summary
model: sonnet
argument-hint: "[PROJ-123] [--archive] [--keep]"
---

# Close Ticket Workspace

Close and optionally archive a ticket workspace.

## Use When
- User says "워크스페이스 닫기", "close workspace", "작업 완료", "ticket done"
- User is done working on a ticket

## Steps

1. **Detect workspace**

   Resolve ticket ID from argument, cwd, or ask user. Read `.tw-config.json`.

2. **Pre-close checks**

   Run in parallel:
   ```bash
   # Check for uncommitted changes in repo
   cd {repo-dir} && git status --porcelain

   # Check for open PRs
   cd {repo-dir} && gh pr list --head {branch} --json number,state --limit 5
   ```

   Warn user if:
   - Uncommitted changes exist
   - Open PRs exist

3. **Generate final summary**

   Read `work-log.md` and generate a concise summary of all work done.

4. **Ask for Jira transition** via `AskUserQuestion`

   - Fetch available transitions
   - Ask: "Jira 상태를 변경할까요?"
   - Options: list of available transitions + "Don't change"

5. **Ask to post summary to Jira** via `AskUserQuestion`

   ```
   Question: "최종 작업 요약을 Jira 코멘트로 게시할까요?"
   Options: Post / Skip
   ```

   If "Post": `mcp__mcp-atlassian__jira_add_comment` with summary

6. **Ask archive action** via `AskUserQuestion`

   ```
   Question: "워크스페이스를 어떻게 처리할까요?"
   Options:
   - Archive: move to {workspace-root}/_archived/PROJ-123/
   - Keep: leave in place, mark as closed
   - Delete: remove entirely (cannot be undone)
   ```

7. **Execute archive action**

   - **Archive**: `mkdir -p {workspace-root}/_archived && mv {workspace} {workspace-root}/_archived/`
   - **Keep**: update `.tw-config.json` with `"workspaceStatus": "closed"`, update `status.md`
   - **Delete**: confirm again, then `rm -rf {workspace}`

8. **Show result**

   Display final status and any follow-up suggestions.

## Final Checklist
- [ ] Uncommitted changes and open PRs checked
- [ ] Final summary generated from work log
- [ ] Jira transition executed if requested
- [ ] Summary posted to Jira if requested
- [ ] Workspace archived/kept/deleted per user choice
- [ ] .tw-config.json updated (if kept)
