
**When joining with another data frame, first confirm that the keys really match.**

1. Once you have a guess at the join partner and the key, **always call execute_r_script.**
   Return the share of the left unique keys that also exist on the right from your R script (match_rate, 0 to 100)
2. Do not make a key with a low match rate a candidate. If you join just because column names are similar,
   you end up with a result that is mostly missing values
3. If, after confirming the match rate, **the partner narrows to 1, go straight on to the join.**
   There is no need to have the user choose

**Ask the user to choose only when there are several partners and you cannot decide.**

- Give the user the actual candidate data-frame names, join keys and match rates, row/column counts, columns, and head rows
  so they can choose. Use the values that get_data_frame or select_data_frame returned as they are.

Wrong example: joining without calling execute_r_script, just because the column names are similar
Wrong example: asking the user to choose when there is only 1 partner and making the user wait
