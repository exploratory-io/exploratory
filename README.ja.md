# Exploratory プラグイン

[English](README.md)

このプラグインは、Claude Code、Codex、Cursor などの AI クライアントを、MCP（Model Context Protocol）で Exploratory につなぎます。プラグインは 2 つあります。

- **Exploratory Server**: [exploratory.io](https://exploratory.io) にパブリッシュされたノート、ダッシュボード、スライド、チャート、アナリティクス、データを読みます。
- **Exploratory Desktop**: 手元の Exploratory Desktop で、プロジェクトを作成・編集します。

## 使う対象に合わせてプラグインを選ぶ

下の表で自分に合うものを選び、そのガイドに沿って進めてください。

| やりたいこと | ガイド | 入れるもの |
|---|---|---|
| exploratory.io にパブリッシュされたコンテンツを読む・集計する | [Server だけを使う](#ガイド-1-server-だけを使う) | Exploratory Server |
| Exploratory Desktop で、データ・チャート・アナリティクス・ノート・ダッシュボードを作る | [Desktop だけを使う](#ガイド-2-desktop-だけを使う) | Exploratory Desktop v17 以降と、Exploratory Desktop プラグイン |
| 両方 | [Server と Desktop を両方使う](#ガイド-3-server-と-desktop-を両方使う) | 上の両方 |

| プラグイン | プラグイン名 | 入手先 |
|---|---|---|
| [Exploratory Server](plugins/exploratory-server/README.md) | `exploratory-server`（0.1.4） | 各 AI クライアントの公式のプラグイン一覧 |
| [Exploratory Desktop](plugins/exploratory-desktop/README.md) | `exploratory`（0.1.6） | このリポジトリのマーケットプレイス（`exploratory-io/exploratory`） |

2 つのプラグインは、ツールもスキルも重なりません。両方を、どちらの順番でも入れられます。

## ガイド 1: Server だけを使う

Exploratory のアカウントが必要です。Exploratory Desktop と Node.js は要りません。

### 手順 1. 入れる

AI クライアントの公式のプラグイン一覧に載ったら、そこから **Exploratory Server** を入れます。

それまでは、MCP の URL を直接足して使えます。この方法では、ツールは使えますが、Server のスキルは入りません。

Claude Code:

```sh
claude mcp add --transport http exploratory-server https://exploratory.io/mcp
```

Codex:

```sh
codex mcp add exploratory-server --url https://exploratory.io/mcp
codex mcp login exploratory-server
```

Cursor、Grok Bot などは、[MCP リファレンス](docs/mcp.ja.md)を見てください。

入れ方は 1 つだけにしてください（公式のプラグイン、URL の直接追加、claude.ai の Exploratory のコネクタのどれか。claude.ai のコネクタは、同じ Claude のアカウントでサインインした Claude Code にも出てきます）。あとで公式の一覧から入れるときは、先に直接足した分を外します（例: `claude mcp remove exploratory-server`）。外さないと、同じツールが 2 組表示されます。

### 手順 2. サインインする

新しいセッションを始めます。最初の呼び出しで、AI クライアントがブラウザを開きます。Exploratory にサインインして、アクセスを許可してください。API キーは要りません。

### 手順 3. 試す

> Exploratory にある自分のパブリッシュされたコンテンツを一覧して

> Exploratory の「売上」データにはどんな列がある？ 売上が一番高い地域の上位 5 つも教えて

## ガイド 2: Desktop だけを使う

次のものが必要です。

- Exploratory Desktop v17 以降。サインインして、起動しておきます。起動すると、`exploratory-mcp` コマンドが PATH に入ります。プラグインは、このコマンドを起動します。
- Claude Code で使う場合は、PATH に `node`。プラグインのレビューのフックが使います。

### 手順 1. Exploratory Desktop で MCP をオンにする

**システム設定 > MCP / CLI** を開き、**MCP** のスイッチをオンにします。チャートやノートなどを作成・変更する場合は、**「作成、変更、削除を許可する」**にもチェックを入れます。どちらも初期状態ではオフです。

### 手順 2. Exploratory Desktop プラグインを入れる

このプラグインは、公式の一覧にはありません。このリポジトリをマーケットプレイスとして足してから、プラグインを入れます。コマンドを打つか、AI クライアントにコマンドの実行を頼んでください。

#### Claude Code

```sh
claude plugin marketplace add exploratory-io/exploratory
claude plugin install exploratory@exploratory
```

Claude Code の `/plugin` から、マーケットプレイス `exploratory-io/exploratory` を足して、`exploratory` を選んで入れることもできます。

#### Codex

```sh
codex plugin marketplace add exploratory-io/exploratory
codex plugin add exploratory@exploratory
```

#### Cursor

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory/plugins/exploratory-desktop
```

スキルなしで Desktop MCP だけを登録する場合は、`~/.cursor/mcp.json` に次を足します。

```json
{
  "mcpServers": {
    "exploratory-desktop": {
      "type": "stdio",
      "command": "exploratory-mcp"
    }
  }
}
```

#### Antigravity

```sh
git clone https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory/plugins/exploratory-desktop
```

### 手順 3. つながりを確かめて試す

新しいセッションを始めます。Claude Code では `/mcp` を開き、`exploratory-desktop` がつながっていることを確かめます。Codex では `codex mcp list` を実行し、`exploratory-desktop` が出ることを確かめます。Exploratory Desktop でプロジェクトを開いてから、次のように頼みます。

> 開いている Exploratory のプロジェクトで、売上データから月ごとのバーのチャートを作って

MCP がオフだと言われたら、手順 1 に戻ってください。

## ガイド 3: Server と Desktop を両方使う

[ガイド 1](#ガイド-1-server-だけを使う) と [ガイド 2](#ガイド-2-desktop-だけを使う) の両方を行います。順番はどちらが先でもかまいません。あとからもう一方を足すときも、先に入れたものを入れ直す必要はありません。

- Desktop プラグインには、振り分けのスキルが入っています。パブリッシュされたコンテンツについての依頼は Server に、手元のプロジェクトについての依頼は Desktop に回します。
- Server の入れ方は 1 つだけにしてください（公式のプラグイン、URL の直接追加、claude.ai のコネクタのどれか）。2 つ入れると、同じツールが 2 組表示されます。
- サインインは別々です。Server はブラウザで Exploratory にサインインします。Desktop は、アプリにサインインしているアカウントを使います。

### 以前の全部入りのプラグインを使っていた場合

以前の `exploratory` プラグインには、Server と Desktop の両方が入っていました。更新すると Desktop プラグインになり、Server の接続は外れます。パブリッシュされたコンテンツも読む場合は、[ガイド 1](#ガイド-1-server-だけを使う) で Server を足してください。

## できること

| 分類 | ツール |
|---|---|
| 探す・読む | `search` でパブリッシュされたコンテンツを一覧・検索し、`fetch` でノート・ダッシュボード・スライドを Markdown で読む |
| チャート・アナリティクス | `chart_get_data` でチャートの数値、`chart_get_image` でチャートの画像、`analytics_get_result` で係数や P 値などの結果を取る |
| データ | `dataframe_get_schema` で列の説明と承認された意味、`dataframe_preview` で行、`query_dataset` でサーバー上の絞り込みと集計、`dataframe_export` で結果を CSV か Parquet に保存 |

表の Server MCP のツールは読み取り専用ですが、`dataframe_export` だけは、15 分間有効なダウンロードリンクを作ります。

Desktop MCP のツールは、手元のプロジェクトを作成・編集します。対象は次のとおりです。

- データフレーム・加工のステップ・ブランチ・パラメータ・接続
- チャートとアナリティクス
- ノートとダッシュボード

Desktop MCP のツールには、変更や削除を伴うものがあります。

- チャート・アナリティクス・ノート・ダッシュボード・ステップ・ブランチ・パラメータ・接続の削除
- ノート・ダッシュボード・データフレームの公開と、公開の取り消し
- `execute_r_script` による R の実行

書き込みの前に、エージェントの提案を確認してください。[Exploratory MCP リファレンス](docs/mcp.ja.md)には、Server MCP のツールについて、引数・エラー・制限を載せています。Desktop MCP のツールは、AI クライアントが表示するツール一覧で確認できます。

## 設定（Claude Code）

プラグインの設定は、Claude Code だけにあり、次の 4 つです。

| 設定 | 既定値 | 役割 |
|---|---|---|
| `ai_summary` | `false` | 作成したチャートとアナリティクスに、AI サマリを作って保存します |
| `save_comments` | `false` | 作成したチャートに、説明のコメントを保存します |
| `review_hook` | `false` | エージェントに作業の見直しを促します（下の説明と[プライバシー](#プライバシー)を見てください） |
| `plan_gate` | `true` | 計画を保存するまで、作成の操作を止めます（[計画チェック](#計画チェックplan_gate)を見てください） |

`review_hook` がオンのとき、エージェントは次のタイミングで作業を見直します。

- 最初の `create_chart` か `create_analytics` の前
- 加工のステップごとのあと
- ノートを作ったあと
- チャートとアナリティクスの作成・編集のあと
  - 見直しは、チャートまたはアナリティクスごとに 1 回です。
  - 1 セッションの上限は、チャートとアナリティクスを合わせて 8 件です。
  - 上限を変えるには、`EXPLORATORY_REVIEW_CHART_LIMIT` を指定します。

設定を見るには、`claude plugin configure exploratory@exploratory` を実行します。変更するには、このコマンドに `--values-stdin` を付けて、JSON オブジェクトを渡します。インストール時に指定することもできます。

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

Desktop パッケージでは、Claude Code の定義からフックと `plan_gate` を接続しています。現在の Codex プラグイン定義では、これらのフックと設定は未接続です。Codex 自体にはフックの仕組みがあります。

### 計画チェック（`plan_gate`）

計画チェックは、エージェントが計画を保存する前に作り始めるのを止める仕組みで、既定ではオンです（`plan_gate` = `true`）。止めるには、上の `claude plugin configure` のコマンドで `plan_gate` を `false` にします。

拒否する呼び出しと規則は、[計画チェック（Claude Code）](docs/mcp.ja.md#計画チェックclaude-code)を見てください。

## データと権限

- Server MCP は、パブリッシュされたコンテンツを読みます。Desktop MCP は、手元のプロジェクトの内容を作成・編集し、依頼に応じて公開できます。エージェントが提案する操作を確認してください。
- Server MCP の呼び出しは、サインインした人として動きます。その人が exploratory.io で閲覧できる範囲を超えません。公開した人は、パブリッシュされたコンテンツごとに MCP からのアクセスを止められます。データの行を非公開にすることもできます。
- Desktop MCP には、この制御は当てはまりません。Desktop MCP は、手元の Exploratory Desktop を通して、アプリにサインインしている利用者として動きます。
- Server MCP の接続を解除するときは、exploratory.io のアカウント設定の「接続中のAIアプリ」から外します。この操作では Desktop MCP は止まりません。Desktop MCP は、Exploratory Desktop を終了すると止まります。

## 更新と削除

次のコマンドは Desktop プラグインの操作です。Server は、導入した公式マーケットプレイスから更新・削除してください。

| クライアント | 更新 | 削除 |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory` のあと `claude plugin update exploratory@exploratory` を実行し、Claude Code を再起動 | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory` のあと、`codex plugin remove exploratory@exploratory` と `codex plugin add exploratory@exploratory` で入れ直す | `codex plugin remove exploratory@exploratory` |
| Cursor | 取得したフォルダで `git pull` を実行し、もう一度 `agent --plugin-dir` で起動 | `--plugin-dir` をやめる。手で `~/.cursor/mcp.json` を書いた場合は、`exploratory-desktop` を消す |
| Antigravity | 取得したフォルダで `git pull` を実行し、もう一度 `agy plugin install` | Antigravity のプラグインの設定から外す |

削除しただけでは、Server MCP のアクセスの許可は残ります。許可も取り消すときは、exploratory.io の「接続中のAIアプリ」からもクライアントを外してください。

## トラブルシューティング

| 問題 | 対処 |
|---|---|
| `exploratory-mcp` が見つからない | MCP 対応の Exploratory Desktop v17 以降を起動して `exploratory-mcp` を PATH に登録し、AI クライアントを再起動します。 |
| Claude Code のフックで `node` が見つからない | Node.js を入れ、`node` を PATH に通します。 |
| Desktop MCP のツールが、アプリが起動していないというエラーを返す | Exploratory Desktop を起動します。そのあと、同じ会話でもう一度ツールを使います。 |
| Server MCP がサインインを求める | もう一度サインインします。Claude Code は `/mcp`、Codex は `codex mcp login exploratory-server`、Cursor は `agent mcp login exploratory-server` です。Grok Bot は、接続を外してから追加し直します。 |
| Desktop MCP が思いどおりに動かない | Exploratory Desktop にサインインしているか確かめます。 |

## プライバシー

- Server MCP: 呼び出しは `https://exploratory.io/mcp` に送られます。読むのはパブリッシュされたコンテンツだけで、読み取り専用です。権限は[データと権限](#データと権限)を見てください。
- Desktop MCP: あなたのコンピューター上で動きます。中継が手元の Exploratory Desktop と通信し、アプリを通して、手元のプロジェクトの内容（データフレーム・チャート・アナリティクス・ノート・ダッシュボード）を読み、編集します。
- Desktop MCP の利用記録: Exploratory Desktop は、Desktop MCP のツールを 1 回呼び出すたびに、利用記録を 1 件、サインインしている exploratory.io のサーバーへ送ります。この記録は、ツールの改善に使います。
  - 記録には、ツールの名前と引数が入ります。引数には、利用者が入力した式や値が入ることがあります。
  - 記録には、成功したかどうかと、エラーの種類とメッセージも入ります。
  - 結果の大きさ（中身は含みません）と所要時間も入ります。
  - Exploratory Desktop の版、AI クライアントの名前と版、セッションとアイテムの ID が入ります。
  - Exploratory Desktop が記録を送るのは、サインインしていて、AI 機能がオンのときだけです。ローカルのデータカタログのツールでは、記録を送りません。
- ツールの結果: ツールが返すもの（行・列名・チャートの画像・エラー）は、会話の一部になります。使っている AI の提供元（例: Anthropic、OpenAI、Google、xAI）へ、その提供元の規約のもとで送られます。その提供元へ送ってはいけないデータには、このプラグインを使わないでください。
- フック（現在の接続先は Claude Code）: フックは、エージェントの操作の前後に自動で動く小さなプログラムです。ここのフックは `node` でローカルに動き、ネットワークには何も送りません。
  - 状態ファイル: フックは、プラグインのデータフォルダに書きます。フォルダが未設定のときは、システムの一時フォルダの `exploratory-plugin-review` に書きます。プラグインは、このファイルを消しません。残したくなければ、自分で消してください。
  - 見直しのフック: `review_hook` がオンのときは、`-charts.json` に、次のツールの引数と結果をそのまま保存します。列名やフィルタの値が入ることがあります。
    - `create_chart`
    - `update_chart`
    - `create_analytics`
    - `update_analytics`
  - ノートについては、フックがノート ID か題名を保存します。
  - 計画のフック: `plan_gate`（既定はオン）がオンのときは、フックが次のものを保存します。
    - R 式から作った SHA-1 ハッシュ（文字列から作る短いコード）
    - レポートと計画ファイルのパス
    - チャートの ID
  - `plan_gate` がオンのときは、作業フォルダの `*計画*.md` と `*plan*.md` も読みます。`計画` は「plan」の意味です。
  - 計画のフックは、`Skill`・`Write`・`Bash`・`PowerShell` を呼び出すたびに起動します。次の Desktop MCP の呼び出しでも起動します。
    - `execute_r_script`、`get_chart_image`、`get_chart_data`
    - `create_chart`、`update_chart`、`create_analytics`、`update_analytics`、`delete_chart`
    - `create_note`、`update_note`、`get_note_image`
    - `create_dashboard`、`update_dashboard`、`get_dashboard`、`get_dashboard_image`
  - 分析のスキルを先に使っていなければ、計画のフックは何も記録しません。
  - 設定のフック: 設定の値をコンテキストとしてエージェントにも渡します。Desktop MCP を呼び出すたびに起動し、`review_hook` と `plan_gate` がどちらも `false` でも同じです。状態ファイルのフォルダに、セッションごとの小さな目印のファイル（`-settings`）を書きます。
  - 記録のフックを止めるには、`review_hook` と `plan_gate` を `false` にします。プラグインを削除しても止まります。
- Exploratory のプライバシーポリシー: https://exploratory.io/privacy

## サポート

https://exploratory.io/ の右下のチャットか、support@exploratory.io へご連絡ください。

利用規約: https://exploratory.io/terms

## セキュリティ

トークンやパスワードを、プロンプトやファイルに書かないでください。プラグインはトークンを渡しません。中継が自分で認証情報を読みます。

Desktop MCP は、削除する操作（`delete_*`、`unpublish`）と公開する操作（`publish_note`・`publish_dashboard`・`publish_data_frame`）に `destructiveHint` を付けています。これは目印にすぎません。目印に従うクライアントは、実行前に確認を求めることがあります。確認の有無は、クライアントと権限の設定で変わります。別のプロジェクトへコピーする操作には付けていません。

脆弱性を見つけたときは、[SECURITY.md](SECURITY.md)（英語のみ）に従って報告してください。

## ドキュメント

- [Exploratory MCP リファレンス](docs/mcp.ja.md): エンドポイント・認証・ツール・エラー・制限
- [セキュリティポリシー](SECURITY.md)（英語のみ）
- [変更履歴](CHANGELOG.md)

## ライセンス

MIT
