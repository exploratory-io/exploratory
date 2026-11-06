const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = process.env.HOOK_TEST_ROOT || path.resolve(__dirname, '..');
const numberRows = value => ({ chart_type: 'singlevalue', rows: [[[String(value)]]], columns: [{name:'0'}] });
function readNumber(f, id, value = 1) {
  f.record('execute_r_script', {}, {rows:[[value]]});
  f.record('get_chart_data', {chartId:id}, numberRows(value));
}
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h2-precision-'));
  const state = path.join(dir, 'review-h2-plan.json');
  const run = (mode, data = {}, extra = {}) => {
    const out = execFileSync(process.execPath, [path.join(root, 'tools/runtime-hook.js'), mode], {
      input: JSON.stringify({ session_id: 'h2', cwd: dir, ...data }),
      env: { ...process.env, PLUGIN_DATA: dir, EXPLORATORY_PLAN_GATE: 'true', CLAUDE_PLUGIN_OPTION_PLAN_GATE: 'true', CLAUDE_PLUGIN_OPTION_REVIEW_HOOK: 'false', ...extra }, encoding: 'utf8'
    }).trim();
    return out ? JSON.parse(out) : null;
  };
  const record = (tool_name, tool_input = {}, tool_response = {}) => run('plan-record', { tool_name, tool_input, tool_response });
  // The gate works only after the exploratory-analysis skill is used (plugin-unify). Seed that as the default state.
  const seed = value => fs.writeFileSync(state, JSON.stringify({ exploratory: true, ...value }));
  record('Skill', { skill: 'exploratory:exploratory-analysis' }, {});
  return { dir, state, run, record, seed, close: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
for (const [label,tool,args] of [['execute_r_script','mcp__plugin_exploratory_exploratory-desktop__execute_r_script',{r_script:'summary(df)'}],['Rscript','Bash',{command:'Rscript analysis.R'}],['render','Bash',{command:'cd /tmp && /opt/homebrew/bin/Rscript -e "rmarkdown::render(\"a.Rmd\")"'}]]) {
  test('A: '+label+' without HTML activates the gate, and an HTML-free plan releases it', () => {
    const f=fixture();try {
      f.record(tool,args);
      assert.equal(f.run('plan-guard',{tool_name:'mcp__plugin_exploratory_exploratory-desktop__create_chart'})?.hookSpecificOutput?.permissionDecision,'deny');
      f.record('Write',{file_path:path.join(f.dir,'Exploratory作成計画.md'),content:'# 計画\nR の集計表から図を作る。'});
      assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null);
    } finally { f.close(); }
  });
}
test('A: create_dashboard is guarded too', () => {
  const f=fixture();try { f.seed({r:true});assert.equal(f.run('plan-guard',{tool_name:'create_dashboard'})?.hookSpecificOutput?.permissionDecision,'deny'); } finally { f.close(); }
});
test('A: a saved plan using path is recorded', () => {
  const f=fixture();try { f.record('execute_r_script');f.record('Write',{path:path.join(f.dir,'plan.md'),content:'R の結果を使う'});assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null); } finally { f.close(); }
});
test('B: a dashboard with an unseen chart blocks at most twice', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',dashboard:true,charts:['bar-1'],fixes:1});
    assert.equal(f.run('plan-stop')?.decision,'block');assert.equal(f.run('plan-stop')?.decision,'block');assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
test('Number: exclude only Number, keep other chart images required', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,fixes:1});
    f.record('create_chart',{marker:'singlevalue'},JSON.stringify({chartId:'number-1'}));
    readNumber(f, 'number-1');
    assert.equal(f.run('plan-stop'),null);
    f.record('create_chart',{marker:'bar'},JSON.stringify({chartId:'bar-1'}));
    assert.equal(f.run('plan-stop')?.decision,'block');
  } finally { f.close(); }
});
test('Number: nested structuredContent preserves exclusion', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',dashboard:true,fixes:1});
    f.record('create_chart',{}, {content:[{type:'text',text:JSON.stringify({chartId:'n',marker:'number'})}]});
    readNumber(f, 'n');
    assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
for (const command of ["echo 'example; Rscript analysis.R'", "echo ';' Rscript analysis.R", 'echo "example; Rscript analysis.R"']) {
  test('review A: quoted Rscript is not execution: '+command, () => {
    const f=fixture();try { f.record('Bash',{command});assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null); } finally { f.close(); }
  });
}
for (const command of ['R_LIBS=/tmp/R Rscript analysis.R','env Rscript analysis.R','R_LIBS=/tmp/R env Rscript analysis.R']) {
  test('review A: environment-prefixed Rscript activates the gate: '+command, () => {
    const f=fixture();try {
      f.record('Bash',{command});
      assert.equal(f.run('plan-guard',{tool_name:'create_chart'})?.hookSpecificOutput?.permissionDecision,'deny');
    } finally { f.close(); }
  });
}
for (const [before,after,blocked] of [['bar','singlevalue',false],['singlevalue','bar',true]]) {
  test('review Number: successful update '+before+' -> '+after, () => {
    const f=fixture();try {
      f.seed({plan:'plan.md',note:true,fixes:1});
      f.record('create_chart',{marker:before},{chartId:'c'});
      f.record('update_chart',{chartId:'c',marker:after},{chartId:'c'});
      if (after === 'singlevalue') readNumber(f, 'c');
      assert.equal(f.run('plan-stop')?.decision==='block',blocked);
    } finally { f.close(); }
  });
}
test('review Number: failed update preserves the previous type', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,fixes:1});f.record('create_chart',{marker:'singlevalue'},{chartId:'c'});
    readNumber(f, 'c');
    f.record('update_chart',{chartId:'c',marker:'bar'},{isError:true});assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
