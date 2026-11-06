#!/usr/bin/env node
// Fails when shipped plugin files changed since <base> but the plugin version did not.
// Clients skip an update when the version is unchanged, so a release without a bump never reaches users.
// Usage: node tools/check-version-bump.js [base-ref]   (default: origin/main)
'use strict';
const { execFileSync } = require('child_process');

const MANIFESTS = [
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.codex-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
  '.agents/plugins/marketplace.json',
  'gemini-extension.json',
];
// Files that do not change what a client installs and runs.
const NOT_SHIPPED = [/^README.*\.md$/, /^CHANGELOG\.md$/, /^SECURITY\.md$/, /^LICENSE$/, /^docs\//, /^\.github\//, /\.test\.cjs$/, /^tools\/check-version-bump\.js$/];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function versionsAt(ref) {
  const found = new Set();
  for (const file of MANIFESTS) {
    let text;
    try {
      text = ref ? git(['show', `${ref}:${file}`]) : require('fs').readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    for (const m of text.matchAll(/"version"\s*:\s*"([^"]+)"/g)) found.add(m[1]);
  }
  return found;
}

const base = process.argv[2] || 'origin/main';
const current = versionsAt(null);
if (current.size !== 1) {
  console.error(`The manifests do not agree on one version: ${[...current].join(', ')}`);
  process.exit(1);
}
const changed = git(['diff', '--name-only', base, '--'])
  .split('\n')
  .filter(Boolean)
  .filter((f) => !NOT_SHIPPED.some((re) => re.test(f)));
if (changed.length === 0) process.exit(0);
const before = versionsAt(base);
const now = [...current][0];
if (before.has(now)) {
  console.error(`Plugin files changed since ${base}, but the version is still ${now}. Raise the version in all manifests and add a CHANGELOG entry.`);
  console.error(changed.slice(0, 10).map((f) => `  ${f}`).join('\n'));
  process.exit(1);
}
