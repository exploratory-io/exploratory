#!/usr/bin/env node
'use strict';
// カスタム R コマンド（exp_custom）の関所。review_hook=true のときだけ runtime-hook.js から呼ばれる。
// 1) 式の書き出しの形が誤っていれば、必ず deny する。
// 2) 製品のコマンドで作れる動詞だけの式は、同じ式について 1 回だけ deny し、式に出てきた動詞ごとに使うコマンドを示す（同じ式をもう一度送れば通す）。
//    コマンドの無い書き方（function(、vapply / sapply / lapply、reframe、rowwise など）を含む式は 1 回目から通す。2) の拒否は 1 セッション 2 回まで。
// 状態はセッションごとの JSON: { seen: [送信済みの式のハッシュ], stops: 2) で拒否した回数 }。
const crypto = require('node:crypto'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const BAD_FORM = /^\s*(?:\{|\.\s*%>%|[A-Za-z_][\w.]*\s*<-|[A-Za-z_][\w.]*\s*%>%)/;
const MAX_STOPS = 2;
// 動詞と、それを作る製品のコマンド。語の一部ではなく、関数の呼び出し（名前 + 括弧）だけを見る。列名に語が含まれても誤判定しない。
// group_by は、同じ式に summarize があるときだけ集計（summarize_group）。無いときは行を減らさないグループ計算（mutate_group）か group_by。
const SUMMARIZE = /\bsummari[sz]e\s*\(/;
const SUMMARIZE_GROUP = 'summarize_group（groupBy / aggregate。条件つきの集計は {as, expression}）';
const MUTATE_GROUP = 'mutate_group（行を減らさないグループごとの計算。groupBy と window: [{column, func, as}]。func は sum / ave（平均）/ median / min / max / count / countd / cumsum / mrank / lag など）か group_by';
const VERBS = [['group_by', /\bgroup_by\s*\(/, expr => SUMMARIZE.test(expr) ? SUMMARIZE_GROUP : MUTATE_GROUP], ['summarize', SUMMARIZE, SUMMARIZE_GROUP], ['count', /\bcount\s*\(/, 'count'],
  ['filter', /\bfilter\s*\(/, 'filter'], ['arrange', /\barrange\s*\(/, 'arrange'], ['pivot_longer', /\bpivot_longer\s*\(/, 'pivot_longer'], ['pivot_wider', /\bpivot_wider\s*\(/, 'pivot_wider'],
  ['left_join', /\bleft_join\s*\(/, 'join'], ['inner_join', /\binner_join\s*\(/, 'join'], ['top_n', /\btop_n\s*\(/, 'top_n'], ['distinct', /\bdistinct\s*\(/, 'distinct']];
const NO_COMMAND = /\b(?:unnest|map2|seq|complete|fill|str_extract|regmatches|function|vapply|sapply|lapply|reframe|rowwise)\s*\(/;
// 呼び出しから exp_custom の式を集める（create_wrangling_step の command、preview_wrangling_steps の changes[]、古い steps[]）。
function expressions(args) {
  const list = Array.isArray(args.changes) ? args.changes : Array.isArray(args.steps) ? args.steps : [args];
  return list.filter(step => step && step.command === 'exp_custom').map(step => {
    const params = step.params || {};
    if (typeof params.expression === 'string') return params.expression;
    return Object.values(params).filter(value => typeof value === 'string').join('\n');
  }).filter(Boolean);
}
// 式に出てきた動詞を、使うコマンドごとにまとめた文にする（例: group_by + summarize は summarize_group、filter は filter）。
function commandHint(exprs) {
  const groups = new Map();
  for (const [verb, pattern, command] of VERBS) for (const expr of exprs.filter(expr => pattern.test(expr))) {
    const name = typeof command === 'function' ? command(expr) : command, verbs = groups.get(name) || [];
    if (!verbs.includes(verb)) groups.set(name, [...verbs, verb]);
  }
  return [...groups].map(([command, verbs]) => verbs.join(' + ') + ' は ' + command).join('、');
}
module.exports = (mode, input) => {
  try {
    const tool = (/^mcp__(?:plugin_exploratory_)?exploratory-desktop__(create_wrangling_step|preview_wrangling_steps)$/.exec(input.tool_name || '') || [])[1];
    if (!tool) return;
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
    if ((state.stops || 0) >= MAX_STOPS) return;
    const hash = expr => crypto.createHash('sha1').update(expr.trim()).digest('hex');
    const first = exprs.filter(expr => VERBS.some(([, pattern]) => pattern.test(expr)) && !NO_COMMAND.test(expr) && !state.seen.includes(hash(expr)));
    if (!first.length) return;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ seen: [...state.seen, ...first.map(hash)], stops: (state.stops || 0) + 1 }));
    const hint = commandHint(first);
    deny('カスタム R の関所: この式の ' + hint + (/）$/.test(hint) ? '' : ' ') + 'で作れます。1 ステップ 1 処理に分け、' +
      (tool === 'preview_wrangling_steps' ? '' : 'preview_wrangling_steps の ') + 'changes に 1 処理ずつ並べてください。' +
      'コマンドで作れない処理が含まれるときだけ、同じ式をもう一度送ると通します。');
  } catch { /* 検査の失敗では止めない */ }
};
