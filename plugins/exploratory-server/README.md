# Exploratory Server

Exploratory Server connects your AI client to Exploratory (https://exploratory.io). Your AI client can search and read the content that your account can view on exploratory.io. It can also query data on the server, and it can create, update and delete Pages (HTML pages) in your account. This content includes notes, dashboards, slides, charts, analytics and data.

The plugin name is `exploratory-server` (version 0.1.6). It uses one MCP connection: `https://exploratory.io/mcp`.

## What you need

- An Exploratory account.
- An AI client that supports MCP plugins or remote MCP servers.

You do not need Exploratory Desktop. You do not need Node.js.

## Install

1. Open the official plugin directory of your AI client.
2. Find **Exploratory Server**.
3. Install the plugin.

Install the plugin from the official plugin directory of your AI client when it is listed there. Until then, you can add the MCP URL directly. In Claude Code, run this command:

```sh
claude mcp add --transport http exploratory-server https://exploratory.io/mcp
```

For other clients, see the [MCP reference](../../docs/mcp.md).

## Sign in

The first time you use the plugin, start the sign-in, sign in to Exploratory in the browser and approve the access. In Claude Code, start a new session, open `/mcp`, choose `exploratory-server` and sign in; in Codex, run `codex mcp login exploratory-server`. You do not need an API key. If your setup cannot open a browser (for example a server or a scheduled job), connect with an API key instead; see [Authentication and API keys](https://docs.exploratory.io/en/mcp/server/auth). A connection with an API key can only read, so it cannot create, update or delete Pages. Detailed steps for each AI client are in the [Exploratory MCP: Server](https://docs.exploratory.io/en/mcp/server) documentation.

To remove the access, open Account Settings on exploratory.io. Then remove the client under Connected AI Apps. For an API key, revoke the key under Account Settings > API Keys.

## What it can do

The plugin mostly reads. It can do these tasks:

- Search the content that your account can view.
- Read notes, dashboards and slides.
- Get the numbers behind a chart, and see the chart as an image.
- Get the results of analytics.
- Show the columns and rows of a data frame.
- Query a data frame on the server, for example to count, sum or filter rows.
- Export a data frame as a CSV or Parquet file.
- Filter and aggregate the data of a chart in a note, dashboard or slide, and see how a data item was built.
- Read the guide for writing a Page, list and read Pages, create a private Page in your account, and update or delete Pages you or your team own. How many Pages you can create, and whether you can change them, depends on your plan. If you connected before Pages were available, remove the client under Connected AI Apps in Account Settings on exploratory.io, then connect again with the browser sign-in to write Pages. A connection that uses an API key cannot write Pages, because an API key can only read; use the browser sign-in for that.

The plugin always works as the signed-in user. It cannot show content that this user cannot view. A publisher can turn off MCP access for a piece of published content. A publisher can also keep the rows of data private.

## What it cannot do

- It cannot create, edit, publish or delete notes, dashboards, charts, analytics or data. The only content it writes is a Page.
- It cannot make a Page public. A new Page is always private, and you share it yourself in the browser.
- It cannot read or change projects on your computer. Use the Exploratory Desktop plugin for that work.

## Data handling

An export creates a temporary file on the server. The AI client gives you a download link. Only the same signed-in user can use the link. The link is valid for 15 minutes by default.

A Page you create is stored in your Exploratory account. Updating a Page's HTML makes a new version; earlier versions are kept up to your account's history limit. Changing only the title, description or datasets keeps the current version. Deleting a Page removes it and all its versions permanently. If a Page is already public, an update or a deletion changes what other people can see.

What a tool returns becomes part of your conversation. It goes to the provider of your AI client under that provider's terms. Do not use the plugin on data that you must not send to that provider.

## Use with Exploratory Desktop

Install both plugins to work with published content and with local projects. You can install them in any order. The tools and skills of the two plugins do not overlap.

Exploratory Desktop is a separate plugin. For the installation steps, see the [Exploratory Desktop README](../exploratory-desktop/README.md).

## Support, privacy and terms

- Support: https://exploratory.io/ (use the chat at the bottom right of the site) or support@exploratory.io
- Privacy: https://exploratory.io/privacy
- Terms: https://exploratory.io/terms
