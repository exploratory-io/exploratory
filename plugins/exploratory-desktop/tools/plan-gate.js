#!/usr/bin/env node
'use strict';
// 分析の関所。review_hook=true のときだけ runtime-hook.js から呼ばれる。
// plan-stop: 分析スキルで作ったノートかダッシュボードに載せたチャートのうち、その成果物の全体画像で見ていないものがあれば 1 回だけ止める。
//   対象は作ったときに記録する（notes: ノートの ID → 埋め込んだチャートの ID、dashboards: ダッシュボードの ID）。別の成果物の画像では見た扱いにしない。
// 状態はセッションごとの JSON 1 つ。session_id が無い・状態が読めないなど迷うときは通す。
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { spawnSync } = require('node:child_process');
// create_note / update_note の markdown に埋め込んだチャートの ID {{chart:ID}} を集める。
const embeddedCharts = markdown => [...new Set([...String(markdown || '').matchAll(/\{\{\s*chart\s*:\s*([^|}\s]+)/g)].map(m => m[1]))];
// 分析スキルの作業中か。スキルを読んだ後（exploratory: true）か、このセッションでそのスキルからノートを作った後で、別のスキルに移っていないとき。
const analysing = state => state.exploratory === true || (Object.hasOwn(state, 'exploratory') && state.note === true && state.otherSkill !== true);
const HTML_NAME = /[^\s"'\x60()（）\[\]<>|｜、,，*]+\.html?\b/gi;
// 応答が JSON 文字列でも、isError などを見られるように解析する。
const parse = response => { if (typeof response !== 'string') return response; try { return JSON.parse(response); } catch { return response; } };
const failed = response => { const value = parse(response); return typeof value === 'string' ? /^error/i.test(value) : !!(value && (value.isError || value.is_error || value.error)); };
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
`], { input: command, encoding: 'utf8', timeout: 5000 });
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
    // 分析スキルを使い、ノートかダッシュボードを作った後に、Number 以外のチャートを全体画像で見たかを確かめる。止めるのは 1 回だけ。
    const state = load();
    if (!Object.hasOwn(state, 'exploratory') || !(state.note || state.dashboard)) return;
    const seen = new Set(state.seen || []);
    let missing = (state.charts || []).filter(id => !(state.numbers || []).includes(id) && !seen.has(id));
    // ノートは、対象のノートに埋め込んだチャートだけを求める（記録が無い古い状態では作ったチャート全部）。
    if (state.note && state.notes && !state.dashboard) { const inNotes = new Set(Object.values(state.notes).flat()); missing = missing.filter(id => inNotes.has(id)); }
    // 全体画像が撮れなかったときは、画像の不足で止めない（撮れない画像を求め続けない）。
    if (state.dashboard ? state.dashboardImageFailed : state.noteImageFailed) return;
    // ダッシュボードの画像は 1 ページずつ撮る。構成を記録できていれば、どのページにも載っていないチャートは求めず、撮るページを番号で示す。
    const boards = Object.entries(state.dashboard && !state.note && state.dashboardPages || {})
      .filter(([board, pages]) => Array.isArray(pages) && (!state.dashboards || state.dashboards.includes(board)));
    const pagesToTake = [];
    if (boards.length) {
      missing = missing.filter(id => boards.some(([, pages]) => dashboardChartIds(pages).includes(id)));
      for (const [board, pages] of boards) pages.forEach((page, i) => {
        if (dashboardChartIds(page).some(id => missing.includes(id))) pagesToTake.push('dashboard_id ' + JSON.stringify(board) + ' の page=' + (i + 1));
      });
    }
    if (missing.length && (state.stops || 0) < 1) {
      save({ ...state, stops: (state.stops || 0) + 1 });
      const how = pagesToTake.length ? 'get_dashboard_image を ' + pagesToTake.join('、') + ' で撮り'
        : state.dashboard && !state.note ? 'get_dashboard_image をページごとに（page を指定して）1 回ずつ撮り' : 'get_note_image で全体画像を 1 回撮り';
      console.log(JSON.stringify({ decision: 'block', reason: '全体画像（get_note_image / get_dashboard_image）で見ていないチャートが ' + missing.length + ' 枚あります（返り値の ID、JSON: ' + missing.map(id => JSON.stringify(id)).join(', ') + '）。' + how + '（unsaved_edits なら open_note にその成果物の id を渡して開き直してから撮り、identity_mismatch なら開き直さず同じ引数でもう 1 回撮る）、元の成果物があればそれと見比べ、直せるずれを直してから報告してください。' }));
    }
    return;
  }
  const response = input.tool_response, ok = !failed(response);
  const chartId = String(args.chartId || args.chart_id || '');
  const responseText = typeof response === 'string' ? response : JSON.stringify(response || '');
  if (name === 'Skill') {
    if (ok && /^(?:exploratory:)?exploratory-analysis$/.test(args.skill || '')) save({ ...load(), exploratory: true, otherSkill: false });
    else if (ok && !String(args.skill || '').startsWith('exploratory:') && Object.hasOwn(load(), 'exploratory')) save({ ...load(), exploratory: false, otherSkill: true });
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
    // HTML は元の成果物（見本）として読むこともあるので、記録しても他の状態（作ったモデル・チャート）は消さない。
    save(withRValues({ ...load(), html: path.resolve(cwd, html.replace(/^.*=/, '')), r: true }));
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
    const board = args.dashboard_id || args.dashboardId, pages = state.dashboardPages?.[board];
    // 対象のダッシュボードの画像だけを数える（別のダッシュボードの画像では見た扱いにしない）。
    if (state.dashboard && !state.note && image && pages && (!state.dashboards || state.dashboards.includes(board))) {
      const charts = dashboardChartIds(pages[(args.page || 1) - 1]);
      save({ ...state, seen: [...new Set([...(state.seen || []), ...charts])] });
    }
    return;
  }
  // ノートは全体画像 1 枚（get_note_image）で見る。全体が写っていれば、そのノートのチャートを見た扱いにする。
  if (/(?:^|__)get_note_image$/.test(name) && ok) {
    const state = load(), full = resultObjects(response).some(v => v?.scope === 'full' && v.truncated === false) || (/\\?"scope\\?"\s*:\s*\\?"full\\?"/.test(responseText) && /\\?"truncated\\?"\s*:\s*false\b/.test(responseText));
    // 対象のノートの画像だけで、そのノートに埋め込んだチャートを見た扱いにする。別のノートの画像は数えない。
    const noteId = String(args.note_id || args.noteId || '');
    const charts = state.notes ? (Object.hasOwn(state.notes, noteId) ? state.notes[noteId] : []) : (state.charts || []);
    if (state.note && full) save({ ...state, seen: [...new Set([...(state.seen || []), ...charts])] });
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
    // 対象のノートに埋め込んだチャートを更新する（replace は置き換え、追記は足す）。
    const noteId = String(args.note_id || args.noteId || '');
    if (/(?:^|__)update_note$/.test(name) && state.notes && Object.hasOwn(state.notes, noteId) && typeof args.markdown === 'string') {
      next.notes = { ...state.notes, [noteId]: args.mode === 'replace' ? embeddedCharts(args.markdown) : [...new Set([...state.notes[noteId], ...embeddedCharts(args.markdown)])] };
    }
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
  // 分析スキルの作業中に作ったノート・ダッシュボードだけを点検の対象として記録する。
  if (/(?:^|__)create_note$/.test(name) && ok) {
    const state = load();
    if (!analysing(state)) return;
    const result = resultObjects(response).find(value => value?.noteId || value?.note_id) || {};
    const noteId = result.noteId || result.note_id || (responseText.match(/\\?"(?:noteId|note_id)\\?"\s*:\s*\\?"([^"\\]+)/) || [])[1];
    save({ ...state, note: true, exploratory: false, ...(noteId ? { notes: { ...state.notes, [noteId]: embeddedCharts(args.markdown) } } : {}) });
    return;
  }
  if (/(?:^|__)create_dashboard$/.test(name) && ok) {
    const state = load();
    if (!analysing(state)) return;
    const result = resultObjects(response).find(v => v?.dashboardId || v?.dashboard_id) || {};
    const id = result.dashboardId || result.dashboard_id;
    save({ ...state, dashboard: true, ...(id ? { dashboards: [...new Set([...(state.dashboards || []), id])] } : {}) });
    return;
  }
}
// 想定外の失敗では止めない（関所は迷うときは通す）。
module.exports = (mode, input) => { try { main(mode, input); } catch { /* 何も返さず通す */ } };
