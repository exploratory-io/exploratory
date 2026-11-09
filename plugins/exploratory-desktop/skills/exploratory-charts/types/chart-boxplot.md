## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: outlier-threshold-default-1-5-iqr](#usage_patterns-outlier-threshold-default-1-5-iqr)
- [usage_patterns: separate-classification-from-box-iqr](#usage_patterns-separate-classification-from-box-iqr)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-boxplot"

## version

2

## kind

"chart"

## title

"箱ヒゲ図（boxplot）の使える設定と代表的な依頼の実現方法"

## marker

"boxplot"

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
  "summary": "外れ値の既定の閾値は 1.5 × IQR。箱ヒゲ図はこの閾値の外側を外れ値として点で表示する",
  "in_exploratory": [
    "固定の既定値であり、変更用の設定名は今回未調査"
  ]
}

## usage_patterns: separate-classification-from-box-iqr

{
  "id": "separate-classification-from-box-iqr",
  "applies_when": [
    "箱ヒゲ図で別の数値列を分類し、その分類をX軸・色・繰り返しに使う依頼"
  ],
  "usable": true,
  "summary": "箱・ヒゲや描画列のIQRによる外れ値表示と、別列の分類境界は別。分類の上下分位点・倍率・比較・母集団は依頼どおり保持し、箱の25%・75%や描画の既定係数へ置き換えない",
  "in_exploratory": [
    "分類対象列と描画する数値列を区別し、分類の方式・境界は共通の数値分類知識と実際の設定説明を照合する"
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
