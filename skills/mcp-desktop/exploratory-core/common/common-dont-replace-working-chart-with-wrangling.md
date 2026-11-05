## id

"common-dont-replace-working-chart-with-wrangling"

## version

2

## kind

"common"

## title

"一度正しい設定で作れたら、それを手作りの加工で置き換えない"

## applies_when

[
  "create_chart/update_chart が既に意図どおりの図を作った後、さらに create_wrangling_step を呼ぼうとしているとき"
]

## rules

[
  "Exploratory でできることは Exploratory（チャート・アナリティクスの設定、製品の加工コマンド）で作る。できないものだけ、ステップのカスタム R コマンド（exp_custom）かカスタムチャート（R）で作る。一度正しい設定で作れた図は、できていることなので、加工やカスタム R に置き換えない",
  "軸の func・設定（PostFilter・EnableOtherGroup・WindowFunc・Bucket 等）を使って一度正しい結果の図を作れたら、その結果を加工ステップで手作業に置き換えない。設定は利用者が画面から中身を確かめ、値を変えられるが、加工ステップに畳み込むとその余地が失われる",
  "図が意図と違って見えた場合（読み返しの値が変換前に見える等）も、依頼どおりに送った func・設定は残し、直し方はまず create_chart/update_chart の設定を見直す。加工ステップを追加するのは、設定のどれでも表せないときだけ（common-settings-before-wrangling を参照）。この知識が付いた加工ステップが、図の枠にある func・設定と同じ変換なら、図をその列に付け替えず delete_wrangling_step で消し、直せない点は返答で伝える"
]

## does_not_apply_when

[
  "図を作る前の、集計・整形そのものが目的の加工（標準の図の種類で表せない形を作るときなど）"
]

## in_exploratory

[]
