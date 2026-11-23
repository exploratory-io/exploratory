**When neither the request nor the plan you made for the work determines which column to use, ask which column to use before creating.** Ask only when the target data or purpose remains genuinely unclear.
Phrasings that **point at a set**, such as 「属性別に」「指標ごとに」「各〜で」「〇〇ごとに見たい」, determine neither
how many columns apply nor which of them the user wants to look at.
**Ask without creating anything.**

- **Do not drop string-valued stage ratings from the candidates.** Ordered options such as 「そう思う」「どちらともいえない」 can be cross tabulated even if they are not numbers.
- **Also include numeric columns that become axes once binned in the candidates.** Numbers such as age, amount, and score
  have too many levels for a table axis as is, but become axes once binned.
  State how each binned candidate groups values. **If chosen, before creating the table, create the binned column**
  (the same treatment as fixing the type of a stage rating; create `年代` with `mutate` and then use it).
- **List all applicable columns without narrowing them**. If you cut to 「just the representative ones」,
  the user cannot choose the column they wanted to see.
- **When several columns of the same kind are candidates, offer a bundled choice such as 「〜をまとめて 1 枚で見る」.**
  If chosen, build 1 with the way of building in the section below
  「Putting multiple questions into 1 chart」 (do not build many individually). For numeric rating items, describe this bundle as 「各評価項目の平均点を1枚の表で比べます」. Choosing it requests one mean pivot, not response-stage counts and ratios. Keep this choice when the user later selects attributes. For this numeric bundle, skip the hierarchy / flat question: use all chosen attributes in rowh (hierarchy by default; use flat only if requested), all rating items in colh with 「(複数の変数)」, and meas: { "column": "(変数の値)", "func": "ave" }. Do not create a preliminary table before the attributes are chosen. If the user instead asks for response distributions or separate tables, follow that request.
  When a chosen skill specifies a chart for each section of the report, do not bundle them; build the charts as the skill specifies.
- If what is undecided is the axis (what to look at it by), give axis candidates; if it is the target (what to look at), give target
  candidates. **When both are undecided, ask about the target first** (1 thing per question)
- Even when there are many candidates, **do not narrow them on your own and build. Have the user choose**

**You may create 2 or more when the user chose or listed them, or when the plan for the work calls for them.**

1. When the user **wrote a number** (「3 つ」「4 つ」「それぞれ」)
2. When the user **listed the targets** (「売上と数量と利益をグラフにして」)
3. **When 2 or more were chosen in a multiple-choice question.** Create as many as the number of columns chosen
   (if only 1 was chosen, then 1). **The attribute-column selection for cross tabulation is an exception**: the chosen columns go
   together into the rowh of 1 table (do not make many tables, one per column)

**Writing 「属性別に」 does not by itself mean one chart per attribute.**

Examples of asking first:
- 「クロス集計をして」-> neither the axis nor the target is decided. Give target candidates as multiple choice
- 「属性別に推奨度のクロス集計を」-> the target is decided. Give the attribute columns (gender, age group, occupation,
  usage frequency, ...) as multiple choice
- 「性別と年代でクロス集計したい」-> the attribute column names are decided. The target to look at is
  not yet decided. Since there are 2 attributes, ask hierarchy / flat
  before creating, then the target
Examples of building without asking:
- 「性別と推奨度のクロス集計を」-> both the axis and the target are determined as 1 column (if the attribute is 1, do not
  ask hierarchy / flat either)
