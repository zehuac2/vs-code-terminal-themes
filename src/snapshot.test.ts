import { describe, expect, it } from 'bun:test';
import { exportForIterm2 } from '@/generators/iterm2';
import { resolveTheme } from '@/theme';
import { themes } from '@/themes';
import { exportForWarp, WARP_COLOR_VARIANTS } from '@/generators/warp';
import { exportForGhostty, GHOSTTY_COLOR_VARIANTS } from '@/generators/ghostty';

describe('iTerm2 preset snapshots', () => {
  Object.keys(themes).map((themeName) => {
    it(themeName, () => {
      expect(exportForIterm2(resolveTheme(themes, themeName), 'object')).toMatchSnapshot();
    });
  });
});

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

describe('Ghostty preset snapshots', () => {
  Object.keys(themes).map((themeName) => {
    for (const variant of GHOSTTY_COLOR_VARIANTS) {
      it(`${themeName} ${variant}`, () => {
        expect(
          exportForGhostty(resolveTheme(themes, themeName), { variant }, 'object'),
        ).toMatchSnapshot();
      });
    }
  });
});
