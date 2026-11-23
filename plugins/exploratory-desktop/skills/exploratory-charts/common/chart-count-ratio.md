**Express the ratio of counts with the aggregate function `count_ratio` (「割合」 on the screen), for cross tabulations (pivot) and Bar charts alike.**

For a new table or bar, counts alone cannot be read. When rebuilding an existing report whose table or bar shows counts only, or when the user asks for counts only, keep counts only. **Include the ratio in the table rather than calculating it only in the explanation.**

**The denominator matches the unit the user wants to compare.** Use the whole-composition ratio only when the intended denominator is the **whole**.
正しい例: When adding category counts and percentages to a metric based on valid responses (such as NPS, a mean, or a satisfaction rate), use the metric's valid-response denominator unless the user explicitly requests a different denominator. If the user requests percentages of all respondents, retain nonresponses in that denominator and state that it differs from the metric's valid-response base; otherwise filter out nonresponses and correct any mismatch in the artifact in this turn.
誤った例: Ignore the requested denominator, explain the intended percentages only in chat, and leave the artifact correction to the next suggestion.
For tables that compare per attribute or per group, a ratio that becomes 100% within that unit
reads better (「女性のうち批判者が 8%」, not 3.7% of the whole).
Which setting produces that differs by chart, so **decide after looking up with list_chart_settings**
(for pivot / summarytable, a count ratio is `count_ratio` and its direction; for Bar charts, the ratio direction and barstyle).
Do not decide by rote; **match the shape of the table you built (what you placed in which slot).**

How to do it: put `"行数"` in the value (y / meas) and attach `func: "count_ratio"`.

```
axes: { rowh: "性別", colh: "年代",
  meas: { "column": "行数", "func": "count_ratio" } }
```

**The forms for lining up both count and ratio are only the following 2.** Put 「行数」 twice in the value slot, and
**the 1st is always the count; only the 2nd is the ratio.**

(a) For a composition ratio relative to the whole — make the 2nd `count_ratio` (do not attach a table calculation) and give **only the direction** `"table_down_across"` (the whole table) in settings. Without it, a pivot with 2 values uses `table_down` (per column)

```
meas: [
  { "column": "行数", "func": "count" },
  { "column": "行数", "func": "count_ratio" }
]
settings: {
  "meas1WindowFuncDirection": "table_down_across"
}
```

(b) For a composition ratio within a row or column of a pivot (making 100% per attribute and so on; the case of 「The denominator matches the unit the user wants to
compare」 above) — keep the 2nd as `count_ratio` (「割合」 on the screen) and give **only the direction** in settings

```
meas: [
  { "column": "行数", "func": "count" },
  { "column": "行数", "func": "count_ratio" }
]
settings: {
  "meas1WindowFuncDirection": "table_across"
}
```

`table_across` is per row (each row 100%, the UI's 「行 (左から右)」 on the Japanese screen, 「Row (Across)」 on the English screen); use `"table_down"` only for per column (each column 100%).
**Do not pass `meas1WindowFunc` or `meas1WindowFuncGroup` yourself.** `count_ratio` writes them (`rtotal`, a reserved value that cannot be chosen on the screen).
Do not use `ptotal` for a count ratio in a pivot.
**Attach the direction only to the 2nd value (`meas1...`).** If a ratio is applied to the 1st, that is not a count.

Bar charts also need the denominator to match the comparison. For example, compare 「使いやすさが低評価の人」 by occupation with ratios.
Respondent counts differ by occupation, so with a bar of counts alone you cannot tell whether 「低評価が多い」 or 「そもそも人数が多い」.

```
axes: { x: {"column": "地域"}, y: {"column": "行数", "func": "count_ratio"} }
```

- **When color is not placed**, it is the composition ratio relative to the whole (the bars total 100%)
- **When color is placed** too, if it is a ratio of counts it stays `count_ratio`. For 100% stacking within each bar,
  combine `barstyle: "stack"` with `yWindowFuncGroup: "total"`, `yWindowFunc: "ptotal"`, and `yWindowFuncDirection: "color"`.
  For bars, `count_ratio` is a count aggregation followed by this table-calculation ratio, not two successive ratios.
  For this 100% stack in a bar you place the table calculation (`yWindowFunc` and its direction) yourself; in a pivot you never pass it, because `count_ratio` writes it there.
  `barstyle` alone changes the arrangement, not the denominator.

**When the count itself is what the user wants to know** (asked 「何件あるか」, the scale is the main point), leave it at `count`.
A ratio makes the count unreadable, so when both are needed, line up the count and the ratio as above.

For a value other than 「行数」 such as an amount or score, use table calculation (`ptotal` and so on) when the composition ratio of that aggregated value is needed. For bars of 「行数」, `count_ratio` also uses the `ptotal` pipeline described above (that is a bar; a pivot of 「行数」 uses `count_ratio` plus the direction only).
The ratio of rows that meet a condition is `count_if_ratio` (「条件に合った行の割合」 on the screen).
Look up usable names with list_chart_settings (section: "func") and then write.
When the value is something other than 「(行数)」 such as an amount or score, the rules for ratios of counts do not apply.

**There is not just one way to express a ratio.** Choose by what the ratio is relative to.

| What the ratio is relative to | What to use |
|---|---|
| Composition ratio relative to the whole | `func: "count_ratio"` (counts; in a pivot, plus `meas{N}WindowFuncDirection: "table_down_across"`) / table calculation `ptotal` (other than counts) |
| Ratio of rows that meet a condition | `func: "count_if_ratio"` |
| Composition ratio only within a certain row, column, or group (counts in a pivot) | `func: "count_ratio"` plus `meas{N}WindowFuncDirection` only: per row (each row 100%) is `table_across`, per column (each column 100%) is `table_down`. Do not pass `meas{N}WindowFunc` / `meas{N}WindowFuncGroup`. Do not use `"row"` for the direction. **Only the cross tabulation default (row direction) uses `table_across`** (the 「Ready-to-use combination」 above) |
| Composition ratio only within a row, column, or group, for a summary table or a value other than counts | Table calculation (`meas{N}WindowFuncGroup: "total"`, `meas{N}WindowFunc: "ptotal"`, direction `meas{N}WindowFuncDirection`) |

Confirm names and usable directions with list_chart_settings (section: ["func", "windowFunc"]) and then
write. **Read whether the request is for 「ratio relative to the whole」, 「per row」, 「per column」, or
「rows that meet a condition」, and choose only the 1 that fits.**
There is no need to line up fixed combinations every time.
