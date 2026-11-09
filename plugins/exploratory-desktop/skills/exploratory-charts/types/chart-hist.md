## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: outlier-threshold-default-1-5-iqr](#usage_patterns-outlier-threshold-default-1-5-iqr)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-hist"

## version

1

## kind

"chart"

## title

"ヒストグラム（hist）の使える設定と代表的な依頼の実現方法"

## marker

"hist"

## controls

{
  "can_use": [
    {
      "key": "bckt",
      "label": "バケット（区間分割）"
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
      "key": "outlierx",
      "label": "X軸の外れ値の扱い"
    },
    {
      "key": "x",
      "label": "X軸"
    }
  ],
  "cannot_use": [
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
      "key": "winf",
      "label": "ウィンドウ関数（表計算: 累計・移動平均・前期比等）"
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
  "isColorBucketSupported": true,
  "isColorNumberFormattingSupported": false,
  "isDualYSupported": false,
  "isGroupByMeasuresColumnSupported": false,
  "isHorizontalReferenceLineSupported": false,
  "isHoverModeSupported": true,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": false,
  "isNumberOfRowsInPopupSupported": false,
  "isPivot": false,
  "isReferenceLineSupported": true,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": true,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": true
}

## usage_patterns: outlier-threshold-default-1-5-iqr

{
  "id": "outlier-threshold-default-1-5-iqr",
  "applies_when": [
    "外れ値の扱いに言及する依頼（「外れ値を除いて」「外れ値の基準は」等）"
  ],
  "usable": true,
  "summary": "外れ値の既定の閾値は 1.5 × IQR（第1四分位数から下・第3四分位数から上に四分位範囲の1.5倍を超えた範囲の外側）。利用者が別の閾値を指定しない限りこの既定が使われる",
  "in_exploratory": [
    "固定の既定値であり、変更用の設定名は今回未調査"
  ]
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼"
  ],
  "usable": "depends",
  "summary": "X 軸の基準線は xReflineType で指定する。渡す前に list_chart_settings で hist の選択肢を確認する。hist は features.isReferenceLineSupported=true",
  "in_exploratory": [
    "xReflineType: ave（平均）、median（中央値）、constant（定数）など。list_chart_settings に marker: hist、setting: xReflineType を指定して選択肢を確認する"
  ]
}

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| hist / densityplot | Add nothing | When the bins or the curve are the main point |
