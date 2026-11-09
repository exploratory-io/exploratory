## この資料の目次

- [id](#id)
- [version](#version)
- [kind](#kind)
- [title](#title)
- [marker](#marker)
- [controls](#controls)
- [features](#features)
- [usage_patterns: cross-tab-pivot-layout](#usage_patterns-cross-tab-pivot-layout)
- [usage_patterns: ratio-denominator](#usage_patterns-ratio-denominator)
- [usage_patterns: pivot-total-calc-timing](#usage_patterns-pivot-total-calc-timing)
- [複数の変数を置ける枠](#複数の変数を置ける枠)
- [読みやすくするために既定で足す設定](#読みやすくするために既定で足す設定)

## id

"chart-pivot"

## version

2

## kind

"chart"

## title

"ピボット（pivot）の使える設定と代表的な依頼の実現方法"

## marker

"pivot"

## controls

{
  "can_use": [
    {
      "key": "facet",
      "label": "繰り返し（Repeat By）"
    },
    {
      "key": "pivot",
      "label": "ピボットの行/列"
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
  "isMissingValueHandlingSupported": true,
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

## usage_patterns: cross-tab-pivot-layout

{
  "id": "cross-tab-pivot-layout",
  "applies_when": [
    "依頼が「クロス集計」「属性ごとに比べる」など、2 つ以上の区分の交差を表で見るもの"
  ],
  "usable": true,
  "summary": "クロス集計はピボットを使う（common-chart-type-fidelity も参照）。比べたい属性を rowh、見たい対象を colh、値を meas に置く。属性が 2 つ以上のときは階層/並列を pivotRowMode で選ぶ。設問ごとの属性別クロス集計を作るときは、先に ../common/chart-pivot-crosstab.md の Denominators と Stacked attributes を読む（無回答は表から除く。属性を縦に積んだ表は下の合計行を pivotShowTotals: \"off\" で消す。値は \"on\" / \"off\" で、true / false ではない）",
  "options": [
    "比べたい属性を行、見たい対象を列に置く",
    "属性が 2 つ以上なら、階層（入れ子）にする",
    "属性が 2 つ以上なら、並列（別々の行ヘッダーとして並べる）にする"
  ],
  "deciding_questions": [
    "比べたい属性はどれで、見たい対象（段階評価など）はどれか",
    "配置が未指定で属性が 2〜3 列なら階層を1つ、4 列以上なら並列を1つ作る。明示された配置を優先し、「並列で」「並べて」「入れ子にせず」「それぞれ別に」は並列、「入れ子で」「階層で」は階層にする。両方作るのは、利用者が両方の比較を求めたときだけ。「複数の変数」を行か列に置くと並列は使えず階層になるため、4 列以上でもこの組み合わせでは並列にしない（設問ごとに並列で見たいときは、「複数の変数」を facet（Repeat By）に置くか、設問ごとに表を分ける）。",
    "値は件数か、割合か、平均か（割合なら usage_pattern: ratio-denominator）"
  ],
  "in_exploratory": [
    "pivot: 比べたい属性を rowh、見たい対象を colh、値を meas に置く",
    "属性が 2 つ以上のときの並べ方: pivotRowMode: hierarchy（階層、既定）/ flat（並列）",
    "summarytable（集計テーブル）は、属性ごとに複数の指標を横に並べる別の用途。colh に属性列は置けない"
  ],
  "does_not_apply_when": [
    "単一の区分の件数や平均だけを見たい（bar や table で足りる）"
  ]
}

## usage_patterns: ratio-denominator

{
  "id": "ratio-denominator",
  "applies_when": [
    "ピボットの区分の中での構成比を出したい依頼"
  ],
  "usable": true,
  "summary": "区分の中の構成比は meas の WindowFunc で出す。表計算の向き（table_across/pane_across/pane_down 等）で分母の範囲が変わる",
  "in_exploratory": [
    "区分の中の構成比: meas{N}WindowFuncGroup: total、meas{N}WindowFunc: ptotal、向きは meas{N}WindowFuncDirection（行ごと table_across / 列ごと table_down）",
    "実機で確かめた向き（行に 2 段、列に 2 段の属性を置いたとき）: table_across は行のグループの全列で 100%、pane_across は列の親グループの中で 100%、pane_down は行の親グループの中（行の子グループをまたいだ合計）で 100%"
  ]
}

## usage_patterns: pivot-total-calc-timing

{
  "id": "pivot-total-calc-timing",
  "applies_when": [
    "ピボットで、平均値など生データを集計した値をさらに合計・平均するとき（小計・合計行、または表計算での再集計）"
  ],
  "usable": true,
  "summary": "合計・小計に使うデータの段階（集計前データ／集計後データ）を pivotTotalCalcTiming で選ぶ。count・sum のように再集計しても値が変わらない関数だけなら分かれ道にならない",
  "options": [
    "集計前データを使う（元の行から直接、合計・平均を計算し直す）",
    "集計後データを使う（ピボットのセルの値をもう一段集計する。例: 「平均の平均」）"
  ],
  "deciding_questions": [
    "求めているのは「元データ全体の真の代表値」か、「表に出ている集計値どうしをさらに束ねた値」か",
    "集計関数が count・sum など、再集計しても値が変わらないものだけなら分かれ道にならない"
  ],
  "in_exploratory": [
    "画面名「合計」メニューの「集計前データ／集計後データ」。設定名 pivotTotalCalcTiming が settings.table に実在する（value: text、選択肢の文字列は索引に無く described: false）"
  ],
  "does_not_apply_when": [
    "合計に count・sum など再集計しても意味が変わらない集計関数だけを使うとき"
  ]
}

## 複数の変数を置ける枠

**It is not pivot-only.** The slots where it can be placed differ by chart:

| Chart | Slots where 「複数の変数」 can be placed |
|---|---|
| pivot / summarytable | `rowh` / `colh` / `facet` |

## 読みやすくするために既定で足す設定

| Chart | What to add by default | When not to add |
|---|---|---|
| pivot / summarytable | If the value is 「(行数)」, `func: "count_ratio"` (the section above). If counts are also needed, line it up with `count` | When the value is something other than counts, such as an amount or score |
