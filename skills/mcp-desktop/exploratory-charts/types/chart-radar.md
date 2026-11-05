## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: radar-scale-normalize](#usage_patterns-radar-scale-normalize)
- [複数の変数を置ける枠](#複数の変数を置ける枠)

## id

"chart-radar"

## version

1

## kind

"chart"

## title

"レーダー（radar）の使える設定と代表的な依頼の実現方法"

## marker

"radar"

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
      "key": "winf",
      "label": "ウィンドウ関数（表計算: 累計・移動平均・前期比等）"
    },
    {
      "key": "x",
      "label": "X軸"
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
  "isShowValueOnPlotSupported": true,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: radar-scale-normalize

{
  "id": "radar-scale-normalize",
  "applies_when": [
    "レーダーで複数の数値指標をまとめて比較するとき"
  ],
  "usable": true,
  "summary": "指標間でスケール（値のレンジ）が揃っているかで標準化するかを決める。レンジが大きく異なる指標を混在させるときは normalizeValues を使う。値（meas）は 3 列以上必要",
  "options": [
    "標準化しない: アンケートの5段階評価など、全指標のレンジが揃っているとき",
    "標準化する: 給料と年齢のようにレンジが大きく異なる指標を混在させるとき"
  ],
  "deciding_questions": [
    "割り当てる数値列どうしの単位・レンジは同じか。異なる場合、レーダーの軸はレンジの大きい列に引っ張られ、他の列が比較できなくなる"
  ],
  "in_exploratory": [
    "画面名「値を標準化する」。設定名 normalizeValues（settings.radar に実在。choices on/off、既定 off）"
  ],
  "does_not_apply_when": [
    "指標のレンジがもともと揃っているとき（標準化すると元の値の大きさの情報が失われる）",
    "値（meas）に割り当てる列が 3 列未満のとき（レーダーは 3 列以上が無いと表示されない。create_chart を呼ぶ前に列数を確認する）"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| radar (when the input is categories) | `x` / `color` / `facet` |
