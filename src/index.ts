import { resolveTheme } from './theme';
import { exportForIterm2 } from './iterm2';
import { themes } from './themes';

const GENERATED_DIR = 'generated';

await Bun.$`mkdir -p ${GENERATED_DIR}`;

for (const [themeName, definition] of Object.entries(themes)) {
  const theme = resolveTheme(themes, themeName);
  const fileName = `${definition.displayName ?? themeName}.itermcolors`;
  const filePath = `${GENERATED_DIR}/${fileName}`;

  await Bun.write(Bun.file(filePath), exportForIterm2(theme));
}
