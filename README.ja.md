# Exploratory プラグイン

[English](README.md)

このプラグインは、Claude Code、Codex、Cursor などの AI クライアントを、MCP（Model Context Protocol）で Exploratory につなぎます。プラグインは 2 つあります。

- **Exploratory Server**: [exploratory.io](https://exploratory.io) にパブリッシュされたノート、ダッシュボード、スライド、チャート、アナリティクス、データを読みます。自分のアカウントに非公開のページ（HTML ページ）を作成し、自分またはチームのページを更新・削除することもできます。
- **Exploratory Desktop**: 手元の Exploratory Desktop で、プロジェクトを作成・編集します。

## 使う対象に合わせてプラグインを選ぶ

下の表で自分に合うものを選び、そのガイドに沿って進めてください。

| やりたいこと | ガイド | 入れるもの |
|---|---|---|
| exploratory.io にパブリッシュされたコンテンツを読む・集計する。ページを作成する | [Server だけを使う](#ガイド-1-server-だけを使う) | Exploratory Server |
| Exploratory Desktop で、データ・チャート・アナリティクス・ノート・ダッシュボードを作る | [Desktop だけを使う](#ガイド-2-desktop-だけを使う) | Exploratory Desktop v17.2と、Exploratory Desktop プラグイン |
| 両方 | [Server と Desktop を両方使う](#ガイド-3-server-と-desktop-を両方使う) | 上の両方 |

| プラグイン | プラグイン名 | 入手先 |
|---|---|---|
| [Exploratory Server](plugins/exploratory-server/README.md) | `exploratory-server`（0.1.6） | 各 AI クライアントの公式のプラグイン一覧 |
| [Exploratory Desktop](plugins/exploratory-desktop/README.md) | `exploratory`（17.2.0） | このリポジトリのマーケットプレイス（`exploratory-io/exploratory`） |

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

Cursor、Grok Bot などは、[MCP リファレンス](docs/mcp.ja.md)を見てください。Claude アプリ、ChatGPT アプリなど、クライアントごとの手順は[AI ツールから追加する](https://docs.exploratory.io/ja/mcp/server/clients/apps)にあります。

入れ方は 1 つだけにしてください（公式のプラグイン、URL の直接追加、claude.ai の Exploratory のコネクタのどれか。claude.ai のコネクタは、同じ Claude のアカウントでサインインした Claude Code にも出てきます）。あとで公式の一覧から入れるときは、先に直接足した分を外します（例: `claude mcp remove exploratory-server`）。外さないと、同じツールが 2 組表示されます。

### 手順 2. サインインする

新しいセッションを始めて、サインインします。Claude Code では `/mcp` を開き、`exploratory-server` を選んで、ブラウザでサインインします。Codex では `codex mcp login exploratory-server` を実行します（上のコマンドに含まれています）。Cursor では、Customize > MCPs の `exploratory-server` の行で「Authenticate」を選ぶか、`agent mcp login exploratory-server` を実行します。Exploratory にサインインして、アクセスを許可してください。API キーは要りません。サーバーや定期ジョブなど、ブラウザを開けない環境では、代わりに API キーで接続します。[認証と API キー](https://docs.exploratory.io/ja/mcp/server/auth#apikey)を見てください。

### 手順 3. 試す

> Exploratory にある自分のパブリッシュされたコンテンツを一覧して

> Exploratory の「売上」データにはどんな列がある？ 売上が一番高い地域の上位 5 つも教えて

## ガイド 2: Desktop だけを使う

次のものが必要です。

- Exploratory Desktop v17.2。サインインして、起動しておきます。起動すると、`exploratory-mcp` コマンドが PATH に入ります。プラグインは、このコマンドを起動します。macOS で、ディスクイメージから直接動かすと、このコマンドは入りません。Exploratory をアプリケーションフォルダに移してから起動してください。
- Claude Code で使う場合は、PATH に `node`。プラグインのレビューのフックが使います。

### 手順 1. システム設定で MCP をオンにして、プラグインを入れる

Exploratory Desktop で、画面の左下にある自分の名前を選び、開いたメニューで「システム設定」を選びます。画面の画像つきの手順は、[プラグインのインストール](https://docs.exploratory.io/ja/mcp/desktop/install)にあります。

1. 左のメニューで「MCP / CLI」を選びます。
2. 「MCP」のスイッチをオンにします。初期状態ではオフです。オフの間は、下のプラグインの欄が薄く表示され、ボタンを押せません。
3. 「Exploratory デスクトップ プラグインのインストール」の欄に、このコンピューターの AI ツール（Claude Code、ChatGPT（Codex）、Antigravity、Cursor）が並びます。使う AI ツールの行の「インストール」を選びます。インストールしたあとは、その AI ツールを起動し直してください。
4. チャートやノートなどを AI に作成・変更させるときだけ、「作成、変更、削除を許可する」にチェックを入れます。チェックがないと、AI は読み取りだけができます。
5. 画面の下にある「保存」を選びます。保存しないと、「MCP」のスイッチと「作成、変更、削除を許可する」の設定は反映されません。

### システム設定から入れられないとき

Exploratory Desktop がネットワークに接続できないときなどは、手作業で入れます。このプラグインは公式の一覧にはないので、このリポジトリをマーケットプレイスとして足してから、プラグインを入れます。コマンドは自分で打つか、AI ツールに実行を頼んでください。Claude アプリ・ChatGPT アプリ・Cursor の画面から入れる手順は、[プラグインのインストール](https://docs.exploratory.io/ja/mcp/desktop/install#manual)を見てください。

下のコマンドは Exploratory Desktop 17.2 用で、`desktop-17.2` ブランチから入れます。Exploratory Desktop 17.1 以前では、[`main` ブランチ](https://github.com/exploratory-io/exploratory/tree/main#readme)の README に従ってください（[リリースライン](docs/release-lines.md)、英語）。以前にブランチを付けずにマーケットプレイスを足していた場合は、先に外してください（`claude plugin marketplace remove exploratory`、または `codex plugin marketplace remove exploratory`）。

#### Claude Code

```sh
claude plugin marketplace add exploratory-io/exploratory#desktop-17.2
claude plugin install exploratory@exploratory
```

Claude Code の `/plugin` から、マーケットプレイス `exploratory-io/exploratory` を足して、`exploratory` を選んで入れることもできます。

#### Codex

```sh
codex plugin marketplace add exploratory-io/exploratory@desktop-17.2
codex plugin add exploratory@exploratory
```

#### Antigravity

```sh
git clone --branch desktop-17.2 https://github.com/exploratory-io/exploratory
agy plugin install ./exploratory/plugins/exploratory-desktop
```

Git が必要です。入れたプラグインは、Antigravity のアプリの Customizations > Installed に表示されます。

#### Cursor

```sh
git clone --branch desktop-17.2 --depth 1 https://github.com/exploratory-io/exploratory
mkdir -p ~/.cursor/plugins/local
cp -R exploratory/plugins/exploratory-desktop ~/.cursor/plugins/local/exploratory
```

Git が必要です。システム設定が使うのと同じフォルダにプラグインをコピーします。Cursor を終了して起動し直してください。

入れたあとは、手順 1 のとおり、**システム設定 > MCP / CLI** で「MCP」のスイッチをオンにして「保存」を選びます。

### 手順 2. つながりを確かめて試す

新しいセッションを始めます。Claude Code では `/mcp` を開き、`exploratory-desktop` がつながっていることを確かめます。Codex では `codex mcp list` を実行し、`exploratory-desktop` が出ることを確かめます。Antigravity では、アプリの Customizations > Installed にプラグインが出ることを確かめます。Cursor では、システム設定の Cursor の行に「インストール済み - v」とプラグインのバージョンが出ることを確かめます。Exploratory Desktop でプロジェクトを開いてから、次のように頼みます。

> 開いている Exploratory のプロジェクトのデータフレームを一覧して

これは「作成、変更、削除を許可する」がオフでも動きます。チャートの作成も試すときは、先に「作成、変更、削除を許可する」にチェックを入れて「保存」を選んでください。

AI ツールが初めて接続すると、Exploratory Desktop に許可を求める画面が出ます。自分で起動したアプリだけ「許可する」を選んでください。MCP がオフだと言われたら、手順 1 に戻り、「MCP」のスイッチをオンにして「保存」を選んだかを確かめてください。ほかのメッセージは、[トラブルシューティング](https://docs.exploratory.io/ja/mcp/desktop/troubleshooting)を見てください。

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
| チャート・アナリティクス | `chart_get_data` でチャートの数値、`chart_get_image` でチャートの画像、`analytics_get_result` で係数や P 値などの結果を取り、`chart_query` でノート・ダッシュボード・スライドの中のチャートのデータをサーバー上で絞り込み・集計する |
| データ | `dataframe_get_schema` で列の説明と承認された意味、`dataframe_preview` で行、`query_dataset` でサーバー上の絞り込みと集計、`dataframe_export` で結果を CSV か Parquet に保存し、`dataframe_get_wrangling` でデータがどう作られたかをステップごとに見ます |
| ページ | `get_page_guide` でページの書き方、`page_publish` でデータをその場で問い合わせる 1 つの HTML ファイルを非公開のページとして公開、`page_update`・`page_list`・`page_get`・`page_delete` でページの変更・一覧・読み取り・削除を行う |
| Desktop の設定 | `desktop_mcp_setup_guide` で、AI クライアントを Exploratory Desktop につなぐ手順を返す |

Server MCP のうち、探す・読む・問い合わせるツールは読み取り専用です。`dataframe_export` は、ダウンロードリンクを作ります（既定で 15 分間有効）。ページのツール `page_publish`・`page_update`・`page_delete` は、自分のアカウントにページを作成し、自分またはチームのページを変更・削除します。作れるページの数と変更できるかどうかは、プランによります。ブラウザでサインインするときに承認する `page:write` の権限が必要です。権限の無い接続は、つなぎ直してください。API キーでも、ページを読むこと（`get_page_guide`・`page_list`・`page_get`）はできますが、作成・変更・削除はできません。

Desktop MCP のツールは、手元のプロジェクトを作成・編集します。対象は次のとおりです。

- プロジェクト（開く・保存・インポート・履歴）、データフレーム・加工のステップ・ブランチ・パラメータ・接続
- ローカルのデータカタログ、R パッケージ、パレット、辞書、AI 関数とノートのプロンプトのテンプレート
- チャートとアナリティクス
- ノートとダッシュボード

Desktop MCP のツールには、変更や削除を伴うものがあります。

- チャート・アナリティクス・ノート・ダッシュボード・ステップ・ブランチ・パラメータ・接続・カタログのアイテム・R パッケージ・パレット・テンプレートの削除
- ノート・ダッシュボード・データフレーム・プロジェクトの公開と、公開の取り消し
- `update_system_settings` による Exploratory のシステム設定の変更
- `execute_r_script` による R の実行

書き込みの前に、エージェントの提案を確認してください。[Exploratory MCP リファレンス](docs/mcp.ja.md)には、Server MCP のツールについて、引数・エラー・制限を載せています。Desktop MCP のツールは、AI クライアントが表示するツール一覧で確認できます。

## 設定（Claude Code）

プラグインの設定は、Claude Code だけにあり、次の 3 つです。

| 設定 | 既定値 | 役割 |
|---|---|---|
| `ai_summary` | `false` | 作成したチャートとアナリティクスに、AI サマリを作って保存します |
| `save_comments` | `false` | 作成したチャートに、説明のコメントを保存します |
| `review_hook` | `false` | エージェントが作業の途中と最後に、自分の作ったものを見直します。問題があればその場で直し、直せなかった点は報告します。見直すのは、チャートやアナリティクス、加工のステップなどを作ったあとです。また、製品のコマンドでできる加工をカスタム R で書こうとしたときは止めて、製品のコマンドで作り直すよう促します。最後の報告の前には、ノートやダッシュボードの全体も画像で点検します。下の説明と[プライバシー](#プライバシー)を見てください。 |

`review_hook` がオンのとき、エージェントは次のタイミングで作業を見直します。

- 最初の `create_chart` か `create_analytics` の前
- 加工のステップごとのあと
- ノートを作ったあと
- チャートとアナリティクスの作成・編集のあと
  - 見直しは、チャートまたはアナリティクスごとに 1 回です。
  - 1 セッションの上限は、チャートとアナリティクスを合わせて 8 件です。
  - 上限を変えるには、`EXPLORATORY_REVIEW_CHART_LIMIT` を指定します。

`review_hook` がオンのときは、フックがカスタム R のステップ（`exp_custom`）の形も点検し、最後の報告の前に、ノートまたはダッシュボードの各ページの全体画像を 1 回見るようエージェントに求めます。点検と規則は、[レビューフック（Claude Code）](docs/mcp.ja.md#レビューフックclaude-code)を見てください。

設定を見るには、`claude plugin configure exploratory@exploratory` を実行します。変更するには、このコマンドに `--values-stdin` を付けて、JSON オブジェクトを渡します。値は、JSON の真偽値ではなく、文字列の `"true"` か `"false"` です（例: `{"review_hook": "true"}`）。インストール時に指定することもできます。

```sh
claude plugin install exploratory@exploratory \
  --config ai_summary=true \
  --config save_comments=true \
  --config review_hook=true
```

Desktop パッケージでは、Claude Code の定義からフックと設定を接続しています。現在の Codex プラグイン定義では、これらのフックと設定は未接続です。Codex 自体にはフックの仕組みがあります。

## データと権限

- Server MCP は、パブリッシュされたコンテンツを読み、自分またはチームのページを公開・管理できます。Desktop MCP は、手元のプロジェクトの内容を作成・編集し、依頼に応じて公開できます。エージェントが提案する操作を確認してください。
- Server MCP の呼び出しは、サインインした人として動きます。その人が exploratory.io で閲覧できる範囲を超えません。公開した人は、パブリッシュされたコンテンツごとに MCP からのアクセスを止められます。データの行を非公開にすることもできます。
- Desktop MCP には、この制御は当てはまりません。Desktop MCP は、手元の Exploratory Desktop を通して、アプリにサインインしている利用者として動きます。
- Server MCP の接続を解除するときは、exploratory.io のアカウント設定の「接続中のAIアプリ」から外します。API キーで接続した場合は、「アカウント設定 > API キー」でそのキーを取り消します。この操作では Desktop MCP は止まりません。Desktop MCP は、Exploratory Desktop を終了すると止まります。
- **システム設定 > MCP / CLI** の**承認済みのアプリ**から、承認したアプリを取り消せます。取り消したアプリは、次の接続でもう一度承認を求めます。

## 更新と削除

Desktop プラグインの更新と削除は、入れた方法によって違います。Server は、導入した公式マーケットプレイスから更新・削除してください。

- システム設定から入れた場合: 新しいバージョンがあると、**システム設定 > MCP / CLI** のその AI ツールの行に「アップデート」が出ます。削除するときは、同じ行の「削除」を選びます。
- コマンドで入れた場合:

| クライアント | 更新 | 削除 |
|---|---|---|
| Claude Code | `claude plugin marketplace update exploratory` のあと `claude plugin update exploratory@exploratory` を実行し、Claude Code を再起動 | `claude plugin uninstall exploratory@exploratory` |
| Codex | `codex plugin marketplace upgrade exploratory` のあと、`codex plugin remove exploratory@exploratory` と `codex plugin add exploratory@exploratory` で入れ直す | `codex plugin remove exploratory@exploratory` |
| Antigravity | 取得したフォルダで `git pull` を実行し、続けて `agy plugin install ./plugins/exploratory-desktop` を実行 | Antigravity のプラグインの設定から外す |
| Cursor | 取得したフォルダで `git pull` を実行し、`rm -rf ~/.cursor/plugins/local/exploratory && cp -R plugins/exploratory-desktop ~/.cursor/plugins/local/exploratory` のあと Cursor を再起動 | `rm -rf ~/.cursor/plugins/local/exploratory` のあと Cursor を再起動 |

削除しただけでは、Server MCP のアクセスの許可は残ります。許可も取り消すときは、exploratory.io の「接続中のAIアプリ」からもクライアントを外してください。API キーで接続した場合は、「アカウント設定 > API キー」でそのキーを取り消します。

## トラブルシューティング

| 問題 | 対処 |
|---|---|
| `exploratory-mcp` が見つからない | Exploratory Desktop v17.2を起動します。起動するとコマンドが入ります。macOS で Exploratory がディスクイメージか一時的な場所から動いていると、コマンドは入りません。Exploratory をアプリケーションフォルダに移して起動し直し、**システム設定 > MCP / CLI** のその AI ツールの行で「再インストール」を選びます。`/usr/local/bin` に入れられなかったときは、置いた場所がシステム設定に表示されます。そのあと AI クライアントを再起動します。 |
| Claude Code のフックで `node` が見つからない | Node.js を入れ、`node` を PATH に通します。 |
| Desktop MCP のツールが、アプリが起動していないというエラーを返す | Exploratory Desktop を起動します。そのあと、同じ会話でもう一度ツールを使います。 |
| Server MCP がサインインを求める | ブラウザでサインインする接続なら、もう一度サインインします。Claude Code は `/mcp`、Codex は `codex mcp login exploratory-server`、Cursor は `agent mcp login exploratory-server` です。Grok Bot は、接続を外してから追加し直します。API キーで接続している場合は、サインインでは直りません。アカウントが引き続き API キーを使えるかを確かめ、無効・期限切れ・取り消し済みのキーを「アカウント設定 > API キー」で作り直します（キーを作れるのは Author です）。 |
| Desktop MCP が思いどおりに動かない | Exploratory Desktop にサインインしているか確かめます。 |

## プライバシー

- Server MCP: 呼び出しは `https://exploratory.io/mcp` に送られます。読むのはパブリッシュされたコンテンツです。自分またはチームのページの公開・管理もできます。権限は[データと権限](#データと権限)を見てください。
- Desktop MCP: あなたのコンピューター上で動きます。中継が手元の Exploratory Desktop と通信し、アプリを通して、手元のプロジェクトの内容（データフレーム・チャート・アナリティクス・ノート・ダッシュボード）を読み、編集します。
- Desktop MCP の利用記録: Exploratory Desktop は、Desktop MCP のツールを 1 回呼び出すたびに、利用記録を 1 件、サインインしている exploratory.io のサーバーへ送ります。この記録は、ツールの改善に使います。
  - 記録には、ツールの名前が入り、引数が入ることもあります。引数には、利用者が入力した式や値が入ることがあります。長さや入れ子の深さが上限を超える引数は省かれます。
  - 記録には、成功したかどうかと、エラーの種類とメッセージも入ります。
  - 結果の大きさ（中身は含みません）と所要時間も入ります。
  - Exploratory Desktop のバージョン、AI クライアントの名前とバージョン、セッションとアイテムの ID が入ります。
  - Exploratory Desktop が記録を送るのは、サインインしていて、AI 機能がオンのときだけです。ローカルのデータカタログのツールでは、記録を送りません。
- ツールの結果: ツールが返すもの（行・列名・チャートの画像・エラー）は、会話の一部になります。使っている AI の提供元（例: Anthropic、OpenAI、Google、xAI）へ、その提供元の規約のもとで送られます。その提供元へ送ってはいけないデータには、このプラグインを使わないでください。
- フック（現在の接続先は Claude Code）: フックは、エージェントの操作の前後に自動で動く小さなプログラムです。ここのフックは `node` でローカルに動き、ネットワークには何も送りません。
  - 状態ファイル: フックは、プラグインのデータフォルダに書きます。フォルダが未設定のときは、システムの一時フォルダの `exploratory-plugin-review` に書きます。プラグインは、このファイルを消しません。残したくなければ、自分で消してください。
  - 見直しのフック: `review_hook` がオンのときは、次のツールの成功した呼び出しの引数と結果から取り出した項目を、チャートまたはアナリティクスごとにまとめて `-charts.json` に保存します。列名やフィルタの値が入ることがあります。
    - `create_chart`
    - `update_chart`
    - `create_analytics`
    - `update_analytics`
  - ノートについては、フックがノート ID か題名を保存します。
  - 記録のフック: `review_hook` がオンのときは、フックが次のものも保存します。
    - カスタム R の式から作った SHA-1 ハッシュ（文字列から作る短いコード）と、カスタム R のステップを拒否した回数
    - R のレポート（HTML）のパス
    - チャートの ID
    - 分析のスキルを使った後に作ったノート・ダッシュボードの ID と、そこに載せたチャートの ID・ページの構成
    - R の結果と、Number・折れ線のチャートのデータにある数値
  - 記録のフックは、`Skill`・`Write`・`Bash`・`PowerShell` を呼び出すたびに起動します。次の Desktop MCP の呼び出しでも起動します。
    - `execute_r_script`、`get_chart_image`、`get_chart_data`
    - `create_chart`、`update_chart`、`create_analytics`、`update_analytics`、`delete_chart`、`delete_analytics`
    - `create_note`、`update_note`、`get_note_image`
    - `create_dashboard`、`update_dashboard`、`get_dashboard`、`get_dashboard_image`
  - 分析のスキルを使う前でも、R を実行した印、R の結果の数値、チャートの ID は記録します。R のレポート（HTML）のパスを記録するのは、分析のスキルを使った後だけです。
  - 画像のフック: `review_hook` のオン・オフにかかわらず動きます。`review_hook` がオフのときは、`get_note_image` と `get_dashboard_image` の前に、コンピューター上の会話の記録を読み、直前の依頼に画像を頼む言葉があるかを調べます。依頼を読めないときは、呼び出しを通します。画像やスクリーンショットを頼んでいなければ、呼び出しを止め、値は `get_chart_data` か `get_dashboard` で読むようエージェントに伝えます。`review_hook` がオンのときは止めません。
  - 設定のフック: 設定の値をコンテキストとしてエージェントにも渡します。Desktop MCP を呼び出すたびに起動し、`review_hook` が `false` でも同じです。状態ファイルのフォルダに、セッションごとの小さな目印のファイル（`-settings`）を書きます。
  - 記録のフックを止めるには、`review_hook` を `false` にします。プラグインを削除しても止まります。
- Exploratory のプライバシーポリシー: https://exploratory.io/privacy

## サポート

https://exploratory.io/ の右下のチャットか、support@exploratory.io へご連絡ください。

利用規約: https://exploratory.io/terms

## セキュリティ

トークンやパスワードを、プロンプトやファイルに書かないでください。プラグインはトークンを渡しません。中継が自分で認証情報を読みます。

Desktop MCP は、削除する操作（`delete_*`、`unpublish`）と公開する操作（`publish_*`: `publish_note`・`publish_dashboard`・`publish_data_frame`・`publish_project`）に `destructiveHint` を付けています。これは目印にすぎません。目印に従うクライアントは、実行前に確認を求めることがあります。確認の有無は、クライアントと権限の設定で変わります。別のプロジェクトへコピーする操作には付けていません。

Exploratory Desktop 自身も、リスクの高い呼び出しを実行する前に確認します。**システム設定 > MCP / CLI** の 2 つのスイッチ「削除・パブリッシュ・設定の変更を確認なしで実行する」「コード実行・AI処理を確認なしで実行する」で省けます。

脆弱性を見つけたときは、[SECURITY.md](SECURITY.md)（英語のみ）に従って報告してください。

## ドキュメント

- [Exploratory MCP リファレンス](docs/mcp.ja.md): エンドポイント・認証・ツール・エラー・制限
- [Exploratory MCP のドキュメント](https://docs.exploratory.io/ja/mcp): 画面の画像つきの詳しい手順
  - [Server](https://docs.exploratory.io/ja/mcp/server): AI ツールごとの接続、[認証と API キー](https://docs.exploratory.io/ja/mcp/server/auth)、[データと権限](https://docs.exploratory.io/ja/mcp/server/data)、[トラブルシューティング](https://docs.exploratory.io/ja/mcp/server/troubleshooting)
  - [Desktop](https://docs.exploratory.io/ja/mcp/desktop): [プラグインのインストール](https://docs.exploratory.io/ja/mcp/desktop/install)、[許可の範囲と設定](https://docs.exploratory.io/ja/mcp/desktop/permissions)、[データと権限](https://docs.exploratory.io/ja/mcp/desktop/data)、[トラブルシューティング](https://docs.exploratory.io/ja/mcp/desktop/troubleshooting)
- [セキュリティポリシー](SECURITY.md)（英語のみ）
- [変更履歴](CHANGELOG.md)

## ライセンス

MIT
