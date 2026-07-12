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

/**
 * Colors with no first-class VS Code equivalent. They exist purely to drive
 * terminal-specific decorations (e.g. iTerm2's bold/link/badge colors) but are
 * still modeled as terminal-agnostic theme colors so any generator can adopt
 * them — see {@link ColorSelector} for how a theme can derive one of these
 * from another resolved color instead of specifying it directly.
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

const REQUIRED_THEME_COLOR_KEY_SET = new Set<ThemeColorKey>(REQUIRED_THEME_COLOR_KEYS);

/** Type guard: `true` when `key` must be fully defined on every resolved theme. */
function isRequiredThemeColorKey(key: ThemeColorKey): key is RequiredThemeColorKey {
  return REQUIRED_THEME_COLOR_KEY_SET.has(key);
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

export interface ResolvedTheme {
  colors: Record<RequiredThemeColorKey, ColorValue> & Partial<Record<OptionalThemeColorKey, ColorValue>>;
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
  parent: Partial<ColorValue> | undefined,
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
 * Walks a theme's `extends` chain and returns the definitions from root
 * ancestor to the requested theme (inclusive), the order later folding needs
 * to layer overrides correctly.
 *
 * @throws If a referenced theme is not defined, or an inheritance cycle exists.
 */
function collectThemeChain(
  themes: Record<string, ThemeDefinition>,
  themeName: string,
): ThemeDefinition[] {
  const chain: ThemeDefinition[] = [];
  const visitedThemeNames = new Set<string>();

  let currentThemeName = themeName;

  for (;;) {
    if (visitedThemeNames.has(currentThemeName)) {
      throw new Error(`Theme inheritance cycle detected while resolving "${currentThemeName}".`);
    }

    visitedThemeNames.add(currentThemeName);

    const definition = themes[currentThemeName];

    if (!definition) {
      throw new Error(`Theme "${currentThemeName}" is not defined.`);
    }

    chain.push(definition);

    if (!definition.extends) {
      break;
    }

    currentThemeName = definition.extends;
  }

  return chain.reverse();
}

/**
 * Folds a root-to-leaf chain of theme definitions into one effective
 * {@link ColorDefinition} per key: concrete overrides merge onto the
 * accumulated color variant by variant, while a selector replaces whatever
 * came before it (and is itself replaced by a later concrete override).
 */
function foldThemeColorChain(
  chain: readonly ThemeDefinition[],
): Partial<Record<ThemeColorKey, ColorDefinition>> {
  const effectiveByKey: Partial<Record<ThemeColorKey, ColorDefinition>> = {};

  for (const definition of chain) {
    for (const key of THEME_COLOR_KEYS) {
      const entry = definition.colors?.[key];

      if (entry === undefined) {
        continue;
      }

      if (isColorSelector(entry)) {
        effectiveByKey[key] = entry;
        continue;
      }

      const previous = effectiveByKey[key];
      const previousColorValue = previous && !isColorSelector(previous) ? previous : undefined;

      effectiveByKey[key] = mergeColorValue(previousColorValue, entry);
    }
  }

  return effectiveByKey;
}

/**
 * Resolves a named theme into a fully-populated {@link ResolvedTheme} by
 * flattening its `extends` chain into one effective color definition per key,
 * then resolving each key — invoking {@link ColorSelector}s lazily against the
 * theme's own resolved colors so they can derive from (and track overrides of)
 * any other key. Selector invocations and color completeness are memoized per
 * key, and both inheritance cycles and selector reference cycles are detected.
 *
 * @param themes - The map of all available theme definitions.
 * @param themeName - The theme to resolve.
 * @throws If the theme (or a referenced parent) is not defined, an inheritance
 *   or selector cycle exists, or a required color is missing after resolution.
 */
export function resolveTheme(
  themes: Record<string, ThemeDefinition>,
  themeName: string,
): ResolvedTheme {
  const chain = collectThemeChain(themes, themeName);
  const effectiveByKey = foldThemeColorChain(chain);

  const resolvedByKey = new Map<ThemeColorKey, ColorValue | undefined>();
  const resolvingKeys = new Set<ThemeColorKey>();

  function resolveKey(key: ThemeColorKey): ColorValue | undefined {
    if (resolvedByKey.has(key)) {
      return resolvedByKey.get(key);
    }

    if (resolvingKeys.has(key)) {
      throw new Error(
        `Theme "${themeName}" has a color selector cycle involving "colors.${key}".`,
      );
    }

    resolvingKeys.add(key);

    const definition = effectiveByKey[key];
    const isRequired = isRequiredThemeColorKey(key);

    const value = definition === undefined
      ? undefined
      : isColorSelector(definition)
        ? definition(themeProxy)
        : validateColorValue(themeName, `colors.${key}`, definition, isRequired);

    if (value === undefined && isRequired) {
      throw new Error(`Theme "${themeName}" is missing required color "colors.${key}".`);
    }

    resolvingKeys.delete(key);
    resolvedByKey.set(key, value);

    return value;
  }

  const colorsProxy = new Proxy({} as ResolvedTheme['colors'], {
    get: (_target, key) => (typeof key === 'string' ? resolveKey(key as ThemeColorKey) : undefined),
  });
  const themeProxy: ResolvedTheme = { colors: colorsProxy };

  const colors = Object.fromEntries(
    mapDefined(THEME_COLOR_KEYS, (key) => {
      const value = resolveKey(key);
      return value ? ([key, value] as const) : undefined;
    }),
  ) as ResolvedTheme['colors'];

  return { colors };
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
