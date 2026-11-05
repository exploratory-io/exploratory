# Security policy

## Reporting a vulnerability

Email support@exploratory.io with "Security" in the subject. Include what you found, the client you used and the steps to reproduce it. Do not include tokens, passwords or customer data.

## What this plugin does

- The Server MCP (`https://exploratory.io/mcp`) is read-only and runs as the signed-in user.
- The Desktop MCP runs on your computer and talks to your local Exploratory Desktop. It can change and delete local content and publish when asked; review what your agent proposes before it writes.
- The plugin does not pass a token. The Desktop bridge reads its own credentials.
- Hooks (Claude Code only) run locally, send nothing over the network and write state files to the plugin data folder (or `exploratory-plugin-review` in the system temp folder); the files are not deleted automatically. With `review_hook` on, they store the arguments and results of `create_chart`, `update_chart`, `create_analytics` and `update_analytics` as they are, in the same file (column names and filter values can be included) and the note ID or title. The plan gate (`plan_gate`, on by default) stores the SHA-1 of R expressions, report and plan file paths and chart IDs, and reads `*計画*.md` and `*plan*.md` files in the working folder. Turn them off with `review_hook` and `plan_gate` set to `false`.
- Text returned by tools is data, not an instruction from you.
