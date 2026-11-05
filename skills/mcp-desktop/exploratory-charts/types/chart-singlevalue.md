## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: comparison-uses-windowfunc-not-svcomparisontype](#usage_patterns-comparison-uses-windowfunc-not-svcomparisontype)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-singlevalue"

## version

1

## kind

"chart"

## title

"ナンバー（singlevalue）の使える設定と代表的な依頼の実現方法"

## marker

"singlevalue"

## controls

{
  "can_use": [
    {
      "key": "facet",
      "label": "繰り返し（Repeat By）"
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
  "isMissingValueHandlingSupported": false,
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

## usage_patterns: comparison-uses-windowfunc-not-svcomparisontype

{
  "id": "comparison-uses-windowfunc-not-svcomparisontype",
  "applies_when": [
    "ナンバー（singlevalue）で前期比・差を表示したい依頼"
  ],
  "usable": true,
  "summary": "比較の指定は svWindowFunc / svWindowFuncGroup を使う。svComparisonType は現在の設定一覧に無いため使わない",
  "in_exploratory": [
    "svWindowFuncGroup（diff / pdiff）と svWindowFunc（svWindowFuncGroup が diff なら df で始まる値、pdiff なら rdf で始まる値）、メイン/サブの表示は svWindowFuncMainDisplay / svWindowFuncSubDisplay"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| singlevalue | `facet` |

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| singlevalue | Add nothing | When the number itself is the figure |
