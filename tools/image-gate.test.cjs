'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '../plugins/exploratory-desktop');

function run(lastUserText, reviewHook) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'image-gate-'));
  const transcript = path.join(dir, 't.jsonl');
  fs.writeFileSync(transcript, [
    JSON.stringify({ type: 'user', message: { role: 'user', content: lastUserText } }),
    JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok' }] } }),
  ].join('\n'));
  const out = execFileSync(process.execPath, [path.join(root, 'tools/runtime-hook.js'), 'image'], {
    input: JSON.stringify({ session_id: 's', tool_name: 'mcp__exploratory-desktop__get_dashboard_image', transcript_path: transcript }),
    env: { ...process.env, EXPLORATORY_REVIEW_HOOK: reviewHook ? 'true' : 'false', PLUGIN_DATA: dir },
  }).toString();
  return out ? JSON.parse(out).hookSpecificOutput : null;
}

test('refuses the dashboard image when the user did not ask for an image', () => {
  assert.strictEqual(run('この HTML と同じダッシュボードを Exploratory Desktop で作ってください。', false).permissionDecision, 'deny');
});
test('lets it through when the latest request asks for an image', () => {
  assert.strictEqual(run('ダッシュボードの画像を見せて', false), null);
});
test('lets it through when review_hook is on', () => {
  assert.strictEqual(run('この HTML と同じダッシュボードを作って', true), null);
});
test('the PreToolUse hook covers get_dashboard_image and get_note_image', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(root, 'hooks/claude.json'), 'utf8')).hooks.PreToolUse;
  const entry = hooks.find(h => h.hooks.some(x => / image$/.test(x.command)));
  assert.ok(entry && new RegExp(entry.matcher).test('mcp__exploratory-desktop__get_note_image'));
});
