# Choosing between the color palette tools

When you view, create, change, or delete a **color palette** (a named custom palette the user made themselves with 「カラーパレットの追加」,
which appears in the screen's color palette selection as custom-<id>), use
get_palettes / save_palette / delete_palette. Text-analysis dictionaries are read and saved with get_dictionaries / save_dictionary.
**It is a different thing from the default color palettes in the Chart tab of the system settings (chart_categ_color_palette /
chart_quant_color_palette, which get_system_settings handles).** Before creating, confirm with
get_palettes that there is no palette of the same name, and delete only when the user clearly asked, after confirming the target with
get_palettes.
