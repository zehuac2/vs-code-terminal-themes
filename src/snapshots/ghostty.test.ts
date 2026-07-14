import { describe, expect, it } from 'bun:test';
import { themes } from '@/themes';
import { exportForGhostty, GHOSTTY_COLOR_VARIANTS } from '@/generators/ghostty';

describe('Ghostty preset snapshots', () => {
  Object.entries(themes).map(([themeName, theme]) => {
    for (const variant of GHOSTTY_COLOR_VARIANTS) {
      it(`${themeName} ${variant}`, () => {
        expect(exportForGhostty(theme, { variant }, 'object')).toMatchSnapshot();
      });
    }
  });
});
