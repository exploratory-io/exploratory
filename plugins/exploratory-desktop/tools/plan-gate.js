#!/usr/bin/env node
'use strict';
// R レポート後の「計画の関所」。plan_gate=true のときだけ runtime-hook.js から呼ばれる。
// 状態はセッションごとの JSON 1 つ: { html: 記録した R のレポート（HTML）の絶対パス, plan: 記録済みの計画ファイルの絶対パス, ... }。
// R の作業を記録した後に効き、session_id が無い・状態が読めないなど迷うときは通す。
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const GATED = /^(?:mcp__.+__)?(?:create_wrangling_step|create_branch|create_chart|create_analytics|create_note|update_note|create_dashboard|save_result_as_dataframe)$/;
const isPlanName = file => /\.md$/i.test(file) && /計画|plan/i.test(path.basename(file));
const isScenarioName = file => /\.md$/i.test(file) && /シナリオ|scenario/i.test(path.basename(file));
// ノートに必ず入れる分析の出力。予測モデルは変数重要度と影響度、クラスタはレーダー。
const requiredOutputs = (model, embedded) => model.kind === 'cluster'
  ? (model.radarTypes.some(type => embedded.includes(type)) ? [] : model.radarTypes)
  : [...(embedded.includes('feature_importance_bar') ? [] : ['feature_importance_bar']),
    ...((model.impactTypes || []).length && !model.impactTypes.some(type => embedded.includes(type)) ? model.impactTypes : [])];
