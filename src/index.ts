import { resolveTheme } from './theme';
import { exportForIterm2 } from './iterm2';
import { themes } from './themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from './warp';

const GENERATED_DIR = 'generated';

const WARP_VARIANT_DISPLAY_NAMES = {
  dark: 'Dark',
  light: 'Light',
} as const;

await Bun.$`mkdir -p ${GENERATED_DIR}`;

for (const [themeName, definition] of Object.entries(themes)) {
  const theme = resolveTheme(themes, themeName);
  const displayName = definition.displayName ?? themeName;
  const iterm2FileName = `${displayName}.itermcolors`;
  const iterm2FilePath = `${GENERATED_DIR}/${iterm2FileName}`;

  await Bun.write(Bun.file(iterm2FilePath), exportForIterm2(theme));

  for (const variant of WARP_COLOR_VARIANTS) {
    const warpVariantName = WARP_VARIANT_DISPLAY_NAMES[variant];
    const warpName = `${displayName} ${warpVariantName}`;
    const warpFilePath = `${GENERATED_DIR}/${warpName}.yaml`;

    await Bun.write(Bun.file(warpFilePath), exportForWarp(theme, { name: warpName, variant }));
  }
}
