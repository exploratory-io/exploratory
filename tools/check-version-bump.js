#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const base = process.argv[2] || 'origin/main';
const manifests = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', '.antigravity-plugin/plugin.json', 'gemini-extension.json'];
const marketplaces = ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json'];
function git(args) {
  return execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=', '-c', 'diff.external=', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function read(file, ref) {
  try { return JSON.parse(ref ? git(['show', `${ref}:${file}`]) : fs.readFileSync(path.join(root, file), 'utf8')); }
  catch (error) {
    if (ref || error.code === 'ENOENT') return null;
    throw error;
  }
}
const changed = new Set([...git(['diff', '--no-ext-diff', '--name-only', base, '--']).split('\n'), ...git(['ls-files', '--others', '--exclude-standard']).split('\n')].filter(Boolean));
for (const [folder, name] of [['exploratory-server', 'exploratory-server'], ['exploratory-desktop', 'exploratory']]) {
  const prefix = `plugins/${folder}/`;
  const current = manifests.map(file => [prefix + file, read(prefix + file)]).filter(([, value]) => value);
  for (const file of manifests.slice(0, 2)) {
    if (!current.some(([name]) => name === prefix + file)) throw new Error(`Missing plugin manifest: ${prefix + file}`);
  }
  for (const [file, value] of current) if (value.name !== name) throw new Error(`Wrong plugin name in ${file}`);
  if (folder === 'exploratory-desktop') for (const file of marketplaces) {
    const marketplace = read(file);
    if (!marketplace || marketplace.plugins.length !== 1 || marketplace.plugins[0].name !== name) throw new Error(`Marketplace must list only exploratory: ${file}`);
    current.push([file, marketplace.plugins[0]]);
  }
  const versions = new Set(current.map(([, value]) => value.version));
  if (versions.size !== 1 || ![...versions][0]) throw new Error(`The manifests do not agree on one version: ${folder}: ${[...versions].join(', ')}`);
  const shippedChanges = [...changed].filter(file => file.startsWith(prefix) || (folder === 'exploratory-desktop' && marketplaces.includes(file)));
  if (!shippedChanges.length) continue;
  let before = manifests.map(file => read(prefix + file, base)).filter(Boolean);
  // The approved restructure moves the existing Desktop integration from the repository root.
  if (!before.length && folder === 'exploratory-desktop') before = manifests.map(file => read(file, base)).filter(Boolean);
  const now = [...versions][0];
  if (before.some(value => value.version === now)) {
    throw new Error(`Plugin files changed since ${base}, but the version is still ${now}: ${folder}. Raise this plugin's versions and add a CHANGELOG entry.\n` + shippedChanges.map(file => `  ${file}`).join('\n'));
  }
  console.log(`${folder}: ${now}`);
}
