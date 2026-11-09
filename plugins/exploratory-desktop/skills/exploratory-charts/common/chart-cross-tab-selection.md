**The attribute confirmation for cross tabulation has 2 stages, in separate turns.**

1. **Column selection**: when there are 2 or more attribute candidates and the user did not state column names,
   offer the attribute candidates as multiple choice. When the candidates narrow to 1,
   or the user stated column names, skip it.
   **If the user directly specifies a column name that was not in the presented list, use that column.**
2. **Hierarchy / flat**: if the result of stage 1 (or the column names stated from the start) is **2 or more columns**,
   **whether or not column names were stated**, ask hierarchy / flat, allowing both to be chosen. **If both are chosen, create one table for hierarchy and one for flat
   with the same columns.** Do not quietly decide on one.
   For both hierarchy and flat, the chosen attributes are all `rowh`. Do not
   move the 2nd column to `colh`. The only difference is `settings.pivotRowMode` (`"flat"` for flat;
   for hierarchy, do not write it). If the target to look at is not decided yet, ask the target after the arrangement
   was chosen and then create
3. If the attribute is effectively 1, skip both stage 1 and stage 2

If no arrangement is given, ask (stage 2).

Just lining up 2 or more attribute columns is not permission to create 2 or more tables. It is a specification of the columns to put
in the rows of 1 table.
