'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

const FORBIDDEN = [
  /\/(?:Users|home)\/[^/\s]+\//,
  /[Uu]nreleased/,
  /未[検]証/,
];

test('published files contain no home paths or unpublished status', () => {
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean).filter(file => fs.existsSync(path.join(root, file)));
  assert(files.length > 20, 'population must be discovered');
  const hits = [];
  for (const file of files) {
    if (/\.(png|jpg|gif|ico|zip)$/i.test(file)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const pattern of FORBIDDEN) if (pattern.test(text)) hits.push(file + ': ' + pattern);
  }
  assert.deepEqual(hits, []);
});
