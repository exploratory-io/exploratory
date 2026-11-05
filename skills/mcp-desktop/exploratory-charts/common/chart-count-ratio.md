**Express the ratio of counts with the aggregate function `count_ratio` (「割合」 on the screen), for cross tabulations (pivot) and Bar charts alike.**

A table or bar of counts alone cannot be read. **Include the ratio in the table rather than calculating it only in the explanation.**

**The denominator matches the unit the user wants to compare.** Use the whole-composition ratio only when the intended denominator is the **whole**.
正しい例: When adding category counts and percentages to a metric based on valid responses (such as NPS, a mean, or a satisfaction rate), use the metric's valid-response denominator unless the user explicitly requests a different denominator. If the user requests percentages of all respondents, retain nonresponses in that denominator and state that it differs from the metric's valid-response base; otherwise filter out nonresponses and correct any mismatch in the artifact in this turn.
誤った例: Ignore the requested denominator, explain the intended percentages only in chat, and leave the artifact correction to the next suggestion.
For tables that compare per attribute or per group, a ratio that becomes 100% within that unit
reads better (「女性のうち批判者が 8%」, not 3.7% of the whole).
Which setting produces that differs by chart, so **decide after looking up with list_chart_settings**
(for pivot / summarytable, table calculation and its direction; for Bar charts, the ratio direction and barstyle).
Do not decide by rote; **match the shape of the table you built (what you placed in which slot).**

How to do it: put `"行数"` in the value (y / meas) and attach `func: "count_ratio"`.

```
axes: { rowh: "性別", colh: "年代",
  meas: { "column": "行数", "func": "count_ratio" } }
```

**The forms for lining up both count and ratio are only the following 2.** Put 「行数」 twice in the value slot, and
**the 1st is always the count; only the 2nd is the ratio.**

(a) For a composition ratio relative to the whole — make the 2nd `count_ratio` (do not attach a table calculation)

```
meas: [
  { "column": "行数", "func": "count" },
  { "column": "行数", "func": "count_ratio" }
]
```

(b) For a composition ratio within a row or column (making 100% per attribute and so on; the case of 「The denominator matches the unit the user wants to
compare」 above) — leave the 2nd as `count` and apply the table calculation **only to the 2nd**

```
meas: [
  { "column": "行数", "func": "count" },
  { "column": "行数", "func": "count" }
]
settings: {
  "meas1WindowFuncGroup": "total",
  "meas1WindowFunc": "ptotal",
  "meas1WindowFuncDirection": "table_across"
}
```

**For the count-and-ratio table forms above, do not apply both `count_ratio` and a table-calculation ratio to the same value.** Also, **attach the ratio setting
only to the 2nd value (`meas1...`).**
If a ratio is applied to the 1st, that is not a count.

Bar charts also need the denominator to match the comparison. For example, compare 「使いやすさが低評価の人」 by occupation with ratios.
Respondent counts differ by occupation, so with a bar of counts alone you cannot tell whether 「低評価が多い」 or 「そもそも人数が多い」.

```
axes: { x: {"column": "地域"}, y: {"column": "行数", "func": "count_ratio"} }
```

- **When color is not placed**, it is the composition ratio relative to the whole (the bars total 100%)
- **When color is placed** too, if it is a ratio of counts it stays `count_ratio`. For 100% stacking within each bar,
  combine `barstyle: "stack"` with `yWindowFuncGroup: "total"`, `yWindowFunc: "ptotal"`, and `yWindowFuncDirection: "color"`.
  For bars, `count_ratio` is a count aggregation followed by this table-calculation ratio, not two successive ratios.
  `barstyle` alone changes the arrangement, not the denominator.

**When the count itself is what the user wants to know** (asked 「何件あるか」, the scale is the main point), leave it at `count`.
A ratio makes the count unreadable, so when both are needed, line up the count and the ratio as above.

For a value other than 「行数」 such as an amount or score, use table calculation (`ptotal` and so on) when the composition ratio of that aggregated value is needed. For bars of 「行数」, `count_ratio` also uses the `ptotal` pipeline described above.
The ratio of rows that meet a condition is `count_if_ratio` (「条件に合った行の割合」 on the screen).
Look up usable names with list_chart_settings (section: "func") and then write.
When the value is something other than 「(行数)」 such as an amount or score, the rules for ratios of counts do not apply.

**There is not just one way to express a ratio.** Choose by what the ratio is relative to.

| What the ratio is relative to | What to use |
|---|---|
| Composition ratio relative to the whole | `func: "count_ratio"` (counts) / table calculation `ptotal` (other than counts) |
| Ratio of rows that meet a condition | `func: "count_if_ratio"` |
| Composition ratio only within a certain row, column, or group | Table calculation (for pivot and summary table, `meas{N}WindowFuncGroup: "total"`, `meas{N}WindowFunc: "ptotal"`). The direction is `meas{N}WindowFuncDirection`: per row (each row 100%) is `table_across`, per column (each column 100%) is `table_down`. Do not use `"row"` for the direction. **Only the cross tabulation default (row direction) uses `table_across`** (the 「Ready-to-use combination」 above) |

Confirm names and usable directions with list_chart_settings (section: ["func", "windowFunc"]) and then
write. **Read whether the request is for 「ratio relative to the whole」, 「per row」, 「per column」, or
「rows that meet a condition」, and choose only the 1 that fits.**
There is no need to line up fixed combinations every time.
