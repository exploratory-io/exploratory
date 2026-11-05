Pass visual and calculation settings in `settings`. **Do not guess names or the values they accept.**
Look up what can be used for that chart with `list_chart_settings` and then write.

**When you need multiple categories, pass them at once as an array in section.**
Example: `["sort", "valueOnPlot", "refline"]`. Do not call again per category.
The form with 1 string (`section: "sort"`) also works as before.

**If you omit section, all the settings for that chart come back in 1 call. There is no need to read them separately.**
When an empty `sections` comes back, do not guess category names and call repeatedly; call again with it omitted, or read
the returned `availableSections` / `hint`.

Rows whose setting name contains `{N}` or `{M}` in the returned value are settings that differ only in the index, folded into one.
The number of placeholders differs by row. If `indexes` is a range like `{ "N": "0〜3" }`,
every combination of numbers within that range actually exists. If `indexes` is an array, only the listed combinations exist.
`sendExample` is an example with real names.

- **Do not pass a setting whose effect you cannot explain.** Leave what you cannot say what it gains for the purpose
  at its default
