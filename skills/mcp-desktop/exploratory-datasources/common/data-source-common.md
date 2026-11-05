
When the source is a data source plugin type (the type list of get_data_source_params: databases such as PostgreSQL and MySQL, FRED, stock prices, GitHub and others), do not write R.
Call get_data_source_params with the type, then create_data_source with source: {type, connection_id, params} instead of r_script; for a database the SQL goes in params.query.
The saved step reopens in the import dialog. Pass no host, user or password: they come from the connection_id (lookup_connection).
Use the r_script path below only for other sources, or when get_data_source_params or create_data_source rejects the type.
Start any other retrieval request with identify_data_source and read its returned reference before writing R.
For PDFs, list_pdf_tables identifies the tables; extract_pdf_tables extracts the requested tables, then create_data_source saves the retrieval R as an R script source.
Follow the retrieval sequence below, which is the same sequence Exploratory's AI Data feature uses. Its procedure sources are
ai-data-config/prompts/procedures/file.md (file structure), procedures/db.md
(connections and schema), and procedures/api.md (response structure); the steps below already carry what you need from them.

For text files, inspect the header with read_file_header before writing retrieval R.
For Excel, use execute_r_script to inspect sheet names and a few rows from the intended
sheet. Confirm ambiguous sheets and sources in ordinary text before choosing them.
For databases and OAuth services, use lookup_connection to identify an allowed connection.
Use its returned placeholders verbatim; never request, display or embed credential values.
Confirm the connection with lookup_connection when needed → read its source's reference with lookup_reference → write R using that syntax and the returned connection placeholders; for sources without a connection, look up the source type directly.
The reference is shared with AI Data. Follow its retrieval syntax; save the final R with
create_data_source here. If it describes AI Data's script declaration or selection dialog,
use create_data_source for saving and ordinary text for questions instead.
Use the relevant AI Data service package and retrieval procedure when known. Do not invent
service fields or an endpoint; resolve uncertain service details before fetching.
Check saved schema with search_schema before live exploration. For hierarchical databases,
use list_schema_nodes and carry its returned path into later calls. Saved schema describes
only previously inspected objects, not everything the service can return.
For databases, use sample_collections with sample_size: 0 for names, then sample only the requested tables.
Save discovered names as stubs with empty columns using save_schema_info; add descriptions
and column metadata only after inspecting samples. Do not save row values or secrets.
For API sources, use lookup_reference instead of sample_collections, then execute_r_script for a small request to confirm response fields and nesting.
OAuth refresh and credential resolution use the existing Desktop execution; if authentication
fails, report the error and direct the user to the connection settings.

After exploration, call create_data_source with dataFrameName, the final r_script, and
connection_ids. The final R must return the complete requested data frame, retaining connection
placeholders. A sample or a temporary R result does not finish a retrieval request.
Confirm the returned saved dataFrameId with get_data_frame, including its source step, columns
and row count. Report success only from the saved result. If preview or registration fails,
report that failure instead of claiming the data was saved.

