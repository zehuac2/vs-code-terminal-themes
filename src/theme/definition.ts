import type {
  ColorOverride,
  ColorValue,
  OptionalThemeColorKey,
  RequiredThemeColorKey,
  ThemeColorKey,
} from './colors';

export interface ResolvedTheme {
  colors: Record<RequiredThemeColorKey, ColorValue> & Partial<Record<OptionalThemeColorKey, ColorValue>>;
}

/**
 * Derives a color from the theme's own resolved colors instead of specifying
 * one directly. Useful for colors that should always track another color
 * (e.g. `bold` tracking `foreground`) across inheritance, even when a child
 * theme overrides the source color.
 *
 * @returns The derived color, or `undefined` to leave the key unset.
 */
export type ColorSelector = (theme: ResolvedTheme) => ColorValue | undefined;

export type ColorDefinition = ColorOverride | ColorSelector;

/** Type guard: `true` when `value` is a {@link ColorSelector} rather than a literal color. */
export function isColorSelector(value: ColorDefinition): value is ColorSelector {
  return typeof value === 'function';
}

export interface ThemeDefinition {
  displayName?: string;
  extends?: string;
  colors?: Partial<Record<ThemeColorKey, ColorDefinition>>;
}

/**
 * Identity helper that preserves the literal types of a theme map while
 * constraining it to {@link ThemeDefinition}. Use it when declaring themes so
 * theme names and color keys stay strongly typed for {@link resolveTheme}.
 */
export function defineThemes<const T extends Record<string, ThemeDefinition>>(themes: T): T {
  return themes;
}
