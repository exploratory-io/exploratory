- **Use refline / trendLine settings for a Y reference line or Y trend line calculated over part of the data.**
  Set `{slot}ReflineBaseDataRangeType` or `{slot}TrendLineBaseDataRangeType` for a value range or the first N periods; for a Y reference line N periods ago, use `{slot}ReflineType: "lag_period"`.
  Look them up with list_chart_settings. Do not filter the chart data or enter an R-computed constant instead. First N periods and lag_period need an X column that returns dates (rtoyear / rtomon), not extracted numbers.

Correct example:
```
1. Confirm names and values with list_chart_settings (marker: "bar", section: "refline")
2. create_chart (marker: "bar",
                axes: { x: "製品カテゴリー", y: "売上金額" },
                settings: { yReflineType: "ave", sortTarget: "y", sortOrder: "desc" })
```

Wrong example: `settings: { referenceLine: "average" }` (there is no such name. It is refused)
