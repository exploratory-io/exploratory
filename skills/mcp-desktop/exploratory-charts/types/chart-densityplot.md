## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-densityplot"

## version

1

## kind

"chart"

## title

"密度曲線（densityplot）の使える設定"

## marker

"densityplot"

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
  "isShowValueOnPlotSupported": false,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": true
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼"
  ],
  "usable": "depends",
  "summary": "X 軸の基準線は xReflineType で指定する。渡す前に list_chart_settings で densityplot の選択肢を確認する。densityplot は features.isReferenceLineSupported=true",
  "in_exploratory": [
    "xReflineType: ave（平均）、median（中央値）、constant（定数）など。list_chart_settings に marker: densityplot、setting: xReflineType を指定して選択肢を確認する"
  ]
}

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| hist / densityplot | Add nothing | When the bins or the curve are the main point |
