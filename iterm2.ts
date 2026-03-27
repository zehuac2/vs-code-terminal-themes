import {
  ANSI_THEME_COLOR_KEYS,
  ANSI_THEME_COLOR_TO_INDEX,
  ITERM2_EXTRA_COLOR_KEYS,
  type ColorValue,
  type ResolvedTheme,
} from './theme';
import { type Dictionary, PlistFormat } from '@plist/common';
import { serialize } from '@plist/plist';

interface ITerm2Color extends Dictionary {
  'Alpha Component': number;
  'Blue Component': number;
  'Green Component': number;
  'Red Component': number;
  'Color Space': 'sRGB';
}

type ITerm2ColorPreset = Dictionary;

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
} as const;

function convertColor(color: string): ITerm2Color {
  const rgba = Bun.color(color, '{rgba}');

  if (!rgba) {
    throw new Error(`Invalid color value: ${color}`);
  }

  return {
    'Alpha Component': rgba.a,
    'Blue Component': rgba.b / 255,
    'Color Space': 'sRGB',
    'Green Component': rgba.g / 255,
    'Red Component': rgba.r / 255,
  };
}

export function exportForIterm2(theme: ResolvedTheme): string {
  const preset: ITerm2ColorPreset = {};

  const addColor = (colorName: string, colorValue: ColorValue) => {
    preset[colorName] = convertColor(colorValue.dark);
    preset[`${colorName} (Light)`] = convertColor(colorValue.light);
    preset[`${colorName} (Dark)`] = convertColor(colorValue.dark);
  };

  for (const colorKey of ANSI_THEME_COLOR_KEYS) {
    const colorIndex = ANSI_THEME_COLOR_TO_INDEX[colorKey];

    addColor(`Ansi ${colorIndex} Color`, theme.colors[colorKey]);
  }

  for (const [themeColorName, iterm2ColorName] of Object.entries(
    CORE_ITERM2_COLOR_NAME_BY_THEME_COLOR,
  )) {
    const colorValue =
      theme.colors[themeColorName as keyof typeof CORE_ITERM2_COLOR_NAME_BY_THEME_COLOR];

    if (!colorValue) {
      continue;
    }

    addColor(iterm2ColorName, colorValue);
  }

  for (const themeColorName of ITERM2_EXTRA_COLOR_KEYS) {
    const colorValue = theme.iterm2.colors[themeColorName];

    if (!colorValue) {
      continue;
    }

    addColor(EXTRA_ITERM2_COLOR_NAME_BY_THEME_COLOR[themeColorName], colorValue);
  }

  return serialize(preset, PlistFormat.XML);
}
