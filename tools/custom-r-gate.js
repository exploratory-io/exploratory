#!/usr/bin/env node
'use strict';
// カスタム R コマンド（exp_custom）の関所。plan_gate=true のときだけ runtime-hook.js から呼ばれる。
// 1) 式の書き出しの形が誤っていれば、必ず deny する。
// 2) コマンドで作れる動詞だけの式は、同じ式について 1 回だけ deny する（同じ式をもう一度送れば通す）。
// 状態はセッションごとの JSON: { seen: [送信済みの式のハッシュ] }。
const crypto = require('node:crypto'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const BAD_FORM = /^\s*(?:\{|\.\s*%>%|[A-Za-z_][\w.]*\s*<-|[A-Za-z_][\w.]*\s*%>%)/;
// 語の一部ではなく、関数の呼び出し（名前 + 括弧）だけを見る。列名に語が含まれても誤判定しない。
const COMMAND_VERBS = /\b(?:group_by|summari[sz]e|filter|arrange|pivot_longer|pivot_wider|left_join|inner_join|top_n|distinct|count)\s*\(/;
const NO_COMMAND = /\b(?:unnest|map2|seq|complete|fill|str_extract|regmatches)\s*\(/;
// 呼び出しから exp_custom の式を集める（steps[] でも単独の command でも）。
function expressions(args) {
  const list = Array.isArray(args.steps) ? args.steps : [args];
  return list.filter(step => step && step.command === 'exp_custom').map(step => {
    const params = step.params || {};
    if (typeof params.expression === 'string') return params.expression;
    return Object.values(params).filter(value => typeof value === 'string').join('\n');
  }).filter(Boolean);
}
module.exports = (mode, input) => {
  try {
    if (!/^mcp__(?:plugin_exploratory_)?exploratory-desktop__create_wrangling_step$/.test(input.tool_name || '')) return;
    const exprs = expressions(input.tool_input || {});
    if (!exprs.length) return;
    const deny = reason => console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
    if (exprs.some(expr => BAD_FORM.test(expr))) {
      deny('カスタム R の関所: exp_custom の式は 表 %>% 式 として実行されます。`d <- .`・`df %>%`・`. %>%`・`{` で始めず、mutate(...)・filter(...) のように動詞から書いてください。');
      return;
    }
    const dir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'exploratory-plugin-review');
    const file = path.join(dir, 'review-' + String(input.session_id || '').replace(/[^A-Za-z0-9_.-]/g, '_') + '-customr.json');
    const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { seen: [] };
    const hash = expr => crypto.createHash('sha1').update(expr.trim()).digest('hex');
    const first = exprs.filter(expr => COMMAND_VERBS.test(expr) && !NO_COMMAND.test(expr) && !state.seen.includes(hash(expr)));
    if (!first.length) return;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ seen: [...state.seen, ...first.map(hash)] }));
    deny('カスタム R の関所: この式の処理は summarize_group / filter / pivot_longer / arrange など、製品のコマンドで作れます。コマンドで作れない理由があるときは、同じ式をもう一度送ると通します。');
  } catch { /* 検査の失敗では止めない */ }
};
