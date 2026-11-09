## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: map-color-binning](#usage_patterns-map-color-binning)

## id

"chart-easymap"

## version

1

## kind

"chart"

## title

"地図（easymap）の使える設定と代表的な依頼の実現方法"

## marker

"easymap"

## controls

{
  "can_use": [
    {
      "key": "color",
      "label": "色"
    },
    {
      "key": "label",
      "label": "ラベル枠"
    },
    {
      "key": "size",
      "label": "サイズ"
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
      "key": "facet",
      "label": "繰り返し（Repeat By）"
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
  "isColorBucketSupported": true,
  "isColorNumberFormattingSupported": true,
  "isDualYSupported": false,
  "isGroupByMeasuresColumnSupported": false,
  "isHorizontalReferenceLineSupported": false,
  "isHoverModeSupported": false,
  "isLeaflet": true,
  "isMissingValueHandlingSupported": false,
  "isNumberOfRowsInPopupSupported": true,
  "isPivot": false,
  "isReferenceLineSupported": false,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": false,
  "isSortSupported": false,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: map-color-binning

{
  "id": "map-color-binning",
  "applies_when": [
    "地図の色分けで値の大きさを区分するとき"
  ],
  "usable": true,
  "summary": "区分方法（等幅/等頻度）は colorBucketType で選ぶ。値の分布に極端な外れ値があるときは等幅だと大半が同じ色に潰れるので等頻度を検討する",
  "options": [
    "等幅（値の大きさで均等分割）",
    "等頻度（行の数が均等になるよう分割）"
  ],
  "deciding_questions": [
    "値の分布に極端な外れ値（大都市・大国など）があるか。あれば等幅では大半の地域が同じ色に潰れる"
  ],
  "in_exploratory": [
    "画面名「分類方法」。設定名 colorBucketType（common に実在。choices に bucket_equal_width / bucket_equal_freq を含む。note に「Map・GeoJSON・EasyMap の Color: none bucket_equal_width bucket_equal_freq bucket_custom bucket_outlier」と明記）",
    "分割数: colorBucketNumOfBuckets。色の分割数は 1〜10 の選択肢から選ぶ（既定 5）。色以外の枠の分割数は 1 以上の自由入力（既定 5）"
  ],
  "does_not_apply_when": [
    "値の分布が比較的均等なとき"
  ]
}
