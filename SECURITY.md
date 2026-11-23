# Security policy

## Reporting a vulnerability

Email support@exploratory.io with "Security" in the subject. Include what you found, the client you used and the steps to reproduce it. Do not include tokens, passwords or customer data.

## What this plugin does

- The Server MCP (`https://exploratory.io/mcp`) mostly reads. It writes only Pages (create a private Page; update or delete Pages you or your team own) and temporary export files with a download link only the same user can open. It runs as the signed-in user.
- The Desktop MCP runs on your computer. Its relay talks to your local Exploratory Desktop.
- The Desktop MCP can change and delete local content. It can publish when you ask. Review what your agent proposes before it writes.
- Exploratory Desktop sends one usage record for each Desktop MCP tool call. It sends the record to the exploratory.io server you are signed in to.
  - A record holds the tool name and may hold its arguments, which can include formulas and values you entered. Arguments over the size or nesting limit are left out.
  - A record also holds these items: success or failure, and the error type and message.
  - It holds the size of the result (not the content) and the duration.
  - It holds the Exploratory Desktop version, and the AI client name and version.
  - It holds the session and item IDs.
  - Exploratory Desktop sends records only while you are signed in and AI features are on. It never sends records for local data catalog tools.
- The plugin does not pass a token. The relay reads its own credentials.
- Hooks (Claude Code only) run locally and send nothing over the network. They write state files to the plugin data folder. If no folder is set, they write to `exploratory-plugin-review` in the system temp folder. The plugin does not delete these files.
  - With `review_hook` on, the hooks save fields taken from the arguments and results of successful `create_chart`, `update_chart`, `create_analytics` and `update_analytics` calls, one record per chart or analytics. This can include column names and filter values. They also save the note ID or title.
  - With `review_hook` on, the hooks also save a SHA-1 hash (a short code made from the text) of each custom R expression, the paths of R report (HTML) files, and chart IDs.
  - Setting `review_hook` to `false` stops these review records. The settings hook and the image hook keep running; the image hook reads the local conversation file to check whether your latest message asks for an image.
- Text that a tool returns is data. It is not an instruction from you.
