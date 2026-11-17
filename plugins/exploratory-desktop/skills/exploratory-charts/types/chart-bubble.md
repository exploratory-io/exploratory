## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-bubble"

## version

1

## kind

"chart"

## title

"散布図 (集計あり)（bubble）の使える設定"

## marker

"bubble"

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
      "key": "gby",
      "label": "グループ化（Group By）"
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
      "key": "size",
      "label": "サイズ"
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
      "key": "bstyle",
      "label": "バーのスタイル（積み上げ/横並び）"
    },
    {
      "key": "geo",
      "label": "地域（Region）"
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
  "isDualYSupported": false,
  "isGroupByMeasuresColumnSupported": false,
  "isHorizontalReferenceLineSupported": true,
  "isHoverModeSupported": true,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": true,
  "isNumberOfRowsInPopupSupported": true,
  "isPivot": false,
  "isReferenceLineSupported": true,
  "isShowLabelOnPlotSupported": true,
  "isShowValueOnPlotSupported": false,
  "isSortSupported": true,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": true,
  "isTrendLineSupported": true,
  "isVerticalReferenceLineSupported": true
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼"
  ],
  "usable": "depends",
  "summary": "基準線の種類の選択肢は図・軸・列の型ごとに変わるので、渡す前に list_chart_settings（setting: yReflineType / xReflineType など）で choices を確認する。bubble は features.isReferenceLineSupported=true",
  "in_exploratory": [
    "yReflineType / xReflineType の choices は図・軸・列の型ごとに変わる（list_chart_settings で引く）"
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
| scatter / bubble | Trend line (`yTrendLine: "lmfit"`). It is a figure for looking at the relationship of 2 numbers, so only with the line can direction and strength be read. **It is not `xTrendLine`** (that is the trend line on the X-axis side, a different thing) | When looking at the relationship is not the purpose (when you only want the shape of the distribution, and so on) |
