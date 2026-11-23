# Exploratory で作るときの製品の使い方と、作った後の確かめ方（いつも読む）

## 加工

加工は次の 3 つの規則で決める。
(1) 分岐は、1 行の単位が変わり（集計、ロング型・ワイド型への変換）、しかも元の行を別の図や一覧でも使うときだけ作る。1 行の単位が同じ図・一覧は、何枚でも分岐 1 本を共有する。列を足す・型を変える・値を直す（例: 9 を欠損にする）・どの図にも効く絞り込み（対象外の行を除く、全体に効くパラメータの filter）は分岐せず、元のデータにステップを足す。データをきれいにする加工（欠損コードの置換、不良回答の判定と除外、区分の列、並び順、表記ゆれの統一）も同じで、元のデータを残すために分岐しない（足したステップは AI の提案として採否を選べ、無効化もできる）。図や一覧ごとの絞り込み・上位 N・並び・集計・割合・移動合計は、チャートの filters と設定で作る（まとめる一覧は下の段落）。同じ目的の続きの加工は 1 本の中に続けて書き、分岐からさらに分岐を切らない（例: 絞り込むだけの分岐からロング型の分岐を切らない）。月別の表と年別の表のように続けて作る表は、途中のステップに図を固定し（create_chart の step）、同じ分岐の中で続ける。
(2) R の 1 つの処理は、Exploratory の 1 つのコマンドに置き換える。group_by+summarise は summarize_group、filter は filter、mutate は mutate（ただし case_when・if_else で条件ごとに値を決める列は mutate の式に書かず case_when コマンド＝画面の「条件を元に計算」にする。形は create_wrangling_step のガイドの case_when の例）、pivot_longer/wider は pivot_longer/pivot_wider、arrange は arrange、top_n は top_n、left_join は join。同じ設定を複数の列に当てる処理は、列を配列で受ける 1 ステップ（mutate_multiple、case_when、set_factor_levels、recode、bin の columns）。同じ表に列を複数足す mutate は mutations: [{as, expression}] の 1 ステップにする。
(3) exp_custom（カスタム R コマンド）は、対応するコマンドが無い処理（例: 行を期間の月数ぶんに展開する unnest、再帰的な計算）だけに使い、1 ステップに 1 処理。式は 表 %>% 式 の形で実行されるので、`d <- .`・`df %>%`・`{ }` で始めず、`mutate(...)`・`filter(...)` のように動詞から書く。使うときは報告に「コマンドが無い理由」を 1 句で書く。

summarize_group の aggregate は式（{as, expression}）も受けるので、条件つきの集計もコマンドで作れる。aggregate の as は元の列と同じ名前にしない（後ろの式がまとめた後の値を読む。例: as を「金額」にすると、次の式の 金額 は合計になる）。年でまとめるときは、先に mutate で 年 = year(日付) の列を作り、その列でまとめる。lubridate や dplyr などは最初から読み込まれているので、式に lubridate:: のようなパッケージ名を付けない。filter の条件は 1 つの conditions にまとめ、列名は逆引用符なしで書く。今日との比較は valueType: "today" と value: "today" を両方渡す。