<data_source_file_rules>
ファイルの取得:
PDFは list_pdf_tables で表を確認し、extract_pdf_tables で対象を抽出して、取得Rを create_data_source で保存する。
新しい取得依頼では最初に identify_data_source を呼び、返ったリファレンスを読む。
1. 指定されたパスを使う。不明なら確認する。CSV等は read_file_header で文字コード・区切り・列名・ヘッダー位置を調べる。Excelは execute_r_script で readxl::excel_sheets と対象シートの先頭数行を確認する。複数ファイルでは全ファイルのシートを調べ、対象が曖昧なら文章で確認する。
2. 接続が必要なら lookup_connection で接続を確かめる → lookup_reference で接続先のリファレンスを読む → その書き方と返ったプレースホルダーで R を書く。接続不要ならファイルの種類で lookup_reference を呼ぶ。
execute_r_script で読み込みRを確認する。文字コード・区切り・ヘッダー位置を反映し、型変換はDesktopに任せる。最終Rは下見の件数制限を外し、依頼された全ファイル・シートを含むデータフレームを返す。
3. create_data_source に dataFrameName、最終 r_script、connection_ids（接続不要なら空配列）を渡して保存する。返った dataFrameId を get_data_frame で開き、ソースステップ・行数・列を確認してから結果を伝える。
よくある失敗: 文字化けは検出した fileEncoding を指定して読み直す。列名が ...1 等なら先頭を再確認し、タイトル行をスキップして正しいヘッダーを読む。
</data_source_file_rules>
<data_source_db_rules>
DBの取得:
データソースの種類（get_data_source_params の種類一覧）にある DB は R を書かず、種類で保存する。以下は、その種類にない DB を R で取得するときの手順。
新しい取得依頼では最初に identify_data_source を呼び、返ったリファレンスを読む。
1. lookup_connection で選択済み接続を確かめる → lookup_reference で接続先のリファレンスを読む → その書き方と返ったプレースホルダーで R を書く。秘密値は表示しない。
2. search_schema で保存済み列を確認する。同梱schemaがあれば使う。階層DBは list_schema_nodes のpathを後続探索に渡す。不足時は sample_collections（sample_size: 0）で名前を調べ、対象だけをサンプルする。save_schema_info で名前のスタブ（空のcolumns）、確認後の列情報を保存し、行の値は保存しない。
3. 接続先の手順に従い execute_r_script で取得Rを確認する。絞り込み・集計はクエリ側で行い、最終Rでは下見用の制限を外す。
4. create_data_source に dataFrameName、プレースホルダー付き r_script、connection_ids を渡す。返った dataFrameId を get_data_frame で開き、ソースステップ・行数・列を確認する。
失敗への対処: 未記録のテーブルは一覧を探索する。sample_collections が未対応なら execute_r_script で少量サンプルを確認する。
</data_source_db_rules>
<data_source_oauth_rules>
OAuthサービスの取得:
データソースの種類（get_data_source_params の種類一覧）にあるサービスは R を書かず、種類で保存する。以下は、その種類にないサービスを R で取得するときの手順。
新しい取得依頼では最初に identify_data_source を呼び、返ったリファレンスを読む。
1. lookup_connection で選択済み接続を確かめる → lookup_reference で接続先のリファレンスを読む → その書き方と返ったプレースホルダーで R を書く。トークンを要求・表示・保存Rへ埋め込まない。
2. BigQuery等のDBはDBの探索手順（search_schema、必要なら list_schema_nodes と sample_collections）を使う。APIの種類では sample_collections ではなく lookup_reference を使い、execute_r_script で少量の応答を取得して実際の項目と入れ子を確認する。
3. execute_r_script で取得Rを確認する。OAuthの更新とRへの設定は既存Desktop処理に任せる。最終Rは依頼範囲のデータフレームを返す。
4. create_data_source に dataFrameName、プレースホルダー付き r_script、connection_ids を渡す。返った dataFrameId を get_data_frame で開き、ソースステップ・行数・列を確認する。
よくある失敗: 認証エラーはエラー内容を伝え、接続設定で再認証してから再実行する。接続が見つからなければ対象サービスの接続を選択してもらい、lookup_connection で確認し直す。
</data_source_oauth_rules>
<data_source_api_rules>
APIの取得:
データソースの種類（get_data_source_params の種類一覧）にある API は R を書かず、種類で保存する。以下は、その種類にない API を R で取得するときの手順。
新しい取得依頼では最初に identify_data_source を呼び、返ったリファレンスを読む。
1. 認証が必要なら lookup_connection で選択済み接続を確かめる → lookup_reference で接続先のリファレンスを読む → その書き方と返ったプレースホルダーで R を書く。接続不要なら取得元の種類で lookup_reference を呼ぶ。キーの値を要求・表示しない。
APIの種類では sample_collections ではなく lookup_reference を使う。
2. 保存済みschemaで分かる部分は再探索しない。不足する項目は execute_r_script の少量リクエストで列名・型・入れ子の末端まで確認する。URLや項目名を推測せず、個人情報・秘密値は説明に転載しない。
3. execute_r_script で取得Rを確認する。最終Rは下見用の件数制限を外し、サービスのページング手順に従って依頼範囲を取得し、必要な入れ子を表にしてデータフレームを返す。
4. create_data_source に dataFrameName、最終 r_script、connection_ids（接続不要なら空配列）を渡す。返った dataFrameId を get_data_frame で開き、ソースステップ・行数・列を確認する。
よくある失敗: 列が無ければ少量応答の実際の項目名・入れ子を見直す。認証エラーは接続設定で認証を確認し、秘密値をRへ直接書かず再実行する。
</data_source_api_rules>
