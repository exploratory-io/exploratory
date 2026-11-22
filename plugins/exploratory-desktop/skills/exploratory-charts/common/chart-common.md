
Create charts with create_chart. What gets created is an ordinary Exploratory chart,
and the user can open and edit it in the Chart tab.

**What you decide is the chart type and which column goes in which slot.**
The executing side fills in visual defaults such as colors, scales, and formats to match the column types, so
use only supported settings to implement the specifications.

**Aggregation (`func`) is the exception.** The executing side's default can contradict what was asked.
There are 2 situations where the default is known to cause trouble, and in those you pass `func` yourself.

| Situation | Default | What to pass | Why |
|---|---|---|---|
| **Putting a numeric column with few distinct values on color**, such as a 1-to-5 rating scale, when the request does not say how to treat it. This applies only when the request does not specify treatment such as "numeric", "value", or "integer"; otherwise use `none` or an integer func matching the request. | `asnum` (continuous; colors are painted in gradations) | `func: "aschar"` | A 1-to-5 rating scale is an ordered category, so make it readable with a separate color for each level |
| In a breakdown of counts, **comparing groups with different denominators** | `count` | `func: "count_ratio"` | The section on count ratios below ("Express the ratio of counts with the aggregate function `count_ratio`") |

Whether `aschar` can be used depends on the slot (the color slot has no `ascategory`; use `aschar`).
**When the request says how to treat a column (as a number, as integers, the value as is), that wording wins over the defaults and over the table above. This holds after a read-back too: a numeric func drawn as ranges is expected, not a reason to switch to `aschar`.** Pick the func whose label matches the wording from list_chart_settings (section: "func"). Do not round or convert a column the request asked to keep as is.
**Look up the usable aggregations and the default with list_chart_settings (section: "func") before writing.**

**Before custom R, use these paths in order:** 1) Statistics (regression, importance, coefficients with intervals): create_analytics and its chart. 2) For another standard chart (bar, scatter), save_result_as_dataframe (analyticsId; outputId if needed), then chart it. 3) Aggregates, shares or derived columns: wrangle, then chart. 4) r-custom only if none can express the picture.

**Before create_chart, match bars to the text:**
1. Bars stack by default (`barstyle` unset). With color or multiple `y` columns, non-additive values (`ave`, `median`, `truepct`, `true_ratio`, `min`, `max`) need `settings.barstyle: "group"` to avoid exceeding 100% or the scale maximum. Stack only counts, sums or composition (`count_ratio` as a 100% stack).
2. `truepct` / `true_ratio` count NA in the denominator; `ave` on numeric 0/1 excludes NA. For answered-only shares, drop NA in a wrangling step or use `ave` on 0/1. State the denominator and count.
3. Text x, color or facet draws blanks as "(NA)". Drop NA for shares among those who have a value (state the dropped count); keep it when missing itself matters.

Procedure:

1. **Decide which data frame to use.** Right after wrangling, if you just create, it is
   pinned to the last step. To use a different one, pass dataFrame
2. **Check the column names and types.** Look at the columns returned by the immediately preceding create_wrangling_step,
   or the list of columns returned by select_data_frame. **Copy column names exactly from the list; do not construct them**
3. **Use the chart type the plan or the request names.** Use the marker that create_chart lists under that screen name, even when a rule below points elsewhere; ピボットテーブル is fine for a table.
   - **For cross tabulation and between-group comparison, put the attribute being compared in rows (`rowh`)** and what you look at (such as a 5-level rating) in columns (`colh`).
     Attributes in columns only when the user explicitly asked, and then **it is pivot** (a summarytable colh cannot hold attribute columns). If update_chart fails by requiring meas and rowh, rebuild as pivot
   - Comparison by region or prefecture -> 地図 - 標準 (easymap), or geojson when the request names it (call list_chart_maps first)
4. Call create_chart. Pass the chart type as marker and the assignment to slots as axes
   Give `title` a short name for what the chart shows, in the app display language (`ui_lang` from get_environment; e.g. 「地域別の売上推移」 in Japanese, "Sales trend by region" in English). Do not prefix it with AI or use an internal marker id.
5. **Look at the returned rows and slots before telling the user.**
   If rows is 0, either there is no data or the choice of slots is wrong
6. For a single-chart request, read it back with get_chart and explain it. The following reading rules apply whenever existing results are read.
   The way to read it (interpretationGuide) is returned only here, so if you write without reading it you are guessing.
   What comes back:
   - metadata: what is being looked at by what
   - data: the result used for drawing (a CSV string with a header row)
   - dataNote: **what that data is.** The contents change by chart type, so always read it first.
     If it says 「これで全部です」, **do not run R for the same numbers.**
     Bar and Line charts contain the aggregated rows, so the totals are already out.
     Only when it says 「全部ではない可能性がある」 or 「ビンごとの件数は入っていません」 do you recount with execute_r_script
     (histogram bins and density curve values are not contained)
  - **Read simple totals and ratios from the data that already came back.** If a pivot contains every row of counts by score, do not repeat the aggregation from the source data to explain low (1 to 2) or high (4 to 5) ratings. **Do not call execute_r_script.** This data is the whole figure, not a sample (dataNote says so)
   - interpretationGuide: **how to read that figure.** Interpret according to it.
     It is not attached to figures that have no reading guide prepared (figures drawn with R, scatter matrix, parallel categories).
     In that case look only at data and metadata and read it yourself
   Do not just line up numbers. **Quote concrete values and write what can be said.**
   For figures where data does not come back (maps, figures drawn with R), write only what can be said from metadata

