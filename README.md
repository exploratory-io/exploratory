# Exploratory MCP plugin

[日本語](#日本語)

One plugin connects Claude Code and Codex to two MCP servers: `exploratory-server` for items published on [exploratory.io](https://exploratory.io), and `exploratory-desktop` for creating and editing data, charts, analytics, and reports in local Exploratory Desktop projects. Cursor and Antigravity can use both servers too (Desktop on your own Mac). Grok Bot keeps its Server-only configuration.

Ask about the notes, dashboards, slides, charts, analytics and data you can view on exploratory.io. Numbers come from the published charts and analytics, or are computed on the server from the data, not estimated by the AI.

## Before you connect

- You need an Exploratory account on exploratory.io. You sign in with it in the browser; there is no API key to set up.
- The Server MCP can read only what you can view on exploratory.io: your own items, items shared with you, and your teams' items.
- To use the Desktop MCP (Claude Code, Codex, Cursor and Antigravity), the latest version of Exploratory Desktop must be running. Installing the plugin registers the MCP servers; it does not start the app.
- The Desktop MCP currently works on macOS only, whichever client you use: its launcher looks for `/Applications/Exploratory.app` (or the path in `EXPLORATORY_MCP_BUNDLE`) and starts it with `node`, so `node` must be on your PATH.
- If Exploratory Desktop is not running, Desktop tools return a not-running error. Start the app; you can then use the tools again in the same conversation.

## Install

| Client | What gets installed |
|---|---|
| Claude Code | Both MCP servers, Server and Desktop skills, Claude-only hooks |
| Codex | Both MCP servers and Server and Desktop skills |
| Cursor (any model, including Grok) | Two MCPs: Server and Desktop (Desktop on your own Mac) |
| Grok Bot | MCP server only |
| Antigravity | Two MCPs: Server and Desktop (Desktop on your own Mac) |

The skill tells the agent which tool to use for which question and how to report numbers. Without it the tools still work: the server sends short usage instructions of its own. On a client that has only the Server MCP, the entry skill still applies and uses the Server MCP alone when no Desktop MCP is registered.

### Claude Code

```sh
claude plugin marketplace add exploratory-io/exploratory
claude plugin install exploratory@exploratory
```

Start a new session, run `/mcp`, select `plugin:exploratory:exploratory-server` and sign in.

### Codex

```sh
codex plugin marketplace add exploratory-io/exploratory
codex plugin add exploratory@exploratory
codex mcp login exploratory-server
```

Start a new session to use it.

### Cursor

Install the repository as a Cursor plugin (`.cursor-plugin`). It registers two MCP servers, `exploratory-server` and `exploratory-desktop`:

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory
```

Then sign in to the Server MCP:

```sh
agent mcp login exploratory-server
```

`exploratory-desktop` uses the Exploratory Desktop app that is running on your computer. To write the settings by hand instead, add both to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "exploratory-server": {
      "type": "http",
      "url": "https://exploratory.io/mcp"
    },
    "exploratory-desktop": {
      "type": "stdio",
      "command": "<path to the cloned repository>/scripts/exploratory-desktop-mcp"
    }
  }
}
```

### Grok Bot

Send this in a chat:

> Add this remote MCP server. Name: exploratory-server, URL: https://exploratory.io/mcp

Then sign in from the card that appears.

### Antigravity

```sh
git clone https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory
```

The Desktop MCP uses the Exploratory Desktop app that is already running. Start `agy`, run `/plugin`, open the plugin `exploratory` (MCP server `exploratory-server`) and choose Sign in. Approve on Exploratory's consent page, then paste the authorization code shown in the browser back into `agy`. In the Antigravity app, use Authenticate next to the server under Agent settings > Customizations.

## Desktop settings and development builds

Claude Code provides `ai_summary` (default `false`), `save_comments` (`false`), `review_hook` (`false`), and `plan_gate` (`true`). Configure them with `/plugin configure exploratory@exploratory`. For example:

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

Hooks and the plan gate run only in Claude Code. Codex does not install these hooks or expose Claude's plugin options.

For a development build, set the bridge bundle and its app data directory in the environment before launching your agent:

```sh
EXPLORATORY_MCP_BUNDLE=/path/to/exploratory-mcp.bundle.js \
EXPLORATORY_HOME=/path/to/development-app-data codex
```

Use the same variables before `claude` for Claude Code. The launcher first checks `EXPLORATORY_MCP_BUNDLE`, then the bundle inside `/Applications/Exploratory.app`. `EXPLORATORY_HOME` is inherited by the bridge. The plugin does not pass a token; the bridge reads its own credentials. If no bundle is found, the launcher writes one error line to stderr and exits with code 1.

## Try it

> List my items on Exploratory.

> In the "Sales" dashboard on Exploratory, which region grew the most last quarter?

## What agents can do

| Category | Tools |
|---|---|
| Find and read | `search` lists and searches items; `fetch` reads a note, dashboard or slide as Markdown |
| Charts and analytics | `chart_get_data` returns the numbers behind a chart; `chart_get_image` returns the chart as an image; `analytics_get_result` returns coefficients, p-values and other results |
| Data | `dataframe_get_schema` describes the columns and their approved meaning; `dataframe_preview` shows rows; `query_dataset` filters and aggregates on the server; `dataframe_export` saves a result as CSV or Parquet |

The Server tools listed above are read-only. Desktop tools can create and edit local projects, and they include operations that change or remove things: deleting charts, analytics, notes, dashboards, steps, branches, parameters and connections; publishing notes, dashboards and data frames and unpublishing them; and running R code with `execute_r_script`. Review what your agent proposes before it writes. See the [Server MCP reference](docs/mcp.md) for arguments, errors and limits.

## Data and permissions

- The Server MCP reads published items. The Desktop MCP can create and edit local project content and publish when requested; review the operations your agent proposes.
- Every call runs as the signed-in user and never goes beyond what that user can view on exploratory.io. A publisher can turn off MCP access for an item, or keep the rows of a data item private.
- To disconnect a client, open Account Settings on exploratory.io and remove it under Connected AI Apps.

## Update and uninstall

| Client | Update | Uninstall |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory`, then `claude plugin update exploratory@exploratory`, and restart Claude Code | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory`, then reinstall with `codex plugin remove exploratory@exploratory` and `codex plugin add exploratory@exploratory` | `codex plugin remove exploratory@exploratory` |
| Cursor | Run `git pull` in the cloned folder and start `agent --plugin-dir` again | Stop using `--plugin-dir`; if you wrote `~/.cursor/mcp.json` by hand, remove `exploratory-server` and `exploratory-desktop` from it |
| Grok Bot | Nothing to update | Remove `exploratory-server` from Grok Bot's connections |
| Antigravity | Run `git pull` in the cloned folder, then `agy plugin install` again | Remove the plugin in Antigravity's plugin settings |

Uninstalling does not revoke access. To revoke it, also remove the client under Connected AI Apps on exploratory.io. This works for every client.

## Privacy

- Server MCP: calls go to `https://exploratory.io/mcp` and run as the signed-in user. They read published items only, are read-only, and never go beyond what that user can view.
- Desktop MCP: it runs on your computer and talks to your local Exploratory Desktop. It reads and edits local project content (data frames, charts, analytics, notes, dashboards) through the app.
- What a tool returns (rows, column names, chart images, errors) becomes part of your conversation, so it is sent to the provider of the AI you use (for example Anthropic, OpenAI, Google or xAI) under that provider's terms. Do not use the plugin on data that you may not send to that provider.
- Hooks (Claude Code only): they run locally with `node`, send nothing over the network and write state files to the plugin data folder, or to `exploratory-plugin-review` in the system temp folder when none is set. The files are not deleted automatically; delete them yourself if you do not want them kept. With `review_hook` on, a `-charts.json` file stores the arguments and results of `create_chart` and `update_chart` as they are, which can include column names and filter values; for notes it stores the note ID or title. The plan gate (`plan_gate`, on by default) stores the SHA-1 of R expressions, the paths of the report and plan files, and chart IDs, and reads `*計画*.md` and `*plan*.md` files in your working folder. To turn them off, set `review_hook` and `plan_gate` to `false` with `/plugin configure exploratory@exploratory`, or uninstall the plugin.
- The hook for `Write`, `Bash` and `Skill` calls starts on every such call, but records nothing unless the analysis skill was used first.
- Exploratory's privacy policy: https://exploratory.io/privacy

## Support

Write to support@exploratory.io.

## Security

Do not put tokens or passwords into prompts or files. The plugin does not pass a token; the Desktop bridge reads its own credentials. The Desktop MCP marks delete operations (`delete_*`, `unpublish`) and publish operations (`publish_note`, `publish_dashboard`, `publish_data_frame`) with `destructiveHint`, so your client asks you to confirm them. Copying to another project is not marked. To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Docs

- [MCP reference](docs/mcp.md): endpoint, authorization, tools, errors and limits
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

MIT

---

## 日本語

Claude Code と Codex に、exploratory.io の公開項目を読む `exploratory-server` と、手元の Exploratory Desktop でデータ・チャート・分析・レポートを作成・編集する `exploratory-desktop` の2つの MCP を登録するプラグインです。Cursor と Antigravity も2つの MCP（Desktop は手元の Mac で）を使えます。Grok Bot の設定は Server 用だけです。

exploratory.io で閲覧できるノート・ダッシュボード・スライド・チャート・アナリティクス・データについて質問できます。数値は、公開されたチャートやアナリティクスの値か、サーバーがデータから計算した値です。AI が推測した値ではありません。

### 使う前に

- exploratory.io の Exploratory アカウントが必要です。ブラウザでこのアカウントにサインインします。API キーの設定は要りません。
- Server MCP が読めるのは、あなたが exploratory.io で閲覧できるものだけです（自分のアイテム、共有されたアイテム、所属チームのアイテム）。
- Desktop MCP を使うには（Claude Code・Codex・Cursor・Antigravity 共通）、Exploratory Desktop の最新版が起動している必要があります。プラグインの導入は MCP の登録までを行います。
- Desktop MCP がいま動くのは、どのクライアントでも macOS だけです。起動処理は `/Applications/Exploratory.app`（または `EXPLORATORY_MCP_BUNDLE` のパス）の中継を `node` で起動するため、`node` が PATH に必要です。
- Exploratory Desktop が起動していないときは、Desktop のツールが未起動のエラーを返します。アプリを起動すれば、同じ会話でまたツールを使えます。

### 入れ方

| クライアント | 入るもの |
|---|---|
| Claude Code | 2つの MCP・Server と Desktop のスキル・Claude 専用フック |
| Codex | 2つの MCP・Server と Desktop のスキル |
| Cursor（Grok を含むどのモデルでも） | 2つの MCP（Server と Desktop。Desktop は手元の Mac で） |
| Grok Bot | MCP サーバーだけ |
| Antigravity | 2つの MCP（Server と Desktop。Desktop は手元の Mac で） |

スキルは、質問に応じてどのツールを使い、数値をどう伝えるかを AI に教えます。スキルがなくてもツールは使えます。サーバー自身も短い使い方を AI に渡します。Server の MCP だけのクライアントでも入口のスキルは働き、Desktop の MCP が登録されていなければ Server の MCP だけを使います。

#### Claude Code

```sh
claude plugin marketplace add exploratory-io/exploratory
claude plugin install exploratory@exploratory
```

新しいセッションで `/mcp` を開き、`plugin:exploratory:exploratory-server` を選んでサインインします。

#### Codex

```sh
codex plugin marketplace add exploratory-io/exploratory
codex plugin add exploratory@exploratory
codex mcp login exploratory-server
```

新しいセッションから使えます。

#### Cursor

リポジトリを Cursor のプラグイン（`.cursor-plugin`）として入れます。`exploratory-server` と `exploratory-desktop` の 2 つの MCP が入ります。

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory
```

そのあと Server の MCP にサインインします。

```sh
agent mcp login exploratory-server
```

`exploratory-desktop` は、起動している Exploratory Desktop を使います。手で書く場合は、`~/.cursor/mcp.json` に両方を書きます。

```json
{
  "mcpServers": {
    "exploratory-server": {
      "type": "http",
      "url": "https://exploratory.io/mcp"
    },
    "exploratory-desktop": {
      "type": "stdio",
      "command": "<取得したリポジトリのパス>/scripts/exploratory-desktop-mcp"
    }
  }
}
```

#### Grok Bot

チャットで次のように送ります。

> 次のリモート MCP サーバーを追加して。名前: exploratory-server、URL: https://exploratory.io/mcp

表示されたカードからサインインします。

#### Antigravity

```sh
git clone https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory
```

`agy` を起動して `/plugin` を開き、プラグイン `exploratory`（MCP サーバー `exploratory-server`）の「Sign in」を選びます。Exploratory の同意画面で許可し、ブラウザに表示された認可コードを `agy` に貼り付けます。Antigravity のアプリでは、エージェントの設定の Customizations で、サーバーの横の Authenticate からサインインします。

### Desktop の設定と開発版

Claude Code の設定は `ai_summary`（既定 `false`）、`save_comments`（`false`）、`review_hook`（`false`）、`plan_gate`（`true`）です。`/plugin configure exploratory@exploratory` で変更できます。コマンドの例は英語版の Desktop settings を参照してください。フックと計画の関所は Claude Code だけで動作します。Codex には Claude の利用者設定とフックを入れません。

開発版を使う場合は、エージェントを起動する前に環境変数を指定します。

```sh
EXPLORATORY_MCP_BUNDLE=/path/to/exploratory-mcp.bundle.js \
EXPLORATORY_HOME=/path/to/development-app-data claude
```

Codex は末尾を `codex` にします。起動処理は `EXPLORATORY_MCP_BUNDLE`、次に `/Applications/Exploratory.app` 内の中継を探します。`EXPLORATORY_HOME` はそのまま中継へ渡ります。プラグインから token は渡さず、中継が認証情報を読みます。中継が見つからなければ、標準エラーへ1行出し終了コード1で終わります。

### 試す

> Exploratory にある自分のアイテムを一覧して

> Exploratory の「売上」ダッシュボードで、前の四半期に一番伸びた地域はどこ？

### できること

| 分類 | ツール |
|---|---|
| 探す・読む | `search` でアイテムを一覧・検索し、`fetch` でノート・ダッシュボード・スライドを Markdown で読む |
| チャート・アナリティクス | `chart_get_data` でチャートの数値、`chart_get_image` でチャートの画像、`analytics_get_result` で係数や P 値などの結果を取る |
| データ | `dataframe_get_schema` で列の説明と承認された意味、`dataframe_preview` で行、`query_dataset` でサーバー上の絞り込みと集計、`dataframe_export` で結果を CSV か Parquet に保存 |

上の Server 用ツールは読み取り専用です。Desktop 用ツールは手元のプロジェクトを作成・編集できます。変更や削除を伴う操作も含みます。チャート・アナリティクス・ノート・ダッシュボード・ステップ・ブランチ・パラメータ・接続の削除、ノート・ダッシュボード・データフレームの公開と公開の取り消し、`execute_r_script` による R の実行です。書き込みの前に、エージェントの提案を確認してください。Server の引数・エラー・制限は [MCP リファレンス](docs/mcp.ja.md)を見てください。

### データと権限

- Server MCP は公開項目を読みます。Desktop MCP は手元のプロジェクトを作成・編集し、依頼に応じて公開できます。エージェントが提案する操作を確認してください。
- 呼び出しはすべてサインインした人として動き、その人が exploratory.io で閲覧できる範囲を超えません。公開した人は、アイテムごとに MCP からの利用を止めたり、データの行を共有しないようにしたりできます。
- 接続を解除するときは、exploratory.io のアカウント設定の「接続中のAIアプリ」から外します。

### 更新と削除

| クライアント | 更新 | 削除 |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory` のあと `claude plugin update exploratory@exploratory` を実行し、Claude Code を再起動 | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory` のあと、`codex plugin remove exploratory@exploratory` と `codex plugin add exploratory@exploratory` で入れ直す | `codex plugin remove exploratory@exploratory` |
| Cursor | 取得したフォルダで `git pull` を実行し、もう一度 `agent --plugin-dir` で起動 | `--plugin-dir` をやめる。手で `~/.cursor/mcp.json` を書いた場合は `exploratory-server` と `exploratory-desktop` を消す |
| Grok Bot | 更新は不要 | Grok Bot の接続の一覧から `exploratory-server` を外す |
| Antigravity | 取得したフォルダで `git pull` を実行し、もう一度 `agy plugin install` | Antigravity のプラグインの設定から外す |

削除しただけでは、アクセスの許可は残ります。許可も取り消すときは、exploratory.io の「接続中のAIアプリ」からも外してください。どのクライアントでも、この方法で取り消せます。

### プライバシー

- Server MCP: 呼び出しは `https://exploratory.io/mcp` に送られ、サインインした人として動きます。読むのは公開項目だけで、読み取り専用です。その人が閲覧できる範囲を超えません。
- Desktop MCP: あなたのコンピューター上で動き、手元の Exploratory Desktop と通信します。アプリを通して、手元のプロジェクトの内容（データフレーム・チャート・アナリティクス・ノート・ダッシュボード）を読み、編集します。
- ツールの結果（行・列名・チャートの画像・エラー）は会話の一部になるので、使っている AI の提供元（例: Anthropic、OpenAI、Google、xAI）へ、その提供元の規約のもとで送られます。その提供元へ送ってはいけないデータには、このプラグインを使わないでください。
- フック（Claude Code のみ）: `node` でローカルに動き、ネットワークには何も送りません。状態ファイルを、プラグインのデータフォルダ（未設定ならシステムの一時フォルダの `exploratory-plugin-review`）に書きます。ファイルは自動では消えないので、残したくなければ自分で消します。`review_hook` がオンのとき、`-charts.json` に `create_chart` と `update_chart` の引数と結果がそのまま保存されます（列名やフィルタの値が入ることがあります）。ノートは noteId か題名を保存します。計画の関所（`plan_gate`、既定はオン）は、R 式の SHA-1、レポートと計画ファイルのパス、チャートの ID を保存し、作業フォルダの `*計画*.md` と `*plan*.md` を読みます。止めるには、`/plugin configure exploratory@exploratory` で `review_hook` と `plan_gate` を `false` にするか、プラグインを削除します。
- `Write`・`Bash`・`Skill` のフックはそれらの呼び出しのたびに起動しますが、分析のスキルを使った後でなければ何も記録しません。
- Exploratory のプライバシーポリシー: https://exploratory.io/privacy

### サポート

support@exploratory.io へご連絡ください。

### セキュリティ

トークンやパスワードをプロンプトやファイルに書かないでください。プラグインは token を渡しません。Desktop の中継が自分の認証情報を読みます。Desktop の MCP は、削除する操作（`delete_*`、`unpublish`）と公開する操作（`publish_note`・`publish_dashboard`・`publish_data_frame`）に `destructiveHint` を付けるので、クライアントが利用者に確認します。別プロジェクトへのコピーには付けません。脆弱性の報告は [SECURITY.md](SECURITY.md) を見てください。

### ドキュメント

- [MCP リファレンス](docs/mcp.ja.md): エンドポイント・認証・ツール・エラー・制限
- [セキュリティポリシー](SECURITY.md)
- [変更履歴](CHANGELOG.md)

### ライセンス

MIT
