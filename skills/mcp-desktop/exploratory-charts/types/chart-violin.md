## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: outlier-threshold-default-1-5-iqr](#usage_patterns-outlier-threshold-default-1-5-iqr)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-violin"

## version

1

## kind

"chart"

## title

"バイオリン図（violin）の使える設定と代表的な依頼の実現方法"

## marker

"violin"

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
      "key": "label",
      "label": "ラベル枠"
    },
    {
      "key": "outliery",
      "label": "Y軸の外れ値の扱い"
    },
    {
      "key": "sort",
      "label": "並び替え"
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
      "key": "winf",
      "label": "ウィンドウ関数（表計算: 累計・移動平均・前期比等）"
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
  "isHoverModeSupported": false,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": false,
  "isNumberOfRowsInPopupSupported": false,
  "isPivot": false,
  "isReferenceLineSupported": false,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": false,
  "isSortSupported": true,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: outlier-threshold-default-1-5-iqr

{
  "id": "outlier-threshold-default-1-5-iqr",
  "applies_when": [
    "外れ値の扱いに言及する依頼（「外れ値を除いて」「外れ値の基準は」等）"
  ],
  "usable": true,
  "summary": "外れ値の既定の閾値は 1.5 × IQR。ヒストグラム・箱ヒゲ図・バイオリン図はいずれも同じ既定を使う",
  "in_exploratory": [
    "固定の既定値であり、変更用の設定名は今回未調査"
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
| boxplot / violin | Order by median (`sortTarget: "y"`, `sortOrder: "desc"`). The arrangement becomes meaningful | When the order of the axis has meaning |
