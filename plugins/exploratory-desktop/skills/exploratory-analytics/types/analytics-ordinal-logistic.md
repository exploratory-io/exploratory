## Ordinal scale (ordinal logistic / build_polr)

Do not put a 0-to-10 recommendation score as a number in the objectiveVariable of build_polr.
A type-confirmation dialog appears and it becomes RUN_REJECTED.

For NPS, treat 0 to 6 as detractors, 7 to 8 as passives, and 9 to 10 as promoters, and **add a new 「推奨者区分」 column
with the case_when command in the same data frame.** It only adds 1 column, so do not call create_branch.

Correct example:

```
create_wrangling_step  command: "case_when"
                       params: {"column":"推奨度","columnSelectorType":"newColumn","newColumnName":"推奨者区分","newValueDataType":"factor","as_factor_order":"topToBottom","cases":[{"conditions":[{"operator":"isNA"}],"valueType":"na"},{"conditions":[{"operator":"lessThanOrEqualTo","value":6}],"value":"批判者"},{"conditions":[{"operator":"lessThanOrEqualTo","value":8}],"value":"中立者"}],"defaultValue":"推奨者"}
```

**newValueDataType: "factor" with as_factor_order is required.** Without it, the level order becomes R's default (alphabetical),
which can be the reverse of the intended meaning order (detractor < passive < promoter).
The comparison direction of the ordinal logistic and the interpretation of odds ratios become reversed.
Do not write factor(case_when(...)) in a mutate expression, or use as.factor.
