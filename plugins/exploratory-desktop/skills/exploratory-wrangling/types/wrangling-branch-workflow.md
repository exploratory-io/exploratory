Procedure:

1. **Finish the common wrangling first.** Whatever is needed in both branches, such as type conversion and excluding unneeded rows,
   is done before creating the branch
2. Create the branch with `create_branch`. `name` is what you point to by this name when joining, so
   make it a name that shows what it contains (example: MAU). If you omit `fromStep`, the branch is created
   from the step you created immediately before
3. **Right after creating it, that branch is the target of wrangling.** If you call create_wrangling_step next, it is
   stacked on the branch
4. When the wrangling of the branch is finished, **return to the original data frame** with `select_data_frame`.
   You can confirm that you returned from the returned list of columns
5. Continue the wrangling of the main line
6. Join the branch with a `join` step. Pass **the name of the branch** to `with` and the combination of
   keys to join on to `on`
   To stack rows vertically, use `create_wrangling_step` with `command: "set_operation"`, `params: { operation: "bind_rows", dataFrames: ["<branch name>"] }`.

To change the branch point of an existing branch later, use `move_branch`. Pass the name or id of the target branch to `branch`,
and the step name or id of the parent data frame to be the new branch point to `toStep`.
The branch's subsequent steps, charts, and analyses are kept, but it can only be moved to a step that belongs to the same
parent data frame as the branch point. Moving it to a step after aggregation changes the granularity of the columns, so before moving, confirm the columns, the row unit, and
the meaning of the aggregation.

Correct example (computing DAU and MAU from an access log and joining them):

```
1. Make 「アクセス日時」 a datetime type with mutate        (common)
2. Narrow with filter to rows where 「イベントタイプ」 is not SIGNUP (common)
3. create_branch  name: "MAU"
4. mutate  as: "アクセス月", expression: floor_date(`アクセス日時`, unit = "month")
5. group_by  columns: ["アクセス月"]
6. summarize  aggregate: [{ column: "ユーザーID", func: "n_distinct", as: "MAU" }]
7. select_data_frame  dataFrame: "アクセスログ"        (return to the main line)
8. mutate  as: "アクセス日", expression: as.Date(`アクセス日時`)
9. group_by  columns: ["アクセス日"]
10. summarize  aggregate: [{ column: "ユーザーID", func: "n_distinct", as: "DAU" }]
11. mutate  as: "アクセス月", expression: floor_date(`アクセス日`, unit = "month")
12. join   with: "MAU", type: "Left Join", on: [{ left: "アクセス月", right: "アクセス月" }]
13. mutate  as: "利用日の割合", expression: `DAU` / `MAU`
```

The month columns in steps 4 and 11 are made with mutate on purpose: they are the join key in step 12, so the join still needs the column itself.
If a step only aggregates by month or day, `groupFun` does it without a helper column (see the groupFun note in the list of things to watch out for).

Things to watch out for:

- **When you only aggregate by day or month, specify it with `groupFun`.** Rounding a date column into another column first is needed
  only when the column itself is used afterward (for example as a join key, as in the correct example). Instead of rounding it into another column and then
  aggregating, write `groupBy: [{ column: "<date column>", groupFun: "rtoday" }]`.
  What you can use are rtoyear / rtohalfyear / rtoq / rtobimon / rtomon / rtoweek / rtoday /
  rtohour / rtomin / rtosec, and extractions (year / mon / week / day / dayofweek and so on)
- **The join partner must already be finished.** If you try to join before building the branch's aggregation,
  it fails with 「まだ実行されていません」
- The join keys must have **the same values** on both sides. If one side is a date and the other is the first day of the month,
  first create a column that rounds the date side to the first of the month
- When you lose track of whether you are working in a branch or have returned to the main line,
  call select_data_frame to check
