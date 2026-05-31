# VS Code Terminal Themes

Recreate VS Code's built-in terminal themes in other terminals.

- Supported themes
  - [Dark (Visual Studio)](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_vs.json)
  - [Light (Visual Studio)](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/light_vs.json)
  - [Dark+](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_plus.json)
  - [Light+](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/light_plus.json)
  - [Dark Modern](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json)
  - [Light Modern](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/light_modern.json)
  - [Dark High Contrast](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_black.json)
  - [Light High Contrast](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_light.json)
  - [2026 Dark](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/2026-dark.json)
  - [2026 Light](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/2026-light.json)
- Supported terminals
  - iTerm2
  - Warp

Download color profiles in
[releases](https://github.com/zehuac2/vs-code-terminal-themes/releases). Run
`bun run build` to generate terminal profiles in `generated/`.

## Theme Definitions

Themes are declared in TypeScript and can inherit from another VS Code theme
with `extends`, matching the `include` chain from VS Code's theme JSON files.

- `colors` uses VS Code-style terminal keys such as ANSI colors, `background`,
  `foreground`, `selectionBackground`, `selectionForeground`, `cursor`, and
  `cursorText`
- `iterm2.colors` is reserved for iTerm2-only extras such as `bold`, `link`, and
  `underline`
- each exported theme name matches VS Code's built-in theme name; shared
  terminal defaults are kept private and are not generated as a separate profile

## Methodology

VS Code's terminal colors appear to be defined in
[src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts).

Individual themes can override those defaults. Theme definitions live in
[extensions/](https://github.com/microsoft/vscode/blob/main/extensions/). The
`themes/` folder contains the local VS Code theme definitions used to keep
`src/themes.ts` in sync.

iTerm2's color theme schema can be found at
[plists/ColorPresets.plist](https://github.com/gnachman/iTerm2/blob/master/plists/ColorPresets.plist)

Warp's custom theme schema can be found in
[Custom Themes](https://docs.warp.dev/appearance/custom-themes).
