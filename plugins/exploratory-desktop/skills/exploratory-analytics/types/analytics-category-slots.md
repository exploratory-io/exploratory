## Type conversion when a slot asks for categories

When you put a numeric column such as a 1-to-5 rating into a slot whose slots.columnTypes in get_analytics_template has no numeric
and has character / factor /
ordered / logical, **convert it to a category.** The variableColumns of latent class analysis is this case.
For a stage rating, use an **ordered factor** (example below). For a category with no order, character type is enough.

- Do not change the type of the source data. Create a branch with create_branch and convert on the branch
- **For a stage rating, make it an ordered factor** with set_factor_levels
  (`columns: [...]`, `levels: [...]`, `ordered: true`; see the correct example).
  If you are just making a column with no stage order a category, use mutate_multiple with `fun: "as.character"`
- Do not use `as.ordered` / `as.factor`. **Because you cannot specify levels yourself**,
  the order of stages becomes R's default (alphabetical)
- An ordered factor (`ordered,factor`) goes into the slots of latent class analysis and k-modes

Correct example:

```
create_branch  name: "潜在クラス用"
create_wrangling_step  command: "set_factor_levels"
                       params: { columns: ["サービスの使いやすさ", "サービスの品質"],
                                 levels: ['非常に悪い', '悪い', '普通', '良い', '非常に良い'], ordered: true }
create_analytics  analysisType: "exp_lca"
                  slots: {"variableColumns": ["サービスの使いやすさ", "サービスの品質"]}
```
