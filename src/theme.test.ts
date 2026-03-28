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

    expect(resolvedTheme.colors.background.light).toBe('#ffffff');
    expect(resolvedTheme.colors.background.dark).toBe('#191A1B');
    expect(resolvedTheme.colors.selectionBackground?.light).toBe('#0069CC26');
    expect(resolvedTheme.colors.selectionBackground?.dark).toBe('#3994BC33');
    expect(resolvedTheme.colors.selectionBackground?.hcDark).toBe(
      builtInThemes.base.colors?.selectionBackground?.hcDark,
    );
    expect(resolvedTheme.colors.cursor?.light).toBe('#202020');
    expect(resolvedTheme.colors.cursor?.dark).toBe('#bfbfbf');
    expect(resolvedTheme.colors.cursor?.hcDark).toBe(builtInThemes.base.colors?.cursor?.hcDark);
    expect(resolvedTheme.colors.cursorText?.light).toBe('#FFFFFF');
    expect(resolvedTheme.colors.cursorText?.dark).toBe('#191A1B');
    expect(resolvedTheme.colors.cursorText?.hcDark).toBe(
      builtInThemes.base.colors?.cursorText?.hcDark,
    );
    expect(resolvedTheme.colors.border?.light).toBe('#2A2B2CFF');
    expect(resolvedTheme.colors.border?.dark).toBe('#2A2B2CFF');
    expect(resolvedTheme.colors.border?.hcDark).toBe('#2A2B2CFF');
    expect(resolvedTheme.colors.tabActiveBorder?.light).toBe('#005FB8');
    expect(resolvedTheme.colors.tabActiveBorder?.dark).toBe('#3994BC00');
  });

  it('resolves the built-in family inheritance chain', () => {
    const classic = resolveTheme(builtInThemes, 'vsCodeClassic');
    const plus = resolveTheme(builtInThemes, 'vsCodePlus');
    const modern = resolveTheme(builtInThemes, 'vsCodeModern');
    const classicSelectionBackground = classic.colors.selectionBackground;
    const plusSelectionBackground = plus.colors.selectionBackground;
    const modernCursor = modern.colors.cursor;

    expect(classicSelectionBackground?.light).toBe('#E5EBF1');
    expect(classicSelectionBackground?.dark).toBe('#3A3D41');
    expect(classicSelectionBackground?.hcDark).toBe(
      builtInThemes.base.colors?.selectionBackground?.hcDark,
    );

    expect(plusSelectionBackground?.light).toBe(classicSelectionBackground?.light);
    expect(plusSelectionBackground?.dark).toBe(classicSelectionBackground?.dark);

    expect(modern.colors.foreground.light).toBe('#3B3B3B');
    expect(modern.colors.foreground.dark).toBe('#CCCCCC');
    expect(modernCursor?.light).toBe('#005FB8');
    expect(modernCursor?.dark).toBe(builtInThemes.base.colors?.cursor?.dark);
    expect(modern.colors.tabActiveBorder?.light).toBe('#005FB8');
    expect(modern.colors.tabActiveBorder?.dark).toBe('#0078D4');
    expect(modern.colors.tabActiveBorder?.hcDark).toBe('#0078D4');
    expect(modern.colors.ansiBlue.dark).toBe(builtInThemes.base.colors?.ansiBlue?.dark);
  });
});
