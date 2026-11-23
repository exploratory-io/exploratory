<wrangling_rules>
For analyses (significance tests, correlations, regression, drivers, prediction, clustering), use create_analytics whenever an analytics type is available in list_analytics_templates; prepare its input with wrangling steps.
- do_chisq.test -> exp_chisq
- do_t.test -> exp_ttest
- do_cor -> do_cor
- build_lm -> build_lm.fast
- build_lr -> logistic
- build_kmeans -> kmeans

Do data wrangling with create_wrangling_step. What gets created is an ordinary Exploratory step, and
the user can open and edit it in the step diagram.
When creating a step through MCP, write issue.label and issue.summary in display_language (the app's UI language); translate English examples instead of copying them. In Japanese, use concise labels such as 「欠損値の削除」「欠損値の置き換え」「値を欠損値に置き換え」.
When you do not know the names or values of the settings to pass in a command's params, first look them up with get_wrangling_command.
A name not listed there has no effect even if you pass it.

For a wrangling request, do the following 4 things in this order. Do not skip any.

**1. Check what exists**

- When the target data frame is not decided, check with list_data_frames
- **Copy column names exactly as the string in the list the tool returned. Do not construct them.**
  Joining a question number to a label, turning the request's words into a column name, and abbreviating are all forbidden.
  For example, passing 「Q2_デザイン」 when the list contains only 「Q2_配送の速さ」 makes
  create_analytics return 「その列はありません」.
- The words in the request and the actual column names may differ (the request's 「売上」 is 「売上金額」 in the data,
  「顧客ID」 is 「顧客識別番号」, and so on). **Choose the matching row from the list and copy its spelling.**
  Do not write a string that is not in the list. When there is none, choose from the close names that COLUMN_NOT_FOUND returns.

**加工を始める前に考えること**
- 分析に要らない行（無効・取り消しの行、空行、欠損の行など）を残すか除くかを考える。基準は「その後の計算に関わるか」。例: アンケートで、ある設問の未回答は、回答者数を数えるなら残してよいが、その設問に答えた人だけで割合を見るなら除く。決めた理由と除いた件数を報告する。
- 企業名などの表記ゆれ（全角・半角、株式会社の有無、英語名と日本語名）を値の一覧で確かめ、同じものはそろえる列を作ってから集計する（見つけたのに「限界」として書くだけで済ませない）。そろえないと同じ対象が別に数えられ、新規・解約などの数がずれる。
- 金額に複数の通貨があるときは、片方を除かず、レートを明示して 1 つの通貨に換算して合計する。レートはデータ内のものか利用者が示したものを使い、無い行に仮のレートを置くときは、そのレートと件数を報告する（セマンティック情報の指標が通貨ごとに分かれていても、売上全体を見せるときは換算した列を作る）。換算できない行があれば、その件数と扱いを報告する。
- ステップで間違いに気付いたら、後ろに直しのステップを足して上書きせず、間違えたステップ自体を直す。create_wrangling_step に間違えたステップの stepName を渡して、そのステップを書き直す（後ろのステップもまとめて作り直すときは、下の「Undo it and recreate」の手順で delete_wrangling_step を使う）。
- 絞り込みで行が減ったら、条件ごとに何行減ったかを報告する。合計が合わなければ調べ直す。
- 日付が今日より後の行（これから始まる契約など）を、推移や新規の数に入れるかを決める（計画・予約など将来分を含む指標なら残す）。入れないなら加工で除くか印の列を作り、図ごとのフィルタで隠さない。どちらにしたかと件数を報告する。

**2. Break the processing down**

- Split the request into one Exploratory step each. 「集計して並べ替えて上位 3 件」 is 3 steps
- Make each operation its own editable step, so that the user can still edit just a middle part; do not fold several operations into one step.
  When you already know the ordered steps, send them together in one create_wrangling_step call with `steps` (see step 3).
  Call one at a time only when you need to see a result before deciding the next operation
- "1 operation" means one kind of operation, not one column. When the same operation with the same settings applies to several columns,
  create ONE step whose command takes a column list (`columns` of set_factor_levels / recode / bin / case_when / mutate_multiple, drop_na, fill ...).
  Example: ordering 16 rating columns that share 5 levels is 1 set_factor_levels step with `columns: [16 names]`, not 16 steps
- Before batching, check each column's data type and unique values (profile_data_frame with `columns: [...]` in one call; when a column has
  more values than profile returns, list them with execute_r_script). Batch only the columns whose type and value set are the same.
  Columns whose values differ (other levels, other spellings, extra values) get their own step. Do not assume the other columns match the first one
- For command, use the command name that represents that operation. **Use exp_custom (the custom R command) only for what no product command can do.**
  If you make an operation that can be expressed in the UI into custom R, it becomes a step that cannot be edited in the GUI
- For params, write only flat specifications that match how the command's description writes them.
  The executing side fills in default values and shapes the structure, so there is no need to write the full JSON of the step

