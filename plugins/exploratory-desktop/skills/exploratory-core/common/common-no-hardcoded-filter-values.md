## id

"common-no-hardcoded-filter-values"

## version

1

## kind

"common"

## title

"絞り込みや「その他」の対象値を加工に書き込まない"

## applies_when

[
  "「上位N」「それ以外はその他にまとめる」「◯◯だけを見せて」等、値そのもので絞り込みたい依頼"
]

## rules

[
  "「上位5店舗」「その他」のような絞り込み・グルーピングの対象になる値（店舗名・商品名等）を、加工ステップの filter 条件や case_when の条件式にそのまま書き込まない。値をデータから読まずに書くと、データが変わった・値の表記が揺れた時に静かに外れる",
  "絞り込みは、対象の軸が持つ設定（{軸}NumGroupsToPreserve・{軸}EnableOtherGroup・{軸}PostFilterType・{軸}PostFilterNumResults 等）に任せる。値を列挙する加工が必要になるのは、軸の設定で表せない条件（複数列にまたがる条件等）のときだけ"
]

## does_not_apply_when

[
  "値そのものではなく、列の型・範囲・欠損の有無で絞り込むとき（この場合は加工の filter 条件でよい）"
]

## in_exploratory

[
  "{軸}NumGroupsToPreserve / {軸}EnableOtherGroup / {軸}PostFilterType / {軸}PostFilterNumResults（各軸の chart-settings.json を参照）"
]
