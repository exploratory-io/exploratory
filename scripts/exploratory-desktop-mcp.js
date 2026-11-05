#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const BUNDLE_NAME = 'exploratory-mcp.bundle.js';
const NOT_FOUND = 'Exploratory Desktop MCP bundle was not found. Install Exploratory or set EXPLORATORY_MCP_BUNDLE.';

/**
 * Lists the places where the relay bundle may be, in search order.
 * @param {object} env environment variables
 * @param {string} platform process.platform value
 * @returns {string[]} candidate bundle paths
 */
function candidates(env, platform) {
  const list = [];
  if (env.EXPLORATORY_MCP_BUNDLE) list.push(env.EXPLORATORY_MCP_BUNDLE);
  if (platform === 'darwin') {
    list.push(path.posix.join('/Applications/Exploratory.app/Contents/Resources/app.nw/mcp', BUNDLE_NAME));
  } else if (platform === 'win32') {
    const w = path.win32;
    // Checked on the Windows release build on 2026-11-05: Exploratory.exe is in <ProgramFiles>\Exploratory and the
    // relay is in its package.nw\mcp folder (there is no resources folder).
    list.push(w.join(env.ProgramFiles || 'C:\\Program Files', 'Exploratory', 'package.nw', 'mcp', BUNDLE_NAME));
    // Not checked on a real machine: a per-user install under LOCALAPPDATA with the same layout.
    if (env.LOCALAPPDATA) list.push(w.join(env.LOCALAPPDATA, 'Exploratory', 'package.nw', 'mcp', BUNDLE_NAME));
  }
  return list;
}

/**
 * Returns the first candidate that exists, or null.
 * @param {object} env environment variables
 * @param {string} platform process.platform value
 * @param {function(string): boolean} exists file existence check
 * @returns {string|null} bundle path
 */
function findBundle(env, platform, exists) {
  return candidates(env, platform).find(exists) || null;
}

/** Starts the bundle with the same node, passing stdio and the exit code through. */
function main() {
  const bundle = findBundle(process.env, process.platform, file => fs.existsSync(file) && fs.statSync(file).isFile());
  if (!bundle) {
    process.stderr.write(NOT_FOUND + '\n');
    process.exit(1);
  }
  const child = spawn(process.execPath, [bundle, ...process.argv.slice(2)], { stdio: 'inherit' });
  child.on('error', error => { process.stderr.write(String(error.message) + '\n'); process.exit(1); });
  // Forward termination signals to the child, as the former sh `exec` made the signal reach the bundle directly.
  for (const name of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.on(name, () => child.kill(name));
  child.on('exit', (code, signal) => {
    if (signal) {
      // End with the same signal as the child; fall back to 128 + n if it is ignored.
      process.removeAllListeners(signal);
      process.kill(process.pid, signal);
      setTimeout(() => process.exit(128 + (require('node:os').constants.signals[signal] || 1)), 100);
      return;
    }
    process.exit(code === null ? 0 : code);
  });
}

if (require.main === module) main();

module.exports = { candidates, findBundle, NOT_FOUND };
