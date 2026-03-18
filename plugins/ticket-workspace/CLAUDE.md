# ticket-workspace

Jira ticket workspace manager -- per-ticket folders with work logs, status tracking, and git repo cloning.

## Release

When releasing a new version:
1. Update the `version` field in all files:
   - `.claude-plugin/plugin.json`
   - `../../.claude-plugin/marketplace.json` (add entry to `plugins` array)
   - `package.json`
2. Create a git tag: `git tag v<version> && git push origin v<version>`
