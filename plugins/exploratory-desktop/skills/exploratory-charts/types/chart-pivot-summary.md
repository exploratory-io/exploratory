**Always put the column to compare (the target column; the column placed on Y or values of the individual table) in some slot of the summary table.**
If you fold only the attribute columns into 「複数の変数」 and the target column is not placed anywhere,
the values collapse into the average / count of the target column **as a whole**, and it becomes a table where differences by attribute cannot be read.

How to build it (multiple attributes, 1 target column):
- This is only for putting the individual tables per attribute on 1 sheet. It is not used
  as a substitute for flat (rows that are not nested). Flat is `settings.pivotRowMode: "flat"`
- Pass to rowh 「複数の変数」 (columns: the list of attribute columns), followed by 「変数の値」 **as an array of 2**
  (`rowh: [{ "column": "(複数の変数)", "columns": [...] }, "(変数の値)"]`).
  The attribute name and that attribute's value become a 2-level row header
- Put the target column in colh (the same column used for Y / values in the individual tables. If it is a question /
  rating-item column that is already in long form, that 1 column)
- Put the aggregation of the target column in meas (the same aggregation as the individual tables).
  **Which aggregation is the default follows the notes of list_chart_settings (section: "func")**
  (defaults per scale, such as for stage ratings, are written there)

Example 1: 「属性別にクロス集計して」 (attribute columns: gender, age group, occupation. Target column: promoter)
1. Offer the attribute candidates as multiple choice before creating
2. If gender, age group, and occupation are chosen, ask hierarchy / flat before creating
3. Put the chosen columns together into the rowh of 1 table. Do not create 3 individually.
   For hierarchy, rowh: ["性別", "年代", "地域"], colh: "推奨者", and meas is 行数 x 2
   (count and row-direction ratio; the 「Ready-to-use combination」 above). For flat, add
   settings: { "pivotRowMode": "flat" } to the same axes
4. Use the way of building with 「複数の変数」 above only when the user asked for the combined 1 sheet.
   Do not add it on your own
