Even for the same 1-to-5 rating column, **in the branch used as input to exp_lca, convert it to an ordered factor**
(set_factor_levels with `columns`, `levels`, `ordered: true`).
The type becomes `ordered,factor` and goes into the slots of exp_lca / k-modes.
A bare `as.character` is used only for categories with no order.
**For the target variable of build_polr, add a new category column (the 推奨者区分 and so on) in the same data frame; do not call create_branch.**
Even when the source column is used in both analyses, keep this target column separate from the input-column type conversion for exp_lca / k-modes.
