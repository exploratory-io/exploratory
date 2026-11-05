---
name: exploratory-settings
description: "For the Exploratory Desktop app on the user's computer (local projects). 「接続の設定を確認したい」「システム設定を変えたい」のように、接続とシステム設定を読む・変えるときに使う（公開は exploratory-dashboards）。"
---

exploratory-desktop が使えない・エラーのときは、~/.exploratory・token・アプリのログ・他の会話の記録を探したり読んだりせず、中継を自分で起動せず、利用者に Exploratory Desktop の起動を頼む（利用者のデータやプロジェクトを探すのは構わない）。

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、変える設定の対象と、利用者がその変更を明示しているかを確かめる。接続や公開に関わる設定は、頼まれていない変更をしない。

## 必ず読む節

MCP の対象指定と結果形式: [get_chart・get_analytics が返すデータの形](../exploratory-core/common/core-chart-reading.md)、[get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [ダッシュボード・パラメーター・接続・公開の共通ルール](../exploratory-dashboards/common/dashboard-common.md)

## 目的で選ぶ節

作業の要点と「必ず読む節」で案内した以外に、選んで読む資料はない。

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