test('review C: a table without a final pipe retains the last cell', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,fixes:1});
    assert.equal(f.run('plan-stop',{last_assistant_message:'| 図 | 可否\n|---|---\n| 図1 | 直せる'})?.decision,'block');
  } finally { f.close(); }
});
for (const status of ['修正済みではない','対応済みではない','修正済みとは言えない']) {
  test('review C: negated completion stays unfinished: '+status, () => {
    const f=fixture();try {
      f.seed({plan:'plan.md',note:true,fixes:1});
      assert.equal(f.run('plan-stop',{last_assistant_message:'| 図1 | 直せる | '+status+' |'})?.decision,'block');
    } finally { f.close(); }
  });
}
test('review C: a completion word in a reason is not a completed status', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,fixes:1});
    assert.equal(f.run('plan-stop',{last_assistant_message:'| 図 | 可否 | 状態 | 理由 |\n|---|---|---|---|\n| 図1 | 直せる | 未修正 | 修正済み |'})?.decision,'block');
  } finally { f.close(); }
});
// Runs only where the replay script of the internal test records is available.
if (process.env.HOOK_REPLAY_SCRIPT) test('review replay: reasons and modes must match the expected stop', () => {
  const script=process.env.HOOK_REPLAY_SCRIPT;
  execFileSync('python3',['-c',String.raw`
import runpy, sys
module=runpy.run_path(sys.argv[1])
matches=module.get('matches_expected',lambda expected,fired:bool(fired))
def stop(reason,mode='plan-stop'):return {'mode':mode,'output':{'decision':'block','reason':reason}}
assert matches('B',[stop('照合の確認: 画像で見ていないチャートが 1 枚あります')])
assert not matches('B',[stop('照合の確認: 直す操作が 0 回です')])
assert not matches('B',[stop('照合の確認: 画像で見ていないチャートが 1 枚あります','plan-record')])
assert matches('zero-fix',[stop('照合の確認: 直す操作が 0 回です')])
assert not matches('A',[stop('計画の関所: R の作業の後は計画を保存してください')])
assert module['bash_r']('R_LIBS=/tmp/R Rscript analysis.R')
assert module['bash_r']('env Rscript analysis.R')
assert not module['bash_r']("echo ';' Rscript analysis.R")
charts={}
remember=module.get('remember_chart_type')
if remember:
 remember(charts,'create_chart',{'marker':'bar'},{'chartId':'c'})
 remember(charts,'update_chart',{'chartId':'c','marker':'singlevalue'},{})
 assert charts['c']=='singlevalue'
 remember(charts,'update_chart',{'chartId':'c','marker':'bar'},{})
 assert charts['c']=='bar'
else:
 charts['c']='bar'
 assert charts['c']=='singlevalue'
` ,script],{encoding:'utf8'});
});
test('B: PNG failure plus chart data does not replace a non-Number image', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',dashboard:true,fixes:1,charts:['bar'],pngFail:['bar'],data:['bar']});
    assert.equal(f.run('plan-stop')?.decision,'block');
  } finally { f.close(); }
});
const table = status => '| 図 | 修正可否 | 状態 | 理由 | 探した設定名 |\n|---|---|---|---|---|\n| 図1 | '+status+' | 未修正 | 設定で直せる | orientation |';
test('C: a fixable unfinished table row blocks even after one update, at most twice', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,charts:['c'],seen:['c'],fixes:1});
    const input={last_assistant_message:table('直せる')};
    assert.equal(f.run('plan-stop',input)?.decision,'block');assert.equal(f.run('plan-stop',input)?.decision,'block');assert.equal(f.run('plan-stop',input),null);
  } finally { f.close(); }
});
test('C: repaired rows and unfixable rows with reason and setting pass', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',dashboard:true,charts:['c'],seen:['c'],fixes:1});
    for (const text of [table('直せる').replace('未修正','修正済み'),table('直せない').replace('設定で直せる','該当設定がない')]) assert.equal(f.run('plan-stop',{last_assistant_message:text}),null);
  } finally { f.close(); }
});
test('C: transcript fallback reads the last assistant answer without tool arguments', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,fixes:1});
    const transcript=path.join(f.dir,'transcript.jsonl');
    fs.writeFileSync(transcript,JSON.stringify({type:'assistant',message:{content:[{type:'text',text:table('直せる')}]}})+'\n');
    assert.equal(f.run('plan-stop',{transcript_path:transcript})?.decision,'block');
  } finally { f.close(); }
});
test('retain zero-fix stop; unknown state, ordinary Bash, prose, and disabled gate pass', () => {
  const f=fixture();try {
    f.record('Bash',{command:'echo Rscript; cat analysis.R'});assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null);
    f.record('Bash',{command:'echo \'rmarkdown::render("report.Rmd")\''});assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null);
    f.seed({plan:'plan.md',note:true,charts:['c'],seen:['c']});assert.equal(f.run('plan-stop')?.decision,'block');
    assert.equal(f.run('plan-stop'),null);
    f.seed({plan:'plan.md',note:true,fixes:1});assert.equal(f.run('plan-stop',{last_assistant_message:'直せる項目はすべて直しました。'}),null);
    assert.equal(f.run('plan-stop',{last_assistant_message:table('直せる')},{CLAUDE_PLUGIN_OPTION_PLAN_GATE:'false'}),null);
    fs.writeFileSync(f.state,'{broken');assert.equal(f.run('plan-guard',{tool_name:'create_chart'}),null);
  } finally { f.close(); }
});

