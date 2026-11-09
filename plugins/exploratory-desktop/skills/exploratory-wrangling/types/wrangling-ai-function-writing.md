**Use the product's presets first.** For summarization, sentiment, classification, translation, name matching of company names, and
name matching of addresses, use the same instruction text as 「AI 関数を作成」 in the column menu.
Pull the instruction text from the current menu with `get_ai_function_presets`.
Do not use old text written in the system prompt. When the menu is updated,
the menu is correct.

自由記述や記録の意味を読む加工（話題の分類・感情の判定・要約）は、get_ai_function_presets で現在のプリセットを確かめ、create_wrangling_step の params.aiPreset（指示を調整するときだけ params.aiPrompt も指定）で AI 関数の列を作る。キーワード・正規表現・case_when などの条件式で意味を推し量って分類しない。プリセットの取得や AI 関数の実行が失敗したら、条件式や自作の指示文へ黙って切り替えず、失敗と理由を利用者に伝える。分類後は結果を原文数件と照合し、分類の方法・照合の件数・重複の扱いを記録してから、話題別の人数や件数と結果指標を集計する。

How to write it (do not write `mutationType`):

```
1. Get the instruction text with get_ai_function_presets
2. create_wrangling_step(command: "mutate",
     params: { as: "センチメントスコア",
               aiPreset: "sentiment_score",
               columns: ["推奨度の理由"] })
```

Pass the id or title in the list to `aiPreset`. If you omit the instruction text (`aiPrompt`), the menu's text goes in.
Pass `aiPrompt` too only when you want to adjust using the preset as a base, such as adding classification labels or changing the target
language of a translation. For uses not in the presets, you may write `aiPrompt` yourself.

When the menu cannot be read or the specified preset does not exist, an error comes back.
**Do not quietly switch to your own instruction text.** Read the returned sentence and fix it.

**How to write the instruction text (`aiPrompt`)** (for uses not in the presets, or when adjusting a preset as a base):

1. **List the criteria for judgment concretely.** Not 「ポジティブかネガティブか」, but
   write what applies for each range of score
2. **Specify the output form.** For example 「スコアのみを数値で返してください」
3. **Include examples.** 「例: Kato Kota -> 加藤」
4. **Provide an escape for when it is not known.** 「不明な場合は NA と返してください」.
   Without it, the AI fills in by guesswork
5. **When classifying, line up all the labels and always include 「その他」**

**When you use the result as a number, apply `as.numeric`.**
The return type of an AI function is inferred each time from what the AI returned.
If even 1 row has a value that does not look numeric, the whole column becomes a string, so
before placing it in a numeric slot of a chart or taking an average, always convert it to numeric
(there is no harm if it is already numeric).
