import { describe, expect, test } from 'bun:test';
import { exportForIterm2 } from './iterm2';
import { resolveTheme } from './theme';
import { themes } from './themes';

describe('iTerm2 preset snapshots', () => {
  Object.keys(themes).map((themeName) => {
    test(themeName, () => {
      expect(exportForIterm2(resolveTheme(themes, themeName), 'object')).toMatchSnapshot();
    });
  });
});
