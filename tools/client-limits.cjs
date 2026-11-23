'use strict';

// Limits of the AI clients that read this plugin. Each value is the smaller of Claude Code and Codex.
module.exports = {
  // Codex 0.169.0 codex-rs/ext/skills/src/render.rs:27-28 MAX_CATALOG_SKILL_DESCRIPTION_CHARS = 1_024 (longer is cut to 1,021 characters and "...").
  // Claude Code cuts description + when_to_use at 1,536 characters (https://code.claude.com/docs/en/skills.md).
  skillDescriptionChars: 1024,
  // Codex 0.169.0 codex-rs/hooks/src/output_spill.rs:12-13 DEFAULT_HOOK_OUTPUT_TOKEN_LIMIT = 2_500 tokens, counted as 4 bytes each.
  // Claude Code moves hook text over 10,000 characters to a file (https://code.claude.com/docs/en/hooks.md).
  hookOutputBytes: 10000
};
