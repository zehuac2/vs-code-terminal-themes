import { defineThemes, type ColorOverride, type ThemeColorKey } from './theme';

type ThemeKind = 'light' | 'dark' | 'hcDark' | 'hcLight';

type ThemeColors = Partial<Record<ThemeColorKey, ColorOverride>>;

const DEFAULT_COLORS_BY_KIND: Record<ThemeKind, Record<ThemeColorKey, string>> = {
  light: {
    ansiBlack: '#000000',
    ansiRed: '#cd3131',
    ansiGreen: '#107C10',
    ansiYellow: '#949800',
    ansiBlue: '#0451a5',
    ansiMagenta: '#bc05bc',
    ansiCyan: '#0598bc',
    ansiWhite: '#555555',
    ansiBrightBlack: '#666666',
    ansiBrightRed: '#cd3131',
    ansiBrightGreen: '#14CE14',
    ansiBrightYellow: '#b5ba00',
    ansiBrightBlue: '#0451a5',
    ansiBrightMagenta: '#bc05bc',
    ansiBrightCyan: '#0598bc',
    ansiBrightWhite: '#a5a5a5',
    background: '#ffffff',
    foreground: '#333333',
    selectionBackground: '#add6ff',
    selectionForeground: '#000000',
    cursor: '#000000',
    cursorText: '#ffffff',
    border: '#2A2B2CFF',
    tabActiveBorder: '#005FB8',
  },
  dark: {
    ansiBlack: '#000000',
    ansiRed: '#cd3131',
    ansiGreen: '#0DBC79',
    ansiYellow: '#e5e510',
    ansiBlue: '#2472c8',
    ansiMagenta: '#bc3fbc',
    ansiCyan: '#11a8cd',
    ansiWhite: '#e5e5e5',
    ansiBrightBlack: '#666666',
    ansiBrightRed: '#f14c4c',
    ansiBrightGreen: '#23d18b',
    ansiBrightYellow: '#f5f543',
    ansiBrightBlue: '#3b8eea',
    ansiBrightMagenta: '#d670d6',
    ansiBrightCyan: '#29b8db',
    ansiBrightWhite: '#e5e5e5',
    background: '#1f1f1f',
    foreground: '#cccccc',
    selectionBackground: '#264f78',
    selectionForeground: '#ffffff',
    cursor: '#aeafad',
    cursorText: '#1f1f1f',
    border: '#2A2B2CFF',
    tabActiveBorder: '#0078D4',
  },
  hcDark: {
    ansiBlack: '#000000',
    ansiRed: '#cd0000',
    ansiGreen: '#00cd00',
    ansiYellow: '#cdcd00',
    ansiBlue: '#0000ee',
    ansiMagenta: '#cd00cd',
    ansiCyan: '#00cdcd',
    ansiWhite: '#e5e5e5',
    ansiBrightBlack: '#7f7f7f',
    ansiBrightRed: '#ff0000',
    ansiBrightGreen: '#00ff00',
    ansiBrightYellow: '#ffff00',
    ansiBrightBlue: '#5c5cff',
    ansiBrightMagenta: '#ff00ff',
    ansiBrightCyan: '#00ffff',
    ansiBrightWhite: '#ffffff',
    background: '#000000',
    foreground: '#ffffff',
    selectionBackground: '#f38518',
    selectionForeground: '#000000',
    cursor: '#ffffff',
    cursorText: '#000000',
    border: '#2A2B2CFF',
    tabActiveBorder: '#0078D4',
  },
  hcLight: {
    ansiBlack: '#292929',
    ansiRed: '#cd3131',
    ansiGreen: '#136C13',
    ansiYellow: '#949800',
    ansiBlue: '#0451a5',
    ansiMagenta: '#bc05bc',
    ansiCyan: '#0598bc',
    ansiWhite: '#555555',
    ansiBrightBlack: '#666666',
    ansiBrightRed: '#cd3131',
    ansiBrightGreen: '#00bc00',
    ansiBrightYellow: '#b5ba00',
    ansiBrightBlue: '#0451a5',
    ansiBrightMagenta: '#bc05bc',
    ansiBrightCyan: '#0598bc',
    ansiBrightWhite: '#a5a5a5',
    background: '#ffffff',
    foreground: '#292929',
    selectionBackground: '#0f4a85',
    selectionForeground: '#ffffff',
    cursor: '#0f4a85',
    cursorText: '#ffffff',
    border: '#2A2B2CFF',
    tabActiveBorder: '#005FB8',
  },
};

function color(value: string): ColorOverride {
  return {
    light: value,
    dark: value,
    hcDark: value,
    hcLight: value,
  };
}

function defaultColors(kind: ThemeKind): ThemeColors {
  return Object.fromEntries(
    Object.entries(DEFAULT_COLORS_BY_KIND[kind]).map(([key, value]) => [key, color(value)]),
  ) as ThemeColors;
}

export const themes = defineThemes({
  'Dark (Visual Studio)': {
    displayName: 'Dark (Visual Studio)',
    colors: {
      ...defaultColors('dark'),
      selectionBackground: color('#3A3D41'),
    },
  },
  'Light (Visual Studio)': {
    displayName: 'Light (Visual Studio)',
    colors: {
      ...defaultColors('light'),
      selectionBackground: color('#E5EBF1'),
    },
  },
  'Dark+': {
    displayName: 'Dark+',
    extends: 'Dark (Visual Studio)',
  },
  'Light+': {
    displayName: 'Light+',
    extends: 'Light (Visual Studio)',
  },
  'Dark Modern': {
    displayName: 'Dark Modern',
    extends: 'Dark+',
    colors: {
      foreground: color('#CCCCCC'),
      tabActiveBorder: color('#0078D4'),
    },
  },
  'Light Modern': {
    displayName: 'Light Modern',
    extends: 'Light+',
    colors: {
      foreground: color('#3B3B3B'),
      cursor: color('#005FB8'),
      selectionBackground: color('#E5EBF1'),
      tabActiveBorder: color('#005FB8'),
    },
  },
  'Dark High Contrast': {
    displayName: 'Dark High Contrast',
    colors: defaultColors('hcDark'),
  },
  'Light High Contrast': {
    displayName: 'Light High Contrast',
    colors: defaultColors('hcLight'),
  },
  '2026 Dark': {
    displayName: '2026 Dark',
    extends: 'Dark Modern',
    colors: {
      background: color('#191A1B'),
      selectionBackground: color('#3994BC33'),
      cursor: color('#bfbfbf'),
      cursorText: color('#191A1B'),
      border: color('#2A2B2CFF'),
      tabActiveBorder: color('#3994BC00'),
    },
  },
  '2026 Light': {
    displayName: '2026 Light',
    extends: 'Light Modern',
    colors: {
      selectionBackground: color('#0069CC26'),
      cursor: color('#202020'),
      cursorText: color('#FFFFFF'),
    },
  },
});
