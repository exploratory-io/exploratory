## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: errbar-data-granularity](#usage_patterns-errbar-data-granularity)
- [usage_patterns: facet-period-breakdown-uses-date-func](#usage_patterns-facet-period-breakdown-uses-date-func)
- [複数の変数を置ける枠](#複数の変数を置ける枠)

## id

"chart-errbar-agg"

## version

1

## kind

"chart"

## title

"エラーバー（errbar-agg、集計済データ）の使える設定と代表的な依頼の実現方法"

## marker

"errbar-agg"

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
      "key": "range",
      "label": "範囲（エラーバーの上限/下限等）"
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
      "key": "outliery",
      "label": "Y軸の外れ値の扱い"
    },
    {
      "key": "pivot",
      "label": "ピボットの行/列"
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
  "isHorizontalReferenceLineSupported": true,
  "isHoverModeSupported": true,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": false,
  "isNumberOfRowsInPopupSupported": false,
  "isPivot": false,
  "isReferenceLineSupported": true,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": true,
  "isSortSupported": true,
  "isSyncAxisSupported": true,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: errbar-data-granularity

{
  "id": "errbar-data-granularity",
  "applies_when": [
    "既に日次集計等をされた、行数の少ないデータで信頼区間を可視化したい依頼"
  ],
  "usable": true,
  "summary": "errbar-agg は集計済みデータ向け。計算のタイプ（平均値/割合）により必要列が異なる",
  "options": [
    "平均値＝平均値・標準偏差・総数の3列",
    "割合＝分子（該当件数）・分母/総数の2列"
  ],
  "in_exploratory": [
    "errbar-agg の計算のタイプは errbarCalcType（settings[\"errbar-agg\"]）。choices は索引上は空配列だが note に「mean=平均値モード、ratio=比率モード」と明記され described: true"
  ]
}

## usage_patterns: facet-period-breakdown-uses-date-func

{
  "id": "facet-period-breakdown-uses-date-func",
  "applies_when": [
    "「月ごとにパネルを分けて」「年ごとに分けて」等、日付列の単位で図を分割（facet/Repeat By）したい依頼"
  ],
  "usable": true,
  "summary": "facet の column に日付列、func に区切りたい単位の関数（monname=月, rtoyear=年 等）を指定する。既定のまま func を変えないと、区切り単位が依頼と食い違う",
  "in_exploratory": [
    "facet 軸の column に日付列、func に monname（月）/ weekday（曜日）/ quarter（四半期）等を指定するとその単位でパネルが分かれる。func を指定しないと既定の区切り単位（年）のままになる"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| bar / line / area / scatter / bubble / boxplot / violin / errbar / errbar-agg | `x` / `facet` |
