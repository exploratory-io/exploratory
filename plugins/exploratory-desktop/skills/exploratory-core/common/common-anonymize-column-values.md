## id

"common-anonymize-column-values"

## version

1

## kind

"common"

## title

"列の値の匿名化は、製品の anonymize（exploratory パッケージ）で書く。digest の seed は sha256 に効かない"

## applies_when

[
  "列の値を匿名化（ハッシュ化。同じ値には同じ結果、違う値には違う結果）して、同じ列または新しい列にする依頼"
]

## rules

[
  "列の匿名化は mutate で anonymize(<列>) と書く（exploratory パッケージの関数。既定は algo = \"sha256\"・seed = 1。製品の列メニュー「匿名化」が作る式と同じ）。シードを指定する依頼は anonymize(<列>, seed = <数>)（seed を変えると結果が変わる）",
  "digest::digest の seed 引数は sha256 には効かない（seed を変えても結果は同じ）。digest や anonymizer::anonymize（既定の設定が製品と違い、結果が一致しない）で自作せず、製品の anonymize を使う"
]

## does_not_apply_when

[
  "依頼が、関数名や algo を明示しているとき（その指定に従う）"
]

## in_exploratory

[
  "列メニュー: 文字列の列 > 匿名化（expression は anonymize(列)）"
]
