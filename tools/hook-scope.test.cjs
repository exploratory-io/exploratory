const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const prefixes = ['mcp__exploratory-desktop__', 'mcp__plugin_exploratory_exploratory-desktop__'];
const others = ['mcp__exploratory-server__', 'mcp__plugin_exploratory_exploratory-server__', 'mcp__other__', 'mcp__plugin_other_exploratory-desktop__', 'mcp__plugin_exploratory_other__', 'mcp__exploratory-desktop-other__', ''];
const cases = [
  ['initial', 'create_chart', {}],
  ['chart', 'create_chart', {}],
  ['note', 'create_note', {}],
  ['wrangling', 'create_wrangling_step', {}],
  ['plan-record', 'create_chart', {}],
  ['plan-guard', 'create_note', {}],
  ['plan-custom-r', 'create_wrangling_step', { command: 'exp_custom', params: { expression: 'filter(x > 0)' } }],
  ['plan-custom-r', 'create_wrangling_step', { command: 'exp_custom', params: { expression: 'd <- .' } }],
  ['settings', 'get_environment', {}]
];
function run(mode, tool_name, tool_input, dir) {
  return execFileSync(process.execPath, [path.join(root, 'tools/runtime-hook.js'), mode], {
    input: JSON.stringify({ session_id: 'scope', tool_name, tool_input,
      tool_response: { structuredContent: { chartId: 'chart', marker: 'bar', noteId: 'note' } } }),
    encoding: 'utf8', env: { ...process.env, PLUGIN_DATA: dir, CLAUDE_PLUGIN_DATA: dir,
      EXPLORATORY_PLAN_GATE: 'true', CLAUDE_PLUGIN_OPTION_PLAN_GATE: 'true', EXPLORATORY_REVIEW_HOOK: 'true', CLAUDE_PLUGIN_OPTION_REVIEW_HOOK: 'true' }
  }).trim();
}
test('hook matchers exclude other MCP servers and unqualified tool names', () => {
  const hooks = require('../hooks/claude.json').hooks;
  for (const prefix of others) for (const tool of ['create_chart', 'create_note', 'create_wrangling_step', 'execute_r_script', 'update_chart']) {
    for (const event of ['PreToolUse', 'PostToolUse']) assert(!hooks[event].some(entry => new RegExp(entry.matcher).test(prefix + tool)), event + ': ' + prefix + tool);
  }
  for (const prefix of prefixes) for (const [mode, tool] of cases) {
    const entries = mode === 'chart' || mode === 'note' || mode === 'wrangling' || mode === 'plan-record' ? hooks.PostToolUse : hooks.PreToolUse;
    assert(entries.some(entry => new RegExp(entry.matcher).test(prefix + tool) && entry.hooks.some(hook => hook.command.endsWith(' ' + mode))), prefix + tool + ': ' + mode);
  }
});
test('direct hook invocation for other servers emits nothing and leaves state untouched', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-scope-'));
  try {
    // Existing plan state makes any mistaken guard invocation observable.
    fs.writeFileSync(path.join(dir, 'review-scope-plan.json'), JSON.stringify({ exploratory: true, r: true }));
    const snapshot = () => fs.readdirSync(dir).sort().map(file => [file, fs.readFileSync(path.join(dir, file), 'utf8')]);
    const before = snapshot();
    for (const prefix of others) for (const [mode, tool, args] of cases) {
      assert.equal(run(mode, prefix + tool, args, dir), '', prefix + tool + ': ' + mode);
      assert.deepEqual(snapshot(), before, prefix + tool + ': ' + mode);
    }
    for (const prefix of others) {
      const child = 'require(' + JSON.stringify(path.join(root, 'tools/custom-r-gate.js')) + ')("plan-custom-r", JSON.parse(process.argv[1]))';
      assert.equal(execFileSync(process.execPath, ['-e', child, JSON.stringify({ session_id: 'scope', tool_name: prefix + 'create_wrangling_step', tool_input: { command: 'exp_custom', params: { expression: 'd <- .' } } })], { encoding: 'utf8', env: { ...process.env, PLUGIN_DATA: dir } }), '');
      assert.deepEqual(snapshot(), before);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
test('both Exploratory namespaces keep review output, custom-R denial and state', () => {
  for (const prefix of prefixes) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-scope-positive-'));
    try {
      for (const [mode, tool] of cases.slice(0, 4)) assert.notEqual(run(mode, prefix + tool, {}, dir), '', prefix + tool + ': ' + mode);
      assert.equal(JSON.parse(run('plan-custom-r', prefix + 'create_wrangling_step', { command: 'exp_custom', params: { expression: 'd <- .' } }, dir)).hookSpecificOutput.permissionDecision, 'deny');
      assert.equal(JSON.parse(run('plan-custom-r', prefix + 'create_wrangling_step', { command: 'exp_custom', params: { expression: 'filter(x > 0)' } }, dir)).hookSpecificOutput.permissionDecision, 'deny');
      assert(fs.existsSync(path.join(dir, 'review-scope-customr.json')));
      assert(fs.existsSync(path.join(dir, 'review-scope-initial')));
      assert(fs.existsSync(path.join(dir, 'review-scope-charts.json')));
      assert(fs.existsSync(path.join(dir, 'review-scope-notes.json')));
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  }
});
