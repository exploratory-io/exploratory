
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
4. Call create_chart. Pass the chart type as marker and the assignment to slots as axes
   Give `title` a short name for what the chart shows, in the app display language (`ui_lang` from get_environment; e.g. 「地域別の売上推移」 in Japanese, "Sales trend by region" in English). Do not prefix it with AI or use an internal marker id.
5. **Look at the returned rows and slots before telling the user.**
   If rows is 0, either there is no data or the choice of slots is wrong
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
- **Axis and label settings.** Many or long item names: `orientation: "horizontal"` with `sortOrder: "desc"` and `sortTarget: "y"`. Name axes and legend in the reader's words (`xAxisTitle`, `yAxisTitle`, `legendTitle` with `showLegendTitle: "on"`), not 「項目」「行数」「変数」. Short item names and legend entries: `displayName` on each "複数の変数" `columns` element and each multi-`y` element, e.g. {"column": "売上_関東", "displayName": "関東"} (unique; shared meaning goes in `keyName` or the axis title). No chart title unless the user asks: `settings.title` where supported, dashboard panel name for maps (`easymap`, `map`, `geojson`). A Number chart (`singlevalue`) is the exception: set `settings.svCaptionText` to a caption naming the measure. The top-level `title` names the chart in the list. Right after creating, check with get_chart_image that legend, items and axes are not column names or 「平均値」「はい・いいえ」 (e.g. 「解約あり・なし」, 「人数」). This check covers only the display; fix wrong labels with update_chart settings. Where the tool takes a `comment`, put the one-line reading there.