1 行が元の 1 行（契約・請求など）のままの一覧は集計テーブルにせず table で作り、並びは tcol の sortOrder と sortPriority で決める（集計テーブルは行の見出しでまとめて並べるので、日数順に並ばず日付もまとまる）。行を絞って・まとめて・並べて・上位 N を取る一覧（項目ごとの合計や件数の表）は、分岐も集計のステップも作らず、元の行の表に集計テーブル（marker: "summarytable"）を 1 枚作る。絞り込みは filters、まとめる列は rowh、値は meas の列と func、並びは meas の sortOrder、上位 N は settings の rowh0PostFilterType（"top" / "bottom"）・rowh0PostFilterNumResults・rowh0PostFilterTargetColumn（基準の列と func。省くと 1 つ目の値で切るので必ず書く）、条件に合う行だけの合計・件数・平均・一意な数は meas の func を sum_if / count_if / mean_if / count_unique_if などにして conditions を 1 つ付ける（sum(売上[今期]) のようなカスタム計算にしない）。別の列どうしの合計の比など、条件つきの関数でも出ない値だけ meas に {"calc": "<集計式>", "displayName": "<名前>"} を置く。calc の中でも 列[条件] で切り出さず sum_if(列, 条件) を使う（例: sum_if(売上, 最新年) / sum_if(広告費, 最新年)）。上位 N の表の合計行は上位 N だけの合計になるので、元に合計行が無ければ settings に pivotShowTotals: "off" を渡す。例（完了した注文の金額が多い商品 上位 10）: `{"marker": "summarytable", "axes": {"rowh": ["商品名"], "meas": [{"column": "金額", "func": "sum", "sortOrder": "desc", "numberFormatting": "currency", "currencySymbol": "¥", "numDecimalDigits": 0}, {"column": "行数", "func": "count", "displayName": "注文数"}, {"calc": "sum(金額) / sum(数量)", "displayName": "平均単価", "numDecimalDigits": 1}]}, "filters": [{"column": "状態", "operator": "equalTo", "value": "完了"}], "settings": {"rowh0PostFilterType": "top", "rowh0PostFilterNumResults": 10, "rowh0PostFilterTargetColumn": {"column": "金額", "func": "sum"}, "pivotShowTotals": "off"}}`（緑のバーはチャートの節）。行をまとめずにそのまま並べる一覧は table にする（ダッシュボードの手順書）。

小数の桁と単位は、create_chart のときに列ごとに付ける（meas・tcol の各列の numDecimalDigits・numberFormatting・currencySymbol・valueSuffix）。桁や表記のための列を加工で作らない。

分岐が要る加工では、元が出来ている分岐は同じメッセージの create_branch でまとめて作る。コマンド・引数・出来る列名が分かっている続きの加工は、create_wrangling_step の steps（[{command, params}, ...]）で 1 回で足す。新しい分岐に足すときは createBranch も同じ呼び出しに入れる（分岐を作ってから順に足す）。結果を見てから次の加工を決めるときだけ、1 ステップずつ足すか preview_wrangling_steps で試す。互いに元にしていない分岐への create_wrangling_step は同じメッセージに並べる。確定後、stepName が分岐の id で始まることを確かめる。直すときは stepName を渡して書き換える。最初の加工の前に 1 回だけ ../exploratory-wrangling/common/wrangling-common.md の「分岐」の節を読む。失敗時の戻し方は同じファイルの「3. Plan known operations together and execute them in order」と「Do not try to fix a mistake you already created by adding on after it. Undo it and recreate.」の節、NA を含む TRUE/FALSE 列の扱いは ../exploratory-wrangling/types/wrangling-two-value-and-multi-answer-columns.md を読む。

チャートも、Exploratory のチャートで描けないものだけカスタムチャート（R）で作る。

delete_wrangling_step が CONFIRMATION_REQUIRED（画面の確認待ち）を返したら、確認は迂回しない。元のデータに誤って足したステップなら、set_step_disabled で、そのステップを最後のものから順に 1 件ずつ disabled: true で無効にして、行数と列を元に戻す（返り値の rowCount で確かめる）。set_step_disabled は画面の確認なしで通る。消すのは利用者が画面で答えてから同じ引数で呼び直す。報告の先頭に、無効にしたステップと、確認に答えてほしいことを書く。

## チャート

この文書と get_guide に無い設定・テンプレート・コマンドだけ、list_chart_settings・list_analytics_templates・get_wrangling_command で確かめて使う。create_chart は、作る図を全部決めてから同じメッセージに並べる（途中のステップの表を使う図は create_chart の step で指定し、作った後に update_chart で付け直さない）。