for (const [label, scope, truncated, error, note, blocked] of [
  ['full', 'full', false, false, false, false],
  ['partial', 'partial', true, false, false, true],
  ['failed', 'full', false, true, false, true],
  ['note', 'full', false, false, true, true]
]) test('dashboard capture: ' + label, () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', charts:['bar'], fixes:1, ...(note ? {note:true} : {dashboard:true})});
    f.record('create_dashboard', {pages:[{rows:[{panels:[{chart:'bar'}]}]}]}, {dashboardId:'dash'});
    f.record('get_dashboard_image', {dashboard_id:'dash'}, {scope, truncated, isError:error});
    assert.equal(f.run('plan-stop')?.decision === 'block', blocked);
  } finally { f.close(); }
});
test('dashboard capture: only charts on the captured page are seen', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, charts:['a','b'], fixes:1});
    f.record('get_dashboard', {dashboard_id:'dash'}, {dashboard:{pages:[
      {layout_rows:[{panels:[{type:'chart',id:'a'}]}]},
      {layout_rows:[{panels:[{type:'chart',id:'b'}]}]}
    ]}});
    f.record('get_dashboard_image', {dashboard_id:'dash',page:1}, {scope:'full',truncated:false});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).seen, ['a']);
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
test('dashboard capture: saved marker panels replace create arguments and exclude non-chart panels', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, charts:['bar-id','number-id'], fixes:1});
    f.record('create_dashboard', {pages:[{rows:[{panels:[{chart:'old-id'}]}]}]}, {dashboardId:'dash'});
    f.record('get_dashboard', {dashboard_id:'dash'}, {dashboard_id:'dash', pages:[
      {layout_rows:[{panels:[{type:'bar',id:'bar-id'}, {type:'singlevalue',id:'number-id'},
        {type:'text',id:'text-id',text:'caption'}, {type:'chart',id:'analytics-viz',analysisId:'analysis-id'}]}]},
      {layout_rows:[{panels:[{type:'line',id:'other-page'}]}]}
    ]});
    f.record('get_dashboard_image', {dashboard_id:'dash',page:1}, {scope:'full',truncated:false});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).seen, ['bar-id','number-id']);
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
// 実データの形: create_dashboard の pages は配列、get_dashboard_image の返答は画像の注記行 + JSON の文字列（そのままでは JSON.parse できない）。
const imageNote = '[Image: source: /tmp/x.png, original 3456x2816, displayed at 2000x1630.]';
for (const [label, scope, truncated, blocked] of [['full', 'full', false, false], ['partial', 'partial', true, true], ['full but truncated', 'full', true, true]]) {
  for (const [shape, wrap] of [['joined text', t => imageNote + '\n' + t], ['content array', t => [{ type: 'image', source: { type: 'base64', data: 'AAAA' } }, { type: 'text', text: imageNote }, { type: 'text', text: t }]], ['escaped JSON string', t => JSON.stringify([{ type: 'text', text: t }])]]) {
    test('dashboard capture, real response shape (' + shape + '): ' + label, () => {
      const f = fixture(); try {
        f.seed({ plan: 'plan.md', charts: ['bar', 'num'], numbers: ['num'], fixes: 1, dashboard: true });
        readNumber(f, 'num');
        f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ title: 'p', rows: [{ panels: [{ chart: 'bar' }, { chart: 'num' }] }] }] }, JSON.stringify({ ok: true, dashboardId: 'Cfq4QyB2', title: 't', warnings: [] }));
        f.record('mcp__plugin_exploratory_exploratory-desktop__get_dashboard_image', { project_id: 'p', dashboard_id: 'Cfq4QyB2' }, wrap(JSON.stringify({ dashboard_id: 'Cfq4QyB2', page: 1, scope, truncated, width: 3456, height: 2816 })));
        assert.equal(f.run('plan-stop')?.decision === 'block', blocked);
      } finally { f.close(); }
    });
  }
}
// 消したチャート（dash-hook4-1 の実際の形: delete_chart の返答は {"removed":{"chartId":...}} の文字列）は、画像確認の対象から外れる。
test('deleted chart is no longer required to be seen (real delete_chart shape)', () => {
  const f = fixture(); try {
    f.seed({ plan: 'plan.md', charts: ['GsW7LYC4', 'cSX3rcG4', 'keep'], seen: ['keep'], fixes: 1, dashboard: true });
    assert.equal(f.run('plan-stop')?.decision, 'block');
    for (const id of ['GsW7LYC4', 'cSX3rcG4']) f.record('mcp__plugin_exploratory_exploratory-desktop__delete_chart', { project_id: 'p', chartId: id }, JSON.stringify({ removed: { chartId: id, displayName: 'x', marker: 'bar' }, execution_id: 'e' }));
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).charts, ['keep']);
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
test('hooks.json delivers delete_chart to plan-record', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(root, 'hooks/claude.json'), 'utf8')).hooks.PostToolUse;
  const entry = hooks.find(h => h.hooks.some(x => /plan-record/.test(x.command)));
  assert.ok(new RegExp(entry.matcher).test('mcp__plugin_exploratory_exploratory-desktop__delete_chart'));
});
// update_dashboard（引数の pages は JSON 文字列のことがある）で外れたチャートは、見るべきチャートから外れる。
test('update_dashboard drops charts that left the dashboard, even when pages is a JSON string', () => {
  const f = fixture(); try {
    f.seed({ plan: 'plan.md', charts: ['old', 'a'], seen: ['a'], fixes: 1, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ rows: [{ panels: [{ chart: 'old' }, { chart: 'a' }] }] }] }, JSON.stringify({ ok: true, dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: JSON.stringify([{ rows: [{ panels: [{ chart: 'a' }] }] }]) }, JSON.stringify({ ok: true, dashboardId: 'D1' }));
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).charts, ['a']);
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
// 外したチャートが同じダッシュボードに戻る、または別のダッシュボードに残る場合は、確認対象から漏らさない。
const panel = c => ({ rows: [{ panels: [{ chart: c }] }] });
test('update_dashboard: a chart removed then re-added to the same dashboard is required again', () => {
  const f = fixture(); try {
    f.seed({ plan: 'plan.md', charts: ['a', 'b'], seen: ['b'], fixes: 1, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ rows: [{ panels: [{ chart: 'a' }, { chart: 'b' }] }] }] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [panel('b')] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [{ rows: [{ panels: [{ chart: 'a' }, { chart: 'b' }] }] }] }, JSON.stringify({ dashboardId: 'D1' }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
test('update_dashboard: a chart still on another dashboard is required', () => {
  const f = fixture(); try {
    f.seed({ plan: 'plan.md', charts: ['a', 'b'], seen: ['b'], fixes: 1, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [panel('a')] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [panel('a')] }, JSON.stringify({ dashboardId: 'D2' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [panel('b')] }, JSON.stringify({ dashboardId: 'D1' }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
// 全体画像の後に直したチャートは、全体画像を撮り直せば数える（dash-hook4-3 の Klb0LNe3 の形）。
test('chart changed after the full image counts again once the full image is retaken', () => {
  const f = fixture(); try {
    f.seed({ plan: 'plan.md', charts: ['Klb0LNe3'], fixes: 0, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ rows: [{ panels: [{ chart: 'Klb0LNe3' }] }] }] }, JSON.stringify({ ok: true, dashboardId: 'D3' }));
    const image = () => f.record('mcp__plugin_exploratory_exploratory-desktop__get_dashboard_image', { dashboard_id: 'D3' }, JSON.stringify({ dashboard_id: 'D3', page: 1, scope: 'full', truncated: false }));
    image();
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_chart', { chartId: 'Klb0LNe3', settings: {} }, JSON.stringify({ ok: true }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
    image();
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
test('numeric: unread Number blocks, including a value invalidated by update', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1});
    f.record('create_chart', {marker:'singlevalue'}, {chartId:'n'});
    assert.match(f.run('plan-stop').reason, /Number 1 枚.*n/);
    readNumber(f, 'n', 370);
    assert.equal(f.run('plan-stop'), null);
    f.record('update_chart', {chartId:'n', settings:{}}, {ok:true});
    assert.match(f.run('plan-stop').reason, /Number 1 枚/);
    const hooks = JSON.parse(fs.readFileSync(path.join(root, 'hooks/claude.json'))).hooks.PostToolUse;
    const entry = hooks.find(h => h.hooks.some(x => /plan-record/.test(x.command)));
    for (const name of ['get_chart_data','execute_r_script']) assert.ok(new RegExp(entry.matcher).test('mcp__plugin_exploratory_exploratory-desktop__' + name));
  } finally { f.close(); }
});
test('numeric: values from either R phase pass; absent values and latest Line y block', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', fixes:1});
    f.record('execute_r_script', {}, {rows:[[351, 365]]});
    f.record('create_chart', {marker:'singlevalue'}, {chartId:'n'});
    f.record('create_chart', {marker:'line'}, {chartId:'l'});
    f.record('create_dashboard', {}, {dashboardId:'d'});
    f.record('execute_r_script', {}, {content:[{type:'text',text:JSON.stringify({rows:[['350',null,true,'label 351','2026-11-01',440]]})}]});
    f.record('get_chart_data', {chartId:'n'}, numberRows(351));
    f.record('get_chart_data', {chartId:'l'}, {chart_type:'line',columns:[{shelf:'y'},{shelf:'x'}],rows:[[365,'2026-11-01'],[440,'2026-10-01']]});
    f.record('get_chart_image', {chartId:'l'}, {});
    assert.equal(f.run('plan-stop'), null);
    f.record('get_chart_data', {chartId:'n'}, numberRows(352));
    f.record('get_chart_data', {chartId:'l'}, {chart_type:'line',columns:[{shelf:'y'},{shelf:'x'}],rows:[[366,'2026-11-01'],[440,'2026-10-01']]});
    const result = f.run('plan-stop');
    assert.match(result.reason, /n=352, l=366/);
    assert.match(result.reason, /R を Exploratory の値に合わせて書き換えない。直すのは Exploratory の加工/);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).rValuesAfter, [350,440]);
    f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
    f.record('get_chart_data', {chartId:'n'}, numberRows(351));
    assert.match(f.run('plan-stop').reason, /n=351/);
    f.record('execute_r_script', {}, {rows:[[351]], isError:true});
    assert.match(f.run('plan-stop').reason, /n=351/);
  } finally { f.close(); }
});
test('numeric: exact, displayed rounding and percent scale pass with real Number shapes', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1});
    f.record('execute_r_script', {}, {rows:[[370,12.345,0.1234,12.34]]});
    for (const [id,value] of [['exact',370],['rounded','12.35'],['percent','12.34'],['fraction','0.1234']]) {
      f.record('create_chart', {marker:'singlevalue'}, {chartId:id});
      f.record('get_chart_data', {chartId:id}, numberRows(value));
    }
    f.record('create_chart', {marker:'singlevalue'}, {chartId:'comparison'});
    f.record('get_chart_data', {chartId:'comparison'}, {content:[{type:'text',text:JSON.stringify({chart_type:'singlevalue',rows:[[['2026-11-01','370|||-3'],['2026-10-01','373|||4']],['r0','.pivot.measure.cell']]})}]});
    assert.equal(JSON.parse(fs.readFileSync(f.state)).values.comparison.main, 370);
    assert.equal(f.run('plan-stop'), null);
    // 一致の候補を分け、割合の両方向が等値規則だけで通らない条件にする。
    for (const [value,r] of [['12.34',0.1234],['0.1234',12.34],['7',0.07],['29',0.29],['12.35',0.12345],['0.13',12.6]]) {
      f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
      readNumber(f, 'n', value);
      const state = JSON.parse(fs.readFileSync(f.state)); state.rValues = [r]; state.rValuesAfter = [r]; f.seed(state);
      assert.equal(f.run('plan-stop'), null);
    }
  } finally { f.close(); }
});
test('numeric: block twice, pass the third Stop without changing the recorded values', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
    for (let i = 0; i < 2; i++) assert.equal(f.run('plan-stop').decision, 'block');
    assert.equal(f.run('plan-stop'), null);
    assert.equal(JSON.parse(fs.readFileSync(f.state)).valueStops, 2);
  } finally { f.close(); }
});
test('numeric: values in R print/cat output pass using the same numeric token rule', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
    f.record('execute_r_script', {}, {rows:[[370,87]],redacted_msg:'# A tibble: 1 × 5\n rows inv amt minDue over\n 1 111 41 13070136 2018-03-08 58\ncat: 0.1234 6e+05 item370 NA'});
    f.record('get_chart_data', {chartId:'n'}, numberRows(13070136));
    assert.equal(f.run('plan-stop'), null);
    const pool = JSON.parse(fs.readFileSync(f.state)).rValuesAfter;
    assert.ok(pool.includes(13070136));
    assert.ok(pool.includes(0.1234));
    assert.ok(pool.includes(600000));
    assert.ok(!pool.includes(2018));
    f.record('get_chart_data', {chartId:'n'}, numberRows(999999));
    assert.match(f.run('plan-stop').reason, /n=999999/);
  } finally { f.close(); }
});

