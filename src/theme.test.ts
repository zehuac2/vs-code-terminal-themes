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

  it("tracks a child's overridden source color through the derived extras", () => {
    // Modern overrides foreground; its bold must follow that override rather
    // than inheriting Visual Studio's foreground.
    const modern = builtInThemes.Modern.colors;

    expect(modern.bold).toEqual(modern.foreground);
    expect(modern.bold?.light).toBe('#3B3B3B');
  });
});
