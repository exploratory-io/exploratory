**Writing R for dates and times (the expression of mutate, exp_custom, and so on)**

- **When a Date column must become a date-time in a stated time zone, build midnight of that day in that zone.**
  `as.POSIXct(<Date column>, tz = "Asia/Tokyo")` does not do that: for a Date it is midnight in UTC with the zone's name put on,
  so the clock reads 09:00 in Tokyo. Use `lubridate::force_tz(as.POSIXct(<Date column>), "Asia/Tokyo")`
  or `as.POSIXct(as.character(<Date column>), tz = "Asia/Tokyo")` (both give 00:00 in that zone; checked in the product's R)
- **A Date has no time of day. Formatting it or converting it as it is always gives 00:00.** When the request fixes the time of day,
  put the fixed time into the value first, for example `as.POSIXct(paste(<Date column>, "09:30:15"), tz = "UTC")`, and format it after that
- Pass floor_date / round_date / ceiling_date the unit the request names (cutting to the hour is `"hour"`; `"minute"` cuts to the minute)
  Cutting to the hour (the minutes and the seconds both become 0; in Japanese 「時の 0 分 0 秒に切り捨て」「時間の切り捨て」) is `unit = "hour"`. `"minute"` leaves the minutes as they are and only the seconds become 0.
  After you build it, read the first rows of the new column: when the request says the minutes are 0, every value you read must show minute 0. If one does not, the unit is wrong: build it again with `"hour"`
- **Do not get a number of seconds (or minutes) between two date-times by subtracting them and converting the difference with `as.numeric(<difference>, units = "secs")` or `as.integer(...)`.**
  The subtraction chooses its own unit (days, for a long span), and converting back leaves a floating-point error (a value like 12345.999999993 instead of 12346), which `as.integer` then cuts down by 1.
  Use `difftime(<end>, <start>, units = "secs")` (`"mins"`, `"hours"`, `"days"` likewise) so the unit is fixed, and put `round()` around the number before `as.integer`.
  Check one row by hand (end minus start) against the first rows of the new column
- For the last day of the week or month that contains a date, use `floor_date(<date>, "week", week_start = 7) + 6` (the week starts on Sunday, so it ends on Saturday)
  or `ceiling_date(<date>, "month") - 1`. Do not add 1 to the date before `ceiling_date`: a date that is already the last day then moves to the next period.
  Also try one date that is exactly on the boundary (the last day itself)

- **Japanese era years (和暦): 「元年」 means year 1 of the era (平成元年 = 1989, 令和元年 = 2019, 大正元年 = 1912).** The text after the era name is not always digits:
  a regex that extracts `[0-9]+` returns NA for 「元」, and NA plus a base year is NA with no error. Read 「元」 as 1 before you add the base year (for example `sub("元", "1", x)`).
  After you convert, count the NA in the new column and compare with the NA count of the source column: a difference means some values were not read
