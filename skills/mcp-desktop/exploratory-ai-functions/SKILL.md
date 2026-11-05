---
name: exploratory-ai-functions
description: "For the Exploratory Desktop app on the user's computer (local projects). 「自由記述を分類したい」「口コミの感情を判定したい」のように、文章の意味を読んで分類・抽出する列を AI 関数で作るときに使う（決まった規則での変換は exploratory-wrangling）。"
---

作成・変更・結果の解釈の前に「必ず読む節」を読み、詳細は必要な種類・節を選ぶ。相対パスはこのフォルダが基準。

## 作業の要点

始める前に、処理が文章の意味を読むものか、決まった規則で変えるものかを決める。意味を読むなら AI 関数、規則で変えるなら加工のコマンドを使う。

## 必ず読む節

MCP の対象指定と結果形式: [get_data_frame の読み方（加工の意図と標本データを両方読む）](../exploratory-core/common/core-source-reading.md)

- [AI 関数の出力の書き方と変換（mutate か exp_custom を選んだあと）](../exploratory-wrangling/types/wrangling-ai-function-writing.md)

## 目的で選ぶ節

- [データ加工の共通ルール（並べ替え・絞り込み・集計・列の作成・結合・ピボット）](../exploratory-wrangling/common/wrangling-common.md)

共通設定は [設定の適用](../exploratory-core/runtime-settings.md) で確定する。道具の詳しい書き方は [MCP の道具別ガイド](../exploratory-core/mcp-tool-guides.md) から操作する道具だけを読む。
