## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: ratio-with-repeat-by-or-color](#usage_patterns-ratio-with-repeat-by-or-color)
- [usage_patterns: period-comparison-basis](#usage_patterns-period-comparison-basis)
- [usage_patterns: anomaly-vs-trend-xmr](#usage_patterns-anomaly-vs-trend-xmr)
- [usage_patterns: bar-line-combo-requires-multi-y-not-color](#usage_patterns-bar-line-combo-requires-multi-y-not-color)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-line"

## version

2

## kind

"chart"

## title

"ライン（line）の使える設定と代表的な依頼の実現方法"

## marker

"line"

## controls

{
  "can_use": [
    {
      "key": "color",
      "label": "色"
    },
    {
      "key": "facet",
      "label": "繰り返し（Repeat By）"
    },
    {
      "key": "winf",
      "label": "ウィンドウ関数（表計算: 累計・移動平均・前期比等）"
    },
    {
      "key": "x",
      "label": "X軸"
    },
    {
      "key": "y",
      "label": "Y軸"
    }
  ],
  "cannot_use": [
    {
      "key": "bckt",
      "label": "バケット（区間分割）"
    },
    {
      "key": "bstyle",
      "label": "バーのスタイル（積み上げ/横並び）"
    },
    {
      "key": "gby",
      "label": "グループ化（Group By）"
    },
    {
      "key": "geo",
      "label": "地域（Region）"
    },
    {
      "key": "label",
      "label": "ラベル枠"
    },
    {
      "key": "lonp",
      "label": "プロット上のラベル表示"
    },
    {
      "key": "mapm",
      "label": "地図モード"
    },
    {
      "key": "outlierx",
      "label": "X軸の外れ値の扱い"
    },
    {
      "key": "outliery",
      "label": "Y軸の外れ値の扱い"
    },
    {
      "key": "pivot",
      "label": "ピボットの行/列"
    },
    {
      "key": "range",
      "label": "範囲（エラーバーの上限/下限等）"
    },
    {
      "key": "size",
      "label": "サイズ"
    },
    {
      "key": "sort",
      "label": "並び替え"
    },
    {
      "key": "tas0",
      "label": "0として扱う"
    },
    {
      "key": "z",
      "label": "Z軸（3D）"
    }
  ]
}

## features

{
  "isColorBucketSupported": true,
  "isColorNumberFormattingSupported": false,
  "isDualYSupported": true,
  "isGroupByMeasuresColumnSupported": true,
  "isHorizontalReferenceLineSupported": true,
  "isHoverModeSupported": true,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": true,
  "isNumberOfRowsInPopupSupported": true,
  "isPivot": false,
  "isReferenceLineSupported": true,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": true,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": true,
  "isTrendLineSupported": true,
  "isVerticalReferenceLineSupported": true
}

## usage_patterns: ratio-with-repeat-by-or-color

{
  "id": "ratio-with-repeat-by-or-color",
  "applies_when": [
    "割合（表計算の割合）を使いながら、繰り返し（facet / Repeat By）や色を置く構成"
  ],
  "usable": true,
  "summary": "分割（繰り返し・色）ごとに割合の分母を取り直すかは yWindowFuncDirection で決まる。詳細は chart-bar.yaml の同名 usage_pattern と同じ（bar・line 共通の設定）",
  "in_exploratory": [
    "yWindowFuncGroup: total、yWindowFunc: ptotal、yWindowFuncDirection: color/x/all（既定 color=画面の「X Axis」）"
  ]
}

## usage_patterns: period-comparison-basis

{
  "id": "period-comparison-basis",
  "applies_when": [
    "依頼に「前年同月比」「前月比」「成長率」「最初の時点と比べてどれだけ伸びたか」など、時系列の値を別の時点・期間の値と比べる言葉が含まれる"
  ],
  "usable": true,
  "summary": "割合の基準（分母）にする時点は yWindowFuncGroup/yWindowFunc で選ぶ。前の期間からの割合は pdiff+pdfperiod、実数の差がほしいときは diff 系を使う",
  "options": [
    "1 つ前の期間・1 年前など「前の期間」を基準にする（前年同月比・前月比）",
    "系列の最初の値を基準にする（成長率）",
    "系列の最後の値・特定の値を基準にする"
  ],
  "deciding_questions": [
    "依頼が指している基準時点は「1 つ前の期間」か「最初の値」か「特定の値」か",
    "割合ではなく実数の差が欲しいのか（その場合は pdiff 系ではなく diff 系を使う）"
  ],
  "in_exploratory": [
    "前の期間からの差の割合（前年同月比・前月比）: yWindowFuncGroup: pdiff、yWindowFunc: pdfperiod、期間の単位は yWindowFuncTsPeriod（選べる期間は list_chart_settings の結果を読む。よく使う例: month、year）、期間の長さは yWindowFuncTsPeriodSize",
    "実数の差（割合でなく）が欲しいときは yWindowFuncGroup: diff を使う"
  ],
  "does_not_apply_when": [
    "金額・件数そのものの差（割合でなく実数）が欲しいとき"
  ]
}

## usage_patterns: anomaly-vs-trend-xmr

{
  "id": "anomaly-vs-trend-xmr",
  "applies_when": [
    "依頼に「いつもと違うか」「異常があったか」「モニタリングしたい」など、時系列の各点が通常のばらつきか気にすべき変化かを判断したい言葉が含まれる"
  ],
  "usable": true,
  "summary": "単純な推移共有ならライン単体で十分。異常判定の材料が要るなら XmR（管理図: 平均線＋管理限界線）を使う",
  "options": [
    "ライン単体（推移を共有するだけで十分なとき）",
    "XmR（平均線＋上下の管理限界線。異常かどうかの判断材料が要るとき）"
  ],
  "deciding_questions": [
    "利用者は「値がいつもと比べて異常かどうか」を判断材料として求めているか、単に推移を共有したいだけか",
    "データ点数は管理限界の計算が安定する程度にあるか。季節性が強い場合はそのままでは基準にならない"
  ],
  "in_exploratory": [
    "基準線の種類に yReflineType: ave（または median）、範囲に yReflineRangeType: control_limits を指定する（どちらも common に実在）",
    "yReflineRangeType の note: 「control_limits と control_limits_for_moving_range は、ライン・バー・散布図 (集計あり)・エラーバーの Y で、基準線の集計単位が X 軸ごとでないときだけ」"
  ],
  "does_not_apply_when": [
    "データ点数が少なすぎて管理限界の計算が安定しないとき"
  ]
}

## usage_patterns: bar-line-combo-requires-multi-y-not-color

{
  "id": "bar-line-combo-requires-multi-y-not-color",
  "applies_when": [
    "1 つの図にバーとラインを混在させたい依頼（コンボチャート）"
  ],
  "usable": "depends",
  "summary": "chart-bar.yaml の同名 usage_pattern と同じ制約（Y 軸の複数列でのみ混在可、色による複数系列では不可）",
  "in_exploratory": [
    "系列ごとのマーカー種別を切り替える設定名は今回の索引からは特定できていない"
  ]
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼"
  ],
  "usable": "depends",
  "summary": "chart-bar.yaml の同名 usage_pattern と同じ（Y 8 種・X 3 種しか索引に無い）",
  "in_exploratory": [
    "common.yReflineType.choices（8 種、described: false）"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| bar / line / area / scatter / bubble / boxplot / violin / errbar / errbar-agg | `x` / `facet` |

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| line / area | Add nothing | When the time order already has meaning and points filled with numbers would hurt readability |
