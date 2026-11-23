2 値の列（0/1、Yes/No、TRUE/FALSE、はい/いいえ など）は、get_wrangling_command(command="mutate") で設定を確認し、mutate の expression に str_logical(列) または値と TRUE/FALSE の対応を明示した論理式を指定して、論理値（logical）に変える（NA はそのまま保つ）。「あり/なし」などの文字列ラベルへの置換はせず、表示に日本語のラベルが要るときはチャートの表示名で付ける。

- **To combine multiple-answer columns into one column, use the 「複数回答の列をまとめる」 command (exp_combine_multiple_answers); do not rebuild it with mutate or R.**
- **When creating a TRUE/FALSE column from a column containing NA, keep those rows NA unless the user asks otherwise.**
  `%in%` turns an NA input into FALSE; make the column with the case_when command and put an isNA case first, for example `{"command":"case_when","column":"x","columnSelectorType":"newColumn","newColumnName":"該当","newValueDataType":"logical","cases":[{"conditions":[{"operator":"isNA"}],"valueType":"na"},{"conditions":[{"operator":"in","value":["a","b"]}],"value":true}],"defaultValue":false}`.
