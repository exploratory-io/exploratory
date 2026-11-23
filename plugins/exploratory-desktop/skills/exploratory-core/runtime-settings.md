# 設定の適用

Exploratory Desktop の最初の呼出し前に届く設定の文があれば、その指示を使う。未注入なら、読み込んだスキルの実パスからプラグインのルートを特定し、`node <plugin-root>/tools/render-settings.js` を実行して出力に従う。環境全体や認証情報は表示しない。

Claude Code で設定のフックが無効なら、同コマンドを引数なしで実行し、既定の設定に従う。設定を変えられるのは Claude Code のプラグイン設定だけで、ほかのクライアント（Codex など）は起動時の環境変数 EXPLORATORY_AI_SUMMARY・EXPLORATORY_SAVE_COMMENTS・EXPLORATORY_REVIEW_HOOK の 3 つがあれば読み、無ければ既定に従う。値が不正なら既定に戻して続ける。

オン・オフどちらの設定でも、読むべき接続時の指示ファイルの Read 行が出力されるので、最初に 1 回読む。AI Summary とチャートの説明コメントは、オフのときも「保存しない」の文が出る。設定ごとの意味と判断はこのコマンドに集約している。

フック用の文: [共通の点検範囲](review-scope.md)、[A 最初の作成直前](review-initial.md)、[B 加工後](review-wrangling.md)、[C1 図の作成・編集後](review-chart-after.md)、[C2 分析の作成・編集後](review-analytics-after.md)、[D ノートの最初の保存後](review-note.md)。
