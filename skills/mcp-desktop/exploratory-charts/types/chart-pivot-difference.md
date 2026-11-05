Do not add it in the first proposal. When adding it, pass `conditionalFormatting` in the column specification of the
value shelf (the input contract is in the tool description of create_chart). Example colors: large positive difference
`#0365C0`, small positive difference `#51A7F9`, small negative difference `#EC5D57`, large negative
difference `#C82506`.

Do not fix the threshold. `±1` / `±2` are commonly used examples but do not apply them unconditionally as defaults.
Compute the distribution of the differences (max and min) from the actual values of the pivot you just created / read,
choose a meaningful split, and explain why you chose it.
In a percent-display column, 「2」 on the screen is 2 points (the executing side does the internal scale conversion, so
do not specify `cfOffsetScaleV2`).