**When neither the request nor the plan you made for the work determines which column to use, ask which column to use before creating.** Ask only when the target data or purpose remains genuinely unclear.
Phrasings that **point at a set**, such as 「属性別に」「指標ごとに」「各〜で」「〇〇ごとに見たい」, determine neither
how many columns apply nor which of them the user wants to look at.
**Ask without creating anything.**


- **Do not drop string-valued stage ratings from the candidates.** Ordered options such as 「そう思う」「どちらともいえない」 can be cross tabulated even if they are not numbers.
- **Also include numeric columns that become axes once binned in the candidates.** Numbers such as age, amount, and score
  have too many levels for a table axis as is, but become axes once binned.
  State how each binned candidate groups values. **If chosen, before creating the table, create the binned column**
  (the same treatment as fixing the type of a stage rating; create `年代` with `mutate` and then use it).
- **List all applicable columns without narrowing them**. If you cut to 「just the representative ones」,
  the user cannot choose the column they wanted to see.
- **When several columns of the same kind are candidates, offer a bundled choice such as 「〜をまとめて 1 枚で見る」.**
  If chosen, build 1 with the way of building in the section below
  「Putting multiple questions into 1 chart」 (do not build many individually). For numeric rating items, describe this bundle as 「各評価項目の平均点を1枚の表で比べます」. Choosing it requests one mean pivot, not response-stage counts and ratios. Keep this choice when the user later selects attributes. For this numeric bundle, skip the hierarchy / flat question: use all chosen attributes in rowh (hierarchy by default; use flat only if requested), all rating items in colh with 「(複数の変数)」, and meas: { "column": "(変数の値)", "func": "ave" }. Do not create a preliminary table before the attributes are chosen. If the user instead asks for response distributions or separate tables, follow that request.
  When a chosen skill specifies a chart for each section of the report, do not bundle them; build the charts as the skill specifies.
- If what is undecided is the axis (what to look at it by), give axis candidates; if it is the target (what to look at), give target
  candidates. **When both are undecided, ask about the target first** (1 thing per question)
- Even when there are many candidates, **do not narrow them on your own and build. Have the user choose**

**When you use a stage-rating column in a table or chart, before using it, convert it to an ordered factor.**
**Fix it on the spot and then build**.
If you do not, the stages are not arranged in meaning order. Ordered items such as age group, store size and visit frequency also keep meaning order, not value or character order.

**However many columns, converting them takes just 1 step.**

```
create_wrangling_step  command: "set_factor_levels"
                       params: { columns: [all the stage-rating columns that share these levels],
                                 levels: ['まったくそう思わない', 'あまりそう思わない', 'どちらともいえない', 'そう思う', '非常にそう思う'], ordered: true }
```

**Pass `ordered: true`**. Making it ordered not only gives the correct arrangement, but also lets it be passed straight to methods that treat
it as an ordinal scale (ordinal logistic regression and so on). It also goes into the slots of latent class analysis and k-modes
(the column type becomes `ordered,factor`).

For levels, arrange **only the actual values that profile_data_frame returned** in meaning order (do not write
values that are not in the data; include every value the data has, because a value left out of levels becomes NA). Put in one `columns` list only the columns
that share the same values; a column with other levels gets its own set_factor_levels step. The stage wording differs by dataset, so do not reuse the strings in this example
as they are. Do not use `as.ordered` / `as.factor`. Because **you cannot specify levels yourself**,
the order of stages becomes R's default (alphabetical).

After fixing, write in 1 line what you fixed and how
     (which columns, as a factor in which order).

**You may create 2 or more when the user chose or listed them, or when the plan for the work calls for them.**

1. When the user **wrote a number** (「3 つ」「4 つ」「それぞれ」)
2. When the user **listed the targets** (「売上と数量と利益をグラフにして」)
3. **When 2 or more were chosen in a multiple-choice question.** Create as many as the number of columns chosen
   (if only 1 was chosen, then 1). **The attribute-column selection for cross tabulation is an exception**: the chosen columns go
   together into the rowh of 1 table (do not make many tables, one per column)

**Writing 「属性別に」 does not by itself mean one chart per attribute.**

Examples of asking first:
- 「クロス集計をして」-> neither the axis nor the target is decided. Give target candidates as multiple choice
- 「属性別に推奨度のクロス集計を」-> the target is decided. Give the attribute columns (gender, age group, occupation,
  usage frequency, ...) as multiple choice
- 「性別と年代でクロス集計したい」-> the attribute column names are decided. The target to look at is
  not yet decided. Since there are 2 attributes, ask hierarchy / flat
  before creating, then the target
