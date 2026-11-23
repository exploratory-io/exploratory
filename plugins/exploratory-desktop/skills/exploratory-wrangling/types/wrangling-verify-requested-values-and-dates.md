- **When the request states a value, a time of day, a unit, or a format in words, compare the result with those words before you report.**
  Look at the first rows (get_data_frame) and check each stated part against the request: the fixed part (for example the hour and minute it fixed),
  the unit (hours or days, hour or minute), the time zone, the order of the parts, the number of decimals.
  A result that only looks like the right kind of value is not enough. **Do not put a value that already exists in the data in place of a value the request fixed.**
- **When the request gives an example (an input and the value it becomes), find that input in the result and compare the value with the example, character by character.**
  When a later step converts a value back (a conversion and its reverse), the result must equal the original values: compare the first rows with the source column.
  Count the missing values (NA) in every column you created or converted, and compare with the count before. A new NA means the conversion did not read the value:
  a function that returns a number without an error has not proved the number is the right one. Fix the step
  If a part is missing or different, fix the step (for date-times, read the guidance on writing R for dates and times)
- **Do not throw away a formula that ran without error only because you doubt it.** If you doubt one, build the alternative in execute_r_script on the source data
  and compare the two results on all rows (count the rows where they differ) before you change the step.
  A rewritten formula is as unchecked as the first one: after any rewrite, compare it with the formula it replaces and read the rows where they differ
