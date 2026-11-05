#!/usr/bin/env node
'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fields = require('../.claude-plugin/plugin.json').userConfig;
const variables = { ai_summary: 'EXPLORATORY_AI_SUMMARY', save_comments: 'EXPLORATORY_SAVE_COMMENTS',
  review_hook: 'EXPLORATORY_REVIEW_HOOK', plan_gate: 'EXPLORATORY_PLAN_GATE' };
const aliases = {
  ai_summary: { する: 'true', しない: 'false' },
  save_comments: { する: 'true', しない: 'false' },
  review_hook: { 使う: 'true', 使わない: 'false' },
  plan_gate: { 使う: 'true', 使わない: 'false' }
};

function settings(environment = process.env, overrides = {}) {
  const result = {};
  for (const [key, field] of Object.entries(fields)) {
    let value = overrides[key] ?? environment['CLAUDE_PLUGIN_OPTION_' + key.toUpperCase()]
      ?? environment[variables[key]] ?? field.default;
    if (value === '') value = field.default;
    if (Object.hasOwn(aliases[key], value)) value = aliases[key][value];
    if (!field.options.includes(value)) throw new Error('Invalid Exploratory setting: ' + key);
    result[key] = value;
  }
  return result;
}

// Render settings in English, including explicit instructions for disabled saves.
function render(values) {
  const lines = [];
  if (values.ai_summary === 'true') lines.push('After creating a chart or an analytics artifact, read the actual results of get_chart_summary_prompt / get_analytics_summary_prompt, generate an AI Summary, and save it to the summary field with save_chart_ai_summary / save_analytics_ai_summary. Do not repeat successful saves. Read only the summary-on connection instructions.');
  // Explicit off instructions prevent unsolicited saves.
  else lines.push('Do not save AI summaries unless the user explicitly requests it.');
  if (values.save_comments === 'true') lines.push('Write a description of the created chart based on its actual results and save it to the comment field with update_chart. This is separate from AI Summary.');
  else lines.push('Do not save chart description comments unless the user explicitly requests it.');
  if (values.review_hook === 'true') lines.push('Apply review instructions once just before the first chart or analytics creation, after every wrangling step, and within the limit after each chart or analytics creation or edit.');
  // Include the absolute chart reference path even when review hooks are disabled.
  lines.push('When creating a chart, check its slots and settings in ' + path.join(root, 'skills/mcp-desktop/exploratory-charts/types/chart-<type>.md') + '.');
  return lines.join('\n') + '\n';
}

module.exports = { settings, render, variables };
if (require.main === module) {
  const args = process.argv.slice(2);
  const overrides = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '').replace(/-/g, '_');
    if (!Object.hasOwn(fields, key) || args[i + 1] === undefined) throw new Error('Unknown or missing setting: ' + args[i]);
    overrides[key] = args[i + 1];
  }
  process.stdout.write(render(settings(process.env, overrides)));
}
