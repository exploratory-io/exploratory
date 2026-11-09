# Exploratory plugins

[日本語](README.ja.md)

These plugins connect your AI client (Claude Code, Codex, Cursor and others) to Exploratory through MCP (Model Context Protocol). There are two plugins:

- **Exploratory Server** reads content published on [exploratory.io](https://exploratory.io): notes, dashboards, slides, charts, analytics and data.
- **Exploratory Desktop** creates and edits projects in Exploratory Desktop on your computer.

## Choose the plugins you need

Find your case in the table, then follow that guide.

| You want to | Guide | What you install |
|---|---|---|
| Read and query content published on exploratory.io | [Server only](#guide-1-server-only) | Exploratory Server |
| Build data, charts, analytics, notes and dashboards in Exploratory Desktop | [Desktop only](#guide-2-desktop-only) | Exploratory Desktop v17 or later, and the Exploratory Desktop plugin |
| Do both | [Server and Desktop](#guide-3-server-and-desktop) | Both of the above |

| Plugin | Plugin name | Where it comes from |
|---|---|---|
| [Exploratory Server](plugins/exploratory-server/README.md) | `exploratory-server` (0.1.4) | Your AI client's official plugin directory |
| [Exploratory Desktop](plugins/exploratory-desktop/README.md) | `exploratory` (0.1.6) | This repository's marketplace (`exploratory-io/exploratory`) |

The two plugins do not share tools or skills. You can install both, in any order.

## Guide 1: Server only

You need an Exploratory account. You do not need Exploratory Desktop or Node.js.

### Step 1. Install

Install **Exploratory Server** from the official plugin directory of your AI client when it is listed there.

Until then, add the MCP URL directly. This adds the tools, but not the Server skill.

Claude Code:

```sh
claude mcp add --transport http exploratory-server https://exploratory.io/mcp
```

Codex:

```sh
codex mcp add exploratory-server --url https://exploratory.io/mcp
codex mcp login exploratory-server
```

For Cursor, Grok Bot and other clients, see the [MCP reference](docs/mcp.md).

Use one way only: the official plugin, the direct URL, or the Exploratory connector on claude.ai (it also appears in Claude Code when you sign in with the same Claude account). If you later install the plugin from the official directory, remove the direct entry first (for example, `claude mcp remove exploratory-server`). Otherwise the same tools appear twice.

### Step 2. Sign in

Start a new session. On the first call, your AI client opens a browser window. Sign in to Exploratory and approve the access. You do not need an API key.

### Step 3. Try it

> List my published content on Exploratory.

> What columns does the "Sales" data on Exploratory have, and which 5 regions have the highest sales?

## Guide 2: Desktop only

You need these:

- Exploratory Desktop v17 or later, signed in and running. When it starts, it puts the `exploratory-mcp` command on your PATH. The plugin starts this command.
- For Claude Code: `node` on your PATH. The plugin's review hooks run with it.

### Step 1. Turn on MCP in Exploratory Desktop

Open **System Settings > MCP / CLI** and turn on the **MCP** switch. To create or change charts, notes and other content, also check **Allow create, edit and delete**. Both are off by default.

### Step 2. Install the Exploratory Desktop plugin

This plugin is not in the official directories. Add this repository as a marketplace, then install the plugin. You can type the commands, or ask your AI client to run them.

#### Claude Code

```sh
claude plugin marketplace add exploratory-io/exploratory
claude plugin install exploratory@exploratory
```

You can also open `/plugin` in Claude Code, add the marketplace `exploratory-io/exploratory`, and select `exploratory`.

#### Codex

```sh
codex plugin marketplace add exploratory-io/exploratory
codex plugin add exploratory@exploratory
```

#### Cursor

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory/plugins/exploratory-desktop
```

To register only the Desktop MCP, without skills, add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "exploratory-desktop": {
      "type": "stdio",
      "command": "exploratory-mcp"
    }
  }
}
```

#### Antigravity

```sh
git clone https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory/plugins/exploratory-desktop
```

### Step 3. Check and try it

Start a new session. In Claude Code, open `/mcp` and check that `exploratory-desktop` is connected. In Codex, run `codex mcp list` and check that `exploratory-desktop` is listed. Open a project in Exploratory Desktop, then try:

> In my open Exploratory project, build a monthly bar chart from the sales data.

If a call says that MCP is turned off, go back to Step 1.

## Guide 3: Server and Desktop

Follow [Guide 1](#guide-1-server-only) and [Guide 2](#guide-2-desktop-only). The order does not matter. You can add the other plugin later; you do not need to reinstall the first one.

- The Desktop plugin includes a routing skill. It sends requests about published content to Server, and requests about your local project to Desktop.
- Install Server in one way only (official plugin, direct URL, or the claude.ai connector). Two Server entries show the same tools twice.
- Sign-in is separate. Server uses Exploratory OAuth in the browser. Desktop uses the account that is signed in to the app.

### If you used the earlier all-in-one plugin

The earlier `exploratory` plugin included both Server and Desktop. When you update it, it becomes the Desktop plugin, and the Server connection is removed. To keep reading published content, add Server with [Guide 1](#guide-1-server-only).

## What agents can do

| Category | Tools |
|---|---|
| Find and read | `search` lists and searches published content; `fetch` reads a note, dashboard or slide as Markdown |
| Charts and analytics | `chart_get_data` returns the numbers behind a chart; `chart_get_image` returns the chart as an image; `analytics_get_result` returns coefficients, p-values and other results |
| Data | `dataframe_get_schema` describes the columns and their approved meaning; `dataframe_preview` shows rows; `query_dataset` filters and aggregates on the server; `dataframe_export` saves a result as CSV or Parquet |

The Server MCP tools in the table are read-only. Only `dataframe_export` makes something: a download link that is valid for 15 minutes.

The Desktop MCP tools create and edit local projects. They work with these items:

- Data frames, wrangling steps, branches, parameters and connections
- Charts and analytics
- Notes and dashboards

Some Desktop MCP tools change or remove things:

- Delete charts, analytics, notes, dashboards, steps, branches, parameters and connections.
- Publish and unpublish notes, dashboards and data frames.
- Run R code with `execute_r_script`.

Review what your agent proposes before it writes. The [Exploratory MCP reference](docs/mcp.md) lists the arguments, errors and limits of the Server MCP tools. Your AI client shows the Desktop MCP tools in its tool list.

## Settings (Claude Code)

Claude Code has four plugin settings:

| Setting | Default | What it does |
|---|---|---|
| `ai_summary` | `false` | Creates and saves an AI Summary for the charts and analytics you create |
| `save_comments` | `false` | Saves an explanatory comment on the charts you create |
| `review_hook` | `false` | Asks the agent to review its work (see below and [Privacy](#privacy)) |
| `plan_gate` | `true` | Makes the agent save a plan before it builds (see [Plan gate](#plan-gate)) |

With `review_hook` on, the agent reviews its work at four times:

- Before the first `create_chart` or `create_analytics`.
- After each wrangling step.
- After a note is created.
- After chart and analytics create or edit calls.
  - The review happens once for each chart or analytics.
  - The limit is 8 charts and analytics together in a session.
  - Set `EXPLORATORY_REVIEW_CHART_LIMIT` to change the limit.

To see the settings, run `claude plugin configure exploratory@exploratory`. To change them, send a JSON object to that command with `--values-stdin`. You can also set them when you install:

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

The Desktop package connects hooks and the plan gate through its Claude Code manifest. Its Codex manifest does not currently connect those hooks or settings; Codex itself has a hook mechanism.

### Plan gate

The plan gate stops the agent from building before it saves a plan. It is on by default (`plan_gate` = `true`). To turn it off, set `plan_gate` to `false` with the `claude plugin configure` command above.

For the refused calls and the rules, see [Plan gate (Claude Code)](docs/mcp.md#plan-gate-claude-code).

## Data and permissions

- The Server MCP reads published content. The Desktop MCP can create and edit local project content. It can publish when you ask. Review the operations your agent proposes.
- Server MCP calls run as the signed-in user. They never go beyond what that user can view on exploratory.io. A publisher can turn off MCP access for each piece of published content. A publisher can also keep the rows of data private.
- These controls do not apply to the Desktop MCP. The Desktop MCP works through the Exploratory Desktop app on your computer, as the user signed in to the app.
- To disconnect a client from the Server MCP, open Account Settings on exploratory.io and remove it under Connected AI Apps. This does not stop the Desktop MCP. The Desktop MCP stops when you quit Exploratory Desktop.

## Update and uninstall

The commands below manage the Desktop plugin. Update or remove Server through the official marketplace where you installed it.

| Client | Update | Uninstall |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory`, then `claude plugin update exploratory@exploratory`, and restart Claude Code | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory`, then reinstall with `codex plugin remove exploratory@exploratory` and `codex plugin add exploratory@exploratory` | `codex plugin remove exploratory@exploratory` |
| Cursor | Run `git pull` in the cloned folder and start `agent --plugin-dir` again | Stop using `--plugin-dir`; if you wrote `~/.cursor/mcp.json` by hand, remove `exploratory-desktop` from it |
| Antigravity | Run `git pull` in the cloned folder, then `agy plugin install` again | Remove the plugin in Antigravity's plugin settings |

Uninstalling does not revoke Server MCP access. To revoke it, also remove the client under Connected AI Apps on exploratory.io.

## Troubleshooting

| Problem | What to do |
|---|---|
| `exploratory-mcp` is not found | Start the MCP-enabled Exploratory Desktop v17 or later to install `exploratory-mcp` on the PATH, then restart your AI client. |
| A Claude Code hook cannot find `node` | Install Node.js and add `node` to your PATH. |
| The Desktop MCP tools return a not-running error | Start Exploratory Desktop. Then use the tools again in the same conversation. |
| The Server MCP asks you to sign in | Sign in again: `/mcp` in Claude Code, `codex mcp login exploratory-server` in Codex, `agent mcp login exploratory-server` in Cursor. In Grok Bot, remove the connection and add it again. |
| The Desktop MCP does not work as you expect | Check that you are signed in to Exploratory Desktop. |

## Privacy

- Server MCP: calls go to `https://exploratory.io/mcp`. They read published content only and are read-only. For permissions, see [Data and permissions](#data-and-permissions).
- Desktop MCP: it runs on your computer. Its relay talks to your local Exploratory Desktop. It reads and edits local project content (data frames, charts, analytics, notes, dashboards) through the app.
- Desktop MCP usage records: Exploratory Desktop sends one usage record for each Desktop MCP tool call. It sends the record to the exploratory.io server you are signed in to. We use the records to improve the tools.
  - A record holds the tool name and its arguments. The arguments can include formulas and values you entered.
  - A record also holds these items: success or failure, and the error type and message.
  - It also holds the size of the result (not the content) and the duration.
  - It holds the Exploratory Desktop version, the AI client name and version, and the session and item IDs.
  - Exploratory Desktop sends records only while you are signed in and AI features are on. It never sends records for local data catalog tools.
- Tool results: what a tool returns (rows, column names, chart images, errors) becomes part of your conversation. It goes to the provider of your AI (for example Anthropic, OpenAI, Google or xAI) under that provider's terms. Do not use the plugin on data that you may not send to that provider.
- Hooks (currently connected through the Claude Code manifest): a hook is a small program that runs by itself before or after an agent action. These hooks run locally with `node` and send nothing over the network.
  - State files: the hooks write them to the plugin data folder. If no folder is set, they write to `exploratory-plugin-review` in the system temp folder. The plugin does not delete these files. Delete them yourself if you do not want them kept.
  - Review hook: with `review_hook` on, it saves the arguments and results of these tools as they are in a `-charts.json` file. This can include column names and filter values.
    - `create_chart`
    - `update_chart`
    - `create_analytics`
    - `update_analytics`
  - For notes, the hooks save the note ID or title.
  - Plan hooks: with `plan_gate` on (the default), the hooks save these items:
    - A SHA-1 hash (a short code made from the text) of each R expression.
    - The paths of the report and plan files.
    - Chart IDs.
  - With `plan_gate` on, the hooks also read the `*計画*.md` and `*plan*.md` files in your working folder. `計画` means "plan".
  - The plan hooks start on every call of `Skill`, `Write`, `Bash` and `PowerShell`. It also starts on these Desktop MCP calls:
    - `execute_r_script`, `get_chart_image`, `get_chart_data`
    - `create_chart`, `update_chart`, `create_analytics`, `update_analytics`, `delete_chart`
    - `create_note`, `update_note`, `get_note_image`
    - `create_dashboard`, `update_dashboard`, `get_dashboard`, `get_dashboard_image`
  - The plan hooks record nothing unless the analysis skill was used first.
  - Settings hook: it passes the setting values to the agent as context. It starts on every Desktop MCP call, also when `review_hook` and `plan_gate` are both `false`. It writes a small marker file (`-settings`) for the session in the state folder.
  - To turn off the record hooks, set `review_hook` and `plan_gate` to `false`. You can also uninstall the plugin.
- Exploratory's privacy policy: https://exploratory.io/privacy

## Support

Use the chat at the bottom right of https://exploratory.io/, or write to support@exploratory.io.

Terms: https://exploratory.io/terms

## Security

Do not put tokens or passwords into prompts or files. The plugin does not pass a token. The relay reads its own credentials.

The Desktop MCP marks delete operations (`delete_*`, `unpublish`) and publish operations (`publish_note`, `publish_dashboard`, `publish_data_frame`) with `destructiveHint`. This is only a hint. A client that honors it can ask you to confirm. This depends on the client and your permission settings. Copying to another project is not marked.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Docs

- [Exploratory MCP reference](docs/mcp.md): endpoint, authorization, tools, errors and limits
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

MIT
