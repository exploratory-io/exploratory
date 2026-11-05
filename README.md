# Exploratory MCP plugin

[日本語](#日本語)

This plugin lets your AI agent read items on [exploratory.io](https://exploratory.io) that you can view. It also lets the agent build data, charts, analytics and reports in Exploratory Desktop on your computer.

MCP (Model Context Protocol) is an open standard that lets an AI use an outside app. This plugin adds two MCP servers:

- Server MCP (`exploratory-server`): reads items on exploratory.io. An item is a note, dashboard, slide, chart, analytics or data that was published there.
- Desktop MCP (`exploratory-desktop`): works with local projects in Exploratory Desktop.

Claude Code, Codex, Cursor and Antigravity get both MCP servers. Grok Bot (a chat client where you add MCP servers by message) gets the Server MCP only.

The agent reads the published values of charts and analytics. It can also ask the server to compute values from the data.

## Before you connect

- You need an Exploratory account on exploratory.io. Sign in with it in the browser. You do not need an API key.
- The Server MCP reads only what you can view on exploratory.io: your own items, items shared with you, and your teams' items.
- The Desktop MCP needs the latest Exploratory Desktop. Get it from https://exploratory.io.
- Sign in to Exploratory Desktop. The Desktop MCP works as the user who is signed in to the app.
- Start the app before you use the Desktop MCP. Installing the plugin only registers the MCP servers. It does not start the app.
- The Desktop MCP works on macOS and Windows with the clients listed above.
- Node.js must be installed and on your PATH. The launcher and the Claude Code hooks use `node`.
- The launcher (`scripts/exploratory-desktop-mcp.js`) starts the relay (`exploratory-mcp.bundle.js`). The relay is a small program that connects the agent and Exploratory Desktop.
- The launcher looks for the relay in this order:
  1. The path in `EXPLORATORY_MCP_BUNDLE`, if you set it.
  2. macOS: `/Applications/Exploratory.app/Contents/Resources/app.nw/mcp/exploratory-mcp.bundle.js`
  3. Windows: `Program Files\Exploratory\package.nw\mcp\exploratory-mcp.bundle.js`, then `%LOCALAPPDATA%\Exploratory\package.nw\mcp\exploratory-mcp.bundle.js`

## Install

| Client | What gets installed |
|---|---|
| Claude Code | Both MCP servers, Server and Desktop skills, Claude Code-only hooks |
| Codex | Both MCP servers and Server and Desktop skills |
| Cursor (any model, including Grok) | Both MCP servers and the skills |
| Grok Bot | Server MCP only |
| Antigravity | Both MCP servers and the skills |

The skill tells the agent which tool to use for which question. It also tells the agent how to report numbers. The tools work without the skill, because the server sends short usage instructions. If a client has no Desktop MCP, the skill uses the Server MCP only.

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

Install the repository as a Cursor plugin (`.cursor-plugin`). It registers two MCP servers: `exploratory-server` and `exploratory-desktop`.

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory
```

Then sign in to the Server MCP:

```sh
agent mcp login exploratory-server
```

`exploratory-desktop` uses the Exploratory Desktop app that is running on your computer. To write the settings by hand, add both servers to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "exploratory-server": {
      "type": "http",
      "url": "https://exploratory.io/mcp"
    },
    "exploratory-desktop": {
      "type": "stdio",
      "command": "node",
      "args": ["<path to the cloned repository>/scripts/exploratory-desktop-mcp.js"]
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

The Desktop MCP uses the Exploratory Desktop app that is running on your computer. To sign in to the Server MCP:

1. Start `agy`.
2. Run `/plugin`.
3. Open the plugin `exploratory` (MCP server `exploratory-server`).
4. Choose Sign in.
5. Approve on Exploratory's consent page.
6. Paste the authorization code from the browser into `agy`.

In the Antigravity app, select Authenticate next to the server under Agent settings > Customizations.

## Try it

> List my items on Exploratory.

> What columns does the "Sales" data item on Exploratory have, and which 5 regions have the highest sales?

> In my open Exploratory project, build a monthly bar chart from the sales data.

## What agents can do

| Category | Tools |
|---|---|
| Find and read | `search` lists and searches items; `fetch` reads a note, dashboard or slide as Markdown |
| Charts and analytics | `chart_get_data` returns the numbers behind a chart; `chart_get_image` returns the chart as an image; `analytics_get_result` returns coefficients, p-values and other results |
| Data | `dataframe_get_schema` describes the columns and their approved meaning; `dataframe_preview` shows rows; `query_dataset` filters and aggregates on the server; `dataframe_export` saves a result as CSV or Parquet |

The Server MCP tools in the table are read-only. `dataframe_export` creates a download link that is valid for 15 minutes.

The Desktop MCP tools create and edit local projects. They work with these items:

- Data frames, wrangling steps, branches, parameters and connections
- Charts and analytics
- Notes and dashboards

Some Desktop MCP tools change or remove things:

- Delete charts, analytics, notes, dashboards, steps, branches, parameters and connections.
- Publish and unpublish notes, dashboards and data frames.
- Run R code with `execute_r_script`.

Review what your agent proposes before it writes. The [Exploratory MCP reference](docs/mcp.md) covers the Server MCP tools only: arguments, errors and limits. Your AI client shows the Desktop MCP tools in its tool list.

## Settings (Claude Code)

Claude Code has four plugin settings:

| Setting | Default | What it does |
|---|---|---|
| `ai_summary` | `false` | Creates and saves an AI Summary for the charts and analytics you create |
| `save_comments` | `false` | Saves an explanatory comment on the charts you create |
| `review_hook` | `false` | Asks the agent to review its work (see below and [Privacy](#privacy)) |
| `plan_gate` | `true` | Makes the agent save a plan before it builds (see [Plan gate](#plan-gate)) |

With `review_hook` on, the agent reviews its work at four times:

- Before the first `create_chart` or `create_analytics`.
- After each wrangling step.
- After a note is created.
- After chart and analytics create or edit calls. This review happens once for each chart or analytics. The limit is 8 charts and analytics together in a session. Set `EXPLORATORY_REVIEW_CHART_LIMIT` to change the limit.

To see the settings, run `claude plugin configure exploratory@exploratory`. To change them, send a JSON object to that command with `--values-stdin`. You can also set them when you install:

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

Hooks and the plan gate run only in Claude Code. Codex does not install them and does not have these settings.

### Plan gate

The plan gate stops the agent from building before it saves a plan. It is on by default (`plan_gate` = `true`).

To turn it off, set `plan_gate` to `false`. Use the `claude plugin configure` command above.

For the refused calls and the rules, see [Plan gate (Claude Code)](docs/mcp.md#plan-gate-claude-code).

## Data and permissions

- The Server MCP reads published items. The Desktop MCP can create and edit local project content. It can publish when you ask. Review the operations your agent proposes.
- Server MCP calls run as the signed-in user. They never go beyond what that user can view on exploratory.io. A publisher can turn off MCP access for an item. A publisher can also keep the rows of a data item private. These controls do not apply to the Desktop MCP. The Desktop MCP works in a different way. It works through the Exploratory Desktop app on your computer, as the user signed in to the app.
- To disconnect a client from the Server MCP, open Account Settings on exploratory.io and remove it under Connected AI Apps. This does not stop the Desktop MCP. The Desktop MCP stops when you quit Exploratory Desktop.

## Update and uninstall

| Client | Update | Uninstall |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory`, then `claude plugin update exploratory@exploratory`, and restart Claude Code | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory`, then reinstall with `codex plugin remove exploratory@exploratory` and `codex plugin add exploratory@exploratory` | `codex plugin remove exploratory@exploratory` |
| Cursor | Run `git pull` in the cloned folder and start `agent --plugin-dir` again | Stop using `--plugin-dir`; if you wrote `~/.cursor/mcp.json` by hand, remove `exploratory-server` and `exploratory-desktop` from it |
| Grok Bot | Nothing to update | Remove `exploratory-server` from Grok Bot's connections |
| Antigravity | Run `git pull` in the cloned folder, then `agy plugin install` again | Remove the plugin in Antigravity's plugin settings |

Uninstalling does not revoke Server MCP access. To revoke it, also remove the client under Connected AI Apps on exploratory.io.

## Troubleshooting

| Problem | What to do |
|---|---|
| `node` is not found | Install Node.js and add `node` to your PATH. |
| The Desktop MCP tools return a not-running error | Start Exploratory Desktop. Then use the tools again in the same conversation. |
| The launcher writes "Exploratory Desktop MCP bundle was not found. Install Exploratory or set EXPLORATORY_MCP_BUNDLE." and exits with code 1 | Install Exploratory Desktop, or set `EXPLORATORY_MCP_BUNDLE` to the path of the relay (see [Before you connect](#before-you-connect)). |
| The Server MCP asks you to sign in | Sign in again: `/mcp` in Claude Code, `codex mcp login exploratory-server` in Codex, `agent mcp login exploratory-server` in Cursor. In Grok Bot, remove the connection and add it again. |
| The Desktop MCP does not work as you expect | Check that you are signed in to Exploratory Desktop. |

## Privacy

- Server MCP: calls go to `https://exploratory.io/mcp`. They run as the signed-in user. They read published items only and are read-only. They never go beyond what that user can view.
- Desktop MCP: it runs on your computer. Its relay talks to your local Exploratory Desktop. It reads and edits local project content (data frames, charts, analytics, notes, dashboards) through the app.
- Desktop MCP usage records: Exploratory Desktop sends one usage record for each Desktop MCP tool call. It sends the record to the exploratory.io server you are signed in to. We use the records to improve the tools.
  - A record holds the tool name and its arguments. The arguments can include formulas and values you entered.
  - A record also holds these items: success or failure, and the error type and message.
  - It holds the size of the result (not the content) and the duration.
  - It holds the Exploratory Desktop version, and the AI client name and version.
  - It holds the session and item IDs.
  - Exploratory Desktop sends records only while you are signed in and AI features are on. It never sends records for local data catalog tools.
- Tool results: what a tool returns (rows, column names, chart images, errors) becomes part of your conversation. It goes to the provider of your AI (for example Anthropic, OpenAI, Google or xAI) under that provider's terms. Do not use the plugin on data that you may not send to that provider.
- Hooks (Claude Code only): they run locally with `node` and send nothing over the network.
  - The hooks write state files to the plugin data folder. If no folder is set, they write to `exploratory-plugin-review` in the system temp folder. The plugin does not delete these files. Delete them yourself if you do not want them kept.
  - With `review_hook` on, the hooks save the arguments and results of `create_chart`, `update_chart`, `create_analytics` and `update_analytics` as they are in a `-charts.json` file. This can include column names and filter values. For notes, they save the note ID or title.
  - With `plan_gate` on (the default), the hooks save a SHA-1 hash (a short code made from the text) of each R expression. They also save the paths of the report and plan files, and chart IDs. They read the `*計画*.md` and `*plan*.md` files in your working folder. These file names are in Japanese. `計画` means "plan".
  - To turn off the record hooks, set `review_hook` and `plan_gate` to `false`. You can also uninstall the plugin.
  - The `settings` hook also passes the setting values to the agent as context.
  - The `settings` hook still runs on every Desktop MCP call, also when both settings are `false`. It writes a small marker file (`-settings`) for the session in the same folder.
  - The plan-record hook starts on every call of `Skill`, `Write`, `Bash` and `PowerShell`. It also starts on these Desktop MCP calls: `execute_r_script`, `create_chart`, `get_chart_image`, `get_chart_data`, `update_chart`, `update_analytics`, `update_note`, `update_dashboard`, `create_note` and `create_dashboard`. It records nothing unless the analysis skill was used first.
- Exploratory's privacy policy: https://exploratory.io/privacy

## Support

Write to support@exploratory.io.

## Security

Do not put tokens or passwords into prompts or files. The plugin does not pass a token. The relay reads its own credentials.

The Desktop MCP marks delete operations (`delete_*`, `unpublish`) and publish operations (`publish_note`, `publish_dashboard`, `publish_data_frame`) with `destructiveHint`. This is only a hint. A client that honors it can ask you to confirm. This depends on the client and your permission settings. Copying to another project is not marked.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Docs

- [Exploratory MCP reference](docs/mcp.md): endpoint, authorization, tools, errors and limits
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Development builds

To use a development build, set these variables before you start your agent:

- `EXPLORATORY_MCP_BUNDLE`: the path of the relay file.
- `EXPLORATORY_HOME`: the app data folder of the development build.

```sh
EXPLORATORY_MCP_BUNDLE=/path/to/exploratory-mcp.bundle.js \
EXPLORATORY_HOME=/path/to/development-app-data claude
```

For Codex, end the command with `codex`.

- The launcher checks `EXPLORATORY_MCP_BUNDLE` first. Then it checks the installed app (see [Before you connect](#before-you-connect)).
- The relay inherits `EXPLORATORY_HOME` from the launcher.
- The plugin does not pass a token. The relay reads its own credentials.
- If the launcher finds no relay, it writes one error line to stderr and exits with code 1.

## License

MIT

---

## 日本語

このプラグインを使うと、AI エージェントが、exploratory.io であなたが閲覧できるアイテムを読めます。手元の Exploratory Desktop で、データ・チャート・アナリティクス・レポートを作ることもできます。

MCP（Model Context Protocol）は、AI が外のアプリを使えるようにするオープンな標準です。このプラグインは、2 つの MCP サーバーを追加します。

- Server MCP（`exploratory-server`）: exploratory.io の公開アイテムを読みます。公開アイテムは、そこに公開されたノート・ダッシュボード・スライド・チャート・アナリティクス・データです。
- Desktop MCP（`exploratory-desktop`）: 手元の Exploratory Desktop のプロジェクトを操作します。

Claude Code・Codex・Cursor・Antigravity では、2 つの MCP サーバーを両方使えます。Grok Bot（チャットで MCP サーバーを追加するクライアント）では、Server MCP だけを使えます。

エージェントは、公開されたチャートやアナリティクスの値を読みます。サーバーに、データから値を計算させることもできます。

### 使う前に

- exploratory.io の Exploratory アカウントが必要です。このアカウントで、ブラウザからサインインします。API キーは要りません。
- Server MCP が読めるのは、あなたが exploratory.io で閲覧できるものだけです。自分の公開アイテム、共有された公開アイテム、所属チームの公開アイテムが対象です。
- Desktop MCP には、Exploratory Desktop の最新版が必要です。https://exploratory.io から入手してください。
- Exploratory Desktop にサインインしてください。Desktop MCP は、アプリにサインインしている利用者として動きます。
- Desktop MCP を使う前に、アプリを起動してください。プラグインが行うのは MCP の登録までです。アプリは起動しません。
- Desktop MCP は、上のクライアントで、macOS と Windows で動きます。
- Node.js をインストールし、PATH に通してください。起動処理と Claude Code のフックは `node` を使います。
- 起動処理（`scripts/exploratory-desktop-mcp.js`）が、中継（`exploratory-mcp.bundle.js`）を起動します。中継は、エージェントと Exploratory Desktop をつなぐ小さなプログラムです。
- 起動処理は、次の順に中継を探します。
  1. `EXPLORATORY_MCP_BUNDLE` に指定したパス（指定した場合）
  2. macOS: `/Applications/Exploratory.app/Contents/Resources/app.nw/mcp/exploratory-mcp.bundle.js`
  3. Windows: `Program Files\Exploratory\package.nw\mcp\exploratory-mcp.bundle.js`、なければ `%LOCALAPPDATA%\Exploratory\package.nw\mcp\exploratory-mcp.bundle.js`

### 入れ方

| クライアント | 入るもの |
|---|---|
| Claude Code | 2 つの MCP サーバー、Server と Desktop のスキル、Claude Code 専用のフック |
| Codex | 2 つの MCP サーバー、Server と Desktop のスキル |
| Cursor（Grok を含むどのモデルでも） | 2 つの MCP サーバーとスキル |
| Grok Bot | Server MCP だけ |
| Antigravity | 2 つの MCP サーバーとスキル |

スキルは、質問に応じてどのツールを使い、数値をどう伝えるかを AI に教えます。サーバーが短い使い方を AI に渡すため、スキルがなくてもツールは使えます。Desktop MCP がないクライアントでは、スキルは Server MCP だけを使います。

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

リポジトリを Cursor のプラグイン（`.cursor-plugin`）として入れます。2 つの MCP サーバー（`exploratory-server` と `exploratory-desktop`）が登録されます。

```sh
git clone https://github.com/exploratory-io/exploratory
agent --plugin-dir ./exploratory
```

そのあと、Server MCP にサインインします。

```sh
agent mcp login exploratory-server
```

`exploratory-desktop` は、手元で起動している Exploratory Desktop を使います。設定を手で書く場合は、`~/.cursor/mcp.json` に両方のサーバーを追加します。

```json
{
  "mcpServers": {
    "exploratory-server": {
      "type": "http",
      "url": "https://exploratory.io/mcp"
    },
    "exploratory-desktop": {
      "type": "stdio",
      "command": "node",
      "args": ["<取得したリポジトリのパス>/scripts/exploratory-desktop-mcp.js"]
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

Desktop MCP は、手元で起動している Exploratory Desktop を使います。Server MCP にサインインする手順は、次のとおりです。

1. `agy` を起動します。
2. `/plugin` を実行します。
3. プラグイン `exploratory`（MCP サーバー `exploratory-server`）を開きます。
4. Sign in を選びます。
5. Exploratory の同意画面で許可します。
6. ブラウザに表示された認可コードを `agy` に貼り付けます。

Antigravity のアプリでは、エージェントの設定の Customizations で、サーバーの横の Authenticate を選びます。

### 試す

> Exploratory にある自分のアイテムを一覧して

> Exploratory の「売上」データにはどんな列がある？ 売上が一番高い地域の上位 5 つも教えて

> 開いている Exploratory のプロジェクトで、売上データから月ごとのバーのチャートを作って

### できること

| 分類 | ツール |
|---|---|
| 探す・読む | `search` で公開アイテムを一覧・検索し、`fetch` でノート・ダッシュボード・スライドを Markdown で読む |
| チャート・アナリティクス | `chart_get_data` でチャートの数値、`chart_get_image` でチャートの画像、`analytics_get_result` で係数や P 値などの結果を取る |
| データ | `dataframe_get_schema` で列の説明と承認された意味、`dataframe_preview` で行、`query_dataset` でサーバー上の絞り込みと集計、`dataframe_export` で結果を CSV か Parquet に保存 |

表の Server MCP のツールは、読み取り専用です。`dataframe_export` は、15 分間有効なダウンロードリンクを作ります。

Desktop MCP のツールは、手元のプロジェクトを作成・編集します。対象は次のとおりです。

- データフレーム・加工のステップ・ブランチ・パラメータ・接続
- チャートとアナリティクス
- ノートとダッシュボード

Desktop MCP のツールには、変更や削除を伴うものがあります。

- チャート・アナリティクス・ノート・ダッシュボード・ステップ・ブランチ・パラメータ・接続の削除
- ノート・ダッシュボード・データフレームの公開と、公開の取り消し
- `execute_r_script` による R の実行

書き込みの前に、エージェントの提案を確認してください。[Exploratory MCP リファレンス](docs/mcp.ja.md)は、Server MCP のツールだけを扱います。引数・エラー・制限を載せています。Desktop MCP のツールは、AI クライアントが表示するツール一覧で確認できます。

### 設定（Claude Code）

プラグインの設定は、Claude Code だけにあり、次の 4 つです。

| 設定 | 既定値 | 役割 |
|---|---|---|
| `ai_summary` | `false` | 作成したチャートとアナリティクスに、AI サマリを作って保存します |
| `save_comments` | `false` | 作成したチャートに、説明のコメントを保存します |
| `review_hook` | `false` | エージェントに作業の見直しを促します（下の説明と[プライバシー](#プライバシー)を見てください） |
| `plan_gate` | `true` | 計画を保存するまで、作成の操作を止めます（[計画チェック](#計画チェックplan_gate)を見てください） |

`review_hook` がオンのとき、エージェントは 4 つのときに作業を見直します。

- 最初の `create_chart` か `create_analytics` の前
- 加工のステップごとのあと
- ノートを作ったあと
- チャートとアナリティクスの作成・編集のあと。この見直しは、チャートまたはアナリティクスごとに 1 回です。上限は、1 セッションでチャートとアナリティクスを合わせて 8 件です。上限を変えるには、`EXPLORATORY_REVIEW_CHART_LIMIT` を指定します。

設定を見るには、`claude plugin configure exploratory@exploratory` を実行します。変更するには、このコマンドに `--values-stdin` を付けて、JSON オブジェクトを渡します。インストール時に指定することもできます。

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

フックと `plan_gate` は Claude Code だけで動きます。Codex には、これらを入れません。設定もありません。

#### 計画チェック（`plan_gate`）

計画チェックは、エージェントが計画を保存する前に作り始めるのを止めます。既定ではオンです（`plan_gate` = `true`）。

止めるには、`plan_gate` を `false` にします。上の `claude plugin configure` のコマンドを使います。

拒否する呼び出しと規則は、[計画チェック（Claude Code）](docs/mcp.ja.md#計画チェックclaude-code)を見てください。

### データと権限

- Server MCP は、公開アイテムを読みます。Desktop MCP は、手元のプロジェクトの内容を作成・編集し、依頼に応じて公開できます。エージェントが提案する操作を確認してください。
- Server MCP の呼び出しは、サインインした人として動きます。その人が exploratory.io で閲覧できる範囲を超えません。公開した人は、公開アイテムごとに MCP からのアクセスを止められます。データの行を非公開にすることもできます。この制御は、Desktop MCP には当てはまりません。Desktop MCP は別の仕組みです。手元の Exploratory Desktop を通して動きます。アプリにサインインしている利用者として動きます。
- Server MCP の接続を解除するときは、exploratory.io のアカウント設定の「接続中のAIアプリ」から外します。この操作では Desktop MCP は止まりません。Desktop MCP は、Exploratory Desktop を終了すると止まります。

### 更新と削除

| クライアント | 更新 | 削除 |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory` のあと `claude plugin update exploratory@exploratory` を実行し、Claude Code を再起動 | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory` のあと、`codex plugin remove exploratory@exploratory` と `codex plugin add exploratory@exploratory` で入れ直す | `codex plugin remove exploratory@exploratory` |
| Cursor | 取得したフォルダで `git pull` を実行し、もう一度 `agent --plugin-dir` で起動 | `--plugin-dir` をやめる。手で `~/.cursor/mcp.json` を書いた場合は、`exploratory-server` と `exploratory-desktop` を消す |
| Grok Bot | 更新は不要 | Grok Bot の接続の一覧から `exploratory-server` を外す |
| Antigravity | 取得したフォルダで `git pull` を実行し、もう一度 `agy plugin install` | Antigravity のプラグインの設定から外す |

削除しただけでは、Server MCP のアクセスの許可は残ります。許可も取り消すときは、exploratory.io の「接続中のAIアプリ」からもクライアントを外してください。

### トラブルシューティング

| 問題 | 対処 |
|---|---|
| `node` が見つからない | Node.js をインストールし、`node` を PATH に通します。 |
| Desktop MCP のツールが「未起動」のエラーを返す | Exploratory Desktop を起動します。そのあと、同じ会話でもう一度ツールを使います。 |
| 起動処理が「Exploratory Desktop MCP bundle was not found. Install Exploratory or set EXPLORATORY_MCP_BUNDLE.」と出力し、終了コード 1 で終わる | Exploratory Desktop をインストールするか、`EXPLORATORY_MCP_BUNDLE` に中継のパスを指定します（[使う前に](#使う前に)を見てください）。 |
| Server MCP がサインインを求める | もう一度サインインします。Claude Code は `/mcp`、Codex は `codex mcp login exploratory-server`、Cursor は `agent mcp login exploratory-server` です。Grok Bot は、接続を外してから追加し直します。 |
| Desktop MCP が思いどおりに動かない | Exploratory Desktop にサインインしているか確かめます。 |

### プライバシー

- Server MCP: 呼び出しは `https://exploratory.io/mcp` に送られ、サインインした人として動きます。読むのは公開アイテムだけで、読み取り専用です。その人が閲覧できる範囲を超えません。
- Desktop MCP: あなたのコンピューター上で動きます。中継が手元の Exploratory Desktop と通信し、アプリを通して、手元のプロジェクトの内容（データフレーム・チャート・アナリティクス・ノート・ダッシュボード）を読み、編集します。
- Desktop MCP の利用記録: Exploratory Desktop は、Desktop MCP のツールを 1 回呼び出すたびに、利用記録を 1 件、サインインしている exploratory.io のサーバーへ送ります。この記録は、ツールの改善に使います。
  - 記録には、ツールの名前と引数が入ります。引数には、利用者が入力した式や値が入ることがあります。
  - 記録には、成功したかどうかと、エラーの種類とメッセージも入ります。
  - 結果の大きさ（中身は含みません）と所要時間が入ります。
  - Exploratory Desktop の版と、AI クライアントの名前と版が入ります。
  - セッションと公開アイテムの ID が入ります。
  - Exploratory Desktop が記録を送るのは、サインインしていて、AI 機能がオンのときだけです。ローカルのデータカタログのツールでは、記録を送りません。
- ツールの結果: ツールが返すもの（行・列名・チャートの画像・エラー）は、会話の一部になります。使っている AI の提供元（例: Anthropic、OpenAI、Google、xAI）へ、その提供元の規約のもとで送られます。その提供元へ送ってはいけないデータには、このプラグインを使わないでください。
- フック（Claude Code のみ）: `node` でローカルに動き、ネットワークには何も送りません。
  - フックは、状態ファイルをプラグインのデータフォルダに書きます。フォルダが未設定のときは、システムの一時フォルダの `exploratory-plugin-review` に書きます。プラグインは、このファイルを消しません。残したくなければ、自分で消してください。
  - `review_hook` がオンのときは、フックが `-charts.json` に、`create_chart`・`update_chart`・`create_analytics`・`update_analytics` の引数と結果を、そのまま保存します。列名やフィルタの値が入ることがあります。ノートは、ノート ID か題名を保存します。
  - `plan_gate`（既定はオン）がオンのときは、フックが、R 式から作った SHA-1 ハッシュ（文字列から作る短いコード）を保存します。レポートと計画ファイルのパスと、チャートの ID も保存します。作業フォルダの `*計画*.md` と `*plan*.md` も読みます。これらのファイル名は日本語です。`計画` は「plan」の意味です。
  - 記録のフックを止めるには、`review_hook` と `plan_gate` を `false` にします。プラグインを削除しても止まります。
  - `settings` のフックは、設定の値をコンテキストとしてエージェントにも渡します。
  - `settings` のフックは、Desktop MCP を呼び出すたびに起動します。2 つの設定が `false` でも同じです。同じフォルダに、セッションごとの小さな目印のファイル（`-settings`）を書きます。
  - 計画記録のフックは、`Skill`・`Write`・`Bash`・`PowerShell` を呼び出すたびに起動します。次の Desktop MCP の呼び出しでも起動します。対象は次のとおりです: `execute_r_script`・`create_chart`・`get_chart_image`・`get_chart_data`・`update_chart`・`update_analytics`・`update_note`・`update_dashboard`・`create_note`・`create_dashboard`。分析のスキルを先に使っていなければ、何も記録しません。
- Exploratory のプライバシーポリシー: https://exploratory.io/privacy

### サポート

support@exploratory.io へご連絡ください。

### セキュリティ

トークンやパスワードを、プロンプトやファイルに書かないでください。プラグインはトークンを渡しません。中継が自分で認証情報を読みます。

Desktop MCP は、削除する操作（`delete_*`、`unpublish`）と公開する操作（`publish_note`・`publish_dashboard`・`publish_data_frame`）に `destructiveHint` を付けています。これは目印にすぎません。目印に従うクライアントは、実行前に確認を求めることがあります。確認の有無は、クライアントと権限の設定で変わります。別プロジェクトへのコピーには付けていません。

脆弱性を見つけたときは、[SECURITY.md](SECURITY.md)（英語のみ）に従って報告してください。

### ドキュメント

- [Exploratory MCP リファレンス](docs/mcp.ja.md): エンドポイント・認証・ツール・エラー・制限
- [セキュリティポリシー](SECURITY.md)（英語のみ）
- [変更履歴](CHANGELOG.md)

### 開発版を使う

開発版を使うときは、エージェントを起動する前に、次の環境変数を指定します。

- `EXPLORATORY_MCP_BUNDLE`: 中継のファイルのパス
- `EXPLORATORY_HOME`: 開発版のアプリのデータフォルダ

```sh
EXPLORATORY_MCP_BUNDLE=/path/to/exploratory-mcp.bundle.js \
EXPLORATORY_HOME=/path/to/development-app-data claude
```

Codex では、コマンドの末尾を `codex` にします。

- 起動処理は、最初に `EXPLORATORY_MCP_BUNDLE` を調べます。次に、インストールしたアプリを調べます（[使う前に](#使う前に)を見てください）。
- 中継は、起動処理から `EXPLORATORY_HOME` を引き継ぎます。
- プラグインはトークンを渡しません。中継が自分で認証情報を読みます。
- 起動処理が中継を見つけられないときは、標準エラーに 1 行を出し、終了コード 1 で終わります。

### ライセンス

MIT