**Choose the product command before writing R.** A group aggregation uses summarize_group with groupBy and aggregate. Use summarize for ungrouped or already-grouped data; its summaries can include a custom expression. A formula inside mutate or summarize is still a product step that the user can edit. Build what Exploratory can do with product commands, and use exp_custom (the step's custom R command) only for what no product command, including a combination of product steps, can do. Being deterministic is not a reason to choose exp_custom.

**3. Plan known operations together and execute them in order**

- **When you already know the commands, params and output column names, send the ordered steps in one create_wrangling_step call.**
  Use `steps: [{command, params}, ...]`. If the branch criterion below calls for a new branch,
  include `createBranch: {name, ...}` in that same call. The server creates and selects the branch first,
  runs each step on the preceding result, and returns each step's id, command and status with one final readback.
  For NPS by occupation, plan mutate (the named contribution column) followed by summarize_group (mean by occupation) together.
- **Call create_wrangling_step one at a time when you need to inspect a result before deciding the next operation.**
  Use the existing `command` and `params` form. Do not line up dependent calls in one response or mix it with `steps`.
- **The returned columns are the columns after that wrangling.** Build the next operation using these column names.
  Do not write by guesswork the name of a column born in the previous operation
- **If it fails, stop there and fix it. Do not move on to the next step.**
  Steps applied before the failure stay in place; do not repeat them.
  The returned reason says what was wrong and how to fix it. Read it, fix
  the specification, and **recreate the same step**. Move on after it succeeds
- **Do not repeat the same specification unchanged.** When you do not know what to fix,
  check the current state with select_data_frame or get_data_frame and then rebuild
- If it still does not pass after fixing the same step 3 times, stop there. Tell the user what you tried and what came back,
  and do not switch to a different method on your own

**Do not try to fix a mistake you already created by adding on after it. Undo it and recreate.**

There are mistakes that R lets through. Dropping too many columns, aggregating by the wrong column, and mixing up
column names are examples. These are not undone automatically.

- **To fix one step in place, pass its `stepName` to `create_wrangling_step` (it rewrites that step). To redo it together with the steps after it, use `delete_wrangling_step` to go back and then recreate.**
  If you pass `stepName`, that step and everything after it are deleted together
- Do not think 「this column disappeared, so I will get it back by another route」.
  That approach only makes the chain complicated and leaves steps the user cannot read
- **The returned columns are the columns actually created in R.** When a name differs from what you expected,
  do not guess; use the returned name as it is, or go back and recreate
  - For example, if you use the same column for both grouping and aggregation, `_1` is attached to the group-side column name
    (`顧客識別番号` -> `顧客識別番号_1`). If you remove it from the aggregation, it stays as the original name

**4. When everything is finished, verify the result before reporting**

This cannot be omitted. **Being able to create the steps and getting the result the request asked for are different things.**

- Call select_data_frame again and confirm **the final list of columns**
- Look at whether all the columns the request wanted are there, and whether there are extra columns or mix-ups
- When you want to check whether row counts or values match the request's conditions, use execute_r_script
- **Before you finish, list every operation the request names, in its order, and check that each one was built.** A request that joins operations
  with 「続けて」「そのあと」「その上で」 is one request: build all of them in this turn. Do not stop after the first one and write the rest
  in the reply as something to do next
- **If there is a discrepancy, fix it there.** Either add the missing step or
  recreate the wrong step. Check again after fixing
- **When the result differs from the shape the request implies (the row count, the unit one row represents, the columns), do not
  just write down the gap and finish.** Suspect that you picked the wrong command. Read the descriptions in the list of usable commands
  in create_wrangling_step again, find the command whose description is the operation the request asked for,
  and look up its settings with get_wrangling_command.
  Then undo the wrong step with `delete_wrangling_step` and recreate it with that command.
  This is not the same as the 3-time limit above: that limit is for errors returned on a step; this is for a step that succeeded but gave a result the request did not ask for
- **Before you finish, compare the final data frame with the shape the request asked for. Remove everything the request did not ask for:
  trial steps and in-between columns.**
  Steps made to test an idea, steps that were replaced by a better step, and steps whose result the request does not need are
  removed with `delete_wrangling_step`. A helper column made only to compute the next column (for example, a total made in one step
  and then used in the next step) is not part of the result either: either build the value in a single step so that no helper column is created,
  or drop the helper column with `select` before you finish. Check the column list again after removing.
  Leaving trial steps and helper columns behind gives the user extra columns and rows they did not ask for
- Only after finishing the check, tell the user what you did. Do not paste the R script of the steps.
  **Do not say 「できました」 before checking**
</wrangling_rules>

**分岐**

In one chain, one data frame can have only one shape.
**Create a branch only when both are true: the unit one row represents changes (aggregation, long/wide conversion), and the original rows are still needed by another chart, table or join.** Charts and tables with the same row unit share one branch.

**Do not create a branch for these; add the step to the data frame itself:** adding a column (binning values into a new column, a year-month column from a date, flag, score or prediction columns), changing a column's type, changing values in a column (for example turning 9 into NA with case_when), and a filter that every chart should see. A filter, top N, sort, aggregation or ratio that only one chart needs is set on the chart (filters and settings), not as a branch. When just adding 1 column for analysis, you must not copy the source data into a separate branch.

Keep one purpose in one chain: do not cut a branch from a branch to continue the same work (for example a filter-only branch followed by a long-format branch).

Examples where a branch is needed:
- From an access log, compute daily DAU and monthly MAU, join them on the month as the key, and compute the share of active days (DAU / MAU)
- From order data, make an aggregation per customer and an aggregation per product and match them up
