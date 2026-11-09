## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: nonstandard-r-custom](#usage_patterns-nonstandard-r-custom)

## id

"chart-r-custom"

## version

1

## kind

"chart"

## title

"カスタム R チャート（r-custom）の使える設定と代表的な依頼の実現方法"

## marker

"r-custom"

## controls

{
  "can_use": [],
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

## usage_patterns: nonstandard-r-custom

{
  "id": "nonstandard-r-custom",
  "applies_when": [
    "依頼された図が、標準の図の種類（create_chart の marker）で表せないとき（例: ベン図、ツリーマップ、ウォーターフォール、円形コードダイアグラム）"
  ],
  "usable": true,
  "summary": "標準の図の種類に無い図だけ r-custom で作ってよい。集計・整形して標準の図で描けるものは r-custom を使わない（利用者が画面から中身を確かめ、設定で変えられるようにするため）",
  "options": [
    "標準の図で表す（加工ステップで形を整えてから）",
    "r-custom で描く"
  ],
  "deciding_questions": [
    "その絵は、標準の図の種類のどれかと設定の組み合わせで表せないか",
    "集計したいだけではないか（集計だけなら加工ステップ＋標準の図）"
  ],
  "in_exploratory": [
    "create_chart の marker: r-custom（カスタム R コード）",
    "データフレームは ${DATA} で参照する。df や data のような名前を自分で決めない",
    "日本語を描くときは必ずフォントを指定する（指定しないと文字が□になる）"
  ],
  "does_not_apply_when": [
    "標準の図の種類で表せるとき"
  ]
}
