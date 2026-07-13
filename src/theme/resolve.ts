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
  type ColorSelector,
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
 * A key's definition after flattening the `extends` chain: an optional
 * {@link ColorSelector} supplying the base color, plus the concrete overrides
 * layered on top of it.
 */
interface EffectiveColor {
  /** The last selector seen in the chain, if any. */
  base?: ColorSelector;
  /** Concrete overrides accumulated since that selector. */
  override?: Partial<ColorValue>;
}

/**
 * Folds a root-to-leaf chain of theme definitions into one {@link EffectiveColor}
 * per key. Concrete overrides merge variant by variant onto whatever came
 * before, *without* discarding a selector inherited from an ancestor — so a
 * child can pin one variant of a selector-backed color and let the selector
 * keep supplying the rest. A selector, in contrast, resets the key: it replaces
 * both the base and any overrides accumulated before it.
 */
function foldThemeColorChain(
  chain: readonly ThemeDefinition[],
): Partial<Record<ThemeColorKey, EffectiveColor>> {
  const effectiveByKey: Partial<Record<ThemeColorKey, EffectiveColor>> = {};

  for (const definition of chain) {
    for (const key of THEME_COLOR_KEYS) {
      const entry = definition.colors?.[key];

      if (entry === undefined) {
        continue;
      }

      if (isColorSelector(entry)) {
        effectiveByKey[key] = { base: entry };
        continue;
      }

      const previous = effectiveByKey[key];

      effectiveByKey[key] = {
        base: previous?.base,
        override: mergeColorValue(previous?.override, entry),
      };
    }
  }

  return effectiveByKey;
}

/**
 * Resolves a named theme into a fully-populated {@link ResolvedTheme} by
 * flattening its `extends` chain into one {@link EffectiveColor} per key, then
 * resolving each key: the base {@link ColorSelector} (if any) is invoked lazily
 * against the theme's own resolved colors — so it can derive from, and track
 * overrides of, any other key — and the key's concrete overrides are then
 * layered on top of its result. Resolution is memoized per key, and both
 * inheritance cycles and selector reference cycles are detected.
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

    const effective = effectiveByKey[key];
    const baseValue = effective?.base?.(themeProxy);
    const merged = mergeColorValue(baseValue, effective?.override);
    const value = validateColorValue(
      themeName,
      `colors.${key}`,
      merged,
      isRequiredThemeColorKey(key),
    );

    resolvingKeys.delete(key);
    resolvedByKey.set(key, value);

    return value;
  }

  /**
   * Resolves `key` for inspection (`in`, `Object.keys`, spreading), reporting a
   * key that is still mid-resolution as absent instead of treating it as a
   * cycle. A selector enumerating the palette is asking what is *available* to
   * derive from, and the key it is itself computing is not — whereas reading
   * that key outright (via `get`) is a genuine self-reference and still throws.
   */
  function inspectKey(key: string | symbol): ColorValue | undefined {
    if (typeof key !== 'string' || resolvingKeys.has(key as ThemeColorKey)) {
      return undefined;
    }

    return resolveKey(key as ThemeColorKey);
  }

  /**
   * Resolves colors lazily on access, so a selector can read keys that have not
   * been resolved yet. `getOwnPropertyDescriptor` must report `configurable`,
   * since none of these keys exist on the target and the proxy invariants would
   * otherwise reject them.
   */
  const colorsProxy = new Proxy({} as ResolvedTheme['colors'], {
    get: (_target, key) => (typeof key === 'string' ? resolveKey(key as ThemeColorKey) : undefined),
    has: (_target, key) => inspectKey(key) !== undefined,
    ownKeys: () => THEME_COLOR_KEYS.filter((key) => inspectKey(key) !== undefined),
    getOwnPropertyDescriptor: (_target, key) => {
      const value = inspectKey(key);

      return value ? { value, enumerable: true, configurable: true, writable: false } : undefined;
    },
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
