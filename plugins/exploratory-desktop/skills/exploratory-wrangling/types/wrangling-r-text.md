**Writing R for text (the expression of mutate, exp_custom, and so on)**

- **Do not pass a column as the `pattern` of `sub`, `gsub`, `grepl`, `regexpr`, or `gregexpr` (also with `fixed = TRUE`).** These functions use only the first element of `pattern`: every row is searched for the first row's string,
  R only warns ("argument 'pattern' has length > 1 and only the first element will be used"), and the step is created with no error. Rows whose own string is different are left unchanged
- When the search string differs by row (it is in another column), use the stringr functions, which take one pattern per row: `stringr::str_replace(<column>, stringr::fixed(<pattern column>), "<replacement>")`
  (`str_replace_all`, `str_detect`, `str_remove` likewise), or `purrr::map2_chr`. An NA or empty pattern gives NA (and a warning), so keep the row's own value for those rows, for example with `ifelse`.
  After you build it, read rows from different parts of the result, including a row whose string differs from the first row's: do not judge by the first row only

- **A text rewrite (sub, gsub, str_replace) leaves a row unchanged when its pattern does not match that row, with no NA and no error, so counting NA does not find it.**
  After you rewrite, also count the rows where the new value is still equal to the source value (or still contains the separator you meant to replace) and read those rows.
  Write the pattern for what the request names (for example, the position of a separator), not for the rows you have seen: do not narrow a part to digits or letters when the request does not say it is only digits or letters
