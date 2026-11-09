## id

"common-date-round-vs-extract"

## version

1

## kind

"common"

## title

"日付の軸は「丸め」と「抽出」を依頼の意味で選ぶ（加工で列を作らない）"

## applies_when

[
  "日付・日時の列を、年・半期・四半期・月・週・日・曜日などの単位でまとめて集計・比較する依頼"
]

## rules

[
  "日付の列は加工で「年」「月」などの列を作らず、軸の column に日付の列をそのまま置き、func で単位を指定する",
  "丸め（ROUND）: 日付をその単位の始まりに丸める。年が違えば別の区分になり、時間の流れに沿って並ぶ。例: rtohalfyear は 2020 年上期・2020 年下期・2021 年上期…。推移・時期ごとの比較（「入社時期別」「月ごとの推移」「年ごと」）は丸めを使う",
  "抽出（EXTRACT）: 日付から一部分だけを取り出す。年が違っても同じ区分にまとまる。例: halfyear は 1・2 の 2 区分、monname は Jan〜Dec の 12 区分。季節性や、年をまたいで同じ月・曜日どうしを比べたい依頼（「何月に多いか」「曜日による違い」「上期と下期の比較」）は抽出を使う",
  "迷ったら、依頼が「いつの時期か（年を区別する）」を知りたいのか、「年に関係なくどの月・曜日か」を知りたいのかで決める。どちらとも読めるときは、選んだ理由を説明に一言書く"
]

## does_not_apply_when

[
  "日付を文字列として扱いたい、または日付の列が無いとき"
]

## in_exploratory

[
  "丸め（ROUND）: rtoyear=Year、rtohalfyear=Half Year、rtoq=Quarter、rtobimon=Bi-Month、rtomon=Month、rtoweek=Week、rtoday=Day",
  "抽出（EXTRACT）: year=Year (e.g. 2020)、monthname_with_year=Year & Month (e.g. 2022-06)、halfyear=Half Year (1-2)、quarter=Quarter (1-4)、bimon=Bi-Month (1-6)、mon=Month - Number (1-12)、monname=Month - Short Name (Jan-Dec)、monnamelong=Month - Long Name、week=Week、day=Day、dayofweek / wday=Day of Week、weekend=Weekend"
]
