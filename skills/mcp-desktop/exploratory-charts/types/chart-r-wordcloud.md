## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: narrow-words-by-setting](#usage_patterns-narrow-words-by-setting)

## id

"chart-r-wordcloud"

## version

1

## kind

"chart"

## title

"ワードクラウド（r-wordcloud）の使える設定"

## marker

"r-wordcloud"

## controls

{
  "can_use": [
    {
      "key": "color",
      "label": "色"
    },
    {
      "key": "size",
      "label": "サイズ"
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

## usage_patterns: narrow-words-by-setting

{
  "id": "narrow-words-by-setting",
  "applies_when": [
    "文字の大きさに置いた値がある数に届かない語を出さない依頼",
    "文字の大きさの値で上位・下位 N 語だけを出す依頼",
    "語ごとの行数を文字の大きさや色に使う依頼"
  ],
  "usable": true,
  "summary": "語の絞り込みと行数は設定と func で作る。集計表・件数・行の抽出・上位 N の抽出の加工ステップを先に作らない",
  "in_exploratory": [
    "minFrequency（画面「表示のための最小カウント」）: size の枠を集計した値がこの数より小さい語を描かない。行数だけでなく合計など size の集計値に効く。未指定は全部の語",
    "上位・下位 N 語: xPostFilterType（top / bottom）と xPostFilterNumResults",
    "行数は元のデータのまま size・color に \"行数\"（func: count）を置く。加工で件数の表を先に作ると、その表の 1 行が 1 件と数えられる"
  ]
}
