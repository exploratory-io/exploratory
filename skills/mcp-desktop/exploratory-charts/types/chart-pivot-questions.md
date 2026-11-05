**Do not make rating items / question columns that are lined up horizontally into long form before using them.** Without adding wrangling,
pass those columns as they are to the 「複数の変数」 slot.

```
axes: { rowh: "性別",
  colh: { "column": "(複数の変数)", "columns": ["サービスの使いやすさ", "サービスの品質",
    "デザイン", ...], "keyName": "評価項目" },
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count_ratio" }] }
```

**Long form is needed only when you want to put 「複数の変数」 in 2 places**
(the product looks at only 1 place per chart. A 「summary table」 that puts attributes together in rows and rating items
together in columns is such a case). It is not needed for individual tables.

Example 2: 「属性別に評価項目をまとめて見たい」 (attribute columns: gender, age group, occupation, usage frequency.
There are 10 rating-item columns lined up horizontally. They are stage ratings, so **the default is count and ratio**)
1. Build gender x rating items, age group x rating items, occupation x rating items, and usage frequency x rating items
   one at a time (individual tables. Attribute in rowh, the 10 rating-item columns in colh with 「複数の変数」,
   and the count and ratio of 「変数の値」 lined up as 2 in meas. **Do not make it long form**).
   Only when the user asks for 「平均スコアで」 do you make it func: "ave"
2. **Only when the user also asked for 1 sheet combining the 4**, build a summary table with attributes in rows and rating items
   in columns. This needs 「複数の変数」 in 2 places, so here for the first time long form is needed
   (make 「評価項目」 and 「スコア」 columns with pivot_longer). rowh:
   [{ "column": "(複数の変数)", "columns": ["性別", "年代", "地域", "利用頻度"] },
   "(変数の値)"], colh: "評価項目", and meas the same as the individual tables.
   **Do not make it long form for the individual tables** (as in the example above, they can be built while staying wide)

**When there are many questions, put the questions in 「繰り返し」. The number of attributes does not matter** (even if it is 1, the same).
「複数の変数」 works in only 1 place per chart, but **attributes just line up raw columns in rows**, so
the 「複数の変数」 slot can be used for the questions. **With this form long form is not needed.**
When there are 2 attribute columns and flat was chosen, also add `"pivotRowMode": "flat"` to settings
(if you do not add it, it is hierarchy by default).

```
axes: { rowh: ["地域", "年代"],
  colh: "(変数の値)",
  facet: { "column": "(複数の変数)", "columns": ["設問1", ... "設問16"], "keyName": "設問" },
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count" }] }
settings: {
  "meas1WindowFuncGroup": "total",
  "meas1WindowFunc": "ptotal",
  "meas1WindowFuncDirection": "table_across"
}
```

It is the same when there is 1 attribute (just make it `rowh: "年代"`).

```
axes: { rowh: "年代",
  colh: "(変数の値)",
  facet: { "column": "(複数の変数)", "columns": ["10 columns of rating items"], "keyName": "評価項目" },
  meas: [{ "column": "行数", "func": "count" }, { "column": "行数", "func": "count" }] }
settings: {
  "meas1WindowFuncGroup": "total",
  "meas1WindowFunc": "ptotal",
  "meas1WindowFuncDirection": "table_across"
}
```

One table lines up per question, with each table's rows being 「region x age group」 and its columns the response stages
(the denominator of the ratio is within the row. As in 「The denominator matches the unit the user wants to compare」 above).

**Before writing 「it cannot be built because it cannot be folded」,
try the form where only the question side is folded and the attributes are lined up in rows.**

**If you put the questions in repeat, long form is not needed even with 1 attribute** (the 2nd example above).
**Building long form (pivot_longer) is acceptable only when 「複数の変数」 must be placed in 2 places.**
With attributes in rows, stages in columns, and questions in repeat, 3 axes are covered, so that need
almost never arises. Before adding working data frames or branches, check whether it can be built in this form.
