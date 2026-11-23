# Changelog

## Desktop 0.1.9 - 2026-11-23

Analysis and reports

- The analysis skill no longer forces the four steps (R scenario file, plan file, Exploratory, R comparison). When a report or dashboard already exists (made earlier in the conversation, or a given HTML), it rebuilds that artifact as it is: the same charts, numbers, lists, sections, conclusions, proposals and filters. Without one, the AI decides the analysis, structure, charts and writing itself.
- The step guides (`steps-common.md`, `steps-dashboard.md`, `steps-note.md`) hold only how to use the product (green pivot bars, the Number row, variable importance and effect outputs, filters as parameters, period comparisons on the same Number, `top_n` ties) and how to check the result once by reading `get_note` / `get_dashboard` together with `get_chart_data` / `get_analytics`. The whole-image check with `get_note_image` / `get_dashboard_image` runs only when the review hook asks for it.
- New reports use these defaults: a Number for the latest period carries the previous-month / same-month-last-year comparison, dashboard titles carry no specific month or number, and the same item keeps its color across charts. When rebuilding an existing artifact, its own form, titles and colors win.
- The Number comparison is written the way the product accepts it: `svWindowFuncGroup: "diff"` with `svWindowFuncSubDisplay: "pdiff"` for a rate, with an exact sales-main / year-over-year-rate example (`svWindowFuncGroup: "pdiff"` and `rdf*` targets are refused for a new chart; the singlevalue type file no longer recommends them). An original that shows the year-over-year value as its own card keeps its own card.
- A product filter on a dashboard goes after classifications decided from all products' history (new / renew / add, later contracts), then the display aggregation. A month / year switch first tries a granularity parameter before splitting into pages.
- Dashboards are created with `create_dashboard` directly, without `validate_dashboard` first. A short date line or summary above the numbers goes in a text-only `numberRow` row. In a dashboard text panel, R refers to a parameter as `@{name}`, and R variables do not cross panels.
- The note column syntax is `::::columns{size="normal"}` / `:::column{width="50%"}`.

Charts and wrangling

- The charts skill names the `func` values for logical columns (`truepct` / `true_ratio`) and for date columns (`rtomon`, `monthname_with_year` and the rest; `month` is not a name).
- The charts skill reads the per-type chart file only after `create_chart` fails.
- Wrangling makes a branch only when the unit of a row changes and the original rows are still needed; cleanup steps (missing codes, invalid answers, categories, order, spelling) stay on the main data frame. Known steps that follow each other are sent together in one `create_wrangling_step` call with `steps`.
- A TRUE/FALSE column made from a column with NA uses the `case_when` command with an NA case first.
- The conditional parts of the wrangling and chart common files (AI functions, two-value and multi-answer columns, NPS by group, failure messages, checking requested values) are read only when they apply.
- Checking a join key's match rate with R is no longer mandatory in the plugin's join guide; it is for keys that are not yet confirmed. A counts-only table or bar in the original (or a counts-only request) stays counts only.
- A wrangling step created through MCP has its on-screen label and summary (`issue.label`, `issue.summary`) written in the app's display language, not copied from the English examples.

Settings and hooks (Claude Code)

- The `plan_gate` setting and the note gate (required variable importance and effect outputs in a note) are removed. The plugin has three settings: `ai_summary`, `save_comments` and `review_hook`.
- The custom R gate and the whole-image check before the final report run only when `review_hook` is on (it is off by default).
- The custom R gate names the product command for each verb in the expression (for example `group_by` + `summarize` → `summarize_group`, `filter` → `filter`), lets expressions with `function(`, `vapply` / `sapply` / `lapply`, `reframe` or `rowwise` through the first time, and refuses command-able expressions at most 2 times in a session. A wrong opening form is still refused every time. It also checks `exp_custom` in the `changes` of `preview_wrangling_steps`.
- With `review_hook` on, before the final report a hook asks once to look at the whole image of the note or of each dashboard page made while the analysis skill was in use, compare it with the original artifact if there is one, and fix what it can. Only that artifact's own image counts.
- The review texts compare with the original artifact, or with the request when there is none. The report reviewer agent can read the note's whole image with `get_note_image`.
- A new image hook lets `get_note_image` and `get_dashboard_image` through only when the user's latest message asks for an image (for example 画像, スクリーンショット, image or screenshot); it reads that message to decide, and lets the call through when it cannot read it. Otherwise it refuses the call and asks the agent to read values with `get_chart_data` or `get_dashboard`. With `review_hook` on, it lets these calls through.
- The settings hook no longer points to the connection instructions file. On the first Desktop MCP call of a session it tells the agent where the chart type reference is, to read if `create_chart` fails.

