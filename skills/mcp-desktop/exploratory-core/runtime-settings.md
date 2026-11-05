# 設定の適用

Exploratory Desktop の最初の呼出し前に届く設定の文があれば、その指示を使う。未注入なら、読み込んだスキルの実パスからプラグインのルートを特定し、`node <plugin-root>/tools/render-settings.js` を実行して出力に従う。環境全体や認証情報は表示しない。

Claude Code で設定のフックが無効なら [core の入口](SKILL.md) の保存済みの3値を、同コマンドの `--ai-summary`、`--save-comments`、`--review-hook` に明示する。未展開の `${user_config.*}` は値として渡さず、Codex は起動時の3環境変数から読む。

オンの設定の文だけが出力され、オフの設定は何も出ない。設定ごとの意味と判断はこのコマンドに集約している。

フック用の文: [共通の点検範囲](review-scope.md)、[A 最初の作成直前](review-initial.md)、[B 加工後](review-wrangling.md)、[C1 図の作成・編集後](review-chart-after.md)、[C2 分析の作成・編集後](review-analytics-after.md)、[D ノートの最初の保存後](review-note.md)。
