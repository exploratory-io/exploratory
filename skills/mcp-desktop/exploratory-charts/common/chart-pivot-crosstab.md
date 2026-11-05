**Ready-to-use combination (the default for cross tabulation)**

- Rows = attribute (`rowh`)
- Columns = the target to look at (such as a 5-level rating; `colh`). When there are multiple targets and they go on 1 sheet, put
  「(変数の値)」 in colh and 「(複数の変数)」 for the target columns. When there are multiple targets and you want to split the tables, put
  「(複数の変数)」 in facet (the same as 「When there are many questions, put the questions in 「繰り返し」」 below)
- Values = (行数) x 2. The 1st is the count and the 2nd is the row-direction ratio
- A pivot is for a cross tabulation compared in 2 directions, rows and columns. Do not make a pivot with nothing in rows (`rowh`), which ends up as a 1-row table. To just compare several numeric columns or items side by side, use a bar chart with 「(複数の変数)」 on x. When the user asks for a pivot or a table, keep that form

```
axes: { rowh: "地域", colh: "購入意向",
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count" }] }
settings: {
  "meas1WindowFuncGroup": "total",
  "meas1WindowFunc": "ptotal",
  "meas1WindowFuncDirection": "table_across"
}
```

The direction value is `"table_across"` (the UI's 「行 (左から右)」). Do not use `"row"`.

**After creating the table, always explain in the reply whether you included or excluded NA (no answer) in the denominator.**
You may decide include / exclude yourself, but not writing what you decided is not acceptable.
If included, state it in one sentence such as 「無回答を分母に含めています」; if excluded, 「無回答は除いて集計しています」.

**Create 「合計との差」 (conditional formatting) only when there is an additional instruction.**
An additional instruction is a request in which the user explicitly asked for comparison or difference between groups. Examples:
- Create: 「全体と比べて差があるか」「平均より高い/低いグループはどこか」
- Do not create: 「クロス集計して」「割合も教えて」 (just lining up counts and ratios)

**Do not add a summary 1 sheet on your own**.
When you have created several tables, write the reading of each and finish. Whether a combined sheet is needed
is offered as a next-step choice for the user to choose (how to build it is in the section 「Putting multiple questions into 1 chart」 below)

**For pivot / summarytable, the magnitude of values is bar-colored at creation time.**
Do not look up list_chart_settings and update_chart just for the color.

**When there are 2 or more attribute columns, pass multiple column names to `rowh` as they are.**
With 2-3 row attributes and no requested layout, create one hierarchical pivot (`settings.pivotRowMode: "hierarchy"`).
With 4 or more row attributes, default to one parallel pivot (`settings.pivotRowMode: "flat"`).
Explicit requests take priority: 「並列で」「並べて」「入れ子にせず」「それぞれ別に」 mean one parallel pivot;
「入れ子で」「階層で」 mean one hierarchical pivot. Create both only when the user requests a comparison of both layouts.
For example, age, gender and occupation on rows and questions (Multiple Variables) on columns means hierarchy by default.
Do not put questions on rows.
Multiple Variables on row or column shelves disables parallel mode and displays hierarchy, even with 4 or more attributes; for parallel results per question, put Multiple Variables on facet (Repeat By) or create a separate table per question.
For composition, use count and count plus `meas1WindowFuncGroup: "total"`,
`meas1WindowFunc: "ptotal"`, `meas1WindowFuncDirection: "table_across"` in either layout,
so each attribute row sums to 100%, including flat mode.
For both hierarchy and flat, axes are the same (all attributes in rowh, the target to look at in colh).
Do not put the 2nd attribute column in colh when there is no target to look at.
Do not fold attributes with 「(複数の変数)」 as a substitute for flat (doing so
removes the hierarchy / flat specification itself).

Example of hierarchy (do not write `pivotRowMode`; the default is hierarchy):
```
axes: { rowh: ["性別", "年代"], colh: "推奨度",
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count" }] }
```

Example of flat:
```
axes: { rowh: ["性別", "年代"], colh: "推奨度",
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count" }] }
settings: { "pivotRowMode": "flat" }
```
