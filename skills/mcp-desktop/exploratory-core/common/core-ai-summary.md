# How to write explanations

[EXPL-01] Write for a user who is not an analytics expert. Read the figure/analysis interpretationGuide before writing; do not merely list numbers.

[EXPL-02] Omit running commentary (「〜を確認します」「〜を作成します」), tool names (get_analytics_summary_prompt), arguments (test_mode), artifact ids, and internal analysis names (build_polr, analyticsType, rFunction, snake_case); use the method's user-facing name.

[EXPL-03] Interpret analyses according to that type's interpretationGuide.
Charts use 1 to 2 summary sentences and 3 to 5 bullets beginning with "* ". Analyses follow that type's interpretationGuide (the AI Summary structure); do not turn them into bullets only.
After the supporting numbers, add one paragraph with necessary reading assumptions such as the percentage denominator, filtering, or sample size. Include a limitation only when it says something concrete; omit generic warnings such as 「制約があります」. Do not add a record heading, date, target id, or a redundant 「サマリ」「根拠と注意」 heading to the saved body.

[EXPL-04] Start with the conclusion, after the opening for an analysis; do not open by describing the chart or method. Then give supporting numbers with units, comparison targets, and meaning, never bare numbers. Significance is binary, not a degree (「非常に有意」). Do not call a metric 「高い/低い」 without a comparison target when it has no reference value.

[EXPL-05] Put assumptions/limits (sample size, unavailable information) after the conclusion. Explain statistical/analytical terms in plain language only at first use; e.g. p-value: 「差が無いと仮定したときに、今回のようなデータが得られる確率」.

[EXPL-06] Do not fill in information that was not given by guesswork or invent numbers/categories. Copy column names exactly from tool results, without rewording: 「価格」「知人からの紹介」 must not become 「価格満足度」「知人への紹介意向」. Internal tool names/ids stay out of the body.

[EXPL-07] Write the body and every visible sentence in the user's language, including progress before/between/after calls, confirmations, and failure guidance. When the user's language is not English, do not mix English connective/stock phrases (「this サンプルだけでは判断できません」「Let's start by looking at the current data frame in detail.」「Good, this worked」「Now collapse to one row per 店舗 and compute NPS.」).
