import { describe, expect, it } from 'bun:test';
import { parse } from '@plist/plist';
import { EXTRA_ITERM2_COLOR_NAME_BY_THEME_COLOR, exportForIterm2 } from '@/generators/iterm2';
import { type ResolvedTheme } from '@/theme';
import { themes as builtInThemes } from '@/themes';
import { DEFAULT_COLORS_BY_KIND } from '@/themes/palette';

/** Independently encodes an opaque `#rrggbb` color the way an iTerm2 preset does. */
function iterm2Color(hex: string): Record<string, number | string> {
  return {
    'Alpha Component': 1,
    'Blue Component': parseInt(hex.slice(5, 7), 16) / 255,
    'Color Space': 'sRGB',
    'Green Component': parseInt(hex.slice(3, 5), 16) / 255,
    'Red Component': parseInt(hex.slice(1, 3), 16) / 255,
  };
}

describe('exportForIterm2', () => {
  it('exports core terminal colors, ansi colors, and iTerm2 extras', () => {
    const base = builtInThemes.Plus.colors;
    const child = {
      colors: {
        ...base,
        ansiBlue: { ...base.ansiBlue, dark: '#010203' },
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
    } satisfies ResolvedTheme;

    const plist = parse(exportForIterm2(child)) as Record<string, unknown>;

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

  it('derives bold, underline, and cursor guide from the theme', () => {
    const resolvedTheme = builtInThemes.Plus;
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
    const resolvedTheme = builtInThemes.Plus;
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<
      string,
      Record<string, number | string>
    >;

    // These carry concrete values from the palette (see src/themes/palette.ts),
    // no longer synthesized from an ANSI palette color.
    expect(plist['Badge Color (Light)']).toEqual(iterm2Color(DEFAULT_COLORS_BY_KIND.light.badge));
    expect(plist['Link Color (Dark)']).toEqual(iterm2Color(DEFAULT_COLORS_BY_KIND.dark.link));
    expect(plist['Match Background Color (Dark)']).toEqual(
      iterm2Color(DEFAULT_COLORS_BY_KIND.dark.matchBackground),
    );
  });

  // iTerm2 keeps a profile's existing value for any key a preset omits, so a
  // theme that fails to define one of these extras does not fall back to a sane
  // default — the key silently keeps its color from the last applied preset.
  it.each(Object.keys(builtInThemes))(
    'emits every extra color for the %s theme, so none can go stale',
    (themeName) => {
      const resolvedTheme = builtInThemes[themeName as keyof typeof builtInThemes];
      const plist = parse(exportForIterm2(resolvedTheme)) as Record<string, unknown>;

      for (const colorName of Object.values(EXTRA_ITERM2_COLOR_NAME_BY_THEME_COLOR)) {
        expect(plist[colorName]).toBeDefined();
        expect(plist[`${colorName} (Light)`]).toBeDefined();
        expect(plist[`${colorName} (Dark)`]).toBeDefined();
      }
    },
  );

  it('keeps the High Contrast badge visible against its background', () => {
    const resolvedTheme = builtInThemes['High Contrast'];
    const plist = parse(exportForIterm2(resolvedTheme)) as Record<
      string,
      Record<string, number | string>
    >;

    // VS Code's hcDark activityBarBadge.background is #000000 — the same as the
    // hcDark terminal background — which would render the badge text invisible.
    expect(plist['Badge Color (Dark)']).not.toEqual(plist['Background Color (Dark)']);
    expect(plist['Badge Color (Dark)']).toEqual(iterm2Color('#FFFFFF'));
  });

  it('composites translucent colors onto the active theme background', () => {
    const resolvedTheme = builtInThemes['2026'];
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
