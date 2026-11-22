## id

"common-settings-before-wrangling"

## version

5

## kind

"common"

## title

"加工で列を作る前に、チャートの関数・設定で済まないか確認する"

## applies_when

[
  "日付・時刻の列を「年ごと」「月ごと」「曜日ごと」等の単位で区切って集計・比較したい依頼",
  "「上位N」「それ以外はその他にまとめる」等、区分の絞り込みをしたい依頼",
  "「累計」「移動平均」「前期比」「構成比」等、系列に沿った計算をしたい依頼",
  "対数・大文字など列の値を変換して、図の列として見せたい依頼",
  "数値の列を区間・外れ値の3区分に分けたい依頼、図に使う行を抜き出したい依頼"
]

## rules

[
  "この知識が設定の一覧（list_chart_settings）の結果に付いたときは、加工の列を作る前に下の確認をする。加工ステップの結果に付いたときは、作った列や行の間引きが軸の func・設定（{軸}Bucket 系・{軸}PostFilter 系・userSampleDataSize 等）で作れるかを確かめる。作れるなら、その加工ステップは使わず delete_wrangling_step で消し、元の列と設定でチャートを作る",
  "create_wrangling_step で新しい列を作る前に、対象の軸の func（year/rtoyear/monname/weekday/quarter 等の日付区切り関数、log・uppercase 等の値の変換）や、軸の設定（{軸}NumGroupsToPreserve・{軸}EnableOtherGroup・{軸}PostFilterType・{軸}PostFilterNumResults・表計算の {軸}WindowFunc・{軸}WindowFuncGroup・{軸}WindowFuncOrder（計算の並び順）・区間と外れ値の区分の {軸}BucketType 等）で同じ結果を出せないか確認する。グループごとの集計値や並べ替えを加工で前もって作らず、元の列を値の枠に置いて枠の集計関数で集計する。func・設定で足りるときは、加工ステップを増やさない",
  "数値の列を、決まった境界の値で区間に分けたいときは、その列そのものを対応する枠（x / y / color / facet / rowh / colh のどれでも）に置き、枠の func を ascategory にして、{軸}BucketType（境界値なら bucket_custom と {軸}BucketCuttingPoints）で指定する。境界の外の値をグループに残さない依頼は {軸}BucketIncludeOutsideRange を off にする。cut() や case_when で区間の列を作らない",
  "日付を単位で区切りたいときは、軸の column に元の日付列をそのまま渡し、func に区切りたい単位の関数（year=年, rtoyear=年（相対）, monname=月, weekday=曜日, quarter=四半期 等）を指定する。文字列化の関数（aschar 等）は区切り単位にならず、元の値がそのまま出る",
  "上位Nだけ残すなら、絞り込みたい列が乗っている軸自身（facet/rowh/colh 等）の {軸}PostFilterType と {軸}PostFilterNumResults、上位N＋その他なら同じ軸の {軸}NumGroupsToPreserve と {軸}EnableOtherGroup で指定する。依頼が「先に上位Nを選んで」の順で書かれていても、行を間引く加工ステップは要らない"
]

## does_not_apply_when

[
  "func・設定のどちらも対応しない変換（例: 複数列を組み合わせた計算、外部データとの結合、軸の func に無い文字列の抽出・正規化）のとき"
]

## in_exploratory

[
  "date-axis func: year/rtoyear/monname/weekday/quarter 等（各軸の func の choices は chart-settings.json を参照）",
  "topN+other: {軸}NumGroupsToPreserve / {軸}EnableOtherGroup（例: facetNumGroupsToPreserve, facetEnableOtherGroup）"
]
