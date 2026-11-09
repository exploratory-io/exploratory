## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: ratio-denominator](#usage_patterns-ratio-denominator)
- [usage_patterns: pivot-total-calc-timing](#usage_patterns-pivot-total-calc-timing)
- [usage_patterns: chart-type-not-pivot](#usage_patterns-chart-type-not-pivot)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-summarytable"

## version

2

## kind

"chart"

## title

"集計テーブル（summarytable）の使える設定と代表的な依頼の実現方法"

## marker

"summarytable"

## controls

{
  "can_use": [
    {
      "key": "facet",
      "label": "繰り返し（Repeat By）"
    },
    {
      "key": "pivot",
      "label": "ピボットの行/列"
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
      "key": "color",
      "label": "色"
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
    },
    {
      "key": "z",
      "label": "Z軸（3D）"
    }
  ]
}

## features

{
  "isColorBucketSupported": false,
  "isColorNumberFormattingSupported": false,
  "isDualYSupported": false,
  "isGroupByMeasuresColumnSupported": false,
  "isHorizontalReferenceLineSupported": false,
  "isHoverModeSupported": false,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": true,
  "isNumberOfRowsInPopupSupported": false,
  "isPivot": true,
  "isReferenceLineSupported": false,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": false,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: ratio-denominator

{
  "id": "ratio-denominator",
  "applies_when": [
    "集計テーブルの区分の中での構成比を出したい依頼"
  ],
  "usable": true,
  "summary": "区分の中の構成比は meas の WindowFunc で出す。chart-pivot.yaml の同名 usage_pattern と同じ仕組み（summarytable も同じ meas{N}WindowFunc 系を持つ）",
  "in_exploratory": [
    "区分の中の構成比: meas{N}WindowFuncGroup: total、meas{N}WindowFunc: ptotal、向きは meas{N}WindowFuncDirection"
  ]
}

## usage_patterns: pivot-total-calc-timing

{
  "id": "pivot-total-calc-timing",
  "applies_when": [
    "集計テーブルで、平均値など生データを集計した値をさらに合計・平均するとき"
  ],
  "usable": true,
  "summary": "chart-pivot.yaml の同名 usage_pattern と同じ設定（pivotTotalCalcTiming）。ノートの説明文言が pivot と summarytable で同一",
  "in_exploratory": [
    "設定名 pivotTotalCalcTiming（settings.table に実在、value: text、described: false）"
  ]
}

## usage_patterns: chart-type-not-pivot

{
  "id": "chart-type-not-pivot",
  "applies_when": [
    "依頼文が「集計テーブル」と明示しているとき"
  ],
  "usable": true,
  "summary": "依頼文が集計テーブルを明示しているのに、区分の絞り込み（上位N・その他）等を理由に marker を pivot へ読み替えない（common-chart-type-fidelity も参照）",
  "in_exploratory": []
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| pivot / summarytable | `rowh` / `colh` / `facet` |

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| pivot / summarytable | If the value is 「(行数)」, `func: "count_ratio"` (the section above). If counts are also needed, line it up with `count` | When the value is something other than counts, such as an amount or score |
