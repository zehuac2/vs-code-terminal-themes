import { type ColorValue, type ResolvedColors } from '@/theme';
import { DEFAULT_COLORS_BY_KIND, type DefaultThemeColorKey, type ThemeKind } from './palette';

/** A theme's base colors, before the selector-backed extras are derived. */
export type BaseColors = Record<DefaultThemeColorKey, ColorValue>;

/**
 * Builds a {@link ColorValue} that pairs a `light` color with a `dark` one,
 * reusing each for the matching high-contrast variant.
 */
export function pairedColor(light: string, dark: string): ColorValue {
  return {
    light,
    dark,
    hcDark: dark,
    hcLight: light,
  };
}

/**
 * Pairs every default color of `lightKind` with its `darkKind` counterpart,
 * producing a full {@link BaseColors} map from the literal palette.
 */
export function pairedDefaults(lightKind: ThemeKind, darkKind: ThemeKind): BaseColors {
  return Object.fromEntries(
    (Object.keys(DEFAULT_COLORS_BY_KIND[lightKind]) as DefaultThemeColorKey[]).map((key) => [
      key,
      pairedColor(DEFAULT_COLORS_BY_KIND[lightKind][key], DEFAULT_COLORS_BY_KIND[darkKind][key]),
    ]),
  ) as BaseColors;
}

/**
 * Derives the selector-backed extras (`bold`, `underline`, `cursorGuide`) from a
 * theme's own base colors, producing a complete {@link ResolvedColors}. Because
 * it runs on each theme's finished base, the extras track that theme's own
 * `foreground`/`link`/`selectionBackground` — a child that overrides one of
 * those gets a matching extra for free. To pin a custom extra, layer it on top:
 * `{ ...withExtras(base), bold: pairedColor(...) }`.
 */
export function withExtras(colors: BaseColors): ResolvedColors {
  return {
    ...colors,
    // VS Code has no distinct bold color; the terminal reuses the foreground.
    bold: colors.foreground,
    // Underlined text uses the same color as a link.
    underline: colors.link,
    // No VS Code terminal analog; track the selection color instead.
    cursorGuide: colors.selectionBackground,
  };
}
