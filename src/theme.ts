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

const REQUIRED_THEME_COLOR_KEY_SET = new Set<ThemeColorKey>(REQUIRED_THEME_COLOR_KEYS);

/** Type guard: `true` when `key` must be fully defined on every resolved theme. */
function isRequiredThemeColorKey(key: ThemeColorKey): key is RequiredThemeColorKey {
  return REQUIRED_THEME_COLOR_KEY_SET.has(key);
}

export const ITERM2_EXTRA_COLOR_KEYS = [
  'bold',
  'link',
  'underline',
  'badge',
  'cursorGuide',
  'matchBackground',
] as const;
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

/**
 * Identity helper that preserves the literal types of a theme map while
 * constraining it to {@link ThemeDefinition}. Use it when declaring themes so
 * theme names and color keys stay strongly typed for {@link resolveTheme}.
 */
export function defineThemes<const T extends Record<string, ThemeDefinition>>(themes: T): T {
  return themes;
}

/**
 * Layers an `override` on top of an inherited `parent` color, variant by
 * variant, with the override winning where it specifies a value.
 *
 * @returns A partial color holding only the variants that are defined, or
 *   `undefined` when neither side contributes anything. The result may still
 *   be missing variants — completeness is checked later by
 *   {@link validateColorValue}.
 */
function mergeColorValue(
  parent: ColorValue | undefined,
  override: ColorOverride | undefined,
): Partial<ColorValue> | undefined {
  if (!parent && !override) {
    return undefined;
  }

  return Object.fromEntries(
    COLOR_VARIANTS
      .map((variant) => [variant, override?.[variant] ?? parent?.[variant]] as const)
      .filter(([, value]) => value !== undefined),
  );
}

/**
 * Asserts that a merged color is complete and returns it as a full
 * {@link ColorValue}.
 *
 * @param themeName - Theme being resolved, used in error messages.
 * @param colorPath - Dotted path of the color (e.g. `colors.ansiBlue`), used in
 *   error messages.
 * @param merged - The merged-but-possibly-incomplete color, or `undefined` when
 *   the color is absent entirely.
 * @param isRequired - Whether the color must be present.
 * @returns The complete color, or `undefined` when an optional color is absent.
 * @throws If a required color is absent, or if any variant is missing.
 */
function validateColorValue(
  themeName: string,
  colorPath: string,
  merged: Partial<ColorValue> | undefined,
  isRequired: boolean,
): ColorValue | undefined {
  if (!merged) {
    if (isRequired) {
      throw new Error(`Theme "${themeName}" is missing required color "${colorPath}".`);
    }

    return undefined;
  }

  const missingVariant = COLOR_VARIANTS.find((variant) => !merged[variant]);

  if (missingVariant) {
    throw new Error(
      `Theme "${themeName}" is missing "${colorPath}.${missingVariant}" after resolution.`,
    );
  }

  return merged as ColorValue;
}

/** Maps over `values`, keeping only the results that are not `undefined`. */
function mapDefined<const T, U>(
  values: readonly T[],
  mapValue: (value: T) => U | undefined,
): U[] {
  return values.flatMap((value) => {
    const mappedValue = mapValue(value);
    return mappedValue === undefined ? [] : [mappedValue];
  });
}

/**
 * Resolves a group of colors (the theme palette or the iTerm2 extras) into
 * `[key, value]` entries by merging each key's override onto the parent and
 * validating the result. Keys whose optional colors are absent are dropped.
 *
 * @param themeName - Theme being resolved, used in error messages.
 * @param pathPrefix - Path prefix for the group (e.g. `colors`,
 *   `iterm2.colors`), used in error messages.
 * @param keys - The color keys to resolve.
 * @param parentColors - Already-resolved colors inherited from the parent theme.
 * @param overrideColors - This theme's own color overrides, if any.
 * @param isRequired - Predicate deciding whether a missing key is an error.
 */
function resolveColorEntries<K extends string>(
  themeName: string,
  pathPrefix: string,
  keys: readonly K[],
  parentColors: Partial<Record<K, ColorValue>>,
  overrideColors: Partial<Record<K, ColorOverride>> | undefined,
  isRequired: (key: K) => boolean,
): Array<[K, ColorValue]> {
  return mapDefined(keys, (colorKey) => {
    const merged = mergeColorValue(parentColors[colorKey], overrideColors?.[colorKey]);
    const resolved = validateColorValue(
      themeName,
      `${pathPrefix}.${colorKey}`,
      merged,
      isRequired(colorKey),
    );

    return resolved ? [colorKey, resolved] : undefined;
  });
}

/**
 * Resolves a named theme into a fully-populated {@link ResolvedTheme} by
 * recursively resolving its `extends` parent and layering this theme's overrides
 * on top. Results are memoized within the call, and inheritance cycles are
 * detected.
 *
 * @param themes - The map of all available theme definitions.
 * @param themeName - The theme to resolve.
 * @throws If the theme (or a referenced parent) is not defined, an inheritance
 *   cycle exists, or a required color is missing after resolution.
 */
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
    const resolvedTheme: ResolvedTheme = {
      colors: Object.fromEntries(
        resolveColorEntries(
          currentThemeName,
          'colors',
          THEME_COLOR_KEYS,
          parent?.colors ?? {},
          definition.colors,
          isRequiredThemeColorKey,
        ),
      ) as ResolvedTheme['colors'],
      iterm2: {
        colors: Object.fromEntries(
          resolveColorEntries(
            currentThemeName,
            'iterm2.colors',
            ITERM2_EXTRA_COLOR_KEYS,
            parent?.iterm2.colors ?? {},
            definition.iterm2?.colors,
            () => false,
          ),
        ),
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
