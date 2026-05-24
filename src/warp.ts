import { stringify } from 'yaml';
import { isTransparentColor, toOpaqueBackgroundHex, toOpaqueHex } from './color';
import {
  type AnsiThemeColorKey,
  type ColorVariant,
  type ColorValue,
  type ResolvedTheme,
} from './theme';

export const WARP_COLOR_VARIANTS = ['light', 'dark'] as const satisfies readonly ColorVariant[];
export type WarpColorVariant = typeof WARP_COLOR_VARIANTS[number];

type WarpDetails = 'lighter' | 'darker';
type WarpColorName = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
type WarpAnsiColors = Record<WarpColorName, string>;

export interface WarpExportOptions {
  name: string;
  variant: WarpColorVariant;
}

export interface WarpExportObject {
  name: string;
  accent: string;
  cursor?: string;
  background: string;
  foreground: string;
  details: WarpDetails;
  terminal_colors: {
    bright: WarpAnsiColors;
    normal: WarpAnsiColors;
  };
}

export type WarpExportFormat = 'yaml' | 'object';

const WARP_DETAILS_BY_VARIANT: Record<WarpColorVariant, WarpDetails> = {
  dark: 'darker',
  light: 'lighter',
};

const NORMAL_ANSI_COLORS: Array<[WarpColorName, AnsiThemeColorKey]> = [
  ['black', 'ansiBlack'],
  ['red', 'ansiRed'],
  ['green', 'ansiGreen'],
  ['yellow', 'ansiYellow'],
  ['blue', 'ansiBlue'],
  ['magenta', 'ansiMagenta'],
  ['cyan', 'ansiCyan'],
  ['white', 'ansiWhite'],
];

const BRIGHT_ANSI_COLORS: Array<[WarpColorName, AnsiThemeColorKey]> = [
  ['black', 'ansiBrightBlack'],
  ['red', 'ansiBrightRed'],
  ['green', 'ansiBrightGreen'],
  ['yellow', 'ansiBrightYellow'],
  ['blue', 'ansiBrightBlue'],
  ['magenta', 'ansiBrightMagenta'],
  ['cyan', 'ansiBrightCyan'],
  ['white', 'ansiBrightWhite'],
];

function selectVariantColor(colorValue: ColorValue, variant: WarpColorVariant): string {
  return colorValue[variant];
}

function createAnsiColors(
  theme: ResolvedTheme,
  entries: Array<[WarpColorName, AnsiThemeColorKey]>,
  variant: WarpColorVariant,
  convertColor: (color: string) => string,
): WarpAnsiColors {
  return Object.fromEntries(
    entries.map(([warpColorName, themeColorName]) => [
      warpColorName,
      convertColor(selectVariantColor(theme.colors[themeColorName], variant)),
    ]),
  ) as WarpAnsiColors;
}

function selectAccentColor(theme: ResolvedTheme, variant: WarpColorVariant): string {
  const activeTabBorder = theme.colors.tabActiveBorder?.[variant];

  if (activeTabBorder && !isTransparentColor(activeTabBorder)) {
    return activeTabBorder;
  }

  return theme.colors.ansiBlue[variant];
}

export function exportForWarp(theme: ResolvedTheme, options: WarpExportOptions): string;
export function exportForWarp(
  theme: ResolvedTheme,
  options: WarpExportOptions,
  format: 'yaml',
): string;
export function exportForWarp(
  theme: ResolvedTheme,
  options: WarpExportOptions,
  format: 'object',
): WarpExportObject;
export function exportForWarp(
  theme: ResolvedTheme,
  { name, variant }: WarpExportOptions,
  format: WarpExportFormat = 'yaml',
): string | WarpExportObject {
  const backgroundColor = selectVariantColor(theme.colors.background, variant);
  const convertColor = (color: string): string => toOpaqueHex(backgroundColor, color);
  const cursor = theme.colors.cursor
    ? convertColor(selectVariantColor(theme.colors.cursor, variant))
    : undefined;
  const warpTheme: WarpExportObject = {
    name,
    accent: convertColor(selectAccentColor(theme, variant)),
    ...(cursor ? { cursor } : {}),
    background: toOpaqueBackgroundHex(backgroundColor),
    foreground: convertColor(selectVariantColor(theme.colors.foreground, variant)),
    details: WARP_DETAILS_BY_VARIANT[variant],
    terminal_colors: {
      bright: createAnsiColors(theme, BRIGHT_ANSI_COLORS, variant, convertColor),
      normal: createAnsiColors(theme, NORMAL_ANSI_COLORS, variant, convertColor),
    },
  };

  if (format === 'object') {
    return warpTheme;
  }

  return stringify(warpTheme, { lineWidth: 0 });
}
