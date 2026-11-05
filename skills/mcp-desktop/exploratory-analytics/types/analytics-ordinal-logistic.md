## Ordinal scale (ordinal logistic / build_polr)

Do not put a 0-to-10 recommendation score as a number in the objectiveVariable of build_polr.
A type-confirmation dialog appears and it becomes RUN_REJECTED.

For NPS, treat 0 to 6 as detractors, 7 to 8 as passives, and 9 to 10 as promoters, and **add a new 「推奨者区分」 column
with mutate in the same data frame.** It only adds 1 column, so do not call create_branch.

Correct example:

```
create_wrangling_step  command: "mutate"
                       params: { as: "推奨者区分",
                                 expression: "factor(case_when(is.na(`推奨度`) ~ NA_character_, `推奨度` <= 6 ~ '批判者', `推奨度` <= 8 ~ '中立者', `推奨度` >= 9 ~ '推奨者'), levels = c('批判者','中立者','推奨者'))" }
```

**levels= is required.** If you do not add it, the factor's level order becomes R's default (alphabetical),
which can be the reverse of the intended meaning order (detractor < passive < promoter).
The comparison direction of the ordinal logistic and the interpretation of odds ratios become reversed.
Do not use a factor without levels, or as.factor.
