## Missing values before a chi-square test

In a chi-square test (exp_chisq), NA in the target variable or the explanatory variable becomes its own category and is counted in the table.
In survey data, NA means no answer. It is not a response category.
Unless the user asks to treat no answer as a category, add a filter to the analysis that keeps only the rows where both variables are not NA, and then run the test.
After running, check that the degrees of freedom equal (levels of the target - 1) x (levels of the explanatory variable - 1) with no NA level, and that Rows equals the number of rows without NA.
Tell the user how many rows were excluded and the remaining number of rows.
