---
name: exploratory-notes
description: "For the Exploratory Desktop app on the user's computer (local projects). 「分析結果をレポートにまとめて」「ノートの章を直して」のように、ノートや分析レポートを書く・保存する・直す・図を埋め込むときに使う。"
---

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、新しく作る依頼か、既存ノートの修正かを分ける。新規は create_note、修正だけ update_note を使う。

## 保存と更新の要点

新規依頼は create_note。既存ノートの修正を頼まれたとき、または同じ依頼の分割保存を続けるときだけ update_note を使う。note_id は作成結果か list_notes の noteId から取り、名前の似た既存ノートへ勝手に追記しない。更新は既定 append、構成全体の置換だけ replace とする。

埋込みトークンは1行に一つだけ置き、前後を空行にする。exploratoryPath を自作しない。1回20図を超える場合は、計画を削らず同じレポートを分割保存する。

既存図の数値を初めて読む・更新後に読み直すときは get_chart(showInView: false) を使う。本文整形だけで数値が既知なら再取得しない。保存後の opened を見て画面の状態を伝える。削除は利用者がそのノートの削除を明示した場合だけ行う。

## 詳細を読む条件

ノートを作る・直すときは、保存の規則として common/note-common.md を毎回読む。既存ノートの編集・削除、埋込みのエラー、既存図の数値取得では、操作前にその該当部分を読み直す。

## 必ず読む節

MCP の対象指定と結果形式: [get_chart・get_analytics が返すデータの形](../exploratory-core/common/core-chart-reading.md)、[get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [ノート（Markdown）の作成と更新、章立て](common/note-common.md)

## 目的で選ぶ節

作業の要点と「必ず読む節」で案内した以外に、選んで読む資料はない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
