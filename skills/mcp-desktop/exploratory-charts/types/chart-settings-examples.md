Examples of instructions and the category to look up:

| What the user says | Category (section) | Example |
|---|---|---|
| Draw an average line / a target-value line | refline | `yReflineType: "ave"` / `"constant"` and `yReflineConstant` |
| Show the line's value / name on the plot | refline | `{slot}ReflineLabelOnPlotArea: "value"` / `"label"`; `"label+value"` only when the user also gave the name text. Do not invent `{slot}ReflineLabel` |
| A line for the X-axis (横軸) / Y-axis (縦軸) values | refline | `xReflineType` / `yReflineType`. The axis named is where the value comes from, not the line's direction. 「横軸の平均の基準線」 is `xReflineType: "ave"` (the average of the X column) even when the aggregated value of the chart sits on y; do not move it to `yReflineType` because y holds an average. One line over all the data is `{slot}ReflineGroup: "all"`; the line length in pixels is `{slot}ReflineLength` |
| Show control limits | refline | `yReflineRangeType` |
| A line at the data's min / max / median | refline | `{slot}ReflineType: "min"` / `"max"` / `"median"`, not a constant you computed |
| Show a trend line / a regression line | trendLine | `yTrendLine: "lmfit"` |
| Make it a moving average | windowFunc | `yWindowFuncGroup: "roll"` and `yWindowFunc: "rollmean"` and `yWindowFuncSize: "3"` |
| Want to see cumulative | windowFunc | `yWindowFuncGroup: "cum"` and `yWindowFunc: "cumsum"` |
| Each value as the difference from a fixed number | windowFunc | `yWindowFunc: "dfconst"` and `yWindowFuncConst` |
| Show each value as its rank (1st, 2nd ...) | windowFunc | `{slot}WindowFuncGroup: "rank"`, `{slot}WindowFunc: "mrank"`, `{slot}WindowFuncOrder: "desc"` when the largest is 1st, on the series named (y = 1st value, y1 = 2nd). Sorting bars is not a rank |
| Split at given boundary values | binning | `{slot}BucketType: "bucket_custom"` and `{slot}BucketCuttingPoints` (comma-separated boundary values), on the numeric column itself with func `ascategory`, in any slot (x / y / color / facet / rowh / colh). Do not build the ranges with cut() / case_when in wrangling. When the values outside the boundaries must not stay as a group, also `{slot}BucketIncludeOutsideRange: "off"` |
| Only the top 10 by the aggregated value | postFilter | `xPostFilterType: "top"` and `xPostFilterNumResults: "10"`, on the slot holding the groups to keep (x / groupby / color / facet) |
| Show numbers on the graph | valueOnPlot | `yValueOnPlot: "on"` |
| Keep the N most frequent values and group the rest into other (or hide it) | otherGroup | `{slot}EnableOtherGroup: "on"` and `{slot}NumGroupsToPreserve`; `{slot}ShowOtherGroup: "off"` to hide the rest (color: `categColor...`) |
| Stack / put side by side | sort | `barstyle: "stack"` / `"group"` |
| Group into equal-width ranges / ranges with about the same number of rows | binning | `{slot}BucketType: "bucket_equal_width"` / `"bucket_equal_freq"` and `{slot}BucketNumOfBuckets` |
| Classify into low outlier / normal / high outlier by IQR, percentile or standard deviation | binning | `{slot}BucketType: "bucket_outlier"` (IQR when no type is set), group names in `{slot}BucketOutlierLabels`; for percentile / SD also `{slot}BucketOutlierType` (`"bucket_outlier_pct"` / `"bucket_outlier_sd"`) with its threshold |
| Make only specific values stand out (the rest dimmed) / change the color of specific values | highlight | `enableHighlight: "on"` and `highlightValues`. 「〜だけ目立たせて」 is this mode even when the chart is also colored by that column; use `highlightOnPalette: "on"` (with `enableHighlight` off) only when the user asks to keep the other values in their normal palette colors |
| Sort in descending order / change the sort order | sort | `sortTarget: "y"` and `sortOrder: "desc"` |
| Put a title on the chart itself (only when the user asks for one; otherwise leave it off) | look up `setting: "title"` | `title` in `settings`. The `title` argument of create_chart / update_chart is only the name in the chart list and is not drawn |

**Confirm the names in this table too before using them.** `list_chart_settings` returns, for each category,
what can be done (`sectionNotes`). **Choose settings by 「what you want to do」.** When you do not know which category to look up,
first read the category descriptions.

- **For the operations listed in the table above, write them with the names in the table.** Even if a setting in another category seems
  to be able to do something similar, do not switch to it.
  For example, 「上位 10 件だけ」 needs `xPostFilterType`; `xOtherGroupEnabled` does not narrow the results.
