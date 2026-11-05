#!/usr/bin/env node
'use strict';
// R レポート後の「計画の関所」。plan_gate=true のときだけ runtime-hook.js から呼ばれる。
// 状態はセッションごとの JSON 1 つ: { html: 記録した R のレポート（HTML）の絶対パス, plan: 記録済みの計画ファイルの絶対パス, ... }。
// 止める条件は狭くする: R のレポート（HTML）の保存を記録した後だけ効き、session_id が無い・状態が読めないなど迷うときは通す。
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const GATED = /^(?:mcp__.+__)?(?:create_wrangling_step|create_branch|create_chart|create_analytics|create_note|save_result_as_dataframe)$/;
const isPlanName = file => /\.md$/i.test(file) && /計画|plan/i.test(path.basename(file));
const HTML_NAME = /[^\s"'\x60()（）\[\]<>|｜、,，*]+\.html?\b/gi;
// 応答が JSON 文字列でも、isError などを見られるように解析する。
const parse = response => { if (typeof response !== 'string') return response; try { return JSON.parse(response); } catch { return response; } };
const failed = response => { const value = parse(response); return typeof value === 'string' ? /^error/i.test(value) : !!(value && (value.isError || value.is_error || value.error)); };
// 計画の本文に書かれた HTML 名のどれかが、実在するか。
const hasHtml = (target, content, base) => (content.match(HTML_NAME) || []).some(html => [path.resolve(path.dirname(target), html), path.resolve(base, html)].some(p => fs.existsSync(p)));
function main(mode, input) {
  // session_id が無いときは状態を持てないので、止めずに通す。
  if (!input.session_id) return;
  const dir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'exploratory-plugin-review');
  const file = path.join(dir, 'review-' + String(input.session_id).replace(/[^A-Za-z0-9_.-]/g, '_') + '-plan.json');
  const args = input.tool_input || {}, name = input.tool_name || '', cwd = input.cwd || process.cwd();
  if (name.startsWith('mcp__') && !/^mcp__(?:plugin_exploratory_)?exploratory-desktop__/.test(name)) return;
  const target = args.file_path ? path.resolve(cwd, args.file_path) : '';
  // 状態が壊れていれば空として扱う（関所は効かない側に倒す）。
  const load = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) || {}; } catch { return {}; } };
  // 並列のフックで JSON が壊れないよう、一時ファイルに書いて rename する。
  const save = state => { fs.mkdirSync(dir, { recursive: true }); const tmp = file + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(state)); fs.renameSync(tmp, file); };
  const say = (hookEventName, extra) => console.log(JSON.stringify({ hookSpecificOutput: { hookEventName, ...extra } }));
  if (mode === 'plan-stop') {
    // ノートまで作った後の報告の前に、作ったチャートを全部画像で見たかを確かめる。止めるのは 2 回まで。
    const state = load();
    if (!Object.hasOwn(state, 'exploratory') || !state.plan || !state.note) return;
    // Number など画像を返さないチャートは、get_chart_image が「PNG なし」で失敗し、同じ chartId の get_chart_data が成功していれば見た扱いにする。
    const seen = new Set([...(state.seen || []), ...(state.pngFail || []).filter(id => (state.data || []).includes(id))]);
    const missing = (state.charts || []).filter(id => !seen.has(id));
    const block = reason => console.log(JSON.stringify({ decision: 'block', reason }));
    if (missing.length && (state.stops || 0) < 2) {
      save({ ...state, stops: (state.stops || 0) + 1 });
      block('照合の確認: 画像で見ていないチャートが ' + missing.length + ' 枚あります（返り値の ID、JSON: ' + missing.map(id => JSON.stringify(id)).join(', ') + '）。1 枚ごとに open_chart で開いて get_chart_image で画像を見て、HTML の図と比べ、直せるずれは直してから照合表を書き直して報告してください。');
    } else if (!missing.length && !(state.fixes || 0) && (state.charts || []).length && !state.fixStopped) {
      save({ ...state, fixStopped: true });
      block('照合の確認: 直す操作が 0 回です。照合表の「見た目のずれ」「形のずれ」で直せる行（並び順・横向き・数値ラベル・桁・% 表記・色の強調）を update_chart で直してから報告してください。直す所が本当に無いときは、照合表の各行に「ずれなし」と書いて、そのまま報告してください。');
    }
    return;
  }
  if (mode === 'plan-guard') {
    if (!GATED.test(name)) return;
    const state = load();
    if (!state.exploratory || !state.html || state.plan) return;
    // Write の記録を取り逃したときのために、作業フォルダの計画ファイルを探し、記録のときと同じ検査を通れば記録して通す。
    const dirs = [...new Set([cwd, path.isAbsolute(state.html) ? path.dirname(state.html) : cwd])].filter(folder => fs.existsSync(folder));
    for (const folder of dirs) for (const entry of fs.readdirSync(folder).filter(isPlanName).sort()) {
      const plan = path.join(folder, entry);
      if (hasHtml(plan, fs.readFileSync(plan, 'utf8'), cwd)) { save({ ...state, plan }); return; }
    }
    say('PreToolUse', { permissionDecision: 'deny', permissionDecisionReason: '計画の関所: R のレポートの後は、先に計画（<題名>_Exploratory作成計画.md）を保存してください。計画には HTML のファイル名を書いてください。' });
    return;
  }
  const response = input.tool_response, ok = !failed(response);
  const chartId = String(args.chartId || args.chart_id || '');
  const responseText = typeof response === 'string' ? response : JSON.stringify(response || '');
  if (name === 'Skill') {
    if (ok && /^(?:exploratory:)?exploratory-analysis$/.test(args.skill || '')) save({ ...load(), exploratory: true });
    else if (ok && !String(args.skill || '').startsWith('exploratory:') && load().exploratory) save({ ...load(), exploratory: false });
    return;
  }
  // R のレポート（HTML）の保存を記録する。Write の .html、Bash と PowerShell の render / .html の出力、execute_r_script で .html を書いたもの。
  const command = String(args.command || '');
  const html = name === 'Write' ? /\.html?$/i.test(target) && target
    : name === 'Bash' || name === 'PowerShell' ? /rmarkdown::render|\brender\s*\(|(?:-o|--output|>)\s*['\x22]?[^\s'\x22]+\.html?\b/i.test(command) && ((command.match(HTML_NAME) || [])[0] || '')
    : /(?:^|__)execute_r_script$/.test(name) ? /\.html?\b/i.test(JSON.stringify(args) + responseText) && ((JSON.stringify(args).match(HTML_NAME) || [])[0] || '')
    : false;
  if (html !== false) {
    if (!ok || !load().exploratory) return;
    const key = html ? path.resolve(cwd, html.replace(/^.*=/, '')) : 'unknown';
    // 同じレポートの再保存（手順 4 の直し）では状態を消さない。新しいレポートなら前の依頼の状態をリセットする。
    if (load().html !== key) save({ exploratory: true, html: key });
    return;
  }
  // 照合の確認用: 作ったチャートと、画像で見たチャートを数える。
  if (/(?:^|__)create_chart$/.test(name) && ok) {
    const id = (responseText.match(/"(?:chartId|chart_id)"\s*:\s*"([^"]+)"/) || [])[1] || (responseText.match(/\\"(?:chartId|chart_id)\\"\s*:\s*\\"([^"\\]+)\\"/) || [])[1];
    const state = load(); if (id) save({ ...state, charts: [...new Set([...(state.charts || []), id])] }); return;
  }
  const add = (state, key, id) => ({ ...state, [key]: [...new Set([...(state[key] || []), id])] });
  if (/(?:^|__)get_chart_image$/.test(name) && chartId) {
    if (ok) save(add(load(), 'seen', chartId));
    else if (/returned no PNG image/.test(responseText)) save(add(load(), 'pngFail', chartId));
    return;
  }
  if (/(?:^|__)get_chart_data$/.test(name) && ok && chartId) { save(add(load(), 'data', chartId)); return; }
  if (/(?:^|__)(?:update_chart|update_analytics|update_note|update_dashboard)$/.test(name) && ok) {
    const state = load(), next = { ...state, fixes: (state.fixes || 0) + 1 };
    // 直した図はもう一度見るので、見た記録を外す。
    if (/(?:^|__)update_(?:chart|analytics)$/.test(name) && chartId) for (const key of ['seen', 'pngFail', 'data']) if (next[key]) next[key] = next[key].filter(id => id !== chartId);
    save(next); return;
  }
  if (/(?:^|__)create_note$/.test(name) && ok) {
    const state = load();
    if (Object.hasOwn(state, 'exploratory')) save({ ...state, note: true, exploratory: false });
    return;
  }
  if (/(?:^|__)create_dashboard$/.test(name) && ok) { save({ ...load(), dashboard: true }); return; }
  if (name !== 'Write' || !isPlanName(target) || typeof args.content !== 'string' || !ok || !load().html) return;
  if (!hasHtml(target, args.content, cwd)) { say('PostToolUse', { additionalContext: '計画の関所: この計画は記録されません。計画に、実在する HTML のファイル名が書かれていません。' }); return; }
  save({ ...load(), plan: target });
}
// 想定外の失敗では止めない（関所は迷うときは通す）。
module.exports = (mode, input) => { try { main(mode, input); } catch { /* 何も返さず通す */ } };
