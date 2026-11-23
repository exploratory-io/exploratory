6. For a single-chart request, read it back with get_chart and explain it. The following reading rules apply whenever existing results are read.
   What comes back:
   - metadata: what is being looked at by what
   - data: the result used for drawing (a CSV string with a header row)
   - dataNote: **what that data is.** The contents change by chart type, so always read it first.
     If it says 「これで全部です」, **do not run R for the same numbers.**
     Bar and Line charts contain the aggregated rows, so the totals are already out.
     Only when it says 「全部ではない可能性がある」 or 「ビンごとの件数は入っていません」 do you recount with execute_r_script
     (histogram bins and density curve values are not contained)
  - **Read simple totals and ratios from the data that already came back.** If a pivot contains every row of counts by score, do not repeat the aggregation from the source data to explain low (1 to 2) or high (4 to 5) ratings. **Do not call execute_r_script.** This data is the whole figure, not a sample (dataNote says so)
   Do not just line up numbers. **Quote concrete values and write what can be said.**
   For figures where data does not come back (maps, figures drawn with R), write only what can be said from metadata
