import { type ThemeColorKey } from '@/theme';

export type ThemeKind = 'light' | 'dark' | 'hcDark' | 'hcLight';

/**
 * Theme colors with a literal per-kind default. Excludes the
 * selector-backed extras (`bold`, `underline`, `cursorGuide`), which have no
 * VS Code color of their own and instead derive from another resolved color —
 * see `withExtras` in `./builders`.
 */
export type DefaultThemeColorKey = Exclude<ThemeColorKey, 'bold' | 'underline' | 'cursorGuide'>;

export const DEFAULT_COLORS_BY_KIND: Record<ThemeKind, Record<DefaultThemeColorKey, string>> = {
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
    // VS Code: textLink.foreground
    link: '#006AB1',
    // VS Code: activityBarBadge.background
    badge: '#007ACC',
    // VS Code: editor.findMatchBackground
    matchBackground: '#A8AC94',
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
    // VS Code: textLink.foreground
    link: '#3794FF',
    // VS Code: activityBarBadge.background
    badge: '#007ACC',
    // VS Code: editor.findMatchBackground
    matchBackground: '#515C6A',
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
    // VS Code: textLink.foreground
    link: '#21A6FF',
    // VS Code: activityBarBadge.foreground. The .background used by the other
    // kinds is #000000 here, which is invisible as iTerm2's badge *text* on the
    // black hcDark background; VS Code draws this badge white-on-black, so the
    // foreground is the color that actually carries it.
    badge: '#FFFFFF',
    // VS Code: editor.findMatchBackground is unset for hcDark; reuses the dark value
    matchBackground: '#515C6A',
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
    // VS Code: textLink.foreground
    link: '#0F4A85',
    // VS Code: activityBarBadge.background
    badge: '#0F4A85',
    // Not VS Code's terminal.findMatchBackground (#0F4A85): that is a dark fill
    // paired with a light find-match foreground, and iTerm2 has no match
    // foreground — matched text keeps this theme's dark foreground (#292929),
    // which needs a pale fill to stay legible.
    matchBackground: '#FFD700',
  },
};
