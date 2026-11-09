---
name: exploratory-charts
description: "For the Exploratory Desktop app on the user's computer (local projects). 「月別の売上をチャートにして」「この図を散布図に変えて」のように、チャートやピボットを 1 枚作る・直す・設定する・読み解くときに使う。"
---

exploratory-desktop が使えない・エラーのときは、~/.exploratory・token・アプリのログ・他の会話の記録を探したり読んだりせず、中継を自分で起動せず、利用者に Exploratory Desktop の起動を頼む（利用者のデータやプロジェクトを探すのは構わない）。

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

AI Summary 書式オフの項目は現在の書式設定がオフのときに選び、オンの本文と混ぜない。

## 作業の要点

チャートは create_chart で作る。種類・列・枠・設定名は実際の一覧で確認する。

## 作成と表示の要点

依頼が図の種類・列・数値の扱いを指定したら、その指定を守る。列名は取得結果から写し、型・枠・func・設定名は実際の一覧で確認する。集計・Top N・日付区切り・表計算は、加工を足す前に list_chart_settings で表せるか調べる。同じ図の修正は ID を保つ update_chart を使う。読返しが意図と違っても、依頼どおり送ったfunc・設定を保持して設定で直し、同じ結果の加工列へ置き換えない。

複数指標を一つの図で比べる依頼は、複数値を取る枠へ配列で置く。系列別の計算は0始まりの系列番号付き設定を使う。単位が大きく異なり同じ図では読みにくい場合は分ける。

色または複数の値を使い、平均・中央値・率など足せない値を比べるバーは settings.barstyle: "group" にする。100%積み上げにするのは、同じ分母の排他的な構成だけ。truepct / true_ratio は NA を分母に含み、数値0/1の ave は含まない。

人数・金額は単位付きで示す。通常の数値列の ave / sum は割合書式で100倍されるため、先に100倍しない。複数変数の値・ピボット・Number は各専用ガイドの例外に従う。長い項目名は横向きのバーを使い、意味順序のない項目は値順。リスト上の title は一覧での名前で、図内の題名とは別のもの。

図は一つずつ作り、返った行数と枠を確かめてから次へ進む。

## 必ず読む節

MCP の対象指定と結果形式: [get_chart・get_analytics が返すデータの形](../exploratory-core/common/core-chart-reading.md)、[get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [チャート作成の共通ルール（図の種類の選び方、create_chart の使い方）](common/chart-common.md)

## 条件つきで読む節

- 割合を使うとき: [件数の割合（count_ratio・表計算の割合・分母の選び方）](common/chart-count-ratio.md)
- 基準線を使うとき: [基準線とトレンド線（データの一部だけを使う設定、遅れ期間）](types/chart-reference-lines.md)
- ピボットの並べ方を決めるとき: [属性ごとの表を 1 枚のまとめ表にする（比べる列を残す）](types/chart-pivot-summary.md)、[横に並んだ設問を、加工せずピボットに入れる](types/chart-pivot-questions.md)
- ピボットの列と配置を決めるとき: [クロス集計の既定の組み合わせ・無回答は除く・属性を積んだ表の合計・合計との差・まとめ表・設問を繰り返しに置く組み方](common/chart-pivot-crosstab.md)、[ピボットで、全体との差を条件付き書式で見せる](types/chart-pivot-difference.md)
- クロス集計を、分析を任されていない依頼で作るとき: [クロス集計の属性を、利用者に 2 段で確かめる手順](common/chart-cross-tab-selection.md)
- 設定名や集計関数を書くとき: [枠の関数・見た目の設定・集計の調べ方（list_chart_settings）](common/chart-settings-lookup.md)、[依頼の言い方から、設定の節と名前を引く例](types/chart-settings-examples.md)、[チャートの種類ごとの既定の設定と、集計関数の選び方（全種類に共通）](common/chart-chart-type-details.md)
- 複数の列や複数回答を 1 つの図に入れるとき: [横に並んだ複数の列や複数回答の列を、1 つの図に入れる（複数の変数）](types/chart-multi-variables.md)
- 地図を作るとき: [地図チャートの地域指定（list_chart_maps の地図 ID と地域の列）](common/chart-map-regions.md)
- ナンバーの書式を決めるとき: [ナンバーの主値と副値の書式](common/chart-singlevalue-format.md)
- カラーパレットを操作するとき: [カラーパレットの操作（表示・作成・変更・削除）](common/chart-palettes.md)
- AI Summary の書式がオフのとき: [チャート作成の共通ルール（図の種類の選び方、create_chart の使い方）（AI Summary 書式オフ）](common/chart-common-format-off.md)

## 目的で選ぶ節

種類を決めたら、作る前に types/chart-<種類>.md を読む（枠・設定。<種類> は bar・line などの marker）。scattermatrix・parcats にはこの資料がない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
