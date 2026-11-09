# Exploratory Server

Exploratory Server connects your AI client to Exploratory (https://exploratory.io). Your AI client can search and read the content that your account can view on exploratory.io. It can also query data on the server. This content includes notes, dashboards, slides, charts, analytics and data.

The plugin name is `exploratory-server` (version 0.1.4). It uses one MCP connection: `https://exploratory.io/mcp`.

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

The first time you use the plugin, your AI client opens a browser window. Sign in to Exploratory in that window. Then approve the access. You do not need an API key.

To remove the access, open Account Settings on exploratory.io. Then remove the client under Connected AI Apps.

## What it can do

The plugin is read-only. It can do these tasks:

- Search the content that your account can view.
- Read notes, dashboards and slides.
- Get the numbers behind a chart, and see the chart as an image.
- Get the results of analytics.
- Show the columns and rows of a data frame.
- Query a data frame on the server, for example to count, sum or filter rows.
- Export a data frame as a CSV or Parquet file.

The plugin always works as the signed-in user. It cannot show content that this user cannot view. A publisher can turn off MCP access for a piece of published content. A publisher can also keep the rows of data private.

## What it cannot do

- It cannot create, edit, publish or delete content.
- It cannot read or change projects on your computer. Use the Exploratory Desktop plugin for that work.

## Data handling

An export creates a temporary file. The AI client gives you a download link. Only the same signed-in user can use the link. The link is valid for 15 minutes.

What a tool returns becomes part of your conversation. It goes to the provider of your AI client under that provider's terms. Do not use the plugin on data that you must not send to that provider.

## Use with Exploratory Desktop

Install both plugins to work with published content and with local projects. You can install them in any order. The tools and skills of the two plugins do not overlap.

Exploratory Desktop is a separate plugin. For the installation steps, see the [Exploratory Desktop README](../exploratory-desktop/README.md).

## Support, privacy and terms

- Support: https://exploratory.io/ (use the chat at the bottom right of the site) or support@exploratory.io
- Privacy: https://exploratory.io/privacy
- Terms: https://exploratory.io/terms
