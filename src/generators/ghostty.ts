import { toOpaqueBackgroundHex, toOpaqueHex } from '@/color';
import {
  ANSI_THEME_COLOR_KEYS,
  ANSI_THEME_COLOR_TO_INDEX,
  type ColorVariant,
  type ResolvedTheme,
} from '@/theme';

export const GHOSTTY_COLOR_VARIANTS = ['light', 'dark'] as const satisfies readonly ColorVariant[];
export type GhosttyColorVariant = (typeof GHOSTTY_COLOR_VARIANTS)[number];

export interface GhosttyExportOptions {
  variant: GhosttyColorVariant;
}

export interface GhosttyExportObject {
  background: string;
  foreground: string;
  cursorColor?: string;
  cursorText?: string;
  selectionBackground?: string;
  selectionForeground?: string;
  /** Ordered 16-entry ANSI palette, index 0–15. */
  palette: string[];
}

export type GhosttyExportFormat = 'config' | 'object';

export function exportForGhostty(theme: ResolvedTheme, options: GhosttyExportOptions): string;
export function exportForGhostty(
  theme: ResolvedTheme,
  options: GhosttyExportOptions,
  format: 'config',
): string;
export function exportForGhostty(
  theme: ResolvedTheme,
  options: GhosttyExportOptions,
  format: 'object',
): GhosttyExportObject;
export function exportForGhostty(
  theme: ResolvedTheme,
  { variant }: GhosttyExportOptions,
  format: GhosttyExportFormat = 'config',
): string | GhosttyExportObject {
  const backgroundColor = theme.colors.background[variant];
  const convertColor = (color: string): string => toOpaqueHex(backgroundColor, color);

  // Build the 16-entry palette array using the canonical index mapping.
  const palette = new Array<string>(16);
  for (const key of ANSI_THEME_COLOR_KEYS) {
    palette[ANSI_THEME_COLOR_TO_INDEX[key]] = convertColor(theme.colors[key][variant]);
  }

  const cursorColor = theme.colors.cursor
    ? convertColor(theme.colors.cursor[variant])
    : undefined;
  const cursorText = theme.colors.cursorText
    ? convertColor(theme.colors.cursorText[variant])
    : undefined;
  const selectionBackground = theme.colors.selectionBackground
    ? convertColor(theme.colors.selectionBackground[variant])
    : undefined;
  const selectionForeground = theme.colors.selectionForeground
    ? convertColor(theme.colors.selectionForeground[variant])
    : undefined;

  const ghosttyTheme: GhosttyExportObject = {
    background: toOpaqueBackgroundHex(backgroundColor),
    foreground: convertColor(theme.colors.foreground[variant]),
    ...(cursorColor ? { cursorColor } : {}),
    ...(cursorText ? { cursorText } : {}),
    ...(selectionBackground ? { selectionBackground } : {}),
    ...(selectionForeground ? { selectionForeground } : {}),
    palette,
  };

  if (format === 'object') {
    return ghosttyTheme;
  }

  return serializeGhosttyConfig(ghosttyTheme);
}

function serializeGhosttyConfig(theme: GhosttyExportObject): string {
  const lines: string[] = [];

  for (let i = 0; i < theme.palette.length; i++) {
    lines.push(`palette = ${i}=${theme.palette[i]}`);
  }

  lines.push(`background = ${theme.background}`);
  lines.push(`foreground = ${theme.foreground}`);

  if (theme.cursorColor !== undefined) {
    lines.push(`cursor-color = ${theme.cursorColor}`);
  }
  if (theme.cursorText !== undefined) {
    lines.push(`cursor-text = ${theme.cursorText}`);
  }
  if (theme.selectionBackground !== undefined) {
    lines.push(`selection-background = ${theme.selectionBackground}`);
  }
  if (theme.selectionForeground !== undefined) {
    lines.push(`selection-foreground = ${theme.selectionForeground}`);
  }

  return lines.join('\n') + '\n';
}
