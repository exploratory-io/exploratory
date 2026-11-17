
[SOURCE-01] Read both get_data_frame steps (wrangling intent) and sample data (data state). firstStepSample / lastStepSample are CSV strings with a header row; use that header for column names. firstStepSample is omitted when it equals lastStepSample: read lastStepSample then.

[SOURCE-02] Top-level columnTypes maps last-step names to character/numeric/integer/etc.; columnUniqueCounts counts levels. Both are omitted when they equal the last step's: read rObjects.lastStep (or the steps[] entry it points to) then. In rObjects step records, columnDetails contains {name, type, uniqueCount}; older or unavailable records retain columns / columnTypes / columnUniqueCounts. Read the format present in each record; missing rates are not returned. Counts are reported as "50+" above 50; even numeric columns with few levels may be ordinal. Use only returned column names.

[SOURCE-03] Count rows/people/cases using rowCount (top level or rObjects.firstStep / lastStep / steps), not columnUniqueCounts or columnDetails[].uniqueCount. The cap (shown as "50+") is never a head count: a 1,500-row data frame must not be reported as 「50人の回答者」 from that value.

[SOURCE-04] An empty sample string means retrieval failed, not an empty data frame. Decide from the steps alone in that case and do not state row counts or concrete values.

[SOURCE-05] Before writing R, confirm the target from current metadata. Pass the confirmed id as dataFrameId to execute_r_script; df refers to its last step. For get_data_frame responses that include rObjects, read them to select the source step. R names are not returned. Their shape is (firstStep / lastStep may be just `{ stepNumber }`: read the steps[] entry with that stepNumber):
```
rObjects: {
  firstStep: { stepNumber: 1, stepId: "...", rowCount: 300, columnDetails: [{ name: "<column name>", type: "character", uniqueCount: 5 }] },
  lastStep: { stepNumber: 5, stepId: "...", rowCount: 3000, columnDetails: [{ name: "<column name>", type: "numeric", uniqueCount: "50+" }] },
  steps: [
    { stepNumber: 1, stepId: "...", rowCount: 300, columnDetails: [{ name: "<column name>" }] },
    { stepNumber: 2, stepId: "...", rowCount: 300, columnDetails: [{ name: "<column name>" }] },
    { stepNumber: 5, stepId: "...", rowCount: 3000, columnDetails: [{ name: "<column name>", type: "numeric", uniqueCount: "50+" }] }
  ]
}
```
[SOURCE-06] Check last-step columnDetails[].type or the returned columnTypes map before create_analytics slots (e.g. variableColumns); never put a character column in a numeric slot.

[SOURCE-07] steps includes all steps, upstream first. For a column lost later, find the most downstream step in steps[] whose columnDetails still contain it. R reads only the last step as df and R names are not returned, so do not script with a step name; if the column exists only in an earlier step, say so instead of computing from df. A step with rowCount: null is not loaded.

[SOURCE-08] For case counts, compare steps' rowCount and use the step where one row is one case. df is the last step: after pivot_longer or aggregation, rows may no longer equal records. For 「回答者数」「顧客数」 use the rowCount of a one-case-per-row step. With firstStep 300 respondents and lastStep 3000 rows (300 x 10 rating items), nrow(df) is 3000 and is wrong for respondent count.

[SOURCE-09] Use a step whose columnDetails actually include the referenced column. R returns NULL without an error for an absent column; mean(NULL, na.rm = TRUE) yields NA, which cannot be quoted in the reply. Example: 「推奨者」 existed, but 「推奨者フラグ」 did not exist in any step. If the column is only in an earlier step, do not compute from df.

[SOURCE-10] Translate English step operation names to descriptions in the user's request language (the examples are Japanese): Filter -> 「注文日で対象期間に絞り込み」「キャンセル注文を除外」; Aggregate (Summarize) Data -> 「月単位で売上を合計」. Do not display 「Filter」「Create Calculation」「Aggregate (Summarize) Data」 or other internal names (Select Columns, Join (Add Columns)).

[SOURCE-11] For an existing analysis, use only the type returned by list_analytics, e.g. Prophet（時系列予測）、線形回帰、ランダムフォレスト only if actually returned. Do not invent a type such as 異常値検知 (Exploratory has no such feature). For a new analysis, list_analytics describes only current artifacts; absence there does not prohibit creation. Look up creatable types with list_analytics_templates and the exploratory-analytics skill.

[SOURCE-12] Do not guess numbers, column names, or chart names the tools did not return.
