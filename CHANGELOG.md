# Changelog

## 0.1.0

- One `exploratory` plugin for content published on exploratory.io and local Exploratory Desktop projects.
- Server MCP with browser OAuth sign-in and read-only search, document retrieval, chart and analytics results, data previews, queries and exports.
- Desktop MCP registration for Claude Code, Codex, Cursor and Antigravity, a local Desktop launcher, and task-specific skills for creating and editing data, charts, analytics and reports.
- Server MCP configurations for Claude Code, Codex, Cursor, Antigravity and Gemini CLI (Gemini CLI keeps the Server MCP only), with an entry skill that selects the connected side and asks about ambiguous targets.
- Claude Code hooks for analysis plans and optional artifact reviews. AI Summary saving, chart comment saving and review hooks default to off; the analysis plan gate defaults to on within an explicitly invoked analysis skill.
- Settings applied before the first Exploratory Desktop call in a session, labelled JSON IDs in hook instructions, and a reviewer that inherits the parent model.
- Company support contact, privacy and security guidance, and installation references in English and Japanese.
- Standalone tests for the distributed hooks, manifests and skills.
