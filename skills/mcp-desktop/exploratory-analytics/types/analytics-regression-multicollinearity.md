## Multicollinearity of regression models

When reading the results of linear regression, logistic regression, and generalized linear models (the various GLMs), also read the multicollinearity (VIF) output with get_analytics.

If VIF reaches the criterion in that analysis's interpretationGuide (10 if none is written), or reaches 5 and makes coefficient interpretation unstable,
resolve it before interpreting the model or moving to the next stage.

Compare strongly related predictors and keep the one that best answers the user's question;
remove or combine a redundant column,
rerun with update_analytics (or create a revised analysis), then read the VIF again with get_analytics.
For a categorical predictor, change the whole category column rather than one dummy level.
Listing predictors for the first model does not forbid dropping a redundant one; only if the user explicitly forbids removal, explain the tradeoff and ask.

Explain which column changed and why, the VIF before and after, then interpret the revised model.
For VIF numbers, use only values in the result you read.
Complete the revised model in this turn; if VIF remains high, explain the limitation rather than interpreting unstable coefficients.
Do not put 「多重共線性を確認する」 itself in the next steps (it is in the result).
