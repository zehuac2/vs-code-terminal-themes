import {
  COLOR_VARIANTS,
  REQUIRED_THEME_COLOR_KEYS,
  THEME_COLOR_KEYS,
  type ColorOverride,
  type ColorValue,
  type RequiredThemeColorKey,
  type ThemeColorKey,
} from './colors';
import {
  isColorSelector,
  type ColorDefinition,
  type ResolvedTheme,
  type ThemeDefinition,
} from './definition';

const REQUIRED_THEME_COLOR_KEY_SET = new Set<ThemeColorKey>(REQUIRED_THEME_COLOR_KEYS);

/** Type guard: `true` when `key` must be fully defined on every resolved theme. */
function isRequiredThemeColorKey(key: ThemeColorKey): key is RequiredThemeColorKey {
  return REQUIRED_THEME_COLOR_KEY_SET.has(key);
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
