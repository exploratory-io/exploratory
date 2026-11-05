チャートの種類ごとの行（複数の変数を置ける枠、既定で足す設定）は、各 types/chart-<種類>.md の末尾にある。以下は全種類に共通する決まり。

# Add by default the settings each chart type needs to be readable

**It is not 「do it because it was said」.** What is needed to read that figure is added
even if not asked. Conversely, what is not in the table below is not added
(the rule above, 「do not pass a setting whose effect you cannot explain」, applies as is).
The same holds inside one setting: when choices differ in how much they show (value only / label and value),
pick the one that shows what was asked, and do not fill in a label the user did not give.

Always confirm setting names with `list_chart_settings` before writing.
For charts not in the table above (maps, radar, figures drawn with R, and so on), leave them at their defaults.

**Look up aggregation (`func`) with `list_chart_settings` too** (`section: "func"`).
For each slot and column type, the usable aggregations and the default come back. If you omit it, the default goes in silently.

| Column type | Default | Commonly used |
|---|---|---|
| Number | `sum` (total) | `ave` (average) / `median` / `min` / `max` / `countd` (distinct count) |
| String | `countd` (distinct count) | `mode` (most frequent value) |
| Logical (TRUE/FALSE) | `truecount` (count of TRUE) | **For a ratio, `truepct`** (`true_ratio` for pivot and summary table) |
| Date | `countd` (`datemax` for pivot and summary table) | `datemin` / `datemax` |
| `"行数"` | `count` | `count_ratio` (ratio relative to the whole) |

**The average is `ave`** (`mean` / `avg` do not exist in the product, and if passed they silently fall back to the default).
**`ave` cannot be used on a logical column.** For a 0/1 number it is `ave`; for TRUE/FALSE it is `truepct`.

For bar, reference lines are available on the X and Y axes.
