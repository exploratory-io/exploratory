---
name: exploratory-datasources
description: "For the Exploratory Desktop app on the user's computer (local projects). 「このファイルを取り込んで」「データベースにつなぎたい」のように、ファイル・データベース・API からデータを取り込む、データソースや接続を作る・確かめるときに使う。"
---

exploratory-desktop が使えない・エラーのときは、~/.exploratory・token・アプリのログ・他の会話の記録を探したり読んだりせず、中継を自分で起動せず、利用者に Exploratory Desktop の起動を頼む（利用者のデータやプロジェクトを探すのは構わない）。

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、取り込む元の種類（ファイル・API・OAuth・DB）と、データソースの種類（get_data_source_params の種類一覧）で足りるかを決める。接続を作る・確かめるときは、../exploratory-dashboards/common/dashboard-common.md の Connections の節を読む。

## 必ず読む節

MCP の対象指定と結果形式: [get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [ファイル・データベース・OAuth・API からデータを取り込む](common/data-source-common.md)

## 目的で選ぶ節

作業の要点と「必ず読む節」で案内した以外に、選んで読む資料はない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
