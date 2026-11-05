## Cross tabulation between clusters (evaluation axis x attribute axis)

The cluster membership of kmodes / kmedoids is in the analysis's own output (`data` / `table`).
Do not use `assign_cluster`. That command is for kmeans only.

Do this procedure only when a cross tabulation is needed for the user's request. When the existing analysis output can answer,
do not create a new branch, wrangling, or chart.

Before cross tabulating 2 clusterings, confirm that the cluster-membership output of each analysis contains the same respondent id.

1. For each analysis, choose 1 named outputType from that analysis's own availableOutputTypes and
   call get_analytics. Do not borrow the other analysis's outputType
2. Confirm that the returned data / table has both the cluster-membership column and the same respondent id
3. Only when both have the same id, join with wrangling for processing that needs to be saved, and
   build the cross table with pivot of create_chart
4. If there is no id, or they cannot be matched, do not try a join, guesswork, or assign_cluster.
   Explain that a cross tabulation cannot be made from the analysis outputs alone