ピボットテーブル・集計テーブルの値の列は、緑の濃淡のバーにする（pivot・summarytable の axes.meas の各列に formattingType: "color"、formattingTarget: "bar"、colorPalette: "Greens"、formattingDirection: "table_down" を付ける。付けないと既定の青いバーになる）。年度や年を軸にするときは、整数で表示する（2018.0 のような小数にしない）。満点のある点数は 0 から満点までの軸にする（横棒なら settings.yAxisRange: "0,5" など）。同じ項目の色は図をまたいでそろえる。色は create_chart の settings（highlightValues と highlightOnPalette: "on"）で作るときに渡し、作った後に update_chart で付け直さない。

よく探し損ねる設定（名前の正は list_chart_settings の返答で、ここは探す場所の例）: 横向き = orientation: "horizontal"、値のラベル = yValueOnPlot: "on"、桁 = 値ラベルは yValueOnPlotNumDecimalDigits、軸は y1AxisNumDecimalDigits など（元を作り直すときは図ごとに元の桁を渡す。元が 5% なら 0）、% 表記 = yAxisNumberFormatting: "percentage"（横向きでも yAxis）、並び = sortTarget と sortOrder（意味順の軸は set_factor_levels の加工で順を決める）、強調 = highlightValues と axes.color に同じ列、件数と割合を同じラベルに = y を {column: "行数", func: "count_ratio"} にして yValueOnPlot: "on" と yValueOnPlotShowRawValue: "on"（割合の下に件数が出る）、凡例や軸の名前 = displayName / xAxisTitle / yAxisTitle。「作れない・直せない」と言えるのは、list_chart_settings(marker=その図の種類) の返答に該当する設定が無いと確かめたときだけ。軸・凡例・数値の見出しが、列名のまま（接頭辞付きなど）や集計の既定名（「行数」「合計」など）のままで、読み手に何の数かわかりにくいときは、表示名（displayName・xAxisTitle・yAxisTitle など）で直す。アナリティクスの図は画像の道具で見られないので、get_analytics で出力を読む。

## Number

時系列の最新の期間の値（毎月の NPS・売上・ライセンス数・その月の顧客数や注文数）を Number で示すときは前月比・前年同月比などを付け、全体を見る数（全回答者数・全従業員数）には付けない。最新の期間が途中（今月・今年）のときは、終わった直近の期間どうしを比べるか、前の期間も同じ日付までに絞って比べる。そろえにくいからといって、頼まれた指標の Number を外さない。

日付の列がある表から Number を比較の指定なしで作ると、既定で主値は最新の月の値、副値は前年同月との差になる。元が全期間の値や比較の無い Number のときは、settings に svWindowFuncGroup: "" を渡して比較を外し、作った後に get_chart_data で主値が元と同じかを確かめる。

途中までの期間（今年・今月など）の値を前の期間と比べるときは、前の期間も同じ日まで（前年なら同じ日まで、前月なら同じ日付まで）にそろえる。前年と比べるときは、月日が今日以前の行だけに絞る列（`month(日付) * 100 + day(日付) <= month(today()) * 100 + day(today())`。閏年でもずれない）を作ってフィルタしてから比べる。前月と比べるときは、前月の行のうち日が今日の日以前のもの（`day(日付) <= day(today())`）に絞る。増えると悪くなる指標（返品率・退学率など）の Number は axes.meas の flipPositiveNegativeColorSub: true（settings には無い）で増加を赤にする。

