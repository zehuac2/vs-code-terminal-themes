# VS Code Terminal Themes

Recreate VS Code's built-in terminal themes in other terminals.

- Supported themes
  - [2026 Dark](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/2026-dark.json)
- Supported terminals
  - iTerm2

## Methodology

VS Code's terminal colors appear to be defined in
[src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts).

Individual themes can override those defaults. Theme definitions live in
[extensions/](https://github.com/microsoft/vscode/blob/main/extensions/).

iTerm2's color theme schema can be found at [plists/ColorPresets.plist](https://github.com/gnachman/iTerm2/blob/master/plists/ColorPresets.plist)
