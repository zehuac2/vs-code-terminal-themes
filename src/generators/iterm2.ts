import { type Dictionary, PlistFormat } from '@plist/common';
import { serialize } from '@plist/plist';
import { compositeColor } from '@/color';
import {
  ANSI_THEME_COLOR_KEYS,
  ANSI_THEME_COLOR_TO_INDEX,
  EXTRA_THEME_COLOR_KEYS,
  type ColorValue,
  type ResolvedTheme,
} from '@/theme';

interface ITerm2Color extends Dictionary {
  'Alpha Component': number;
  'Blue Component': number;
  'Green Component': number;
  'Red Component': number;
  'Color Space': 'sRGB';
}

type ITerm2ColorPreset = Dictionary;
export type ITerm2ExportObject = ITerm2ColorPreset;
export type ITerm2ExportFormat = 'xml' | 'object';

const CORE_ITERM2_COLOR_NAME_BY_THEME_COLOR = {
  background: 'Background Color',
  foreground: 'Foreground Color',
  selectionBackground: 'Selection Color',
  selectionForeground: 'Selected Text Color',
  cursor: 'Cursor Color',
  cursorText: 'Cursor Text Color',
} as const;

const EXTRA_ITERM2_COLOR_NAME_BY_THEME_COLOR = {
  bold: 'Bold Color',
  link: 'Link Color',
  underline: 'Underline Color',
  badge: 'Badge Color',
  cursorGuide: 'Cursor Guide Color',
  matchBackground: 'Match Background Color',
} as const;

type ITerm2PresetEntry = [string, ITerm2Color];

/**
 * iTerm2 colors are effectively opaque, so flatten any alpha onto the theme background.
 */
function createColorConverter(backgroundColor: string): (color: string) => ITerm2Color {
  return (color: string): ITerm2Color => {
    const composited = compositeColor(backgroundColor, color);

    return {
      'Alpha Component': 1,
      'Blue Component': composited.b / 255,
      'Color Space': 'sRGB',
      'Green Component': composited.g / 255,
      'Red Component': composited.r / 255,
    };
  };
}

function createPresetEntries(
  colorName: string,
  colorValue: ColorValue,
  convertLightColor: (color: string) => ITerm2Color,
  convertDarkColor: (color: string) => ITerm2Color,
): ITerm2PresetEntry[] {
  return [
    [colorName, convertDarkColor(colorValue.dark)],
    [`${colorName} (Light)`, convertLightColor(colorValue.light)],
    [`${colorName} (Dark)`, convertDarkColor(colorValue.dark)],
  ];
}

function compactEntries<T>(entries: Array<T | undefined>): T[] {
  return entries.filter((entry): entry is T => entry !== undefined);
}

export function exportForIterm2(theme: ResolvedTheme): string;
export function exportForIterm2(theme: ResolvedTheme, format: 'xml'): string;
export function exportForIterm2(theme: ResolvedTheme, format: 'object'): ITerm2ExportObject;
export function exportForIterm2(
  theme: ResolvedTheme,
  format: ITerm2ExportFormat = 'xml',
): string | ITerm2ExportObject {
  const convertLightColor = createColorConverter(theme.colors.background.light);
  const convertDarkColor = createColorConverter(theme.colors.background.dark);

  const ansiEntries = ANSI_THEME_COLOR_KEYS.flatMap((colorKey) =>
    createPresetEntries(
      `Ansi ${ANSI_THEME_COLOR_TO_INDEX[colorKey]} Color`,
      theme.colors[colorKey],
      convertLightColor,
      convertDarkColor,
    ),
  );

  const coreEntries = compactEntries(
    Object.entries(CORE_ITERM2_COLOR_NAME_BY_THEME_COLOR).map(
      ([themeColorName, iterm2ColorName]) => {
        const colorValue =
          theme.colors[themeColorName as keyof typeof CORE_ITERM2_COLOR_NAME_BY_THEME_COLOR];

        return colorValue
          ? createPresetEntries(iterm2ColorName, colorValue, convertLightColor, convertDarkColor)
          : undefined;
      },
    ),
  ).flat();

  const extraEntries = compactEntries(
    EXTRA_THEME_COLOR_KEYS.map((themeColorName) => {
      const colorValue = theme.colors[themeColorName];

      return colorValue
        ? createPresetEntries(
            EXTRA_ITERM2_COLOR_NAME_BY_THEME_COLOR[themeColorName],
            colorValue,
            convertLightColor,
            convertDarkColor,
          )
        : undefined;
    }),
  ).flat();

  const preset = Object.fromEntries([
    ...ansiEntries,
    ...coreEntries,
    ...extraEntries,
  ]) as ITerm2ExportObject;

  if (format === 'object') {
    return preset;
  }

  return serialize(preset, PlistFormat.XML);
}
