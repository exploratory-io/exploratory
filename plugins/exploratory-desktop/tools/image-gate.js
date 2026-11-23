'use strict';
// 画像の道具は、利用者が直前の依頼で画像を頼んだとき（または review_hook が on）だけ通す。道具の説明だけでは、作った後の確認に呼ばれ続けた（2026-11-23）。
const fs = require('node:fs');
module.exports = function imageGate(values, input) {
  if (values.review_hook === 'true') return;
  let asked = true;
  try {
    const lines = fs.readFileSync(input.transcript_path, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry; try { entry = JSON.parse(lines[i]); } catch { continue; }
      if (entry.type !== 'user' || entry.isMeta) continue;
      const content = entry.message && entry.message.content;
      const text = typeof content === 'string' ? content : Array.isArray(content) ? content.filter(b => b && b.type === 'text').map(b => b.text).join('\n') : '';
      if (!text) continue;
      asked = /画像|スクリーンショット|スクショ|見た目|image|screenshot|picture/i.test(text);
      break;
    }
  } catch {}
  if (!asked) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
    permissionDecisionReason: 'get_dashboard_image and get_note_image are only for when the user asks for an image. Do not use them to check what you made; read values with get_chart_data or get_dashboard. 画像の道具は、利用者が画像を頼んだときだけ使います。' } }));
};
