import {
  type ColorDefinition,
  type ColorOverride,
  type ResolvedTheme,
  type ThemeColorKey,
} from '@/theme';
import { DEFAULT_COLORS_BY_KIND, type DefaultThemeColorKey, type ThemeKind } from './palette';

type ThemeColors = Partial<Record<ThemeColorKey, ColorDefinition>>;

/**
 * Selector-backed extra colors with no first-class VS Code equivalent. They
 * track another resolved color of the same theme so overrides (e.g. Modern's
 * `foreground`) propagate automatically instead of going stale.
 */
export const EXTRA_SELECTOR_COLORS = {
  // VS Code has no distinct bold color; the terminal reuses the foreground.
  bold: (theme: ResolvedTheme) => theme.colors.foreground,
  // Underlined text uses the same color as a link.
  underline: (theme: ResolvedTheme) => theme.colors.link,
  // No VS Code terminal analog; track the selection color instead.
  cursorGuide: (theme: ResolvedTheme) => theme.colors.selectionBackground,
} satisfies ThemeColors;

export function pairedColor(light: string, dark: string): ColorOverride {
  return {
    light,
    dark,
    hcDark: dark,
    hcLight: light,
  };
}

export function pairedDefaultColors(lightKind: ThemeKind, darkKind: ThemeKind): ThemeColors {
  return Object.fromEntries(
    Object.keys(DEFAULT_COLORS_BY_KIND[lightKind]).map((key) => {
      const colorKey = key as DefaultThemeColorKey;
      return [
        colorKey,
        pairedColor(
          DEFAULT_COLORS_BY_KIND[lightKind][colorKey],
          DEFAULT_COLORS_BY_KIND[darkKind][colorKey],
        ),
      ];
    }),
  ) as ThemeColors;
}
