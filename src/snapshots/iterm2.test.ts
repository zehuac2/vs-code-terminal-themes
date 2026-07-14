import { describe, expect, it } from 'bun:test';
import { exportForIterm2 } from '@/generators/iterm2';
import { themes } from '@/themes';

describe('iTerm2 preset snapshots', () => {
  Object.entries(themes).map(([themeName, theme]) => {
    it(themeName, () => {
      expect(exportForIterm2(theme, 'object')).toMatchSnapshot();
    });
  });
});
