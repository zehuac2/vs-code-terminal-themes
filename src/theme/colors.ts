export const COLOR_VARIANTS = ['light', 'dark', 'hcDark', 'hcLight'] as const;
export type ColorVariant = typeof COLOR_VARIANTS[number];

export interface ColorValue {
  light: string;
  dark: string;
  hcDark: string;
  hcLight: string;
}

export const ANSI_THEME_COLOR_KEYS = [
  'ansiBlack',
  'ansiRed',
  'ansiGreen',
  'ansiYellow',
  'ansiBlue',
  'ansiMagenta',
  'ansiCyan',
  'ansiWhite',
  'ansiBrightBlack',
  'ansiBrightRed',
  'ansiBrightGreen',
  'ansiBrightYellow',
  'ansiBrightBlue',
  'ansiBrightMagenta',
  'ansiBrightCyan',
  'ansiBrightWhite',
] as const;

export type AnsiThemeColorKey = typeof ANSI_THEME_COLOR_KEYS[number];

export const CORE_THEME_COLOR_KEYS = [
  'background',
  'foreground',
  'selectionBackground',
  'selectionForeground',
  'cursor',
  'cursorText',
  'border',
  'tabActiveBorder',
] as const;

export type CoreThemeColorKey = typeof CORE_THEME_COLOR_KEYS[number];

/**
 * Colors with no first-class VS Code equivalent. They exist purely to drive
 * terminal-specific decorations (e.g. iTerm2's bold/link/badge colors) but are
 * still modeled as terminal-agnostic theme colors so any generator can adopt
 * them. Some are derived from another resolved color of the same theme rather
 * than specified directly — see `withExtras` in `src/themes/builders.ts`.
 *
 * Every theme must define all of these, whether directly or via `withExtras`.
 * iTerm2 keeps a profile's existing value for any key a preset omits, so a
 * preset that leaves one of these out does not fall back to a sane default —
 * it silently inherits a stale color from whatever preset was applied before
 * it. `exportForIterm2` has a test asserting every built-in theme emits all of
 * them.
 */
export const EXTRA_THEME_COLOR_KEYS = [
  'bold',
  'link',
  'underline',
  'badge',
  'cursorGuide',
  'matchBackground',
] as const;
export type ExtraThemeColorKey = typeof EXTRA_THEME_COLOR_KEYS[number];

export const THEME_COLOR_KEYS = [
  ...ANSI_THEME_COLOR_KEYS,
  ...CORE_THEME_COLOR_KEYS,
  ...EXTRA_THEME_COLOR_KEYS,
] as const;
export type ThemeColorKey = typeof THEME_COLOR_KEYS[number];

export const REQUIRED_THEME_COLOR_KEYS = [...ANSI_THEME_COLOR_KEYS, 'background', 'foreground'] as const;
export type RequiredThemeColorKey = typeof REQUIRED_THEME_COLOR_KEYS[number];
export type OptionalThemeColorKey = Exclude<ThemeColorKey, RequiredThemeColorKey>;

export const ANSI_THEME_COLOR_TO_INDEX: Record<AnsiThemeColorKey, number> = {
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

/**
 * A theme's fully-populated colors: every required key is a complete
 * {@link ColorValue}; optional keys may be absent. Completeness is enforced at
 * compile time by declaring themes `satisfies Record<string, Theme>`.
 */
export type ResolvedColors = Record<RequiredThemeColorKey, ColorValue> &
  Partial<Record<OptionalThemeColorKey, ColorValue>>;

/** A resolved theme's colors, ready for a generator to consume. */
export interface ResolvedTheme {
  colors: ResolvedColors;
}

/** A named, resolved theme as stored in the built-in {@link ResolvedTheme} map. */
export interface Theme extends ResolvedTheme {
  displayName: string;
}
