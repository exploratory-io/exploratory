## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: ratio-denominator](#usage_patterns-ratio-denominator)
- [usage_patterns: ratio-with-repeat-by-or-color](#usage_patterns-ratio-with-repeat-by-or-color)
- [usage_patterns: stack-vs-100pct](#usage_patterns-stack-vs-100pct)
- [usage_patterns: category-colors-by-meaning](#usage_patterns-category-colors-by-meaning)
- [usage_patterns: breakdown-pie-vs-bar](#usage_patterns-breakdown-pie-vs-bar)
- [usage_patterns: bar-line-combo-requires-multi-y-not-color](#usage_patterns-bar-line-combo-requires-multi-y-not-color)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-bar"

## version

4

## kind

"chart"

## title

"バー（bar）の使える設定と代表的な依頼の実現方法"

## marker

"bar"

## controls

{
  "can_use": [
    {
      "key": "bstyle",
      "label": "バーのスタイル（積み上げ/横並び）"
    },
    {
      "key": "color",
      "label": "色"
    },
    {
      "key": "facet",
      "label": "繰り返し（Repeat By）"
    },
    {
      "key": "sort",
      "label": "並び替え"
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
  "isSortSupported": true,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": true
}

## usage_patterns: ratio-denominator

{
  "id": "ratio-denominator",
  "applies_when": [
    "件数や構成比を比べる依頼（「割合」「比率」「何 % が」「多い・少ない」の比較）",
    "区分ごとに母数（人数）が違うデータ"
  ],
  "usable": true,
  "summary": "割合の分母（全体／区分の中／条件一致）は func と表計算の組み合わせで選べる。分母を取り違えると比較が意味をなさない",
  "options": [
    "全体に対する構成比",
    "ある区分の中での構成比（その区分の中で 100% になる）",
    "条件に合った行の割合",
    "割合にせず件数のまま（規模そのものが知りたいとき）"
  ],
  "deciding_questions": [
    "利用者が比べたい単位は何か（全体の中の比率か、各区分の中の比率か）",
    "区分ごとに母数が違うのに、件数だけで比べていないか"
  ],
  "in_exploratory": [
    "全体に対する構成比（件数）: 値に「行数」を置き func: count_ratio",
    "条件に合った行の割合: func: count_if_ratio",
    "区分の中の構成比: func: count_ratio（または count＋ptotal）の向きは yWindowFuncDirection で決まる（詳細は usage_pattern: ratio-with-repeat-by-or-color）"
  ]
}

## usage_patterns: ratio-with-repeat-by-or-color

{
  "id": "ratio-with-repeat-by-or-color",
  "applies_when": [
    "割合（count_ratio または表計算の割合）を使いながら、繰り返し（facet / Repeat By）や色を置く構成"
  ],
  "usable": true,
  "summary": "分割（繰り返し・色）ごとに割合の分母を取り直すかは yWindowFuncDirection で決まる。既定の color は画面の「X Axis」を指し、値の名前と画面ラベルが意図的に逆になっている点に注意",
  "options": [
    "分割（繰り返しの各区分・色の各区分）ごとに分母を取り直す",
    "全体を分母にしたまま分割して表示する"
  ],
  "deciding_questions": [
    "利用者が比べたいのは、各分割の中での構成か、全体の中での位置か",
    "作った図の割合が、その意図どおりの分母で計算されているか（get_chart の data で合計を確かめる）"
  ],
  "in_exploratory": [
    "yWindowFuncGroup: total、yWindowFunc: ptotal。分母の単位は yWindowFuncDirection（choices: color / x / all）。common.yWindowFuncDirection の note: 「% of・順位」のとき color = 画面の「X Axis」＝同じ Repeat By・同じ X の中で合計 100%（色が無いときは all と同じ）、x = 画面の「Color By」＝同じ Repeat By・同じ色の中で X 方向に合計 100%、all = 画面の「All」＝ Repeat By ごとの全体で 100%。既定は color",
    "累計・差などの表計算では yWindowFuncDirection の選択肢が color と all だけになり、x は選べない",
    "count_ratio（画面の RATIO）と、count に表計算の % of Total（total / ptotal）を掛けたものは、同じ向きなら同じ値。違いは Y 軸のタイトルだけ"
  ]
}

## usage_patterns: stack-vs-100pct

{
  "id": "stack-vs-100pct",
  "applies_when": [
    "バーで、色（内訳）を置いて区分ごとの中身を見せる依頼（「積み上げて」「内訳」「構成」）"
  ],
  "usable": true,
  "summary": "積み上げ/横並びは barstyle、100% 積み上げは barstyle と表計算の割合（count_ratio + yWindowFuncDirection=color）の組み合わせ。barstyle だけでは件数のまま積み上がり 100% にならない",
  "options": [
    "積み上げ（件数・量の大きさと内訳を同時に見る）",
    "100% 積み上げ（各バーの中の構成比だけを比べる）",
    "横並び（内訳どうしの大きさを直接比べる）"
  ],
  "deciding_questions": [
    "比べたいのは各バーの大きさか、各バーの中の構成比か",
    "「積み上げて」は並べ方の指示で、「割合で」は集計の指示。2 つを取り違えていないか"
  ],
  "in_exploratory": [
    "積み上げ / 横並び: barstyle: stack / group",
    "100% 積み上げ（各バーの中の内訳が 100%）: barstyle: stack と、値の「行数」に func: count_ratio、yWindowFuncGroup: total、yWindowFunc: ptotal、yWindowFuncDirection: color を組み合わせる。100% 積み上げ専用の barstyle の値は無い"
  ],
  "does_not_apply_when": [
    "内訳（色）を置かないバー"
  ]
}

## usage_patterns: category-colors-by-meaning

{
  "id": "category-colors-by-meaning",
  "applies_when": [
    "A stacked or grouped bar whose color slot holds categories with a meaning or an order (promoter / passive / detractor, satisfaction levels), and the user wants each category in a fitting color (detractor red, neutral gray, promoter blue; shades following the order of stages)"
  ],
  "usable": true,
  "summary": "Fix a color per category value with several {value, color} pairs in settings.highlightValues, switched on by highlightOnPalette (not enableHighlight), so the colors do not depend on palette order",
  "in_exploratory": [
    "Pass settings {\"enableHighlight\": \"off\", \"highlightOnPalette\": \"on\", \"highlightValues\": [{\"value\": \"<value as it appears in the color slot>\", \"color\": \"#EC5D57\"}, {\"value\": \"...\", \"color\": \"#BDBDBD\"}, ...]}. A bare list of values is refused. Values not listed keep their normal palette color",
    "This is not the \"make only one bar stand out\" mode (enableHighlight on dims every other value to highlightDefaultColor); never turn enableHighlight and highlightOnPalette on together. For shades only, categColorPalette (e.g. Blues, Reds) is enough but its color-to-category match depends on palette order"
  ]
}

## usage_patterns: breakdown-pie-vs-bar

{
  "id": "breakdown-pie-vs-bar",
  "applies_when": [
    "内訳・割合を可視化する依頼（「内訳を見せて」「割合を教えて」等）で、区分の数が多い、または区分どうしの大小を直接比較したいとき"
  ],
  "usable": true,
  "summary": "区分の数が多い、または大小の直接比較が目的なら bar（高さで比較できる）。全体を 100 とした内訳の形だけを見せたいなら pie（chart-pie を参照）",
  "deciding_questions": [
    "利用者が知りたいのは「全体を 100 とした内訳の形」か、「区分どうしの大小の比較」か",
    "区分の数は多くないか"
  ],
  "in_exploratory": []
}

## usage_patterns: bar-line-combo-requires-multi-y-not-color

{
  "id": "bar-line-combo-requires-multi-y-not-color",
  "applies_when": [
    "1 つの図にバーとラインを混在させたい依頼（コンボチャート）"
  ],
  "usable": "depends",
  "summary": "バー・ラインの混在は、Y 軸に複数列を割り当てて列ごとにマーカー種別を切り替えたときだけ使える。色（Color By）で複数系列を作っている場合は使えない",
  "deciding_questions": [
    "複数系列の作り方が Y 軸の複数列（マーカー切替が使える）か、色による分割（使えない）か"
  ],
  "in_exploratory": [
    "系列ごとのマーカー種別を切り替える設定名は、今回の索引（chart-settings.json）からは特定できていない（settings に marker を含むキーは地図用の mapMarkerType のみ）"
  ],
  "does_not_apply_when": [
    "1 系列だけの図、または色で分割した複数系列で混在が不要なとき"
  ]
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼（「平均線を引いて」「合計の基準線」等）"
  ],
  "usable": "depends",
  "summary": "Y 軸の基準線は 8 種類、X 軸は 3 種類しか索引に無い。ノートが挙げる「合計値・最頻値・最初/最後の値・対角線」に対応する値が見当たらないので、渡す前に choices を確認する",
  "in_exploratory": [
    "common.yReflineType.choices（8 種: ave/median/constant/rollmean/min/max/sd/lag_period、described: false）。settings.bar.xReflineType.choices は none/constant/ave の 3 種類のみ"
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
| bar (vertical / horizontal bars) | Descending order (`sortTarget: "y"`, `sortOrder: "desc"`) and value display (`yValueOnPlot: "on"`) | Do not sort when the order of the axis has meaning (dates, times, stages such as 「10代/20代」, 1-to-5 rating scales). Do not write values when there are more than 25 bars |
| When showing a breakdown of counts with bar | Ratio (`func: "count_ratio"`. The section above) | When the count itself is being asked |
