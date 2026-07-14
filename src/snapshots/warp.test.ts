import { describe, expect, it } from 'bun:test';
import { themes } from '@/themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from '@/generators/warp';

describe('Warp preset snapshots', () => {
  Object.entries(themes).map(([themeName, theme]) => {
    for (const variant of WARP_COLOR_VARIANTS) {
      it(`${themeName} ${variant}`, () => {
        const variantDisplayName = variant === 'light' ? 'Light' : 'Dark';
        const displayName = `VSCode ${theme.displayName} ${variantDisplayName}`;

        expect(
          exportForWarp(theme, { name: displayName, variant }, 'object'),
        ).toMatchSnapshot();
      });
    }
  });
});
