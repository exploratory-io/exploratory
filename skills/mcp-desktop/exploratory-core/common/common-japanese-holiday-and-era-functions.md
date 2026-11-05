## id

"common-japanese-holiday-and-era-functions"

## version

1

## kind

"common"

## title

"日本の祝日の判定と和暦の変換は、製品が使う zipangu の関数で書く（存在しない関数名を作らない）"

## applies_when

[
  "日付が日本の祝日かどうかを TRUE/FALSE や区分で調べる依頼",
  "和暦（令和3年1月1日・R3/1/1・平成31年4月30日 のような年号つきの文字列）を西暦の日付に直す依頼"
]

## rules

[
  "日本の祝日の判定は zipangu::is_jholiday(<日付の列>) で書く（TRUE/FALSE を返す。製品の列メニュー「日本の祝日 (TRUE / FALSE)」が作る式は is_jholiday(<列>)）。timeDate::holidayNippon など、名前から作った関数を書かない（R_ERROR 'not an exported object' になる）",
  "和暦の文字列を日付にするには zipangu::convert_jdate(<和暦の文字列>) を使う（\"令和3年1月1日\"・\"R3/1/1\" → 2021-01-01、\"平成31年4月30日\" → 2019-04-30）。年号の後の数字を正規表現で取り出して基準年を足す自前の式を、先には書かない",
  "「2024年1月1日」のような西暦の日本語表記は和暦ではない。convert_jdate でなく lubridate の ymd・ym を使う",
  "R のパッケージ一覧（installed.packages()）で祝日・和暦の名前を探して見つからなくても、関数が無い証拠にはならない。製品の R には zipangu が入っている前提で、上の関数を試す"
]

## does_not_apply_when

[
  "日付が既に Date の列で、祝日でも和暦でもない判定（曜日・月・年の取り出し）をするとき"
]

## in_exploratory

[
  "列メニュー: 日付の列 > 日本の祝日 (TRUE / FALSE)（expression は is_jholiday(列)）、和暦 / 西暦 (令和4年1月1日 / 2022-01-01)（convert_jdate）"
]
