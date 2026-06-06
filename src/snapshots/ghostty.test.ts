import { describe, expect, it } from 'bun:test';
import { resolveTheme } from '@/theme';
import { themes } from '@/themes';
import { exportForGhostty, GHOSTTY_COLOR_VARIANTS } from '@/generators/ghostty';

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
