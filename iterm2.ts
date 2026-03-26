import { type Theme, type NamedThemeColor, NAMED_THEME_COLOR_TO_INDEX_THEME_COLOR } from './theme';
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

export function exportForIterm2(theme: Theme): string {
  const preset: ITerm2ColorPreset = {};

  (Object.keys(theme) as NamedThemeColor[]).forEach((colorName) => {
    const color = theme[colorName];
    const colorIndex = NAMED_THEME_COLOR_TO_INDEX_THEME_COLOR[colorName];

    preset[`Ansi ${colorIndex} Color`] = convertColor(color.dark);
    preset[`Ansi ${colorIndex} Color (Light)`] = convertColor(color.light);
    preset[`Ansi ${colorIndex} Color (Darl)`] = convertColor(color.dark);
  });

  return serialize(preset, PlistFormat.XML);
}
