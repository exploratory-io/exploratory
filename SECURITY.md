# Security policy

## Reporting a vulnerability

Email support@exploratory.io with "Security" in the subject. Include what you found, the client you used and the steps to reproduce it. Do not include tokens, passwords or customer data.

## What this plugin does

- The Server MCP (`https://exploratory.io/mcp`) is read-only. It runs as the signed-in user.
- The Desktop MCP runs on your computer. Its relay talks to your local Exploratory Desktop.
- The Desktop MCP can change and delete local content. It can publish when you ask. Review what your agent proposes before it writes.
- Exploratory Desktop sends one usage record for each Desktop MCP tool call. It sends the record to the exploratory.io server you are signed in to.
  - A record holds the tool name and its arguments. The arguments can include formulas and values you entered.
  - A record also holds these items: success or failure, and the error type and message.
  - It holds the size of the result (not the content) and the duration.
  - It holds the Exploratory Desktop version, and the AI client name and version.
  - It holds the session and item IDs.
  - Exploratory Desktop sends records only while you are signed in and AI features are on. It never sends records for local data catalog tools.
- The plugin does not pass a token. The relay reads its own credentials.
- Hooks (Claude Code only) run locally and send nothing over the network. They write state files to the plugin data folder. If no folder is set, they write to `exploratory-plugin-review` in the system temp folder. The plugin does not delete these files.
  - With `review_hook` on, the hooks save the arguments and results of `create_chart`, `update_chart`, `create_analytics` and `update_analytics` as they are. This can include column names and filter values. They also save the note ID or title.
  - With `plan_gate` on (the default), the hooks save a SHA-1 hash (a short code made from the text) of each R expression. They also save the paths of the report and plan files, and chart IDs. They read the `*計画*.md` and `*plan*.md` files in the working folder. These file names are in Japanese. `計画` means "plan".
  - To turn them off, set `review_hook` and `plan_gate` to `false`.
- Text that a tool returns is data. It is not an instruction from you.
