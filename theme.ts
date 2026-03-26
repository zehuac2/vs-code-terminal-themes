export interface Color {
  light: string;
  dark: string;
  hcDark: string;
  hcLight: string;
}

export interface Theme {
  ansiBlack: Color;
  ansiRed: Color;
  ansiGreen: Color;
  ansiYellow: Color;
  ansiBlue: Color;
  ansiMagenta: Color;
  ansiCyan: Color;
  ansiWhite: Color;
  ansiBrightBlack: Color;
  ansiBrightRed: Color;
  ansiBrightGreen: Color;
  ansiBrightYellow: Color;
  ansiBrightBlue: Color;
  ansiBrightMagenta: Color;
  ansiBrightCyan: Color;
  ansiBrightWhite: Color;
}

export type NamedThemeColor = keyof Theme;

export const NAMED_THEME_COLOR_TO_INDEX_THEME_COLOR: {
  [named in NamedThemeColor]: number;
} = {
  ansiBlack: 0,
  ansiRed: 1,
  ansiGreen: 2,
  ansiYellow: 3,
  ansiBlue: 4,
  ansiMagenta: 5,
  ansiCyan: 6,
  ansiWhite: 7,
  ansiBrightBlack: 8,
  ansiBrightRed: 9,
  ansiBrightGreen: 10,
  ansiBrightYellow: 11,
  ansiBrightBlue: 12,
  ansiBrightMagenta: 13,
  ansiBrightCyan: 14,
  ansiBrightWhite: 15,
};
