
The shape of the data that get_chart and get_analytics return.

- data: a **CSV string with a header row**. The first row is the actual column names and values follow from the second row.
  An array of row objects does not come back. Read it as CSV as it is
- dataFormat: always csv
- metadata: the chart definition with labels attached. It contains the title, type, X axis, Y axis, color, aggregate function, and so on
- dataNote: **an explanation of what that data is. It is always attached, whether or not data is present.**
  It says how many rows there are, what a row means in that figure, and whether it is everything or a sample

How to handle data being null:
- **It does not mean the chart has no data.** It only could not be fetched. The reason is in dataNote
- From the axis settings in metadata, work out what the chart shows. If you know the definition you can use it in the explanation
- Do not leave a chart out of the explanation because its data could not be fetched
- But do not write values or trends by guesswork for a chart that has no data

How to treat the CSV rows:

**Read dataNote first. Whether the rows can be trusted is written only there.**
The contents vary by chart type, so do not decide from the type alone.

- When dataNote says 「**この図が使った行はこれで全部です**」
  - The rows are the result the figure itself drew. **Do not run
    execute_r_script to get totals or composition ratios.** Bar charts and line charts contain the rows after aggregation
    as they are, so the totals by category are already there
  - But you cannot use it as 「全体の件数」 or 「元データのレコード数」.
    It is the row count after the chart aggregated
- When dataNote says 「**全部ではない可能性がある**」
  - Do not count totals, averages, composition ratios, or counts from these rows.
    If you need numbers, compute them with execute_r_script
- When dataNote says 「**集計前の生の行です**」 or 「**ビンごとの件数は入っていません**」
  - Histograms and density curves fall under this. Neither the bin heights on the screen nor the curve values are
    contained anywhere. **If you state counts, ratios, or medians, count them with execute_r_script**
- When dataNote says 「**転送の上限で途中までです**」
  - The rows are cut off partway. Do not count totals or counts
