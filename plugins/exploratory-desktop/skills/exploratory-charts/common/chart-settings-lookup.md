Pass visual and calculation settings in `settings`. **Do not guess names or the values they accept.**
Look up what can be used for that chart with `list_chart_settings` and then write.

**When you need multiple categories, pass them at once as an array in section.**
Example: `["sort", "valueOnPlot", "refline"]`. Do not call again per category.
The form with 1 string (`section: "sort"`) also works as before.

**If you pass only marker (no section, search or setting), an index comes back (categories, their notes and counts), not the settings. Pass the categories you need as section (an array is fine) to get the setting names and values.**
When an empty `sections` comes back, do not guess category names and call repeatedly; call again with it omitted, or read
the returned `availableSections` / `hint`.

Rows whose setting name contains `{N}` or `{M}` in the returned value are settings that differ only in the index, folded into one.
The number of placeholders differs by row. If `indexes` is a range like `{ "N": "0〜3" }`,
every combination of numbers within that range actually exists. If `indexes` is an array, only the listed combinations exist.
`sendExample` is an example with real names.

- **Do not pass a setting whose effect you cannot explain.** Leave what you cannot say what it gains for the purpose
  at its default
