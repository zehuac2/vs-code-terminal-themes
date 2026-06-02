import { resolveTheme } from '@/theme';
import { exportForIterm2 } from '@/iterm2';
import { themes } from '@/themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from '@/warp';
import { $ } from 'bun';

const GENERATED_DIR = 'generated';
const ITERM_GENERATED_DIR = `${GENERATED_DIR}/iTerm`;
const WARP_GENERATED_DIR = `${GENERATED_DIR}/Warp`;

const WARP_VARIANT_DISPLAY_NAMES = {
  dark: 'Dark',
  light: 'Light',
} as const;

function toWarpFileNamePart(displayName: string): string {
  return displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

await $`rm -rf ${GENERATED_DIR}`.quiet();

for (const [themeName, definition] of Object.entries(themes)) {
  const theme = resolveTheme(themes, themeName);
  const displayName = definition.displayName ?? themeName;
  const iterm2FileName = `VSCode ${displayName}.itermcolors`;
  const iterm2FilePath = `${ITERM_GENERATED_DIR}/${iterm2FileName}`;

  await Bun.write(Bun.file(iterm2FilePath), exportForIterm2(theme), { createPath: true });

  for (const variant of WARP_COLOR_VARIANTS) {
    const warpVariantName = WARP_VARIANT_DISPLAY_NAMES[variant];
    const warpName = `VSCode ${displayName} ${warpVariantName}`;
    const warpFileName = `vscode_${toWarpFileNamePart(displayName)}_${variant}.yaml`;
    const warpFilePath = `${WARP_GENERATED_DIR}/${warpFileName}`;

    await Bun.write(Bun.file(warpFilePath), exportForWarp(theme, { name: warpName, variant }), {
      createPath: true,
    });
  }
}
