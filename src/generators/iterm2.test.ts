import { describe, expect, it } from 'bun:test';
import { parse } from '@plist/plist';
import { exportForIterm2 } from '@/generators/iterm2';
import { defineThemes, resolveTheme } from '@/theme';
import { themes as builtInThemes } from '@/themes';

describe('exportForIterm2', () => {
  it('exports core terminal colors, ansi colors, and iTerm2 extras', () => {
    const themes = defineThemes({
      ...builtInThemes,
      child: {
        extends: 'Plus',
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
    expect(plist['Badge Color']).toBeDefined();
    expect(plist['Badge Color (Light)']).toBeDefined();
    expect(plist['Badge Color (Dark)']).toBeDefined();
    expect(plist['Cursor Guide Color']).toBeDefined();
    expect(plist['Cursor Guide Color (Light)']).toBeDefined();
    expect(plist['Cursor Guide Color (Dark)']).toBeDefined();
    expect(plist['Match Background Color']).toBeDefined();
    expect(plist['Match Background Color (Light)']).toBeDefined();
    expect(plist['Match Background Color (Dark)']).toBeDefined();
    expect(plist['Link Color']).toBeDefined();
    expect(plist['Link Color (Light)']).toBeDefined();
    expect(plist['Link Color (Dark)']).toBeDefined();
    expect(plist['Underline Color']).toBeUndefined();
  });

  it('falls back to the foreground color for bold when the theme defines none', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'Plus');
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<string, unknown>;

    expect(plist['Bold Color']).toEqual(plist['Foreground Color']);
    expect(plist['Bold Color (Light)']).toEqual(plist['Foreground Color (Light)']);
    expect(plist['Bold Color (Dark)']).toEqual(plist['Foreground Color (Dark)']);
  });

  it('falls back to palette-derived colors for badge, cursor guide, match background, and link', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'Plus');
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<string, unknown>;

    expect(plist['Badge Color']).toEqual(plist['Ansi 1 Color']);
    expect(plist['Badge Color (Light)']).toEqual(plist['Ansi 1 Color (Light)']);
    expect(plist['Badge Color (Dark)']).toEqual(plist['Ansi 1 Color (Dark)']);

    expect(plist['Match Background Color']).toEqual(plist['Ansi 3 Color']);
    expect(plist['Match Background Color (Light)']).toEqual(plist['Ansi 3 Color (Light)']);
    expect(plist['Match Background Color (Dark)']).toEqual(plist['Ansi 3 Color (Dark)']);

    expect(plist['Cursor Guide Color']).toEqual(plist['Selection Color']);
    expect(plist['Cursor Guide Color (Light)']).toEqual(plist['Selection Color (Light)']);
    expect(plist['Cursor Guide Color (Dark)']).toEqual(plist['Selection Color (Dark)']);

    expect(plist['Link Color']).toEqual(plist['Ansi 4 Color']);
    expect(plist['Link Color (Light)']).toEqual(plist['Ansi 4 Color (Light)']);
    expect(plist['Link Color (Dark)']).toEqual(plist['Ansi 4 Color (Dark)']);
  });

  it('composites translucent colors onto the active theme background', () => {
    const resolvedTheme = resolveTheme(builtInThemes, '2026');
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
