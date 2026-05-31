import { describe, expect, it } from 'bun:test';
import { parse } from '@plist/plist';
import { exportForIterm2 } from './iterm2';
import { defineThemes, resolveTheme } from './theme';
import { themes as builtInThemes } from './themes';

describe('exportForIterm2', () => {
  it('exports core terminal colors, ansi colors, and iTerm2 extras', () => {
    const themes = defineThemes({
      ...builtInThemes,
      child: {
        extends: 'Dark+',
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
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<string, unknown>;

    expect(plist['Ansi 4 Color']).toBeDefined();
    expect(plist['Ansi 4 Color (Light)']).toBeDefined();
    expect(plist['Ansi 4 Color (Dark)']).toBeDefined();
    expect(plist['Ansi 4 Color (Darl)']).toBeUndefined();
    expect(plist['Background Color']).toBeDefined();
    expect(plist['Foreground Color']).toBeDefined();
    expect(plist['Selection Color']).toBeDefined();
    expect(plist['Selected Text Color']).toBeDefined();
    expect(plist['Cursor Color']).toBeDefined();
    expect(plist['Cursor Text Color']).toBeDefined();
    expect(plist['Bold Color']).toBeDefined();
    expect(plist['Underline Color']).toBeUndefined();
  });

  it('composites translucent colors onto the active theme background', () => {
    const resolvedTheme = resolveTheme(builtInThemes, '2026 Dark');
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<
      string,
      Record<string, number | string>
    >;
    const selectionColor = plist['Selection Color'];

    expect(selectionColor).toEqual({
      'Alpha Component': 1,
      'Blue Component': 59 / 255,
      'Color Space': 'sRGB',
      'Green Component': 50 / 255,
      'Red Component': 31 / 255,
    });
  });
});
