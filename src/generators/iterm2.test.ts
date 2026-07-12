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
          bold: {
            light: '#aaaaaa',
            dark: '#bbbbbb',
            hcDark: '#cccccc',
            hcLight: '#dddddd',
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
    expect(plist['Underline Color']).toBeDefined();
  });

  it('derives bold, underline, and cursor guide from the theme via selectors', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'Plus');
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<string, unknown>;

    expect(plist['Bold Color']).toEqual(plist['Foreground Color']);
    expect(plist['Bold Color (Light)']).toEqual(plist['Foreground Color (Light)']);
    expect(plist['Bold Color (Dark)']).toEqual(plist['Foreground Color (Dark)']);

    expect(plist['Underline Color']).toEqual(plist['Link Color']);
    expect(plist['Underline Color (Light)']).toEqual(plist['Link Color (Light)']);
    expect(plist['Underline Color (Dark)']).toEqual(plist['Link Color (Dark)']);

    expect(plist['Cursor Guide Color']).toEqual(plist['Selection Color']);
    expect(plist['Cursor Guide Color (Light)']).toEqual(plist['Selection Color (Light)']);
    expect(plist['Cursor Guide Color (Dark)']).toEqual(plist['Selection Color (Dark)']);
  });

  it('uses the theme-defined VS Code-sourced colors for badge, link, and match background', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'Plus');
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<
      string,
      Record<string, number | string>
    >;

    // These carry concrete values sourced from VS Code (see src/themes.ts), no
    // longer synthesized from an ANSI palette color.
    expect(plist['Badge Color (Light)']).toEqual({
      'Alpha Component': 1,
      'Blue Component': 0xcc / 255,
      'Color Space': 'sRGB',
      'Green Component': 0x7a / 255,
      'Red Component': 0x00 / 255,
    });
    expect(plist['Link Color (Dark)']).toEqual({
      'Alpha Component': 1,
      'Blue Component': 0xff / 255,
      'Color Space': 'sRGB',
      'Green Component': 0x94 / 255,
      'Red Component': 0x37 / 255,
    });
    expect(plist['Match Background Color (Dark)']).toEqual({
      'Alpha Component': 1,
      'Blue Component': 0x6a / 255,
      'Color Space': 'sRGB',
      'Green Component': 0x5c / 255,
      'Red Component': 0x51 / 255,
    });
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
