'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

// Names and patterns are assembled from pieces so this file does not contain them literally.
const j = (...parts) => parts.join('');

// Files that are not published: internal tooling and the OpenAI review data.
const NOT_PUBLISHED = new Set([
  j('build-from-data', 'blog.js'), 'compare-knowledge.js', 'internal.test.cjs', 'mcp-source.js',
  j('sync-from-data', 'blog.sh'), 'verify-contract.js', 'verify.js', 'build-server-zip.js',
  'distribution.test.cjs', 'note-importance.test.cjs', 'server-plugin.test.cjs', 'server-skill.md',
  'openai-review-info.json',
].map(name => 'tools/' + name));

const FORBIDDEN = [
  j('GFd0hmj', '1Gv'), j('mcp_', 'sample'), j('Share-Test-', 'Dashboard'), j('uZ0', 'KSa'),
  j('review', '_info'), j('test', '_cases'), j('expected', '_behavior'), j('demo_recording', '_url'),
  j('Un', 'released'), j('un', 'released'), j('未', '検', '証'), j('実機で', '未', '検証'),
  // Internal names and the old settings name.
  j('data', 'blog'), j('/Us', 'ers/'), j('tak', 'ato'), j('Prefer', 'ences > MCP'), j('環境', '設定'),
];

test('published files contain no review-only data or internal release status', () => {
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean).filter(file => fs.existsSync(path.join(root, file)) && !NOT_PUBLISHED.has(file));
  assert(files.length > 20, 'population must be discovered');
  const hits = [];
  for (const file of files) {
    if (/\.(png|jpg|gif|ico|zip)$/i.test(file)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const pattern of FORBIDDEN) if (text.includes(pattern)) hits.push(file + ': ' + pattern);
  }
  assert.deepEqual(hits, []);
});
