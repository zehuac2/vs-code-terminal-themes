import { exportForIterm2 } from '@/generators/iterm2';
import { themes } from '@/themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from '@/generators/warp';
import { exportForGhostty, GHOSTTY_COLOR_VARIANTS } from '@/generators/ghostty';
import { $ } from 'bun';

const GENERATED_DIR = 'generated';
const ITERM_GENERATED_DIR = `${GENERATED_DIR}/iTerm`;
const WARP_GENERATED_DIR = `${GENERATED_DIR}/Warp`;
const GHOSTTY_GENERATED_DIR = `${GENERATED_DIR}/Ghostty`;

const VARIANT_DISPLAY_NAMES = {
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

for (const [, theme] of Object.entries(themes)) {
  const displayName = theme.displayName;
  const iterm2FileName = `VSCode ${displayName}.itermcolors`;
  const iterm2FilePath = `${ITERM_GENERATED_DIR}/${iterm2FileName}`;

  await Bun.write(Bun.file(iterm2FilePath), exportForIterm2(theme), { createPath: true });

  for (const variant of WARP_COLOR_VARIANTS) {
    const warpVariantName = VARIANT_DISPLAY_NAMES[variant];
    const warpName = `VSCode ${displayName} ${warpVariantName}`;
    const warpFileName = `vscode_${toWarpFileNamePart(displayName)}_${variant}.yaml`;
    const warpFilePath = `${WARP_GENERATED_DIR}/${warpFileName}`;

    await Bun.write(Bun.file(warpFilePath), exportForWarp(theme, { name: warpName, variant }), {
      createPath: true,
    });
  }

  for (const variant of GHOSTTY_COLOR_VARIANTS) {
    const ghosttyVariantName = VARIANT_DISPLAY_NAMES[variant];
    const ghosttyFileName = `VSCode ${displayName} ${ghosttyVariantName}`;
    const ghosttyFilePath = `${GHOSTTY_GENERATED_DIR}/${ghosttyFileName}`;

    await Bun.write(Bun.file(ghosttyFilePath), exportForGhostty(theme, { variant }), {
      createPath: true,
    });
  }
}
