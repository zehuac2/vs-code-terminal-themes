import { describe, expect, it } from 'bun:test';
import { defineThemes, resolveTheme } from './theme';
import { themes as builtInThemes } from './themes';

const COMPLETE_TEST_COLORS = {
  ansiBlack: {
    light: '#000000',
    dark: '#000000',
    hcDark: '#000000',
    hcLight: '#000000',
  },
  ansiRed: {
    light: '#010000',
    dark: '#010000',
    hcDark: '#010000',
    hcLight: '#010000',
  },
  ansiGreen: {
    light: '#000100',
    dark: '#000100',
    hcDark: '#000100',
    hcLight: '#000100',
  },
  ansiYellow: {
    light: '#010100',
    dark: '#010100',
    hcDark: '#010100',
    hcLight: '#010100',
  },
  ansiBlue: {
    light: '#000001',
    dark: '#000001',
    hcDark: '#000001',
    hcLight: '#000001',
  },
  ansiMagenta: {
    light: '#010001',
    dark: '#010001',
    hcDark: '#010001',
    hcLight: '#010001',
  },
  ansiCyan: {
    light: '#000101',
    dark: '#000101',
    hcDark: '#000101',
    hcLight: '#000101',
  },
  ansiWhite: {
    light: '#010101',
    dark: '#010101',
    hcDark: '#010101',
    hcLight: '#010101',
  },
  ansiBrightBlack: {
    light: '#020202',
    dark: '#020202',
    hcDark: '#020202',
    hcLight: '#020202',
  },
  ansiBrightRed: {
    light: '#020000',
    dark: '#020000',
    hcDark: '#020000',
    hcLight: '#020000',
  },
  ansiBrightGreen: {
    light: '#000200',
    dark: '#000200',
    hcDark: '#000200',
    hcLight: '#000200',
  },
  ansiBrightYellow: {
    light: '#020200',
    dark: '#020200',
    hcDark: '#020200',
    hcLight: '#020200',
  },
  ansiBrightBlue: {
    light: '#000002',
    dark: '#000002',
    hcDark: '#000002',
    hcLight: '#000002',
  },
  ansiBrightMagenta: {
    light: '#020002',
    dark: '#020002',
    hcDark: '#020002',
    hcLight: '#020002',
  },
  ansiBrightCyan: {
    light: '#000202',
    dark: '#000202',
    hcDark: '#000202',
    hcLight: '#000202',
  },
  ansiBrightWhite: {
    light: '#020202',
    dark: '#020202',
    hcDark: '#020202',
    hcLight: '#020202',
  },
  background: {
    light: '#ffffff',
    dark: '#000000',
    hcDark: '#000000',
    hcLight: '#ffffff',
  },
  foreground: {
    light: '#111111',
    dark: '#eeeeee',
    hcDark: '#eeeeee',
    hcLight: '#111111',
  },
};

describe('resolveTheme', () => {
  it('merges inherited colors and preserves non-overridden variants', () => {
    const themes = defineThemes({
      parent: {
        colors: COMPLETE_TEST_COLORS,
      },
      child: {
        extends: 'parent',
        colors: {
          ansiBlue: {
            dark: '#010203',
          },
          selectionBackground: {
            light: '#111111',
            dark: '#222222',
            hcDark: '#333333',
            hcLight: '#444444',
          },
        },
        iterm2: {
          colors: {
            bold: {
              light: '#aaaaaa',
              dark: '#bbbbbb',
              hcDark: '#cccccc',
              hcLight: '#dddddd',
            },
          },
        },
      },
    });

    const resolvedTheme = resolveTheme(themes, 'child');

    expect(resolvedTheme.colors.ansiBlue.dark).toBe('#010203');
    expect(resolvedTheme.colors.ansiBlue.light).toBe(COMPLETE_TEST_COLORS.ansiBlue.light);
    expect(resolvedTheme.colors.selectionBackground?.hcLight).toBe('#444444');
    expect(resolvedTheme.iterm2.colors.bold?.dark).toBe('#bbbbbb');
  });

  it('rejects unknown parent themes', () => {
    const themes = defineThemes({
      broken: {
        extends: 'missing',
      },
    });

    expect(() => resolveTheme(themes, 'broken')).toThrow('Theme "missing" is not defined.');
  });

  it('rejects inheritance cycles', () => {
    const themes = defineThemes({
      first: {
        extends: 'second',
      },
      second: {
        extends: 'first',
      },
    });

    expect(() => resolveTheme(themes, 'first')).toThrow('Theme inheritance cycle detected');
  });

  it('requires all required colors after resolution', () => {
    const themes = defineThemes({
      broken: {
        colors: {
          ansiBlack: {
            light: '#000000',
            dark: '#000000',
            hcDark: '#000000',
            hcLight: '#000000',
          },
        },
      },
    });

    expect(() => resolveTheme(themes, 'broken')).toThrow('missing required color');
  });

  it('exports built-in themes as light/dark families', () => {
    expect(Object.keys(builtInThemes)).toEqual([
      '2026',
      'Visual Studio',
      'Plus',
      'Modern',
      'High Contrast',
    ]);
  });

  it('resolves the built-in 2026 themes with requested overrides', () => {
    const theme2026 = resolveTheme(builtInThemes, '2026');

    expect(theme2026.colors.background.dark).toBe('#191A1B');
    expect(theme2026.colors.selectionBackground?.dark).toBe('#3994BC33');
    expect(theme2026.colors.cursor?.dark).toBe('#bfbfbf');
    expect(theme2026.colors.cursorText?.dark).toBe('#191A1B');
    expect(theme2026.colors.border?.dark).toBe('#2A2B2CFF');
    expect(theme2026.colors.tabActiveBorder?.dark).toBe('#3994BC00');

    expect(theme2026.colors.background.light).toBe('#ffffff');
    expect(theme2026.colors.selectionBackground?.light).toBe('#0069CC26');
    expect(theme2026.colors.cursor?.light).toBe('#202020');
    expect(theme2026.colors.cursorText?.light).toBe('#FFFFFF');
    expect(theme2026.colors.foreground.light).toBe('#3B3B3B');
  });

  it('resolves the built-in VS Code inheritance chains', () => {
    const classic = resolveTheme(builtInThemes, 'Visual Studio');
    const plus = resolveTheme(builtInThemes, 'Plus');
    const modern = resolveTheme(builtInThemes, 'Modern');
    const highContrast = resolveTheme(builtInThemes, 'High Contrast');

    expect(classic.colors.selectionBackground?.dark).toBe('#3A3D41');
    expect(classic.colors.selectionBackground?.light).toBe('#E5EBF1');
    expect(plus.colors.selectionBackground?.dark).toBe('#3A3D41');
    expect(plus.colors.selectionBackground?.light).toBe('#E5EBF1');

    expect(modern.colors.foreground.dark).toBe('#CCCCCC');
    expect(modern.colors.foreground.light).toBe('#3B3B3B');
    expect(modern.colors.tabActiveBorder?.dark).toBe('#0078D4');
    expect(modern.colors.tabActiveBorder?.light).toBe('#005FB8');
    expect(modern.colors.ansiBlue.dark).toBe(classic.colors.ansiBlue.dark);

    expect(modern.colors.cursor?.light).toBe('#005FB8');
    expect(modern.colors.selectionBackground?.light).toBe('#E5EBF1');

    expect(highContrast.colors.background.dark).toBe('#000000');
    expect(highContrast.colors.ansiBlue.dark).toBe('#0000ee');
    expect(highContrast.colors.foreground.light).toBe('#292929');
    expect(highContrast.colors.cursor?.light).toBe('#0f4a85');
  });
});
