**When you use a stage-rating column in a table or chart, before using it, convert it to an ordered factor.**
**Fix it on the spot and then build**.
If you do not, the stages are not arranged in meaning order. Ordered items such as age group, store size and visit frequency also keep meaning order, not value or character order.

**However many columns, converting them takes just 1 step.**

```
create_wrangling_step  command: "set_factor_levels"
                       params: { columns: [all the stage-rating columns that share these levels],
                                 levels: ['まったくそう思わない', 'あまりそう思わない', 'どちらともいえない', 'そう思う', '非常にそう思う'], ordered: true }
```

**Pass `ordered: true`**. Making it ordered not only gives the correct arrangement, but also lets it be passed straight to methods that treat
it as an ordinal scale (ordinal logistic regression and so on). It also goes into the slots of latent class analysis and k-modes
(the column type becomes `ordered,factor`).

For levels, arrange **only the actual values that profile_data_frame returned** in meaning order (do not write
values that are not in the data; include every value the data has, because a value left out of levels becomes NA). Put in one `columns` list only the columns
that share the same values; a column with other levels gets its own set_factor_levels step. The stage wording differs by dataset, so do not reuse the strings in this example
as they are. Do not use `as.ordered` / `as.factor`. Because **you cannot specify levels yourself**,
the order of stages becomes R's default (alphabetical).

After fixing, write in 1 line what you fixed and how
     (which columns, as a factor in which order).
