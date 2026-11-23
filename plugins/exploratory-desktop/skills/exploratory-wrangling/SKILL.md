---
name: exploratory-wrangling
description: "For the Exploratory Desktop app on the user's computer (local projects). 列を作る・絞る・集計する・結合するなど、データ加工を頼まれたときに使う（分岐、日付・文字列の式を含む。文章の意味を読んで分ける処理は exploratory-ai-functions）。"
---

exploratory-desktop が使えない・エラーのときは、~/.exploratory・token・アプリのログ・他の会話の記録を探したり読んだりせず、中継を自分で起動せず、利用者に Exploratory Desktop の起動を頼む（利用者のデータやプロジェクトを探すのは構わない）。

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、文章の意味を読んで分ける処理か、決まった規則で変える処理かを分ける。意味を読む処理なら AI 関数、規則で変える処理なら加工のコマンドを使う。

## 加工の要点

列名は取得結果から写し、コマンドと params は get_wrangling_command で確認する。Exploratory でできる加工は製品のコマンドで作り、できないものだけ exp_custom（ステップのカスタム R コマンド）で作る。同じ操作・設定・値集合の列は一つのステップにまとめる。既知の連続操作は create_wrangling_step の steps に並べて 1 回で足し（分岐が要るときだけ createBranch を同じ呼び出しに入れる）、途中の結果を見て決める操作は結果を見てから次を呼ぶ。

2 値の列（0/1、Yes/No、TRUE/FALSE、はい/いいえ など）は、get_wrangling_command(command="mutate") で設定を確認し、mutate の expression に str_logical(列) または値と TRUE/FALSE の対応を明示した論理式を指定して、論理値（logical）に変える（NA はそのまま保つ）。「あり/なし」などの文字列ラベルへの置換はせず、表示に日本語のラベルが要るときはチャートの表示名で付ける。

分岐は、集計やワイド型・ロング型の変換で 1 行の単位が変わり、しかも元の行を別の図や結合でも使うときだけ作る。列を足す・型を変える・値を直す（例: 9 を欠損にする）・全体に効く絞り込みは、分岐せず元のデータにステップを足す。データをきれいにする加工（欠損コードの置換、不良回答の判定と除外、区分の列、並び順、表記ゆれの統一）も同じで、元のデータを残すために分岐しない（足したステップは AI の提案として採否を選べ、無効化もできる）。同じ目的の続きの加工は 1 本の中で続け、分岐からさらに分岐を切らない。NA は利用者の指定なしに FALSE や最後のカテゴリへ混ぜない。失敗時は返答の理由と適用済みステップを確認し、適用済み部分を繰り返さない。最終列・行数・指定された値や単位を実結果で確かめてから報告する。

## 詳細を読む条件

分岐を扱う前に types/wrangling-branch-workflow.md、結合でキーが合うか確かでないとき（表記ゆれ・型の違い・結合で行数が増減しそうなとき）は types/wrangling-join-keys.md（キーの一致率の確かめ方）、日付は types/wrangling-r-dates.md、文字列は types/wrangling-r-text.md、AI関数は types/wrangling-ai-function-writing.md を読む。

## 必ず読む節

MCP の対象指定と結果形式: [get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [データ加工の共通ルール（並べ替え・絞り込み・集計・計算を作成・結合・ピボット）](common/wrangling-common.md)

## 条件つきで読む節

- 自由記述の分類・感情の判定・要約（例:「口コミを話題ごとに分類して」）や、AI データ加工（ai_wrangle）を頼まれたとき: [AI データ加工（ai_wrangle）と、自由記述の意味を AI 関数で判定する加工](types/wrangling-ai-functions-and-free-text.md)
- 2 値の列を論理値にする、複数回答の列を 1 列にまとめる、NA を含む TRUE/FALSE 列を作るとき（例:「はい/いいえを TRUE/FALSE にして」「複数回答の列を 1 つにまとめて」）: [2 値の列を論理値にする・複数回答の列を 1 列にまとめる・NA を含む TRUE/FALSE 列](types/wrangling-two-value-and-multi-answer-columns.md)
- グループ別の NPS を求めるとき（例:「職業別の NPS を出して」）: [グループ別の NPS（寄与の列を mutate で作ってから集計する）](types/wrangling-nps-by-group.md)
- ステップの失敗が返ったとき（「取り消した」「R が止まりました」「無い列を指しています」「operator は使えません」）: [加工の失敗メッセージ別の対処（取り消し・R が止まった・列が無い・operator）](types/wrangling-failure-messages.md)
- 依頼が値・単位・日時・例を言葉で指定しているとき、式を書き直したとき（例:「24 時間表記の時刻にして」「この入力ならこの値になるように」）: [依頼が書いた値・単位・日時・例の確かめ、式を書き直したときの全行比較](types/wrangling-verify-requested-values-and-dates.md)

## 目的で選ぶ節

作業の要点と「必ず読む節」で案内した以外に、選んで読む資料はない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
