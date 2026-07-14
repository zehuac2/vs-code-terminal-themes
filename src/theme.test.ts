import { describe, expect, it } from 'bun:test';
import { themes as builtInThemes } from '@/themes';
import { pairedColor, withExtras, type BaseColors } from '@/themes/builders';

describe('builders', () => {
  it('pairs light and dark, reusing each for the matching high-contrast variant', () => {
    expect(pairedColor('#111111', '#222222')).toEqual({
      light: '#111111',
      dark: '#222222',
      hcDark: '#222222',
      hcLight: '#111111',
    });
  });

  it('derives the extras from the base theme colors', () => {
    const base = {
      foreground: pairedColor('#111111', '#eeeeee'),
      link: pairedColor('#006AB1', '#3794FF'),
      selectionBackground: pairedColor('#add6ff', '#264f78'),
    } as BaseColors;

    const resolved = withExtras(base);

    // bold tracks foreground, underline tracks link, cursorGuide tracks selection.
    expect(resolved.bold).toEqual(base.foreground);
    expect(resolved.underline).toEqual(base.link);
    expect(resolved.cursorGuide).toEqual(base.selectionBackground);
  });
});

describe('built-in themes', () => {
  it('enumerates the light/dark families with 2026 hoisted first', () => {
    expect(Object.keys(builtInThemes)).toEqual([
      '2026',
      'Visual Studio',
      'Plus',
      'Modern',
      'High Contrast',
    ]);
  });

  it('resolves the 2026 theme with its requested overrides', () => {
    const { colors } = builtInThemes['2026'];

    expect(colors.background.dark).toBe('#191A1B');
    expect(colors.selectionBackground?.dark).toBe('#3994BC33');
    expect(colors.cursor?.dark).toBe('#bfbfbf');
    expect(colors.cursorText?.dark).toBe('#191A1B');
    expect(colors.border?.dark).toBe('#2A2B2CFF');
    expect(colors.tabActiveBorder?.dark).toBe('#3994BC00');

    expect(colors.background.light).toBe('#ffffff');
    expect(colors.selectionBackground?.light).toBe('#0069CC26');
    expect(colors.cursor?.light).toBe('#202020');
    expect(colors.cursorText?.light).toBe('#FFFFFF');
    expect(colors.foreground.light).toBe('#3B3B3B');
  });

  it('resolves the VS Code inheritance chains', () => {
    const classic = builtInThemes['Visual Studio'].colors;
    const plus = builtInThemes.Plus.colors;
    const modern = builtInThemes.Modern.colors;
    const highContrast = builtInThemes['High Contrast'].colors;

    expect(classic.selectionBackground?.dark).toBe('#3A3D41');
    expect(classic.selectionBackground?.light).toBe('#E5EBF1');
    expect(plus.selectionBackground?.dark).toBe('#3A3D41');
    expect(plus.selectionBackground?.light).toBe('#E5EBF1');

    expect(modern.foreground.dark).toBe('#CCCCCC');
    expect(modern.foreground.light).toBe('#3B3B3B');
    expect(modern.tabActiveBorder?.dark).toBe('#0078D4');
    expect(modern.tabActiveBorder?.light).toBe('#005FB8');
    // A non-overridden color is inherited unchanged.
    expect(modern.ansiBlue.dark).toBe(classic.ansiBlue.dark);
    // A partial override keeps the inherited variants.
    expect(modern.cursor?.light).toBe('#005FB8');
    expect(modern.selectionBackground?.light).toBe('#E5EBF1');

    expect(highContrast.background.dark).toBe('#000000');
    expect(highContrast.ansiBlue.dark).toBe('#0000ee');
    expect(highContrast.foreground.light).toBe('#292929');
    expect(highContrast.cursor?.light).toBe('#0f4a85');
  });

  it("tracks a child's overridden source color through the derived extras", () => {
    // Modern overrides foreground; its bold must follow that override rather
    // than inheriting Visual Studio's foreground.
    const modern = builtInThemes.Modern.colors;

    expect(modern.bold).toEqual(modern.foreground);
    expect(modern.bold?.light).toBe('#3B3B3B');
  });
});
