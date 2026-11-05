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

// オンの設定の文だけを出す。オフの設定は何も出さない（全部オフならチャート資料の案内 1 文だけになる）。
function render(values) {
  const lines = [];
  if (values.ai_summary === 'true') lines.push('チャート・アナリティクスを作成したら get_chart_summary_prompt / get_analytics_summary_prompt の実結果を読み、AI Summary を生成して save_chart_ai_summary / save_analytics_ai_summary の summary に保存する。成功した保存は繰り返さない。接続時の指示は summary-on だけを読む。');
  // Explicit off instructions prevent unsolicited saves.
  else lines.push('AI Summary は保存しない（利用者が明示して求めたときだけ）。');
  if (values.save_comments === 'true') lines.push('作ったチャートの説明コメントを実結果に基づいて書き、update_chart の comment に保存する。AI Summary とは別の保存先として扱う。');
  else lines.push('チャートの説明コメントは保存しない（利用者が明示して求めたときだけ）。');
  if (values.review_hook === 'true') lines.push('最初の図・analytics の作成直前に1回、加工の作成直後は毎回、図の作成・編集直後と analytics の作成・編集直後は上限内で点検文を適用する。');
  // 点検フックは既定でオフなので、毎回届くこの 1 文に、図を作るときに確かめる資料の場所を絶対パスで置く。
  lines.push('チャートを作るときは ' + path.join(root, 'skills/mcp-desktop/exploratory-charts/types/chart-<種類>.md') + ' で枠と設定を確かめる。');
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
