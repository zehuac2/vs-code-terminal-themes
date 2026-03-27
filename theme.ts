export const COLOR_VARIANTS = ['light', 'dark', 'hcDark', 'hcLight'] as const;
export type ColorVariant = typeof COLOR_VARIANTS[number];

export interface ColorValue {
  light: string;
  dark: string;
  hcDark: string;
  hcLight: string;
}

export type ColorOverride = Partial<ColorValue>;

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

export const THEME_COLOR_KEYS = [...ANSI_THEME_COLOR_KEYS, ...CORE_THEME_COLOR_KEYS] as const;
export type ThemeColorKey = typeof THEME_COLOR_KEYS[number];

export const REQUIRED_THEME_COLOR_KEYS = [...ANSI_THEME_COLOR_KEYS, 'background', 'foreground'] as const;
export type RequiredThemeColorKey = typeof REQUIRED_THEME_COLOR_KEYS[number];
export type OptionalThemeColorKey = Exclude<ThemeColorKey, RequiredThemeColorKey>;

export const ITERM2_EXTRA_COLOR_KEYS = ['bold', 'link', 'underline'] as const;
export type Iterm2ExtraColorKey = typeof ITERM2_EXTRA_COLOR_KEYS[number];

export interface ThemeDefinition {
  displayName?: string;
  extends?: string;
  colors?: Partial<Record<ThemeColorKey, ColorOverride>>;
  iterm2?: {
    colors?: Partial<Record<Iterm2ExtraColorKey, ColorOverride>>;
  };
}

export interface ResolvedTheme {
  colors: Record<RequiredThemeColorKey, ColorValue> & Partial<Record<OptionalThemeColorKey, ColorValue>>;
  iterm2: {
    colors: Partial<Record<Iterm2ExtraColorKey, ColorValue>>;
  };
}

export function defineThemes<const T extends Record<string, ThemeDefinition>>(themes: T): T {
  return themes;
}

function mergeColorValue(parent: ColorValue | undefined, override: ColorOverride | undefined): ColorValue | undefined {
  if (!parent && !override) {
    return undefined;
  }

  return {
    light: override?.light ?? parent?.light ?? '',
    dark: override?.dark ?? parent?.dark ?? '',
    hcDark: override?.hcDark ?? parent?.hcDark ?? '',
    hcLight: override?.hcLight ?? parent?.hcLight ?? '',
  };
}

function assertResolvedColorValue(
  themeName: string,
  colorPath: string,
  colorValue: ColorValue | undefined,
): ColorValue {
  if (!colorValue) {
    throw new Error(`Theme "${themeName}" is missing "${colorPath}" after resolution.`);
  }

  for (const variant of COLOR_VARIANTS) {
    if (!colorValue[variant]) {
      throw new Error(`Theme "${themeName}" is missing "${colorPath}.${variant}" after resolution.`);
    }
  }

  return colorValue;
}

export function resolveTheme(
  themes: Record<string, ThemeDefinition>,
  themeName: string,
): ResolvedTheme {
  const resolvedThemes = new Map<string, ResolvedTheme>();
  const activeThemeNames = new Set<string>();

  const resolveByName = (currentThemeName: string): ResolvedTheme => {
    const cached = resolvedThemes.get(currentThemeName);

    if (cached) {
      return cached;
    }

    const definition = themes[currentThemeName];

    if (!definition) {
      throw new Error(`Theme "${currentThemeName}" is not defined.`);
    }

    if (activeThemeNames.has(currentThemeName)) {
      throw new Error(`Theme inheritance cycle detected while resolving "${currentThemeName}".`);
    }

    activeThemeNames.add(currentThemeName);

    const parent = definition.extends ? resolveByName(definition.extends) : undefined;
    const resolvedColors: Partial<Record<ThemeColorKey, ColorValue>> = {};
    const resolvedIterm2Colors: Partial<Record<Iterm2ExtraColorKey, ColorValue>> = {};

    for (const colorKey of THEME_COLOR_KEYS) {
      const mergedColorValue = mergeColorValue(parent?.colors[colorKey], definition.colors?.[colorKey]);
      const isRequiredColor = REQUIRED_THEME_COLOR_KEYS.includes(colorKey as RequiredThemeColorKey);

      if (mergedColorValue) {
        resolvedColors[colorKey] = assertResolvedColorValue(
          currentThemeName,
          `colors.${colorKey}`,
          mergedColorValue,
        );
        continue;
      }

      if (isRequiredColor) {
        throw new Error(`Theme "${currentThemeName}" is missing required color "colors.${colorKey}".`);
      }

    }

    for (const colorKey of ITERM2_EXTRA_COLOR_KEYS) {
      const mergedColorValue = mergeColorValue(parent?.iterm2.colors[colorKey], definition.iterm2?.colors?.[colorKey]);

      if (!mergedColorValue) {
        continue;
      }

      resolvedIterm2Colors[colorKey] = assertResolvedColorValue(
        currentThemeName,
        `iterm2.colors.${colorKey}`,
        mergedColorValue,
      );
    }

    const resolvedTheme: ResolvedTheme = {
      colors: resolvedColors as ResolvedTheme['colors'],
      iterm2: {
        colors: resolvedIterm2Colors,
      },
    };

    activeThemeNames.delete(currentThemeName);
    resolvedThemes.set(currentThemeName, resolvedTheme);

    return resolvedTheme;
  };

  return resolveByName(themeName);
}

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
