---
name: exploratory-wrangling
description: "For the Exploratory Desktop app on the user's computer (local projects). 列を作る・絞る・集計する・結合するなど、データ加工を頼まれたときに使う（分岐、日付・文字列の式を含む。文章の意味を読んで分ける処理は exploratory-ai-functions）。"
---

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、文章の意味を読んで分ける処理か、決まった規則で変える処理かを分ける。意味を読む処理なら AI 関数、規則で変える処理なら加工のコマンドを使う。

## 加工の要点

列名は取得結果から写し、コマンドと params は get_wrangling_command で確認する。Exploratory でできる加工は製品のコマンドで作り、できないものだけ exp_custom（ステップのカスタム R コマンド）で作る。同じ操作・設定・値集合の列は一つのステップにまとめる。既知の連続操作は steps で順序を指定し、途中の結果を見て決める操作は逐次実行する。

2 値の列（0/1、Yes/No、TRUE/FALSE、はい/いいえ など）は、get_wrangling_command(command="mutate") で設定を確認し、mutate の expression に str_logical(列) または値と TRUE/FALSE の対応を明示した論理式を指定して、論理値（logical）に変える（NA はそのまま保つ）。「あり/なし」などの文字列ラベルへの置換はせず、表示に日本語のラベルが要るときはチャートの表示名で付ける。

集計・行抽出・ワイド型・ロング型の変換など、行数・粒度・表の構造が変わる加工は分岐し、補助列の追加だけなら分岐しない。NA は利用者の指定なしに FALSE や最後のカテゴリへ混ぜない。失敗時は返答の理由と適用済みステップを確認し、適用済み部分を繰り返さない。最終列・行数・指定された値や単位を実結果で確かめてから報告する。

## 詳細を読む条件

分岐を扱う前に types/wrangling-branch-workflow.md、結合の前に types/wrangling-join-keys.md（キーの一致率を実データで確かめる）、日付は types/wrangling-r-dates.md、文字列は types/wrangling-r-text.md、AI関数は types/wrangling-ai-function-writing.md を読む。

## 必ず読む節

MCP の対象指定と結果形式: [get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [データ加工の共通ルール（並べ替え・絞り込み・集計・計算を作成・結合・ピボット）](common/wrangling-common.md)

## 目的で選ぶ節

作業の要点と「必ず読む節」で案内した以外に、選んで読む資料はない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
