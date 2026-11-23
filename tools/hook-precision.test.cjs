const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = process.env.HOOK_TEST_ROOT || path.resolve(__dirname, '../plugins/exploratory-desktop');
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
      input: JSON.stringify({ session_id: 'h2', cwd: dir, ...data, ...(data.tool_name && !/^(mcp__|Skill$|Write$|Bash$|PowerShell$)/.test(data.tool_name) ? { tool_name: 'mcp__exploratory-desktop__' + data.tool_name } : {}) }),
      env: { ...process.env, PLUGIN_DATA: dir, CLAUDE_PLUGIN_OPTION_REVIEW_HOOK: 'true', ...extra }, encoding: 'utf8'
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
  test('A: '+label+' is recorded as R work', () => {
    const f=fixture();try {
      f.record(tool,args);
      assert.equal(JSON.parse(fs.readFileSync(f.state)).r,true);
    } finally { f.close(); }
  });
}
test('A: writing a plan or scenario file records nothing and says nothing', () => {
  const f=fixture();try {
    f.record('execute_r_script');
    for (const file of ['plan.md','売上_シナリオ.md','x_Exploratory作成計画.md']) assert.equal(f.record('Write',{file_path:path.join(f.dir,file),content:'report.html'}),null,file);
    const state=JSON.parse(fs.readFileSync(f.state));
    assert.equal(state.plan,undefined);assert.equal(state.scenario,undefined);
  } finally { f.close(); }
});
test('B: a dashboard with an unseen chart blocks once, without a plan file, and names no R comparison', () => {
  const f=fixture();try {
    f.seed({dashboard:true,charts:['bar-1'],fixes:1});
    const first=f.run('plan-stop');
    assert.equal(first?.decision,'block');
    assert.match(first.reason,/全体画像（get_note_image \/ get_dashboard_image）で見ていないチャートが 1 枚/);
    assert.match(first.reason,/元の成果物があればそれと見比べ/);
    for (const word of ['R の図','照合表','数値の確認','照合の確認']) assert(!first.reason.includes(word),word);
    assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
test('B: an unread Number or a value absent from R does not stop the report', () => {
  const f=fixture();try {
    f.seed({dashboard:true,fixes:1});
    f.record('create_chart',{marker:'singlevalue'},{chartId:'n'});
    assert.equal(f.run('plan-stop'),null);
    f.record('execute_r_script',{},{rows:[[1000]]});
    f.record('get_chart_data',{chartId:'n'},numberRows(999));
    assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
test('B: no stop before the analysis skill was used', () => {
  const f=fixture();try {
    fs.writeFileSync(f.state,JSON.stringify({note:true,charts:['c']}));
    assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
test('Number: exclude only Number, keep other chart images required', () => {
  const f=fixture();try {
    f.seed({note:true,fixes:1});
    f.record('create_chart',{marker:'singlevalue'},JSON.stringify({chartId:'number-1'}));
    readNumber(f, 'number-1');
    assert.equal(f.run('plan-stop'),null);
    f.record('create_chart',{marker:'bar'},JSON.stringify({chartId:'bar-1'}));
    assert.equal(f.run('plan-stop')?.decision,'block');
  } finally { f.close(); }
});
test('Number: nested structuredContent preserves exclusion', () => {
  const f=fixture();try {
    f.seed({dashboard:true,fixes:1});
    f.record('create_chart',{}, {content:[{type:'text',text:JSON.stringify({chartId:'n',marker:'number'})}]});
    readNumber(f, 'n');
    assert.equal(f.run('plan-stop'),null);
  } finally { f.close(); }
});
for (const command of ["echo 'example; Rscript analysis.R'", "echo ';' Rscript analysis.R", 'echo "example; Rscript analysis.R"']) {
  test('review A: quoted Rscript is not recorded as R work: '+command, () => {
    const f=fixture();try { f.record('Bash',{command});assert.equal(JSON.parse(fs.readFileSync(f.state)).r,undefined); } finally { f.close(); }
  });
}
for (const command of ['R_LIBS=/tmp/R Rscript analysis.R','env Rscript analysis.R','R_LIBS=/tmp/R env Rscript analysis.R']) {
  test('review A: environment-prefixed Rscript: recorded as R work: '+command, () => {
    const f=fixture();try {
      f.record('Bash',{command});
      assert.equal(JSON.parse(fs.readFileSync(f.state)).r,true);
      ;
    } finally { f.close(); }
  });
}
for (const [before,after,blocked] of [['bar','singlevalue',false],['singlevalue','bar',true]]) {
  test('review Number: successful update '+before+' -> '+after, () => {
    const f=fixture();try {
      f.seed({note:true,fixes:1});
      f.record('create_chart',{marker:before},{chartId:'c'});
      f.record('update_chart',{chartId:'c',marker:after},{chartId:'c'});
      if (after === 'singlevalue') readNumber(f, 'c');
      assert.equal(f.run('plan-stop')?.decision==='block',blocked);
    } finally { f.close(); }
  });
}
test('review Number: failed update preserves the previous type', () => {
  const f=fixture();try {
    f.seed({note:true,fixes:1});f.record('create_chart',{marker:'singlevalue'},{chartId:'c'});
    readNumber(f, 'c');
    f.record('update_chart',{chartId:'c',marker:'bar'},{isError:true});assert.equal(f.run('plan-stop'),null);
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
    f.seed({dashboard:true,fixes:1,charts:['bar'],pngFail:['bar'],data:['bar']});
    assert.equal(f.run('plan-stop')?.decision,'block');
  } finally { f.close(); }
});
const table = status => '| 図 | 修正可否 | 状態 | 理由 | 探した設定名 |\n|---|---|---|---|---|\n| 図1 | '+status+' | 未修正 | 設定で直せる | orientation |';
test('no zero-fix stop; unknown state, ordinary Bash, prose, a fixable table, and disabled gate pass', () => {
  const f=fixture();try {
    f.record('Bash',{command:'echo Rscript; cat analysis.R'});
    f.record('Bash',{command:'echo \'rmarkdown::render("report.Rmd")\''});
    f.seed({note:true,charts:['c'],seen:['c']});assert.equal(f.run('plan-stop'),null);
    // The final answer is no longer read: an unfinished 「直せる」 row does not stop the report.
    assert.equal(f.run('plan-stop',{last_assistant_message:table('直せる')}),null);
    f.seed({note:true,fixes:1});assert.equal(f.run('plan-stop',{last_assistant_message:'直せる項目はすべて直しました。'}),null);
    f.seed({note:true,charts:['c']});
    assert.equal(f.run('plan-stop',{},{CLAUDE_PLUGIN_OPTION_REVIEW_HOOK:'false'}),null);
    fs.writeFileSync(f.state,'{broken');
  } finally { f.close(); }
});

for (const [label, scope, truncated, error, note, blocked] of [
  ['full', 'full', false, false, false, false],
  ['partial', 'partial', true, false, false, true],
  ['failed', 'full', false, true, false, false],
  ['note', 'full', false, false, true, true]
]) test('dashboard capture: ' + label, () => {
  const f = fixture(); try {
    f.seed({ charts:['bar'], fixes:1, ...(note ? {note:true} : {dashboard:true})});
    f.record('create_dashboard', {pages:[{rows:[{panels:[{chart:'bar'}]}]}]}, {dashboardId:'dash'});
    f.record('get_dashboard_image', {dashboard_id:'dash'}, {scope, truncated, isError:error});
    assert.equal(f.run('plan-stop')?.decision === 'block', blocked);
  } finally { f.close(); }
});
test('dashboard capture: only charts on the captured page are seen', () => {
  const f = fixture(); try {
    f.seed({ dashboard:true, charts:['a','b'], fixes:1});
    f.record('get_dashboard', {dashboard_id:'dash'}, {dashboard:{pages:[
      {layout_rows:[{panels:[{type:'chart',id:'a'}]}]},
      {layout_rows:[{panels:[{type:'chart',id:'b'}]}]}
    ]}});
    f.record('get_dashboard_image', {dashboard_id:'dash',page:1}, {scope:'full',truncated:false});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).seen, ['a']);
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
// ページが 2 つ以上のダッシュボード: 撮るページを番号で示し、どのページにも載せていないチャートは求めない。
test('dashboard capture: the stop names the page to take and ignores charts on no page', () => {
  const f = fixture(); try {
    f.seed({ dashboard:true, charts:['c1','c2','c3'], fixes:1});
    f.record('create_dashboard', {pages:[{rows:[{panels:[{chart:'c1'}]}]}, {rows:[{panels:[{chart:'c2'}]}]}]}, {dashboardId:'dash'});
    f.record('get_dashboard_image', {dashboard_id:'dash',page:1}, {scope:'full',truncated:false});
    const stop = f.run('plan-stop');
    assert.equal(stop?.decision, 'block');
    assert(stop.reason.includes('"c2"') && !stop.reason.includes('"c3"'), stop.reason);
    assert(stop.reason.includes('page=2') && !stop.reason.includes('page=1'), stop.reason);
    assert(stop.reason.includes('dashboard_id "dash"'), stop.reason);
  } finally { f.close(); }
});
test('dashboard capture: every page taken, a chart on no page does not stop', () => {
  const f = fixture(); try {
    f.seed({ dashboard:true, charts:['c1','c2','c3'], fixes:1});
    f.record('create_dashboard', {pages:[{rows:[{panels:[{chart:'c1'}]}]}, {rows:[{panels:[{chart:'c2'}]}]}]}, {dashboardId:'dash'});
    for (const page of [1, 2]) f.record('get_dashboard_image', {dashboard_id:'dash',page}, {scope:'full',truncated:false});
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
test('dashboard capture: without a recorded layout the stop asks for every page', () => {
  const f = fixture(); try {
    f.seed({ dashboard:true, charts:['c1'], fixes:1});
    const stop = f.run('plan-stop');
    assert.equal(stop?.decision, 'block');
    assert(stop.reason.includes('ページごとに（page を指定して）'), stop.reason);
  } finally { f.close(); }
});
test('dashboard capture: saved marker panels replace create arguments and exclude non-chart panels', () => {
  const f = fixture(); try {
    f.seed({ dashboard:true, charts:['bar-id','number-id'], fixes:1});
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
        f.seed({ charts: ['bar', 'num'], numbers: ['num'], fixes: 1, dashboard: true });
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
    f.seed({ charts: ['GsW7LYC4', 'cSX3rcG4', 'keep'], seen: ['keep'], fixes: 1, dashboard: true });
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
    f.seed({ charts: ['old', 'a'], seen: ['a'], fixes: 1, dashboard: true });
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
    f.seed({ charts: ['a', 'b'], seen: ['b'], fixes: 1, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ rows: [{ panels: [{ chart: 'a' }, { chart: 'b' }] }] }] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [panel('b')] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [{ rows: [{ panels: [{ chart: 'a' }, { chart: 'b' }] }] }] }, JSON.stringify({ dashboardId: 'D1' }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
test('update_dashboard: a chart still on another dashboard is required', () => {
  const f = fixture(); try {
    f.seed({ charts: ['a', 'b'], seen: ['b'], fixes: 1, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [panel('a')] }, JSON.stringify({ dashboardId: 'D1' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [panel('a')] }, JSON.stringify({ dashboardId: 'D2' }));
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_dashboard', { dashboard_id: 'D1', pages: [panel('b')] }, JSON.stringify({ dashboardId: 'D1' }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
  } finally { f.close(); }
});
// 全体画像の後に直したチャートは、全体画像を撮り直せば数える（dash-hook4-3 の Klb0LNe3 の形）。
test('chart changed after the full image counts again once the full image is retaken', () => {
  const f = fixture(); try {
    f.seed({ charts: ['Klb0LNe3'], fixes: 0, dashboard: true });
    f.record('mcp__plugin_exploratory_exploratory-desktop__create_dashboard', { pages: [{ rows: [{ panels: [{ chart: 'Klb0LNe3' }] }] }] }, JSON.stringify({ ok: true, dashboardId: 'D3' }));
    const image = () => f.record('mcp__plugin_exploratory_exploratory-desktop__get_dashboard_image', { dashboard_id: 'D3' }, JSON.stringify({ dashboard_id: 'D3', page: 1, scope: 'full', truncated: false }));
    image();
    f.record('mcp__plugin_exploratory_exploratory-desktop__update_chart', { chartId: 'Klb0LNe3', settings: {} }, JSON.stringify({ ok: true }));
    assert.equal(f.run('plan-stop')?.decision, 'block');
    image();
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
test('numeric: nested R failures exclude values without changing other tools success rules', () => {
  const f = fixture(); try {
    const nestedError = {content:[{type:'text',text:JSON.stringify({isError:true,rows:[[42]]})}]};
    f.seed({ dashboard:true, fixes:1});
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
    f.seed({ dashboard:true, fixes:1});
    f.record('create_chart', {marker:'Line'}, {chartId:'l'});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).lines, ['l']);
    f.record('update_chart', {chartId:'l',marker:'LINE'}, {});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).lines, ['l']);
    f.record('get_chart_data', {chartId:'l'}, {chart_type:'line',columns:[{shelf:'x'},{shelf:'y'}],rows:[['2026-11-01',365]]});
    f.record('get_chart_image', {chartId:'l'}, {});
    assert.deepEqual(JSON.parse(fs.readFileSync(f.state)).values.l, {kind:'line', last:365, digits:0});
    assert.equal(f.run('plan-stop'), null);
  } finally { f.close(); }
});
test('note (legacy state without a note record): one full get_note_image counts every created chart as seen; a partial image does not', () => {
  const f=fixture();try {
    f.seed({note:true,charts:['c1','c2'],fixes:1});
    f.record('mcp__plugin_exploratory_exploratory-desktop__get_note_image',{note_id:'n1'},{scope:'full',truncated:true});
    assert.equal(f.run('plan-stop',{})?.decision,'block');
    f.record('mcp__plugin_exploratory_exploratory-desktop__get_note_image',{note_id:'n1'},{scope:'full',truncated:false});
    assert.equal(f.run('plan-stop',{}),null);
  } finally { f.close(); }
});
test('image capture: a failed note image stops image demands until a later capture succeeds', () => {
  const f=fixture();try {
    f.seed({note:true,charts:['bar'],fixes:1});
    f.record('get_note_image',{},{isError:true});
    assert.equal(f.run('plan-stop'),null);
    f.record('get_note_image',{},{scope:'partial',truncated:true});
    assert.equal(f.run('plan-stop')?.decision,'block');
  } finally { f.close(); }
});

// The image of another note must not count, and only the target note's charts are required.
test('note: only the full image of the note that embeds the chart counts; another note image does not', () => {
  const f=fixture();try {
    f.record('create_chart',{marker:'bar'},{chartId:'c1'});
    f.record('create_chart',{marker:'bar'},{chartId:'other'});
    f.record('create_note',{markdown:'## A\n{{chart:c1}}'},{structuredContent:{noteId:'A',title:'A'}});
    f.record('get_note_image',{note_id:'B'},{scope:'full',truncated:false});
    const stop=f.run('plan-stop');
    assert.equal(stop?.decision,'block');
    assert.match(stop.reason,/"c1"/);
    assert(!stop.reason.includes('"other"'),'a chart on no target note is not required');
  } finally { f.close(); }
  const g=fixture();try {
    g.record('create_chart',{marker:'bar'},{chartId:'c1'});
    g.record('create_note',{markdown:'{{chart:c1}}'},JSON.stringify({noteId:'A'}));
    g.record('get_note_image',{note_id:'A'},{scope:'full',truncated:false});
    assert.equal(g.run('plan-stop'),null);
  } finally { g.close(); }
});
test('note: a chart added by update_note is required until the note image is retaken', () => {
  const f=fixture();try {
    f.record('create_chart',{marker:'bar'},{chartId:'c1'});
    f.record('create_note',{markdown:'{{chart:c1}}'},{noteId:'A'});
    f.record('get_note_image',{note_id:'A'},{scope:'full',truncated:false});
    f.record('create_chart',{marker:'bar'},{chartId:'c2'});
    f.record('update_note',{note_id:'A',mode:'append',markdown:'{{chart:c2}}'},{ok:true});
    assert.match(f.run('plan-stop')?.reason || '',/"c2"/);
  } finally { f.close(); }
});
test('after moving to another skill, a new chart and dashboard are not checked', () => {
  const f=fixture();try {
    f.record('Skill',{skill:'pstack:poteto-mode'},{});
    f.record('create_chart',{marker:'bar'},{chartId:'c9'});
    f.record('create_dashboard',{pages:[{rows:[{panels:[{chart:'c9'}]}]}]},{dashboardId:'D9'});
    assert.equal(f.run('plan-stop'),null);
    const state=JSON.parse(fs.readFileSync(f.state));
    assert.equal(state.dashboard,undefined);
  } finally { f.close(); }
});
test('a dashboard made under the analysis skill is checked only through its own pages', () => {
  const f=fixture();try {
    f.record('create_chart',{marker:'bar'},{chartId:'a'});
    f.record('create_dashboard',{pages:[{rows:[{panels:[{chart:'a'}]}]}]},{dashboardId:'D1'});
    f.record('get_dashboard',{dashboard_id:'X'},{dashboard:{pages:[{layout_rows:[{panels:[{type:'chart',id:'a'}]}]}]}});
    f.record('get_dashboard_image',{dashboard_id:'X'},{scope:'full',truncated:false});
    assert.match(f.run('plan-stop')?.reason || '',/dashboard_id "D1" の page=1/);
  } finally { f.close(); }
});
