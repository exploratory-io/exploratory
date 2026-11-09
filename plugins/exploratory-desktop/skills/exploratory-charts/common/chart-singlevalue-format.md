# Main and sub value formats
Set the main value format with meas.numberFormatting and the sub value format independently with meas.numberFormattingSub (number or percentage). svWindowFuncGroup and SubDisplay select what to display, not its format.
These are axes.meas column properties, not settings names. For ratios in 0..1 units use percentage; never pre-multiply a column by 100. Saved formats are returned in the creation result and get_chart shelves.

When creating a Number with date columns and no comparison settings, the main is the latest period and the sub is its difference from one year earlier. Use axes.svWindowFuncGroupByColumn to choose the date column and grouping func; if omitted, the first date column and month grouping are used. Explicit comparisons and existing charts are preserved. count_ratio is an exception: the product excludes period comparisons to preserve the share-of-total denominator, so it keeps its percentage display without a comparison.