Examples of building without asking:
- 「性別と推奨度のクロス集計を」-> both the axis and the target are determined as 1 column (if the attribute is 1, do not
  ask hierarchy / flat either)

Things to remember:

- **Settle the needed specifications, such as slots, aggregation, and the basis of the ratio, first, and then call create_chart.**
  Use update_chart when the user requests a correction to the same figure.
  Do not pile up update_chart calls changing the specification bit by bit
- **Top N, Others, cumulative and other table calculations, and column transforms (log, upper case) are slot funcs or settings.**
  Splitting a numeric column into ranges or into low outlier / normal / high outlier is also a slot setting.
  Several aggregates of one column (mean, median, max ...) are that column placed on several value slots, each with its own func; do not summarize them first in a wrangling step.
  Look them up with list_chart_settings before adding a wrangling step; add one only after that lookup shows no setting or func that does it, and put the original column on the slot. If a read-back looks off (groups folded into Others, a slot shown empty, bins or lines not where you expected),
  keep the column and func in place and fix it with that slot's settings via update_chart (Others: `{slot}EnableOtherGroup: "off"`).
  Do not swap the func, rebuild the column with a wrangling step, or filter on values you typed in. If no setting fixes it, say so instead.
  A value you sent that matches the request's words stays: re-read that setting's note (list_chart_settings, setting:) before changing it to another choice
- **Call create_chart one at a time. Receive the result before calling the next.**
  Do not line up multiple create_chart in 1 response
- Repeat: create 1 -> look at the returned rows and slots -> create the next.
  If one fails midway, fix it there before moving on.
  For a single-chart request, read and explain that one figure, then stop
- To count rows, write "行数" in place of a column name
  (example: `axes: { x: "製品カテゴリー", y: "行数" }`)
- To change the aggregation, use the form `{ "column": "売上金額", "func": "ave" }`.
  The average is `ave` (not `mean`)
- To overlay multiple series, pass an array
  (example: `axes: { x: "注文日", y: ["売上金額", "数量"] }`)
- **If you merely chose the wrong slot or aggregation, fix it with update_chart without deleting.**
  The id does not change, so saved references can still be used as they are
  Only what you passed changes
- **Before create_chart, check the charts already made in this conversation (list_created_artifacts).**
  If the request corrects or modifies the same figure, use update_chart. Different questions or breakdowns may be separate charts, including charts of the same type.
  For a single-chart request, create that one figure and stop. Do not create a chart to compare it and then delete one of the two
- Delete with delete_chart only when the figure itself is no longer needed.
- When refused, the slots that chart takes are listed in the returned sentence. **Read that and fix it.**
  Do not send the same specification again

**Display settings.** Look up exact names with list_chart_settings and settle the settings before creation.

- **To color only specific bars (highlight).** Put the item column on the color slot as well (highlight acts on the values of the color slot), then pass in settings `enableHighlight: "on"` and `highlightValues: [{"value": "<the value as it appears in the data>", "color": "<a color chosen for this figure>"}]`. The other bars take `highlightDefaultColor`. Not `enableHighlight` with `highlightOnPalette`.
- **Show a share as %, not as 0.44.** On a Bar or Line chart, set `yAxisNumberFormatting: "percentage"` (also for a horizontal bar, not `xAxisNumberFormatting`) and the digits with `numDecimalDigits`.
  - An aggregated ordinary numeric column (`ave`, `sum`) is multiplied by 100 by the query: keep it 0 to 1 (multiplying first doubles it).
  - Measure Values (several numeric columns put together) are not multiplied in the app released today: for 0 to 1 columns, make columns multiplied by 100 first and put those together, or pivot longer into one ordinary value column and aggregate that.
  - Value labels take the axis `%`: use `yValueOnPlot: "on"`, with no `percentage` on the label number format.
  - A pivot has no % format: keep the digits equal with `numDecimalDigits` and put 「（%）」 in the heading, or make a column multiplied by 100 first.
- **Axis and label settings.** Many or long item names: `orientation: "horizontal"` with `sortOrder: "desc"` and `sortTarget: "y"`. Name axes and legend in the reader's words (`xAxisTitle`, `yAxisTitle`, `legendTitle` with `showLegendTitle: "on"`), not 「項目」「行数」「変数」. Short item names and legend entries: `displayName` on each "複数の変数" `columns` element and each multi-`y` element, e.g. {"column": "売上_関東", "displayName": "関東"} (unique; shared meaning goes in `keyName` or the axis title). No chart title unless the user asks: `settings.title` where supported, dashboard panel name for maps (`easymap`, `map`, `geojson`). A Number chart (`singlevalue`) is the exception: set `settings.svCaptionText` to a caption naming the measure. The top-level `title` names the chart in the list. Right after creating, check with get_chart_image that legend, items and axes are not column names or 「平均値」「はい・いいえ」 (e.g. 「解約あり・なし」, 「人数」). This check covers only the display; fix wrong labels with update_chart settings. Where the tool takes a `comment`, put the one-line reading there.
