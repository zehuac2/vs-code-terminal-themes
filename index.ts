import { resolveTheme } from './theme';
import { exportForIterm2 } from './iterm2';
import { themes } from './themes';

for (const [themeName, definition] of Object.entries(themes)) {
  const theme = resolveTheme(themes, themeName);
  const fileName = `${definition.displayName ?? themeName}.itermcolors`;

  await Bun.write(Bun.file(fileName), exportForIterm2(theme));
}
