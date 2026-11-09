**Putting multiple questions into 1 chart (multiple variables)**

Used when you want to look together at **measurement columns lined up horizontally**, such as 「there are 10 columns of 10-level rating questions」.
It refolds the columns into 2 axes, 「変数」 and 「変数の値」.

```
create_chart(marker: "pivot",
  axes: { rowh: { "column": "(複数の変数)",
                  "columns": ["サービスの使いやすさ", "サービスの品質", "デザイン"],
                  "keyName": "評価項目" },
          colh: "(変数の値)",
          meas: { "column": "行数", "func": "count" },
          facet: "地域" })
```

- **Always pass the columns to fold in `columns`.** If you do not, it is refused
- `keyName` is the heading for the 「変数」 side (if omitted, a default name is used)
- **「(変数の値)」 is used as a pair with 「(複数の変数)」.** One alone is refused
- If you try to place it in a slot or chart where it cannot be placed, it is refused with the places where it can be placed attached

**「(複数の変数)」 and 「(変数の値)」 do not need to be placed in the same slot side by side.**
If you place 「(複数の変数)」 in any of the slots in the table above, 「(変数の値)」 can be placed in another
free slot. Choose the placement by whether you want to put it all in 1 table or split tables per question.

```
create_chart(marker: "pivot",
  axes: { rowh: ["性別", "地域"],
          facet: { "column": "(複数の変数)",
                   "columns": ["設問1", "設問2", "設問3"] },
          colh: "(変数の値)",
          meas: { "column": "行数", "func": "count" } })
```

- To split tables per question, place 「(複数の変数)」 in facet (repeat)
- To line up the questions as rows and columns within 1 table, place 「(複数の変数)」 in rowh / colh

**When the folded source columns are numbers with few distinct values, such as a 1-to-5 rating scale,
attach `func: "aschar"` to 「(変数の値)」.** This applies only when the request does not specify treatment such as "numeric", "value", or "integer"; otherwise use `none` or an integer func matching the request. If you omit it, it is split into continuous ranges as a number
(the same reason and the same fix as 「putting a numeric column with few distinct values on color」.
See the table of aggregations above).

```
colh: { "column": "(変数の値)", "func": "aschar" }
```

**A 0/1 numeric wide form (multiple-answer selection columns lined up horizontally) is completed on the chart side.**
The section 「Putting multiple questions into 1 chart」 above is for the horizontal form of stage ratings such as Likert.
0/1 selection columns are different from that, and you do not add a wrangling step (create_branch / pivot_longer).

Fold the 0/1 **numeric columns** into 「複数の変数」, and the value is `sum` (count) by default.
Use `func: "ave"` only when 「選択率」 or 「割合」 is stated explicitly. Do not use `count_ratio`.
Do not use it for TRUE/FALSE logical columns. For a logical value on its own, use
`truepct` / `truecount` / `true_ratio`.

If the request has no words such as 「選択率」 「割合」 「%」, always use the default `sum` (count).
Do not take the roundabout route of adding 「選択率」 to the title or labels yourself and then choosing `ave`.

```
axes: { rowh: "地域",
  colh: { "column": "(複数の変数)", "columns": ["購入要因_味", "購入要因_品質"],
    "keyName": "購入要因" },
  meas: { "column": "(変数の値)", "func": "sum" } }
```

Look at the notes of list_chart_settings (section: "func") for the slots where it can be placed and the details of aggregation,
and then write.

**For a column whose cell contains multiple values, make func: "multiple_answers" the first choice.**
Use it only on text/factor columns. Do not use it on numeric, logical, or date columns.
It cannot be used on the value shelf (y / meas / size / label).

```
{ "column": "サービスの改善点", "func": "multiple_answers" }
```

Look at the notes of list_chart_settings
(section: "func") for the separator, trim, de-duplication, and which marker x shelf combinations are possible, and then write.
Use the wrangling step `exp_multiple_answers_to_longer` only for special cases that cannot be achieved in the chart.
Except when you want to expand the column permanently, complete it on the chart side. Even when changing to a different chart (marker) with the same column,
you do not insert a wrangling step; just pass `func: "multiple_answers"` as it is to axes again, and there is no need to create a new branch or
a wrangling step such as 「行に分解」.
