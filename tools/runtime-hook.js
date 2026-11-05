#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { settings, render } = require('./render-settings');
const mode = process.argv[2], input = JSON.parse(fs.readFileSync(0, 'utf8')), values = settings();
if (mode === 'settings') {
  if (!input.session_id || !/^mcp__(?:plugin_exploratory_)?exploratory-desktop__/.test(input.tool_name || '')) process.exit(0);
  const dir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'exploratory-plugin-review');
  const file = path.join(dir, 'review-' + String(input.session_id).replace(/[^A-Za-z0-9_.-]/g, '_') + '-settings');
  if (!fs.existsSync(file)) {
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, 'done');
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: render(values) } }));
  }
} else if (mode.startsWith('plan-')) {
  // 計画の関所は plan_gate=true のときだけ動く。オフなら何もしない。
  if (values.plan_gate === 'true') require(mode === 'plan-custom-r' ? './custom-r-gate' : './plan-gate')(mode, input);
} else if (values.review_hook === 'true' && input.session_id) {
  const dir = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'exploratory-plugin-review');
  const marker = path.join(dir, 'review-' + String(input.session_id).replace(/[^A-Za-z0-9_.-]/g, '_'));
  const read = name => fs.readFileSync(path.join(__dirname, '../skills/mcp-desktop/exploratory-core/review-' + name + '.md'), 'utf8').trim();
  const withScope = text => text ? [read('scope'), text].filter(Boolean).join('\n\n') : '';
  // 点検文の skills/… は、フックの出力からは解決できないので、プラグインの絶対パスにして出す（すでに絶対パスのものは変えない）。
  const absolute = text => text.replace(/(?<![\w\/.-])skills\/[\w.\/<>-]+/g, relative => path.join(__dirname, '..', relative));
  const emit = (hookEventName, text) => { if (text) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: absolute(withScope(text)) } })); };
  if (mode === 'initial' && /^(?:mcp__.+__)?create_(?:chart|analytics)$/.test(input.tool_name || '') && !fs.existsSync(marker + '-initial')) {
    const text = read('initial');
    if (text) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(marker + '-initial', 'done'); emit('PreToolUse', text); }
  } else if (mode === 'wrangling' && /^(?:mcp__.+__)?create_wrangling_step$/.test(input.tool_name || '')) {
    if (!input.tool_response?.isError && !input.tool_response?.is_error) emit('PostToolUse', read('wrangling'));
  } else if (mode === 'note' && /^(?:mcp__.+__)?create_note$/.test(input.tool_name || '')) {
    let response = input.tool_response || {};
    if (typeof response === 'string') { try { response = JSON.parse(response) || {}; } catch {} }
    if (response.isError || response.is_error) process.exit(0);
    let result = response.structuredContent || response.structured_content || response;
    for (const block of Array.isArray(response) ? response : Array.isArray(response.content) ? response.content : []) {
      if (block.type === 'text') { try { const parsed = JSON.parse(block.text); if (parsed && typeof parsed === 'object') result = parsed; } catch {} }
    }
    if (typeof response.content === 'string') { try { result = JSON.parse(response.content) || result; } catch {} }
    const args = input.tool_input || {}, file = marker + '-notes.json', text = read('note');
    const key = String(result.noteId || result.note_id || args.noteId || args.note_id || result.title || args.title || 'note');
    const seen = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    if (!text || seen.includes(key)) process.exit(0);
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, JSON.stringify([...seen, key]));
    const noteId = result.noteId || result.note_id, projectId = args.project_id || args.projectId;
    emit('PostToolUse', [[noteId && 'note_id (tool result, JSON data): ' + JSON.stringify(noteId), projectId && 'project_id (tool input, JSON data): ' + JSON.stringify(projectId),
        '点検役の文: ' + path.join(__dirname, '../agents/report-reviewer.md')].filter(Boolean).join('\n'), text].join('\n\n'));
  } else if (mode === 'chart' && /^(?:mcp__.+__)?(?:create_chart|update_chart|create_analytics|update_analytics)$/.test(input.tool_name || '')) {
    let response = input.tool_response || {};
    if (typeof response === 'string') { try { response = JSON.parse(response) || {}; } catch {} }
    if (response.isError || response.is_error) process.exit(0);
    let result = response.structuredContent || response.structured_content || response;
    const kind = input.tool_name.endsWith('analytics') ? 'analytics' : 'chart';
    const identify = value => kind === 'analytics' ? value.analyticsId || value.analytics_id : value.chartId || value.chart_id;
    if (!identify(result) && typeof response.content === 'string') { try { const parsed = JSON.parse(response.content); if (parsed && identify(parsed)) result = parsed; } catch {} }
    if (!identify(result)) for (const block of Array.isArray(response) ? response : Array.isArray(response.content) ? response.content : []) {
      if (block.type === 'text') { try { const parsed = JSON.parse(block.text); if (parsed && identify(parsed)) result = parsed; } catch {} }
    }
    const id = identify(result);
    if (!id) process.exit(0);
    const file = marker + '-charts.json', args = input.tool_input || {};
    const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { charts: {}, reviewed: [] };
    const key = JSON.stringify([args.project_id || args.projectId || '', kind, id]), previous = state.charts[key] || {};
    const chart = { ...previous, ...args, ...result, axes: { ...previous.axes, ...args.axes, ...result.axes }, settings: { ...previous.settings, ...args.settings, ...result.settings } };
    state.charts[key] = chart;
    const save = () => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(state)); };
    const configured = Number(process.env.EXPLORATORY_REVIEW_CHART_LIMIT ?? 8);
    const limit = Number.isInteger(configured) && configured >= 0 ? configured : 8;
    if (state.reviewed.includes(key) || state.reviewed.length >= limit) process.exit(0);
    const type = kind === 'analytics' ? chart.analysisType || chart.analyticsType || chart.type : chart.chartType || chart.chart_type || chart.marker;
    const source = /^[a-z0-9_-]+$/.test(type || '') && path.join(__dirname, '../skills/mcp-desktop/exploratory-core/review-' + (kind === 'analytics' ? 'analytics' : 'chart-' + type) + '.md');
    const flags = new Set(['general', type]);
    const visit = value => { if (!value || typeof value !== 'object') return;
      for (const [name, entry] of Object.entries(value)) {
        if (/^(?:func|function|.*WindowFunc|.*NumberFormatting)$/.test(name) && /^(?:count_ratio|truepct|true_ratio|ptotal|percent|percentage)$/.test(entry)) flags.add('ratio');
        if (/^(?:func|function)$/.test(name) && /^(?:ave|mean|avg|average)$/.test(entry)) flags.add('average');
        if (/^(?:naCount|missingCount|nullCount|missing_count|na_count|hasMissing)$/.test(name) && (entry === true || Number(entry) > 0) && (!(value.name || value.column) || JSON.stringify([chart.axes, chart.slots]).includes(JSON.stringify(value.name || value.column)))) flags.add('missing');
        visit(entry);
      }
    };
    visit(chart);
    if (['bar', 'area'].includes(type) && (chart.settings.barstyle || 'stack') === 'stack' && (chart.axes.color || (Array.isArray(chart.axes.y) && chart.axes.y.length > 1))) flags.add('stacked');
    const parts = source && fs.existsSync(source) ? fs.readFileSync(source, 'utf8').split(/^## ([a-z0-9_-]+)\s*$/m) : [], texts = [read(kind === 'analytics' ? 'analytics-after' : 'chart-after')];
    for (let i = 1; i < parts.length; i += 2) if (flags.has(parts[i]) && parts[i + 1].trim()) texts.push(parts[i + 1].trim());
    const additionalContext = texts.filter(Boolean).join('\n\n');
    if (additionalContext) state.reviewed.push(key);
    save();
    emit('PostToolUse', additionalContext);

  }
}