新しく作るときと、元の Number に前年比などの副表示があるときは、前年比・前月比を別の Number に分けず、同じ Number の副表示にする（元のカードに補足が 2 つあっても、副表示は 1 つ（差など）にし、2 つ目のために別の Number を足さない。そのことは最後の返答で伝える）。期間の比較は日付の列から作る（axes.svWindowFuncGroupByColumn にその日付の列、settings に svWindowFuncGroup: "diff" と svWindowFunc（1 つ前の期間は dfprev、N 期間前は dfperiod と svWindowFuncTsPeriod / svWindowFuncTsPeriodSize）。副表示に出す値は svWindowFuncSubDisplay で選ぶ。選べる値は "" = なし、count = 行数、latest = 最後の期間の値、last-period = 最後の期間、previous-period-value = 前の期間の値（svWindowFunc が dfperiod のときだけ）、diff = 差、pdiff = 変化率で、これで全部。svWindowFuncGroup に pdiff は入れられず、svWindowFunc に rdf で始まる値も入れられない。チャートの種類別の資料に pdiff / rdf とあっても使わない。名前と値は list_chart_settings(marker="singlevalue") で引く）。売上金額を主値、前年同月比の変化率を副表示にする例: `{"axes": {"meas": {"column": "売上金額", "func": "sum"}, "svWindowFuncGroupByColumn": {"column": "受注日", "func": "rtomon"}}, "settings": {"svWindowFuncGroup": "diff", "svWindowFunc": "dfperiod", "svWindowFuncAggregationType": "date", "svWindowFuncTsPeriod": "year", "svWindowFuncTsPeriodSize": 1, "svWindowFuncMainDisplay": "latest", "svWindowFuncSubDisplay": "pdiff"}}`（前月比なら svWindowFunc: "dfprev" にして svWindowFuncTsPeriod / svWindowFuncTsPeriodSize を外す。日付の単位は rtoyear / rtoq / rtomon / rtoweek / rtoday）。

副値が件数（例: 売上金額の下の「1,250 注文」）のときは、別の Number にせず settings の svWindowFuncSubDisplay: "count" にする。期間の比較が無くても使え、主値と同じフィルタの行数が出る。

今日から遡る 12 か月とその前の 12 か月のように、暦の区切りでない期間どうしを比べるときは、期間を表す日付の列を case_when コマンドで作る（例: 条件 `{"expression": "日付 > today() - days(365)"}` の値を today()、`{"expression": "日付 > today() - days(730)"}` の値を today() - years(1) にする。どちらにも入らない行は NA になり、比較から外れる）。その列を svWindowFuncGroupByColumn に rtoyear で置き、svWindowFunc: "dfperiod"、svWindowFuncTsPeriod: "year"、svWindowFuncTsPeriodSize: 1 で比べる。前の期間の値そのものを副値に出すときは svWindowFuncSubDisplay: "previous-period-value"。期間を "直近12か月" のような文字の列にすると、期間の比較を付けられない。今日と 1 年前の時点の数（例: その日に在籍している会員の数）を比べるときは、時点ごとに 1 行の表（今日と 1 年前の 2 行で、日付の列を持つもの）を作って同じように比べる。

1 つの Number に載る副値は 1 つ。元のカードに補足が 2 つ以上あっても、補足が別の指標（例: 件数のカードに添えた合計金額）でも、Number は足さない（元のカードの枚数のまま）。載せなかった補足は最後の返答で伝える。主値・副値の桁は元に合わせる（numDecimalDigits）。元が「¥12.3百万」「1.2万件」のように単位を付けて桁を落とした表記のときは、単位で割った列（例: 金額 / 1e6）を mutate で作り、その列を axes.meas に置いて numberFormatting・numDecimalDigits・valueSuffix（例: "百万"）で同じ表記にする（valueSuffix は settings ではなく axes.meas の列に書く。前年比などの割合の副値は割っても変わらない）。
## 作った後の確かめ方

作った後は get_note / get_dashboard（図の数・題名・順番）と get_chart_data / get_analytics（Number は主値と副値）を同じメッセージに並べて 1 回読み、直すものだけ直して報告する。値の確かめのために作り直したり R と照らしたりしない。全体画像（get_note_image / get_dashboard_image）での点検は、作成後のレビュー（フックが求めたとき）だけ行う。撮るときはノートは 1 回、ダッシュボードはページごとに 1 回ずつ順に撮り（同じメッセージに並べない）、直すのは表示の崩れ（切れ・重なり・空のパネル・元と違う形）だけにする。

元の成果物があるときは、報告に、元から変えたもの・落としたもの・足したもの（理由）を書く。作れないと書くのは、この文書の作り方（ずらした窓での集計、期間の制限と切り替え、粒度の切り替えなど）を試した後だけにし、試した方法と結果を書く。要素ごとに元と並べて照らすのは、作成後のレビュー（フックが求めたとき）だけ行う。
