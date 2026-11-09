# Changelog

## Server 0.1.3 / Desktop 0.1.6 - 2026-11-09

- Explain how to turn on Desktop MCP and write access in System Settings > MCP / CLI.
- Split the former combined plugin into `plugins/exploratory-server/` and `plugins/exploratory-desktop/`, with independently versioned manifests. Earlier entries below describe the combined plugin.
- Distribute Server (`exploratory-server`) through official marketplaces; list only Desktop (`exploratory`, display name Exploratory Desktop) in Exploratory's GitHub marketplace. Install both in either order to use both.
- Keep Server limited to the remote URL MCP, Server skill and allowed static assets; no hooks or local executables.
- Require the MCP-enabled Exploratory Desktop v17 or later and `exploratory-mcp` with no arguments, installed on the PATH when Desktop starts; remove the repository Desktop launcher. Claude Code hooks still run with `node`.
- Flatten the Desktop skills and keep its routing skill, Claude Code hooks and reviewer in the Desktop folder. The Codex manifest does not currently connect the hooks.
- Update the Codex skill installer to reference only the flat Desktop skills, without copying or linking the Server skill.
- Keep the MCP reference documents at the repository root under `docs/`.

## 0.1.2 - 2026-11-07

- Claude Code hooks react only to the Exploratory Desktop MCP tools, not to same-named tools from other MCP servers.
- The release version check also covers the Antigravity manifest.
- Add assets/logo-plate.png, the logo on a white background for directory listings.

## 0.1.1 - 2026-11-06

- Desktop analysis: R makes calculations and PNG charts (no HTML report); requests that name an analysis go straight to analytics.
- Dashboards: a Number row, a comparison for the latest period, and one full-dashboard image to check the result. Notes are checked with one full-note image.
- Claude Code hooks: the plan gate also guards dashboards, checks Number and Line values against R, and stops on fixable rows left unfixed.

## 0.1.0 - 2026-11-05

- One `exploratory` plugin for content published on exploratory.io and local Exploratory Desktop projects.
- Server MCP with browser OAuth sign-in and read-only search, document retrieval, chart and analytics results, data previews, queries and exports.
- Desktop MCP registration for Claude Code, Codex, Cursor and Antigravity, a local Desktop launcher, and task-specific skills for creating and editing data, charts, analytics and reports.
- Server MCP configurations for Claude Code, Codex, Cursor, Antigravity, with an entry skill that selects the connected side and asks about ambiguous targets.
- Claude Code hooks for analysis plans and optional artifact reviews. AI Summary saving, chart comment saving and review hooks default to off; the analysis plan gate defaults to on within an explicitly invoked analysis skill.
- Settings applied before the first Exploratory Desktop call in a session, labelled JSON IDs in hook instructions, and a reviewer that inherits the parent model.
- Company support contact, privacy and security guidance, and installation references in English and Japanese.
- Standalone tests for the distributed hooks, manifests and skills.
