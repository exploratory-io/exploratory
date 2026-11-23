'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const limits = require('./client-limits.cjs');

const repoRoot = path.resolve(__dirname, '..');
const pluginDirs = fs.readdirSync(path.join(repoRoot, 'plugins')).map(name => path.join(repoRoot, 'plugins', name))
  .filter(dir => fs.statSync(dir).isDirectory());

function description(file) {
  // A Windows checkout may have CRLF line ends.
  const frontmatter = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  assert(frontmatter, file + ' has no frontmatter');
  const line = frontmatter[1].match(/^description:[ \t]*(.*)$/m);
  assert(line && line[1], file + ' has no one-line description');
  return line[1].startsWith('"') ? JSON.parse(line[1]) : line[1];
}

test('every skill description fits the client limit', () => {
  const files = pluginDirs.flatMap(dir => fs.existsSync(path.join(dir, 'skills'))
    ? fs.readdirSync(path.join(dir, 'skills')).map(name => path.join(dir, 'skills', name, 'SKILL.md')).filter(file => fs.existsSync(file)) : []);
  assert(files.length > 0);
  for (const file of files) {
    const text = description(file);
    assert(text.length > 0 && text.length <= limits.skillDescriptionChars, path.relative(repoRoot, file) + ': ' + text.length);
  }
});

test('a CRLF checkout of a skill gives the same description as LF', () => {
  const file = path.join(repoRoot, 'plugins/exploratory-desktop/skills/exploratory-core/SKILL.md');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exploratory-crlf-'));
  try {
    const crlf = path.join(dir, 'SKILL.md');
    fs.writeFileSync(crlf, fs.readFileSync(file, 'utf8').replace(/\r?\n/g, '\r\n'));
    assert.equal(description(crlf), description(file));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// A tool name the matcher accepts, made from the words the matcher itself lists.
function toolNameFor(matcher) {
  if (!matcher) return '';
  const pattern = new RegExp(matcher);
  const words = [...new Set(matcher.match(/[A-Za-z][A-Za-z_]*/g) || [])];
  // The first alternative of each group, e.g. create_(chart|analytics) -> create_chart.
  const first = matcher.split('$|')[0].replace('(?:plugin_exploratory_)?', '').replace(/\(([^()|]+)(?:\|[^()]*)?\)/g, '$1').replace(/[\^$]/g, '');
  const candidates = [first].concat(words.flatMap(word => ['mcp__exploratory-desktop__' + word, word]), 'mcp__exploratory-desktop__get_environment');
  return candidates.find(name => pattern.test(name));
}

test('every hook output fits the client limit in all settings', () => {
  const runs = [];
  for (const dir of pluginDirs) {
    const hooksDir = path.join(dir, 'hooks');
    if (!fs.existsSync(hooksDir)) continue;
    for (const file of fs.readdirSync(hooksDir).filter(name => name.endsWith('.json'))) {
      for (const [event, entries] of Object.entries(JSON.parse(fs.readFileSync(path.join(hooksDir, file), 'utf8')).hooks)) {
        for (const entry of entries) for (const hook of entry.hooks) {
          const parts = hook.command.match(/^node "\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)"(?: (\S+))?$/);
          assert(parts, 'unexpected hook command: ' + hook.command);
          const toolName = toolNameFor(entry.matcher);
          assert(toolName !== undefined, 'no tool name for ' + entry.matcher);
          runs.push({ event, script: path.join(dir, parts[1]), mode: parts[2], toolName });
        }
      }
    }
  }
  assert(runs.length > 0);
  let checked = 0;
  for (const ai of ['true', 'false']) for (const comments of ['true', 'false']) for (const review of ['true', 'false']) {
    for (const run of runs) {
      const home = fs.mkdtempSync(path.join(os.tmpdir(), 'exploratory-limit-'));
      try {
        const input = JSON.stringify({ session_id: 'limit', hook_event_name: run.event, tool_name: run.toolName, transcript_path: path.join(home, 'none.jsonl'),
          tool_input: { project_id: 'p', title: 't', chartType: 'bar', axes: { x: { column: 'a' }, y: { column: '行数', func: 'count_ratio' }, color: { column: 'b' } }, settings: {} },
          tool_response: { structuredContent: { chartId: 'c', analyticsId: 'a', noteId: 'n' } } });
        // No hook exits non-zero today, so any non-zero exit (crash, syntax error) fails here instead of passing as a short output.
        const output = execFileSync(process.execPath, [run.script, run.mode].filter(Boolean), { input, cwd: home, stdio: ['pipe', 'pipe', 'pipe'],
            env: { PATH: process.env.PATH, HOME: home, PLUGIN_DATA: home, CLAUDE_PLUGIN_OPTION_AI_SUMMARY: ai,
              CLAUDE_PLUGIN_OPTION_SAVE_COMMENTS: comments, CLAUDE_PLUGIN_OPTION_REVIEW_HOOK: review } });
        const bytes = Buffer.byteLength(output.toString());
        assert(bytes <= limits.hookOutputBytes, run.mode + ' ' + run.toolName + ' ' + [ai, comments, review].join('/') + ': ' + bytes);
        if (bytes > 0) checked++;
      } finally { fs.rmSync(home, { recursive: true, force: true }); }
    }
  }
  assert(checked > 0, 'no hook produced output');
});
