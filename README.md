# Exploratory plugins

[日本語](README.ja.md)

These plugins connect your AI client (Claude Code, Codex, Cursor and others) to Exploratory through MCP (Model Context Protocol). There are two plugins:

- **Exploratory Server** reads content published on [exploratory.io](https://exploratory.io): notes, dashboards, slides, charts, analytics and data. It can also create private Pages (HTML pages) in your account, and update or delete Pages you or your team own.
- **Exploratory Desktop** creates and edits projects in Exploratory Desktop on your computer.

## Choose the plugins you need

Find your case in the table, then follow that guide.

| You want to | Guide | What you install |
|---|---|---|
| Read and query content published on exploratory.io, and create Pages | [Server only](#guide-1-server-only) | Exploratory Server |
| Build data, charts, analytics, notes and dashboards in Exploratory Desktop | [Desktop only](#guide-2-desktop-only) | Exploratory Desktop v17 or later, and the Exploratory Desktop plugin |
| Do both | [Server and Desktop](#guide-3-server-and-desktop) | Both of the above |

| Plugin | Plugin name | Where it comes from |
|---|---|---|
| [Exploratory Server](plugins/exploratory-server/README.md) | `exploratory-server` (0.1.6) | Your AI client's official plugin directory |
| [Exploratory Desktop](plugins/exploratory-desktop/README.md) | `exploratory` (0.1.10) | This repository's marketplace (`exploratory-io/exploratory`) |

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

For Cursor, Grok Bot and other clients, see the [MCP reference](docs/mcp.md). For the Claude app, the ChatGPT app and every other client, see [Add from an AI tool](https://docs.exploratory.io/en/mcp/server/clients/apps).

Use one way only: the official plugin, the direct URL, or the Exploratory connector on claude.ai (it also appears in Claude Code when you sign in with the same Claude account). If you later install the plugin from the official directory, remove the direct entry first (for example, `claude mcp remove exploratory-server`). Otherwise the same tools appear twice.

### Step 2. Sign in

Start a new session and sign in. In Claude Code, open `/mcp`, select `exploratory-server` and sign in in the browser. In Codex, run `codex mcp login exploratory-server` (included above). In Cursor, choose **Authenticate** on the `exploratory-server` row under Customize > MCPs, or run `agent mcp login exploratory-server`. Sign in to Exploratory and approve the access. You do not need an API key. If your setup cannot open a browser (a server or a scheduled job), connect with an API key instead: see [Authentication and API keys](https://docs.exploratory.io/en/mcp/server/auth#apikey).

### Step 3. Try it

> List my published content on Exploratory.

> What columns does the "Sales" data on Exploratory have, and which 5 regions have the highest sales?

## Guide 2: Desktop only

You need these:

- Exploratory Desktop v17 or later, signed in and running. When it starts, it puts the `exploratory-mcp` command on your PATH. The plugin starts this command. On macOS, if you run Desktop directly from the disk image, the command is not added. Move Exploratory to the Applications folder and start it from there.
- For Claude Code: `node` on your PATH. The plugin's review hooks run with it.

### Step 1. Turn on MCP and install the plugin in System Settings

In Exploratory Desktop, choose your name at the bottom left of the screen, then choose **System Settings**. The steps with pictures are in [Install the plugin](https://docs.exploratory.io/en/mcp/desktop/install).

1. In the menu on the left, choose **MCP / CLI**.
2. Turn on the **MCP** switch. It is off by default. While it is off, the plugin section below is dimmed and its buttons cannot be used.
3. In the **Install the Exploratory Desktop plugin** section, Exploratory lists the AI tools on this computer (Claude Code, ChatGPT (Codex), Antigravity and Cursor). Choose **Install** on the row of the AI tool you use. After installing, restart that AI tool.
4. Only when you want the AI to create or change charts, notes and other content, check **Allow create, edit and delete**. Without it, the AI can only read.
5. Choose **Save** at the bottom of the screen. If you do not save, the MCP switch and **Allow create, edit and delete** do not take effect.

### If you can't install from System Settings

For example when Exploratory Desktop can't reach the network, install by hand. The plugin is not in the official plugin directories: add this repository as a marketplace, then install the plugin. Run the commands yourself, or ask your AI tool to run them. Installing from the Claude app, the ChatGPT app and the Cursor app is described in [Install the plugin](https://docs.exploratory.io/en/mcp/desktop/install#manual).

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

#### Antigravity

```sh
git clone https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory/plugins/exploratory-desktop
```

Needs Git. The plugin appears in the Antigravity app under Customizations > Installed.

#### Cursor

```sh
git clone --depth 1 https://github.com/exploratory-io/exploratory
mkdir -p ~/.cursor/plugins/local
cp -R exploratory/plugins/exploratory-desktop ~/.cursor/plugins/local/exploratory
```

Needs Git. This copies the plugin into the same folder that System Settings uses. Quit and restart Cursor.

Then turn on the **MCP** switch in **System Settings > MCP / CLI** and choose **Save**, as in Step 1.

### Step 2. Check and try it

Start a new session. In Claude Code, open `/mcp` and check that `exploratory-desktop` is connected. In Codex, run `codex mcp list` and check that `exploratory-desktop` is listed. In Antigravity, check that the plugin appears under Customizations > Installed. For Cursor, check that its row in **System Settings > MCP / CLI** shows **Installed - v** and the version. Open a project in Exploratory Desktop, then try:

> List the data frames in my open Exploratory project.

This works with **Allow create, edit and delete** off. To try creating a chart, first check **Allow create, edit and delete** and choose **Save**.

The first time an AI tool connects, Exploratory Desktop shows a window asking for your approval. Choose Allow only for an app you started yourself. If a call says that MCP is turned off, go back to Step 1 and check that you turned the MCP switch on and chose Save. For other messages, see [Troubleshooting](https://docs.exploratory.io/en/mcp/desktop/troubleshooting).

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
| Charts and analytics | `chart_get_data` returns the numbers behind a chart; `chart_get_image` returns the chart as an image; `analytics_get_result` returns coefficients, p-values and other results; `chart_query` filters and aggregates the data of a chart in a note, dashboard or slide on the server |
| Data | `dataframe_get_schema` describes the columns and their approved meaning; `dataframe_preview` shows rows; `query_dataset` filters and aggregates on the server; `dataframe_export` saves a result as CSV or Parquet; `dataframe_get_wrangling` shows how a data item was built, step by step |
| Pages | `get_page_guide` tells how to write a Page; `page_publish` publishes one HTML file that queries your data live, as a private Page; `page_update`, `page_list`, `page_get` and `page_delete` change, list, read and delete Pages |
| Set up Desktop | `desktop_mcp_setup_guide` returns the steps to connect an AI client to Exploratory Desktop |

The Server MCP tools for finding, reading and querying are read-only. `dataframe_export` makes a download link that is valid for 15 minutes by default. The Page tools `page_publish`, `page_update` and `page_delete` create Pages in your account and change or delete Pages you or your team own. How many Pages you can create, and whether you can change them, depends on your plan. They need the `page:write` permission, which you approve when you sign in through the browser. If a connection lacks it, reconnect. With an API key you can still read Pages (`get_page_guide`, `page_list`, `page_get`), but not create, change or delete them.

The Desktop MCP tools create and edit local projects. They work with these items:

- Projects (open, save, import, history) and data frames, wrangling steps, branches, parameters and connections
- The local data catalog, R packages, palettes, dictionaries, and AI function and note prompt templates
- Charts and analytics
- Notes and dashboards

Some Desktop MCP tools change or remove things:

- Delete charts, analytics, notes, dashboards, steps, branches, parameters, connections, catalog items, R packages, palettes and templates.
- Publish and unpublish notes, dashboards, data frames and projects.
- Change the Exploratory system settings with `update_system_settings`.
- Run R code with `execute_r_script`.

Review what your agent proposes before it writes. The [Exploratory MCP reference](docs/mcp.md) lists the arguments, errors and limits of the Server MCP tools. Your AI client shows the Desktop MCP tools in its tool list.

## Settings (Claude Code)

Claude Code has three plugin settings:

| Setting | Default | What it does |
|---|---|---|
| `ai_summary` | `false` | Creates and saves an AI Summary for the charts and analytics you create |
| `save_comments` | `false` | Saves an explanatory comment on the charts you create |
| `review_hook` | `false` | Asks the agent to review its work, checks custom R steps, and asks for one look at the whole image before the final report (see below and [Privacy](#privacy)) |

With `review_hook` on, the agent reviews its work at four times:

- Before the first `create_chart` or `create_analytics`.
- After each wrangling step.
- After a note is created.
- After chart and analytics create or edit calls.
  - The review happens once for each chart or analytics.
  - The limit is 8 charts and analytics together in a session.
  - Set `EXPLORATORY_REVIEW_CHART_LIMIT` to change the limit.

With `review_hook` on, the hooks also check the form of custom R steps (`exp_custom`) and, before the final report, ask the agent once to look at the whole image of a note or of each dashboard page. For the checks and their rules, see [Review hook (Claude Code)](docs/mcp.md#review-hook-claude-code).

To see the settings, run `claude plugin configure exploratory@exploratory`. To change them, send a JSON object to that command with `--values-stdin`. Each value is the string `"true"` or `"false"`, not a JSON boolean (for example `{"review_hook": "true"}`). You can also set them when you install:

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

The Desktop package connects the hooks and settings through its Claude Code manifest. Its Codex manifest does not currently connect those hooks or settings; Codex itself has a hook mechanism.

## Data and permissions

- The Server MCP reads published content, and can publish and manage Pages you or your team own. The Desktop MCP can create and edit local project content. It can publish when you ask. Review the operations your agent proposes.
- Server MCP calls run as the signed-in user. They never go beyond what that user can view on exploratory.io. A publisher can turn off MCP access for each piece of published content. A publisher can also keep the rows of data private.
- These controls do not apply to the Desktop MCP. The Desktop MCP works through the Exploratory Desktop app on your computer, as the user signed in to the app.
- To disconnect a client from the Server MCP, open Account Settings on exploratory.io and remove it under Connected AI Apps. For an API key, revoke the key under Account Settings > API Keys. This does not stop the Desktop MCP. The Desktop MCP stops when you quit Exploratory Desktop.
- In **System Settings > MCP / CLI**, under **Approved apps**, you can remove an app you approved; it asks for approval again the next time it connects.

## Update and uninstall

The Desktop plugin is updated and removed the way you installed it. Update or remove Server through the official marketplace where you installed it.

- Installed from System Settings: when a newer version exists, the AI tool's row in **System Settings > MCP / CLI** shows **Update**. To remove the plugin, choose **Remove** on the same row.
- Installed with commands:

| Client | Update | Uninstall |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory`, then `claude plugin update exploratory@exploratory`, and restart Claude Code | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory`, then reinstall with `codex plugin remove exploratory@exploratory` and `codex plugin add exploratory@exploratory` | `codex plugin remove exploratory@exploratory` |
| Antigravity | In the cloned folder, run `git pull`, then `agy plugin install ./plugins/exploratory-desktop` | Remove the plugin in Antigravity's plugin settings |
| Cursor | Run `git pull` in the cloned folder, then `rm -rf ~/.cursor/plugins/local/exploratory && cp -R plugins/exploratory-desktop ~/.cursor/plugins/local/exploratory`, and restart Cursor | `rm -rf ~/.cursor/plugins/local/exploratory`, and restart Cursor |

Uninstalling does not revoke Server MCP access. To revoke it, also remove the client under Connected AI Apps on exploratory.io; for an API key, revoke the key under Account Settings > API Keys.

## Troubleshooting

| Problem | What to do |
|---|---|
| `exploratory-mcp` is not found | Start Exploratory Desktop v17 or later; it adds the command when it starts. On macOS, if Exploratory runs from the disk image or a temporary location, the command is not added: move Exploratory to the Applications folder, start it again, and choose **Reinstall** on the AI tool's row in **System Settings > MCP / CLI**. If the command could not be added to `/usr/local/bin`, System Settings shows where it was placed instead. Then restart your AI client. |
| A Claude Code hook cannot find `node` | Install Node.js and add `node` to your PATH. |
| The Desktop MCP tools return a not-running error | Start Exploratory Desktop. Then use the tools again in the same conversation. |
| The Server MCP asks you to sign in | With the browser sign-in, sign in again: `/mcp` in Claude Code, `codex mcp login exploratory-server` in Codex, `agent mcp login exploratory-server` in Cursor. In Grok Bot, remove the connection and add it again. With an API key, signing in does not help: check that your account can still use API keys and replace an invalid, expired or revoked key under Account Settings > API Keys (only Authors can create keys). |
| The Desktop MCP does not work as you expect | Check that you are signed in to Exploratory Desktop. |

## Privacy

- Server MCP: calls go to `https://exploratory.io/mcp`. They read published content and publish and manage Pages you or your team own. For permissions, see [Data and permissions](#data-and-permissions).
- Desktop MCP: it runs on your computer. Its relay talks to your local Exploratory Desktop. It reads and edits local project content (data frames, charts, analytics, notes, dashboards) through the app.
- Desktop MCP usage records: Exploratory Desktop sends one usage record for each Desktop MCP tool call. It sends the record to the exploratory.io server you are signed in to. We use the records to improve the tools.
  - A record holds the tool name and may hold its arguments, which can include formulas and values you entered. Arguments over the size or nesting limit are left out.
  - A record also holds these items: success or failure, and the error type and message.
  - It also holds the size of the result (not the content) and the duration.
  - It holds the Exploratory Desktop version, the AI client name and version, and the session and item IDs.
  - Exploratory Desktop sends records only while you are signed in and AI features are on. It never sends records for local data catalog tools.
- Tool results: what a tool returns (rows, column names, chart images, errors) becomes part of your conversation. It goes to the provider of your AI (for example Anthropic, OpenAI, Google or xAI) under that provider's terms. Do not use the plugin on data that you may not send to that provider.
- Hooks (currently connected through the Claude Code manifest): a hook is a small program that runs by itself before or after an agent action. These hooks run locally with `node` and send nothing over the network.
  - State files: the hooks write them to the plugin data folder. If no folder is set, they write to `exploratory-plugin-review` in the system temp folder. The plugin does not delete these files. Delete them yourself if you do not want them kept.
  - Review hook: with `review_hook` on, it saves fields taken from the arguments and results of successful calls of these tools, one record per chart or analytics, in a `-charts.json` file. They can include column names and filter values.
    - `create_chart`
    - `update_chart`
    - `create_analytics`
    - `update_analytics`
  - For notes, the hooks save the note ID or title.
  - Record hooks: with `review_hook` on, the hooks also save these items:
    - A SHA-1 hash (a short code made from the text) of each custom R expression, and how many custom R steps were refused.
    - The paths of R report (HTML) files.
    - Chart IDs.
    - The IDs of the notes and dashboards made after the analysis skill was used, with the chart IDs and page layout on them.
    - Numbers returned by R and by Number and Line chart data.
  - The record hooks start on every call of `Skill`, `Write`, `Bash` and `PowerShell`. It also starts on these Desktop MCP calls:
    - `execute_r_script`, `get_chart_image`, `get_chart_data`
    - `create_chart`, `update_chart`, `create_analytics`, `update_analytics`, `delete_chart`, `delete_analytics`
    - `create_note`, `update_note`, `get_note_image`
    - `create_dashboard`, `update_dashboard`, `get_dashboard`, `get_dashboard_image`
  - Even before the analysis skill is used, the record hooks record that R was run, the numbers returned by R, and chart IDs. They record the paths of R report (HTML) files only after the analysis skill was used.
  - Image hook: it runs whether `review_hook` is on or off. With `review_hook` off, before `get_note_image` and `get_dashboard_image` it reads the conversation file on your computer and checks your latest message for words that ask for an image. If it cannot read that message, it lets the call through. Unless you asked for an image or a screenshot, it refuses the call and tells the agent to read values with `get_chart_data` or `get_dashboard` instead. With `review_hook` on, it lets these calls through.
  - Settings hook: it passes the setting values to the agent as context. It starts on every Desktop MCP call, also when `review_hook` is `false`. It writes a small marker file (`-settings`) for the session in the state folder.
  - To turn off the record hooks, set `review_hook` to `false`. You can also uninstall the plugin.
- Exploratory's privacy policy: https://exploratory.io/privacy

## Support

Use the chat at the bottom right of https://exploratory.io/, or write to support@exploratory.io.

Terms: https://exploratory.io/terms

## Security

Do not put tokens or passwords into prompts or files. The plugin does not pass a token. The relay reads its own credentials.

The Desktop MCP marks delete operations (`delete_*`, `unpublish`) and publish operations (`publish_*`: `publish_note`, `publish_dashboard`, `publish_data_frame`, `publish_project`) with `destructiveHint`. This is only a hint. A client that honors it can ask you to confirm. This depends on the client and your permission settings. Copying to another project is not marked.

Exploratory Desktop also asks you to confirm before it runs a high-risk call. You can skip this in **System Settings > MCP / CLI** with the two switches **Run changes, deletions and publishing without asking** and **Run code and AI processing without asking**.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Docs

- [Exploratory MCP reference](docs/mcp.md): endpoint, authorization, tools, errors and limits
- [Exploratory MCP documentation](https://docs.exploratory.io/en/mcp): detailed instructions with pictures
  - [Server](https://docs.exploratory.io/en/mcp/server): setup for each AI client, [authentication and API keys](https://docs.exploratory.io/en/mcp/server/auth), [data and permissions](https://docs.exploratory.io/en/mcp/server/data) and [troubleshooting](https://docs.exploratory.io/en/mcp/server/troubleshooting)
  - [Desktop](https://docs.exploratory.io/en/mcp/desktop): [install](https://docs.exploratory.io/en/mcp/desktop/install), [permissions and settings](https://docs.exploratory.io/en/mcp/desktop/permissions), [data and permissions](https://docs.exploratory.io/en/mcp/desktop/data) and [troubleshooting](https://docs.exploratory.io/en/mcp/desktop/troubleshooting)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

MIT
