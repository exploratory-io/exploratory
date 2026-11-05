## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: breakdown-pie-vs-bar](#usage_patterns-breakdown-pie-vs-bar)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-pie"

## version

1

## kind

"chart"

## title

"パイ / ドーナツ（pie）の使える設定と代表的な依頼の実現方法"

## marker

"pie"

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
  "isColorBucketSupported": false,
  "isColorNumberFormattingSupported": false,
  "isDualYSupported": false,
  "isGroupByMeasuresColumnSupported": false,
  "isHorizontalReferenceLineSupported": false,
  "isHoverModeSupported": false,
  "isLeaflet": false,
  "isMissingValueHandlingSupported": false,
  "isNumberOfRowsInPopupSupported": true,
  "isPivot": false,
  "isReferenceLineSupported": false,
  "isShowLabelOnPlotSupported": false,
  "isShowValueOnPlotSupported": false,
  "isSortSupported": false,
  "isSyncAxisSupported": false,
  "isTrendLineIgnoreColorSupported": false,
  "isTrendLineSupported": false,
  "isVerticalReferenceLineSupported": false
}

## usage_patterns: breakdown-pie-vs-bar

{
  "id": "breakdown-pie-vs-bar",
  "applies_when": [
    "内訳・割合を可視化する依頼（「内訳を見せて」「割合を教えて」等）"
  ],
  "usable": true,
  "summary": "全体を 100 とした内訳の形を見せたい、かつ区分の数が少ないときは pie。区分の数が多い、または大小の直接比較が目的なら bar（chart-bar.yaml の同名 usage_pattern を参照）",
  "options": [
    "パイ / ドーナツ: 全体を 100 とした内訳の形を見せたい、かつ区分の数が少ないとき",
    "バー: 区分どうしの大小を高さで直接比較したい、または区分の数が多いとき"
  ],
  "deciding_questions": [
    "利用者が知りたいのは「全体を 100 とした内訳の形」か、「区分どうしの大小の比較」か",
    "区分の数は多くないか（繰り返し・色を重ねると区分が増え、パイでは読みにくくなる）"
  ],
  "in_exploratory": [
    "marker: pie。割合の表示 pieShowPercentages: on（割合が主眼の図なので数字が無いと読めない）。区分が 10 を超えるときは値の表示を付けない（chart.txt の既定表）",
    "chart_type: pie / marker: pie はパイとドーナツのファミリー名で、スタイルは別に指定する。穴のないパイの指定には settings.pieHole: \"0\"、ドーナツの指定には settings.pieHole: \"55\" を文字列で渡し、未指定は \"55\"（ドーナツ）になる。設定は list_chart_settings に marker: pie と setting: pieHole を指定して照会でき、other セクションに属する。"
  ],
  "does_not_apply_when": [
    "区分の数がごく少なく（2〜3 程度）、内訳の形を一目で見せれば十分なとき"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| pie | `color` / `facet` |

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| pie | Percentage display (`pieShowPercentages: "on"`). Ratio is the main point of this figure, so without numbers it cannot be read | When there are more than 10 categories (they overlap) |