// create_note の markdown に埋め込んだ分析の出力 {{analytics:ID|出力}} を集める。
const embeddedOutputs = markdown => [...String(markdown || '').matchAll(/\{\{\s*analytics\s*:\s*([^|}\s]+)\s*\|\s*([^}\s]+)\s*\}\}/g)].map(m => ({ id: m[1], type: m[2] }));
const HTML_NAME = /[^\s"'\x60()（）\[\]<>|｜、,，*]+\.html?\b/gi;
// 応答が JSON 文字列でも、isError などを見られるように解析する。
const parse = response => { if (typeof response !== 'string') return response; try { return JSON.parse(response); } catch { return response; } };
const failed = response => { const value = parse(response); return typeof value === 'string' ? /^error/i.test(value) : !!(value && (value.isError || value.is_error || value.error)); };
// 計画の本文に書かれた HTML 名のどれかが、実在するか。
const hasHtml = (target, content, base) => (content.match(HTML_NAME) || []).some(html => [path.resolve(path.dirname(target), html), path.resolve(base, html)].some(p => fs.existsSync(p)));
function replyText(input) {
  if (typeof input.last_assistant_message === 'string') return input.last_assistant_message;
  if (!input.transcript_path) return '';
  let text = '';
  for (const line of fs.readFileSync(input.transcript_path, 'utf8').split(/\r?\n/).filter(Boolean)) {
    let row; try { row = JSON.parse(line); } catch { continue; }
    if (row.type !== 'assistant' || row.isSidechain) continue;
    const content = row.message?.content;
    if (typeof content === 'string') text = content;
    else if (Array.isArray(content) && !content.some(block => block.type === 'tool_use')) text = content.filter(block => block.type === 'text').map(block => block.text).join('\n');
  }
  return text;
}
// 自分で「直せる」と付けた表の行だけを見る。表でない文章や判断できない行は通す。
function unfinishedRows(text) {
  const unfinished = [], complete = /^(?:修正済み?|対応済み?|直した|修正した|解消済み?|ずれなし)$/;
  let previous = [], statusColumn = -1;
  for (const line of text.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) { previous = []; statusColumn = -1; continue; }
    const cells = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map(cell => cell.replace(/\*\*|`/g, '').trim());
    if (cells.every(cell => /^:?-+:?$/.test(cell))) { statusColumn = previous.findIndex(cell => /^(?:状態|修正状況|対応状況|修正結果)$/.test(cell)); continue; }
    previous = cells;
    const fixable = cells.findIndex(cell => /^直せる(?:[（(].*[）)])?$/.test(cell));
    if (fixable < 0) continue;
    const status = cells[statusColumn >= 0 ? statusColumn : fixable + 1] || '';
    if (!complete.test(status)) unfinished.push(line);
  }
  return unfinished;
}
// 引用の境界は標準の shlex に任せる。利用できない・解釈できない入力は通す。
function shellRWork(command) {
  if (!/Rscript|\brender\s*\(/.test(command)) return false;
  const result = spawnSync('python3', ['-c', String.raw`
import json, pathlib, re, shlex, sys
command = sys.stdin.read()
def tokens(posix):
    lexer = shlex.shlex(command, posix=posix, punctuation_chars=';&|(){}\n')
    lexer.whitespace = lexer.whitespace.replace('\n', '')
    lexer.whitespace_split = True
    return lexer
def check():
    raw = tokens(False)
    boundary, use_env = True, False
    for literal in raw:
        if literal in ('(', ')', '{', '}') or '<<' in literal: return False
        if literal in (';', '&&', '||', '|', '&', '\n'):
            boundary, use_env = True, False
            continue
        if not boundary: continue
        if re.match(r'^[A-Za-z_][A-Za-z0-9_]*=', literal): continue
        words = shlex.split(literal)
        if len(words) != 1: return False
        word = words[0]
        executable = pathlib.PurePosixPath(word).name
        if executable == 'env' and not use_env:
            use_env = True
            continue
        if use_env and word in ('-i', '--ignore-environment', '--'): continue
        if executable == 'Rscript': return True
        if executable == 'R' and re.search(r'\brender\s*\(', command): return True
        boundary = False
    return False
try: print(json.dumps(check()))
except (ValueError, TypeError): print('false')
`], { input: command, encoding: 'utf8', timeout: 1000 });
  return !result.error && result.status === 0 && result.stdout.trim() === 'true';
}
function resultObjects(response) {
  const values = [parse(response)];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value || typeof value !== 'object') continue;
    for (const key of ['content', 'structuredContent', 'structured_content']) if (value[key]) values.push(parse(value[key]));
    if (Array.isArray(value)) for (const block of value) if (block?.type === 'text') values.push(parse(block.text));
  }
  return values;
}
// ダッシュボードの構成（pages か 1 ページ分）に載っているチャートの ID を集める。
function dashboardChartIds(node) {
  const charts = [], visit = value => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.chart === 'string') charts.push(value.chart);
    if (value.type && !['text', 'image', 'separator'].includes(value.type) && !value.analysisId && typeof value.id === 'string') charts.push(value.id);
    Object.values(value).forEach(visit);
  };
  visit(node);
  return [...new Set(charts)];
}
const numeric = value => (typeof value === 'number' || (typeof value === 'string' && /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) && Number.isFinite(Number(value)) ? Number(value) : null;
function numbersIn(rows, printed = false) {
  return (Array.isArray(rows) ? rows.flat(Infinity) : []).map(value => numeric(typeof value === 'string' ? value.replace(/[,%()]/g, '') : value))
    .filter(value => value !== null && !(printed && Number.isInteger(value) && Math.abs(value) < 10));
}
const mergeNumbers = (old, values) => [...new Set([...(old || []), ...values])].slice(-5000);
function chartValue(result) {
  if (!Array.isArray(result?.rows)) return;
  let raw, kind;
  if (['singlevalue', 'number'].includes(result.chart_type)) {
    // Number の rows[0] はセル配列。比較付きは [日付, "主値|||差"] の最新点を使う。
    const cells = result.rows[0];
    if (!Array.isArray(cells) || !cells.length) return;
    const point = cells.reduce((last, row) => Array.isArray(row) && row.length > 1 && String(row.at(-2)) > String(last.at(-2)) ? row : last, cells[0]);
    raw = Array.isArray(point) ? point.at(-1) : point;
    if (typeof raw === 'string') raw = raw.split('|||')[0];
    kind = 'number';
  } else if (result.chart_type === 'line') {
    const x = (result.columns || []).findIndex(col => col.shelf === 'x');
    const y = (result.columns || []).findIndex(col => col.shelf === 'y');
    if (x < 0 || y < 0 || !result.rows.length) return;
    const point = result.rows.reduce((last, row) => row[x] > last[x] ? row : last);
    raw = point[y]; kind = 'line';
  }
  const value = numeric(raw);
  if (!kind || value === null) return;
  const [mantissa, exponent = '0'] = String(raw).toLowerCase().split('e');
  const digits = Math.max(0, (mantissa.split('.')[1] || '').length - Number(exponent));
  return { kind, ...(kind === 'number' ? { main: value } : { last: value }), digits };
}
function matches(value, pool, digits) {
  const rounded = r => Number(r.toFixed(Math.min(digits, 100)));
  // R の出力は小数 4 桁に丸まって返るので、その丸めの幅（0.00005。% に直した値なら 0.005）までの違いは一致とみなす。
  const close = (r, tolerance) => Math.abs(r - value) <= tolerance + 1e-12;
  return pool.some(r => r === value || rounded(r) === value || rounded(r * 100) === value || rounded(r / 100) === value || close(r, 5e-5) || close(r * 100, 5e-3));
}
function main(mode, input) {
  // session_id が無いときは状態を持てないので、止めずに通す。
  if (!input.session_id) return;
  const dir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'exploratory-plugin-review');
  const file = path.join(dir, 'review-' + String(input.session_id).replace(/[^A-Za-z0-9_.-]/g, '_') + '-plan.json');
  const args = input.tool_input || {}, name = input.tool_name || '', cwd = input.cwd || process.cwd();
  if (name.startsWith('mcp__') && !/^mcp__(?:plugin_exploratory_)?exploratory-desktop__/.test(name)) return;
  const targetPath = args.file_path || args.path;
  const target = targetPath ? path.resolve(cwd, targetPath) : '';
  // 状態が壊れていれば空として扱う（関所は効かない側に倒す）。
  const load = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) || {}; } catch { return {}; } };
  // 並列のフックで JSON が壊れないよう、一時ファイルに書いて rename する。
  const save = state => { fs.mkdirSync(dir, { recursive: true }); const tmp = file + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(state)); fs.renameSync(tmp, file); };
  const say = (hookEventName, extra) => console.log(JSON.stringify({ hookSpecificOutput: { hookEventName, ...extra } }));
  if (mode === 'plan-stop') {
    // ノートかダッシュボードを作った後に、Number 以外の画像を確認する。画像の不足で止めるのは 2 回まで。
    const state = load();
    if (!Object.hasOwn(state, 'exploratory') || !state.plan || !(state.note || state.dashboard)) return;
    // Number は画像の確認から外し、ほかのチャートの PNG なしをデータの取得で代用しない。
    const seen = new Set(state.seen || []);
    const images = (state.charts || []).filter(id => !(state.numbers || []).includes(id));
    const missing = images.filter(id => !seen.has(id));
    const block = reason => console.log(JSON.stringify({ decision: 'block', reason }));
    const unfinished = unfinishedRows(replyText(input));
    if (unfinished.length && (state.unfixedStops || 0) < 2) {
      save({ ...state, unfixedStops: (state.unfixedStops || 0) + 1 });
      block('照合の確認: 照合表に「直せる」のまま未修正の行が ' + unfinished.length + ' 行あります。直して照合表を更新するか、直せない理由と探した設定名を記録してください。');
      return;
    }
    const values = state.values || {}, unread = (state.numbers || []).filter(id => !values[id] && !(state.unparsedValues || []).includes(id));
    const pool = [...(state.rValues || []), ...(state.rValuesAfter || [])];
    const targets = [...new Set([...(state.numbers || []), ...(state.lines || [])])];
    const mismatch = targets.filter(id => values[id] && !matches(values[id].main ?? values[id].last, pool, values[id].digits));
    // 全体画像が撮れなかったときは、画像の不足で止めない（撮れない画像を求め続けない）。
    if (state.dashboard ? state.dashboardImageFailed : state.noteImageFailed) missing.length = 0;
    if ((unread.length || mismatch.length) && (state.valueStops || 0) < 2) {
      save({ ...state, valueStops: (state.valueStops || 0) + 1 });
      block('数値の確認: ' + (unread.length ? 'Number ' + unread.length + ' 枚の値を get_chart_data で読み直していません（' + unread.join(', ') + '）。' : '') +
        (mismatch.length ? '読み直した値が R の計算結果に現れません（' + mismatch.map(id => id + '=' + (values[id].main ?? values[id].last)).join(', ') + '）。' : '') +
        '計画の定義で R の値を 1 行の表として返し、違えば Exploratory の加工を直してください。R を Exploratory の値に合わせて書き換えない。直すのは Exploratory の加工');
      return;
    }
    if (missing.length && (state.stops || 0) < 2) {
      save({ ...state, stops: (state.stops || 0) + 1 });
      block('照合の確認: 画像で見ていないチャートが ' + missing.length + ' 枚あります（返り値の ID、JSON: ' + missing.map(id => JSON.stringify(id)).join(', ') + '）。' + (state.dashboard ? 'get_dashboard_image で全体画像を撮り直し、R の図（PNG）と比べ、直せるずれを直してから照合表を書き直して報告してください。' : 'get_note_image で全体画像を撮り直し、R の図（PNG）と比べ、直せるずれを直してから照合表を書き直して報告してください。'));
    }
    return;
  }
  if (mode === 'plan-guard') {
    if (!GATED.test(name)) return;
    const state = load();
    const deny = reason => say('PreToolUse', { permissionDecision: 'deny', permissionDecisionReason: reason });
    // ノートを作る前に、このセッションで作った予測モデルとクラスタの必須の出力が埋め込まれているかを見る。拒否は 2 回まで。
    // update_note は本文を置き換える（mode: replace）ときだけ見る。追記は既存の本文が分からないので見ない。
    if ((/(?:^|__)create_note$/.test(name) || (/(?:^|__)update_note$/.test(name) && args.mode === 'replace')) && (state.noteGateStops || 0) < 2) {
      const embedded = embeddedOutputs(args.markdown);
      const lacking = (state.predictive || []).map(model => ({ model, missing: requiredOutputs(model, embedded.filter(o => o.id === model.id).map(o => o.type)) })).filter(x => x.missing.length);
      if (lacking.length) {
        save({ ...state, noteGateStops: (state.noteGateStops || 0) + 1 });
        deny('ノートの関所: 次の分析の出力をノートの本文に {{analytics:ID|出力}} で入れてから作り直してください。' + lacking.map(({ model, missing }) =>
          (model.kind === 'cluster' ? 'クラスタ（' : '予測モデル（') + model.title + '、ID ' + model.id + '）: ' + missing.join(' または ')).join(' / '));
        return;
      }
    }
    if (/(?:^|__)update_note$/.test(name) || !state.exploratory || !(state.r || state.html) || (state.plan && state.scenario)) return;
    // Write の記録を取り逃したときのために、作業フォルダのシナリオと計画のファイルを探し、記録のときと同じ検査を通れば記録して通す。
    const dirs = [...new Set([cwd, state.html && path.isAbsolute(state.html) ? path.dirname(state.html) : cwd])].filter(folder => fs.existsSync(folder));
    const next = { ...state };
    for (const folder of dirs) for (const entry of fs.readdirSync(folder).sort()) {
      const file = path.join(folder, entry);
      if (!next.scenario && isScenarioName(entry)) next.scenario = file;
      if (!next.plan && isPlanName(entry) && (!state.html || hasHtml(file, fs.readFileSync(file, 'utf8'), cwd))) next.plan = file;
    }
    if (next.plan !== state.plan || next.scenario !== state.scenario) save(next);
    const lacks = [!next.scenario && 'シナリオ（<題名>_シナリオ.md）', !next.plan && '計画（<題名>_Exploratory作成計画.md）'].filter(Boolean);
    if (lacks.length) deny('計画の関所: R の作業の後は、先に' + lacks.join('と') + 'を保存してください。');
    return;
  }
  const response = input.tool_response, ok = !failed(response);
  const chartId = String(args.chartId || args.chart_id || '');
  const responseText = typeof response === 'string' ? response : JSON.stringify(response || '');
  if (/(?:^|__)create_analytics$/.test(name) && ok) {
    const values = resultObjects(response);
    if (values.some(failed)) return;
    const result = values.find(value => value?.analyticsId && Array.isArray(value.outputs));
    const outputs = (result?.outputs || []).filter(type => typeof type === 'string');
    const radarTypes = outputs.filter(type => /^radar/.test(type));
    if (outputs.includes('feature_importance_bar') || radarTypes.length) {
      const state = load(), model = { id: result.analyticsId, title: result.displayName || args.title || result.analyticsId,
        kind: outputs.includes('feature_importance_bar') ? 'predictive' : 'cluster', radarTypes,
        impactTypes: outputs.filter(type => type.startsWith('local_importance_')) };
      save({ ...state, predictive: [...(state.predictive || []).filter(value => value.id !== model.id), model] });
    }
    return;
  }
  if (name === 'Skill') {
    if (ok && /^(?:exploratory:)?exploratory-analysis$/.test(args.skill || '')) save({ ...load(), exploratory: true });
    else if (ok && !String(args.skill || '').startsWith('exploratory:') && load().exploratory) save({ ...load(), exploratory: false });
    return;
  }
  const withRValues = state => {
    if (!/(?:^|__)execute_r_script$/.test(name) || resultObjects(response).some(failed)) return state;
    const values = resultObjects(response).flatMap(value => [
      ...numbersIn(value?.rows), ...numbersIn(typeof value?.redacted_msg === 'string' ? [value.redacted_msg.split(/\s+/)] : [], true)
    ]);
    return { ...state, rValues: mergeNumbers(state.rValues, values), ...(state.dashboard ? { rValuesAfter: mergeNumbers(state.rValuesAfter, values) } : {}) };
  };
  // R のレポート（HTML）の保存を記録する。Write の .html、Bash と PowerShell の render / .html の出力、execute_r_script で .html を書いたもの。
  const command = String(args.command || '');
  const shellR = (name === 'Bash' || name === 'PowerShell') && shellRWork(command);
  const html = name === 'Write' ? /\.html?$/i.test(target) && target
    : name === 'Bash' || name === 'PowerShell' ? shellR && /rmarkdown::render|\brender\s*\(|(?:-o|--output|>)\s*['\x22]?[^\s'\x22]+\.html?\b/i.test(command) && ((command.match(HTML_NAME) || [])[0] || '')
    : /(?:^|__)execute_r_script$/.test(name) ? /\.html?\b/i.test(JSON.stringify(args) + responseText) && ((JSON.stringify(args).match(HTML_NAME) || [])[0] || '')
    : false;
  if (html !== false) {
    if (!ok || !load().exploratory) return;
    if (!html) { save(withRValues({ ...load(), r: true })); return; }
    const key = html ? path.resolve(cwd, html.replace(/^.*=/, '')) : 'unknown';
    // 同じレポートの再保存（手順 4 の直し）では状態を消さない。新しいレポートなら前の依頼の状態をリセットする。
    save(withRValues(load().html !== key ? { exploratory: true, html: key, r: true } : load()));
    return;
  }
  const rWork = /(?:^|__)execute_r_script$/.test(name) || (name === 'Bash' && shellR);
  if (rWork) { if (ok) save(withRValues({ ...load(), r: true })); return; }
  // 照合の確認用: 作ったチャートと、画像で見たチャートを数える。
  if (/(?:^|__)create_chart$/.test(name) && ok) {
    const id = (responseText.match(/"(?:chartId|chart_id)"\s*:\s*"([^"]+)"/) || [])[1] || (responseText.match(/\\"(?:chartId|chart_id)\\"\s*:\s*\\"([^"\\]+)\\"/) || [])[1];
    const state = load(), result = resultObjects(response).find(value => value?.chartId || value?.chart_id) || {};
    const marker = args.marker || args.chartType || result.marker || result.chartType;
    if (id) save({ ...state, charts: [...new Set([...(state.charts || []), id])], lines: String(marker).toLowerCase() === 'line' ? [...new Set([...(state.lines || []), id])] : (state.lines || []).filter(value => value !== id), numbers: ['singlevalue', 'number'].includes(String(marker).toLowerCase()) ? [...new Set([...(state.numbers || []), id])] : (state.numbers || []).filter(value => value !== id) }); return;
  }
  if (/(?:^|__)(?:create_dashboard|get_dashboard|update_dashboard)$/.test(name) && ok) {
    const values = resultObjects(response), result = values.find(v => v?.dashboardId || v?.dashboard_id || v?.dashboard) || {};
    const id = args.dashboard_id || args.dashboardId || result.dashboardId || result.dashboard_id;
    const rawPages = values.find(v => Array.isArray(v?.pages))?.pages || result.dashboard?.pages || args.pages;
    const pages = typeof rawPages === 'string' ? parse(rawPages) : rawPages;
    if (id && Array.isArray(pages)) {
      const state = load(), next = { ...state, dashboardPages: { ...state.dashboardPages, [id]: pages } };
      // 構成が変わったら、前の構成にあって今の構成に無いチャートは、見るべきものから外す。
      if (/(?:^|__)update_dashboard$/.test(name) && state.dashboardPages?.[id]) {
        // 別のダッシュボードに残るチャートは外さない。外したものは left に控え、pages に戻ったら charts に戻す。
        const now = new Set(dashboardChartIds(pages)), elsewhere = new Set(Object.values(next.dashboardPages).flatMap(p => dashboardChartIds(p)));
        const gone = new Set(dashboardChartIds(state.dashboardPages[id]).filter(c => !now.has(c) && !elsewhere.has(c)));
        for (const key of ['charts', 'numbers', 'lines', 'seen', 'pngFail', 'data']) if (next[key]) next[key] = next[key].filter(c => !gone.has(c));
        next.left = [...new Set([...(state.left || []), ...gone])];
      }
      const back = (next.left || []).filter(c => dashboardChartIds(pages).includes(c) && !(state.deleted || []).includes(c));
      if (back.length) { next.charts = [...new Set([...(next.charts || []), ...back])]; next.left = next.left.filter(c => !back.includes(c)); }
      save(next);
    }
  }
  // 全体画像が撮れなかったことを覚え、撮れたら忘れる（撮れない画像を Stop で求め続けない）。
  if (/(?:^|__)get_(?:dashboard|note)_image$/.test(name)) { const key = /dashboard/.test(name) ? 'dashboardImageFailed' : 'noteImageFailed', state = load(); if (!ok) { save({ ...state, [key]: true }); return; } if (state[key]) save({ ...state, [key]: false }); }
  if (/(?:^|__)get_dashboard_image$/.test(name) && ok) {
    const state = load(), image = resultObjects(response).find(v => v?.scope === 'full' && v.truncated === false) || (/\\?"scope\\?"\s*:\s*\\?"full\\?"/.test(responseText) && /\\?"truncated\\?"\s*:\s*false\b/.test(responseText) ? {} : undefined);
    const pages = state.dashboardPages?.[args.dashboard_id || args.dashboardId];
    if (state.dashboard && !state.note && image && pages) {
      const charts = dashboardChartIds(pages[(args.page || 1) - 1]);
      save({ ...state, seen: [...new Set([...(state.seen || []), ...charts])] });
    }
    return;
  }
  // ノートは全体画像 1 枚（get_note_image）で全チャートを見る。全体が写っていれば、作ったチャートを見た扱いにする。
  if (/(?:^|__)get_note_image$/.test(name) && ok) {
    const state = load(), full = resultObjects(response).some(v => v?.scope === 'full' && v.truncated === false) || (/\\?"scope\\?"\s*:\s*\\?"full\\?"/.test(responseText) && /\\?"truncated\\?"\s*:\s*false\b/.test(responseText));
    if (state.note && full) save({ ...state, seen: [...new Set([...(state.seen || []), ...(state.charts || [])])] });
    return;
  }
  const add = (state, key, id) => ({ ...state, [key]: [...new Set([...(state[key] || []), id])] });
  if (/(?:^|__)get_chart_image$/.test(name) && chartId) {
    if (ok) save(add(load(), 'seen', chartId));
    else if (/returned no PNG image/.test(responseText)) save(add(load(), 'pngFail', chartId));
    return;
  }
  // 消したチャートは撮れないので、見るべきチャートから外す。
  if (/(?:^|__)delete_chart$/.test(name) && ok && chartId) {
    const state = load(), next = { ...state, deleted: [...new Set([...(state.deleted || []), chartId])] };
    for (const key of ['charts', 'numbers', 'lines', 'seen', 'pngFail', 'data']) if (next[key]) next[key] = next[key].filter(id => id !== chartId);
    save(next); return;
  }
  if (/(?:^|__)get_chart_data$/.test(name) && ok && chartId) {
    const state = add(load(), 'data', chartId), value = resultObjects(response).map(chartValue).find(Boolean);
    state.values = { ...state.values };
    state.unparsedValues = (state.unparsedValues || []).filter(id => id !== chartId);
    if (value) state.values[chartId] = value;
    else { delete state.values[chartId]; state.unparsedValues.push(chartId); }
    save(state); return;
  }
  if (/(?:^|__)(?:update_chart|update_analytics|update_note|update_dashboard)$/.test(name) && ok) {
    const state = load(), next = { ...state, fixes: (state.fixes || 0) + 1 };
    if (/(?:^|__)update_chart$/.test(name) && chartId) {
      const result = resultObjects(response).find(value => value?.marker || value?.chartType) || {};
      const marker = args.marker || args.chartType || result.marker || result.chartType;
      if (marker) next.numbers = ['singlevalue', 'number'].includes(String(marker).toLowerCase())
        ? [...new Set([...(state.numbers || []), chartId])]
        : (state.numbers || []).filter(id => id !== chartId);
      if (marker) next.lines = String(marker).toLowerCase() === 'line' ? [...new Set([...(state.lines || []), chartId])] : (state.lines || []).filter(id => id !== chartId);
      if (next.values) { next.values = { ...next.values }; delete next.values[chartId]; }
      next.unparsedValues = (state.unparsedValues || []).filter(id => id !== chartId);
    }
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
  if (name === 'Write' && ok && isScenarioName(target)) { save({ ...load(), scenario: target }); return; }
  if (name !== 'Write' || !isPlanName(target) || typeof args.content !== 'string' || !ok) return;
  if (load().html && !hasHtml(target, args.content, cwd)) { say('PostToolUse', { additionalContext: '計画の関所: この計画は記録されません。計画に、実在する HTML のファイル名が書かれていません。' }); return; }
  save({ ...load(), plan: target });
}
// 想定外の失敗では止めない（関所は迷うときは通す）。
module.exports = (mode, input) => { try { main(mode, input); } catch { /* 何も返さず通す */ } };
