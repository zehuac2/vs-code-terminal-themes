import { describe, expect, it } from 'bun:test';
import { resolveTheme } from '@/theme';
import { themes } from '@/themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from '@/generators/warp';

describe('Warp preset snapshots', () => {
  Object.entries(themes).map(([themeName, definition]) => {
    for (const variant of WARP_COLOR_VARIANTS) {
      it(`${themeName} ${variant}`, () => {
        const variantDisplayName = variant === 'light' ? 'Light' : 'Dark';
        const displayName = `VSCode ${definition.displayName ?? themeName} ${variantDisplayName}`;

        expect(
          exportForWarp(resolveTheme(themes, themeName), { name: displayName, variant }, 'object'),
        ).toMatchSnapshot();
      });
    }
  });
});