test('numeric: R printed tokens strip punctuation and exclude small integers only from text', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
    f.record('execute_r_script', {}, {rows:[[2,'(3)','1,234']], redacted_msg:'# A tibble: 1 × 5\n 1 13,070,136 (41) 7% -9 10 0.07'});
    const pool = JSON.parse(fs.readFileSync(f.state)).rValues;
    assert.deepEqual(pool, [2,3,1234,13070136,41,10,0.07]);
    for (const value of [13070136,41,2]) {
      f.record('get_chart_data', {chartId:'n'}, numberRows(value));
      assert.equal(f.run('plan-stop'), null);
    }
    f.record('get_chart_data', {chartId:'n'}, numberRows(5));
    assert.match(f.run('plan-stop').reason, /n=5/);
  } finally { f.close(); }
});
test('numeric: successful unreadable Number is recorded separately and passes until updated', () => {
  const f = fixture(); try {
    for (const response of [numberRows('NA'),numberRows(''),{chart_type:'unexpected',rows:[[['42']]]},{chart_type:'singlevalue',rows:[]}]) {
      f.seed({plan:'plan.md', dashboard:true, fixes:1, numbers:['n']});
      f.record('get_chart_data', {chartId:'n'}, response);
      assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).unparsedValues, ['n']);
      assert.equal(f.run('plan-stop'), null);
      f.record('update_chart', {chartId:'n'}, {ok:true});
      assert.match(f.run('plan-stop').reason, /Number 1 枚/);
      readNumber(f, 'n', 42);
      assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).unparsedValues, []);
      assert.equal(f.run('plan-stop'), null);
    }
  } finally { f.close(); }
});
test('numeric: nested R failures exclude values without changing other tools success rules', () => {
  const f = fixture(); try {
    const nestedError = {content:[{type:'text',text:JSON.stringify({isError:true,rows:[[42]]})}]};
    f.seed({plan:'plan.md', dashboard:true, fixes:1});
    f.record('execute_r_script', {}, nestedError);
    assert.equal(JSON.parse(fs.readFileSync(f.state)).rValues, undefined);
    f.record('get_chart_image', {chartId:'c'}, nestedError);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).seen, ['c']);
    f.record('get_chart_image', {chartId:'failed'}, {isError:true});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).seen, ['c']);
  } finally { f.close(); }
});
test('numeric: Line marker casing is ignored for create and update', () => {
  const f = fixture(); try {
    f.seed({plan:'plan.md', dashboard:true, fixes:1});
    f.record('create_chart', {marker:'Line'}, {chartId:'l'});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).lines, ['l']);
    f.record('update_chart', {chartId:'l',marker:'LINE'}, {});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).lines, ['l']);
    f.record('get_chart_data', {chartId:'l'}, {chart_type:'line',columns:[{shelf:'x'},{shelf:'y'}],rows:[['2026-11-01',365]]});
    f.record('get_chart_image', {chartId:'l'}, {});
    assert.match(f.run('plan-stop').reason, /l=365/);
  } finally { f.close(); }
});
test('note: one full get_note_image counts every created chart as seen; a partial image does not', () => {
  const f=fixture();try {
    f.seed({plan:'plan.md',note:true,charts:['c1','c2'],fixes:1});
    f.record('mcp__plugin_exploratory_exploratory-desktop__get_note_image',{note_id:'n1'},{scope:'full',truncated:true});
    assert.equal(f.run('plan-stop',{})?.decision,'block');
    f.record('mcp__plugin_exploratory_exploratory-desktop__get_note_image',{note_id:'n1'},{scope:'full',truncated:false});
    assert.equal(f.run('plan-stop',{}),null);
  } finally { f.close(); }
});
