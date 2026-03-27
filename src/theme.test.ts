import { describe, expect, it } from 'bun:test';
import { defineThemes, resolveTheme } from './theme';
import { themes as builtInThemes } from './themes';

describe('resolveTheme', () => {
  it('merges inherited colors and preserves non-overridden variants', () => {
    const themes = defineThemes({
      ...builtInThemes,
      child: {
        extends: 'base',
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
    expect(resolvedTheme.colors.ansiBlue.light).toBe(builtInThemes.base.colors?.ansiBlue?.light);
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

  it('resolves the built-in vsCodeDark variant with requested overrides', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'vsCode');

    expect(resolvedTheme.colors.background.dark).toBe('#191A1B');
    expect(resolvedTheme.colors.selectionBackground?.light).toBe('#0069CC26');
    expect(resolvedTheme.colors.selectionBackground?.dark).toBe('#3994BC33');
    expect(resolvedTheme.colors.cursor?.dark).toBe('#bfbfbf');
    expect(resolvedTheme.colors.cursorText?.dark).toBe('#191A1B');
    expect(resolvedTheme.colors.border?.dark).toBe('#2A2B2CFF');
    expect(resolvedTheme.colors.tabActiveBorder?.dark).toBe('#3994BC00');
    expect(resolvedTheme.colors.ansiBlue.dark).toBe(builtInThemes.base.colors?.ansiBlue?.dark);
  });
});
