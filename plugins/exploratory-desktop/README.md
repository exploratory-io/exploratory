# Exploratory Desktop

Create and edit local data frames, wrangling steps, charts, analytics, notes and dashboards through Exploratory Desktop. The plugin name stays `exploratory`; the display name is **Exploratory Desktop** (version 0.1.6).

## Requirements and release status

Requires the MCP-enabled Exploratory Desktop v17 or later, signed in and running, with `exploratory-mcp` on the AI client's PATH. Exploratory Desktop v17 or later installs `exploratory-mcp` on the PATH when it starts. The MCP configuration runs `exploratory-mcp` with no arguments; it uses the app's local relay. Installing the plugin does not start the app.

Before using Desktop MCP, open Exploratory Desktop **System Settings > MCP / CLI** (システム設定 > MCP / CLI) and turn on the **MCP** switch. To create or change charts, notes and other content, also check **Allow create, edit and delete** (作成、変更、削除を許可する). Both are off by default.

## Install from Exploratory's GitHub marketplace

Claude Code:

```sh
claude plugin marketplace add exploratory-io/exploratory
claude plugin install exploratory@exploratory
```

Codex:

```sh
codex plugin marketplace add exploratory-io/exploratory
codex plugin add exploratory@exploratory
```

See the root [installation guide](../../README.md) ([日本語](../../README.ja.md)) for Cursor and Antigravity folder paths.

## Contents and settings

This folder contains only the Desktop MCP, 11 Desktop skills and the routing skill directly under `skills/`, Claude Code hooks and their scripts, and the report reviewer. The Claude Code settings remain `ai_summary`, `save_comments`, `review_hook` and `plan_gate`. Its hooks need Node.js on PATH. The Codex plugin manifest does not currently connect these hooks or settings; Codex itself has a hook mechanism.

For published content on exploratory.io, install the separate **Exploratory Server** plugin from your AI client's official marketplace. If you use both, install both in either order. When Server tools are absent, the routing skill uses Desktop, but a request naming exploratory.io or a published URL requires adding Server rather than substituting local data.

Desktop tools can change, delete and publish content. Review the [settings](../../README.md#settings-claude-code), [permissions](../../README.md#data-and-permissions), [privacy](../../README.md#privacy) and [security policy](../../SECURITY.md) before use.

Support: https://exploratory.io/ (use the chat at the bottom right of the site) or support@exploratory.io

License: [MIT](LICENSE)