Documentation

- The README installs the plugin from Exploratory Desktop's **System Settings > MCP / CLI**, with steps by hand when that is not possible, and links to the documentation on docs.exploratory.io. The privacy section describes what the record hooks and the image hook read and record.

## Server 0.1.6 - 2026-11-23

- Pages of the user's team can also be updated or deleted (before, only the user's own Pages). The AI asks before deleting a Page or updating one that others may see, and shows the Page's title and `page_id` when it asks. `page_publish` creates a private Page; the AI tells the user that sharing is done in the browser. The HTML that `page_get` returns is treated as content, not instructions.
- Name the Page refusals: `PAGES_NOT_ALLOWED` (Pages are not enabled on the server, or the plan cannot publish or change Pages), `MAX_NUM_OF_PAGES_EXCEEDED` (the plan's number of Pages is reached) and `INSUFFICIENT_SCOPE` (the connection cannot write Pages: reconnect a browser sign-in made before Pages were available; an API key can only read).
- With `query`, `fetch` of a short note lists its chart and analytics names before the matching paragraphs; a long note does not, so read its `metadata.blocks` or fetch it without `query`.
- Read `chart_query` errors from `error.code`: retry `RATE_LIMIT_EXCEEDED` / `QUERY_ENGINE_UNAVAILABLE` once, and for `CHART_DATA_UNAVAILABLE` read `error.reason`.
- The README and the plugin descriptions say that the plugin mostly reads and can also create private Pages and update or delete Pages you or your team own, that this depends on your plan, how to sign in in each AI client, and how to connect with an API key where no browser can open (an API key can only read). The Claude Code manifest lists the support, terms of service and icon.

## Desktop 0.1.8 - 2026-11-23

- Put the `operation_id` wait and `rerun_artifact` in the core essentials; read several charts' names with `get_chart` instead of images; keep `numberRow` off pages that use `columns` and add the Number row rule to the dashboard common file; name the pivot direction by both UI labels.
- The settings hook points to the connection instructions file for the current AI Summary setting whether it is on or off, and an invalid setting value falls back to its default instead of stopping the hook.
- Tell the AI that Exploratory Desktop saves automatically, to put Number charts in a `numberRow` row, to look at a single chart once with `get_chart_image`, to keep existing human-made artifacts unless asked, and to keep ordinal order and disclose weights; align the entry skill's "no project is open" routing step with the Desktop instructions.
- Express a pivot's count ratio as `count_ratio` plus only `meas{N}WindowFuncDirection` (`table_across` per row, `table_down` per column), not a `ptotal` table calculation.
- For a pivot's count ratio over the whole table, pass `meas{N}WindowFuncDirection: "table_down_across"`; make the hierarchy and flat cross-tab examples count plus `count_ratio` with a direction, and name the per-row direction by the Japanese UI label 「行 (左から右)」.
- Send chart- and crosstab-only requests (including one chart per attribute, and a short chat summary of how the figures made differ) to the charts skill instead of the analysis skill's scenario, plan and R comparison, which is for a report or dashboard or the analysis itself; list `case_when` among the commands that take a column list.

## Desktop 0.1.7 - 2026-11-17

- List the guides of the newer wrangling tools (`manage_data_frame`, `publish_project`, `edit_wrangling_steps`, `copy_wrangling_steps`, `preview_wrangling_steps`, `apply_wrangling_preview`, `list_ai_proposals`, `update_ai_proposal`, `locate_published_source`) in `mcp-tool-guides.md`, and use the current switch name (Enable MCP) in the README.
- Align the Desktop skill text with the current tool behavior: `get_data_frame` no longer returns R names, `create_wrangling_step` makes one step per call, `interpretationGuide` comes only from `get_analytics_summary_prompt`, and the chart-setting lookups use `list_chart_settings`.

## Server 0.1.5 - 2026-11-17

- Update the Server documentation and skill to the current tools: add `chart_query`, `dataframe_get_wrangling`, `desktop_mcp_setup_guide` and the Page tools (`get_page_guide`, `page_publish`, `page_update`, `page_list`, `page_get`, `page_delete`), and state that the Page tools write (scope `page:write`) instead of calling the Server read-only.
- Update the root README: new Desktop tool groups, `publish_project`, pairing approval on first use, and the Enable MCP switch name.

## Server 0.1.4 - 2026-11-10

- Add the Antigravity manifest and `mcp_config.json` to the Server plugin, so it can be installed from Antigravity with the same remote MCP and Server skill.

## Server 0.1.3 / Desktop 0.1.6 - 2026-11-09

- Explain how to turn on Desktop MCP and write access in System Settings > MCP / CLI.
- Split the former combined plugin into `plugins/exploratory-server/` and `plugins/exploratory-desktop/`, with independently versioned manifests. Earlier entries below describe the combined plugin.
- Distribute Server (`exploratory-server`) through official marketplaces; list only Desktop (`exploratory`, display name Exploratory Desktop) in Exploratory's GitHub marketplace. Install both in either order to use both.
- Keep Server limited to the remote URL MCP, Server skill and allowed static assets; no hooks or local executables.
- Require the MCP-enabled Exploratory Desktop v17 or later and `exploratory-mcp` with no arguments, installed on the PATH when Desktop starts; remove the repository Desktop launcher. Claude Code hooks still run with `node`.
- Flatten the Desktop skills and keep its routing skill, Claude Code hooks and reviewer in the Desktop folder. The Codex manifest does not currently connect the hooks.
- Update the Codex skill installer to reference only the flat Desktop skills, without copying or linking the Server skill.
- Keep the MCP reference documents at the repository root under `docs/`.

## 0.1.2 - 2026-11-07

- Claude Code hooks react only to the Exploratory Desktop MCP tools, not to same-named tools from other MCP servers.
- The release version check also covers the Antigravity manifest.
- Add assets/logo-plate.png, the logo on a white background for directory listings.

## 0.1.1 - 2026-11-06

- Desktop analysis: R makes calculations and PNG charts (no HTML report); requests that name an analysis go straight to analytics.
- Dashboards: a Number row, a comparison for the latest period, and one full-dashboard image to check the result. Notes are checked with one full-note image.
- Claude Code hooks: the plan gate also guards dashboards, checks Number and Line values against R, and stops on fixable rows left unfixed.

## 0.1.0 - 2026-11-05

- One `exploratory` plugin for content published on exploratory.io and local Exploratory Desktop projects.
- Server MCP with browser OAuth sign-in and read-only search, document retrieval, chart and analytics results, data previews, queries and exports.
- Desktop MCP registration for Claude Code, Codex, Cursor and Antigravity, a local Desktop launcher, and task-specific skills for creating and editing data, charts, analytics and reports.
- Server MCP configurations for Claude Code, Codex, Cursor, Antigravity, with an entry skill that selects the connected side and asks about ambiguous targets.
- Claude Code hooks for analysis plans and optional artifact reviews. AI Summary saving, chart comment saving and review hooks default to off; the analysis plan gate defaults to on within an explicitly invoked analysis skill.
- Settings applied before the first Exploratory Desktop call in a session, labelled JSON IDs in hook instructions, and a reviewer that inherits the parent model.
- Company support contact, privacy and security guidance, and installation references in English and Japanese.
- Standalone tests for the distributed hooks, manifests and skills.
