import { describe, expect, it } from 'bun:test';
import { exportForIterm2 } from '@/generators/iterm2';
import { resolveTheme } from '@/theme';
import { themes } from '@/themes';

describe('iTerm2 preset snapshots', () => {
  Object.keys(themes).map((themeName) => {
    it(themeName, () => {
      expect(exportForIterm2(resolveTheme(themes, themeName), 'object')).toMatchSnapshot();
    });
  });
});
