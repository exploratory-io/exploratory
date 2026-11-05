## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: errbar-data-granularity](#usage_patterns-errbar-data-granularity)
- [usage_patterns: reference-line-choices-limited](#usage_patterns-reference-line-choices-limited)
- [複数の変数を置ける枠](#複数の変数を置ける枠)

## id

"chart-errbar"

## version

1

## kind

"chart"

## title

"エラーバー（errbar、生データ）の使える設定と代表的な依頼の実現方法"

## marker

"errbar"

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
    "信頼区間を可視化したい依頼（「エラーバーを出して」「信頼区間を見せて」等）"
  ],
  "usable": true,
  "summary": "errbar は 1 行 1 観測の生データが前提。既に集計済みの行数の少ないデータなら errbar-agg（chart-errbar-agg.yaml）を使う",
  "options": [
    "エラーバー（生データ）: 1 行が 1 観測対象であることが前提",
    "エラーバー（集計済データ）: 既に日次集計等をされた行数の少ないデータのとき"
  ],
  "deciding_questions": [
    "手元のデータは「1 行が 1 観測対象」か、それとも既に集計された行（例: 1 日 1 行）か",
    "生データを集計済みの粒度のまま信頼区間を計算すると、サンプルサイズが実際の観測数より少なく見積もられ、区間の幅が不当に広くなる"
  ],
  "in_exploratory": [
    "marker: errbar（生データ）/ errbar-agg（集計済データ）。どちらも chart-settings.json の markers に実在",
    "Y 軸にロジカル型（TRUE/FALSE）の列を割り当てると、割合の対象（分母）は既定で X 軸のグループになる"
  ],
  "does_not_apply_when": [
    "サンプルサイズが十分小さく、厳密な数値を求めていないとき"
  ]
}

## usage_patterns: reference-line-choices-limited

{
  "id": "reference-line-choices-limited",
  "applies_when": [
    "基準線（リファレンスライン）を追加したい依頼"
  ],
  "usable": "depends",
  "summary": "chart-bar.yaml の同名 usage_pattern と同じ（Y 8 種・X 3 種しか索引に無い）。errbar は features.isReferenceLineSupported=true",
  "in_exploratory": [
    "common.yReflineType.choices（8 種、described: false）"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| bar / line / area / scatter / bubble / boxplot / violin / errbar / errbar-agg | `x` / `facet` |
