---
name: exploratory-codex-scripts
description: "Codex: when a functions.exec script calls an Exploratory Desktop MCP tool, on success print only the fields you need from the result's structuredContent (text(r.structuredContent.body)), never the whole result: its content repeats the same JSON, so text(r) doubles it and a large result is cut at 10k tokens. For errors (isError, no structuredContent), images and non-JSON guidance, read the matching content block."
---

On success, print `r.structuredContent` or one of its fields, not `r`.
For errors, images and guidance that has no structuredContent, read the matching `r.content` block.
