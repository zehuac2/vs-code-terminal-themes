import { describe, expect, it } from 'bun:test';
import { parse } from 'yaml';
import { exportForWarp, type WarpExportObject } from './warp';
import { defineThemes, resolveTheme } from './theme';
import { themes as builtInThemes } from './themes';

describe('exportForWarp', () => {
  it('exports core colors and normal and bright ANSI colors', () => {
    const resolvedTheme = resolveTheme(builtInThemes, 'vsCode');
    const yaml = exportForWarp(resolvedTheme, { name: 'VS Code Dark', variant: 'dark' });
    const warpTheme = parse(yaml) as WarpExportObject;

    expect(warpTheme.name).toBe('VS Code Dark');
    expect(warpTheme.details).toBe('darker');
    expect(warpTheme.background).toBe('#191A1B');
    expect(warpTheme.foreground).toBe('#CCCCCC');
    expect(warpTheme.cursor).toBe('#BFBFBF');
    expect(warpTheme.accent).toBe('#2472C8');
    expect(warpTheme.terminal_colors.normal.blue).toBe('#2472C8');
    expect(warpTheme.terminal_colors.bright.blue).toBe('#3B8EEA');
  });

  it('exports only 24-bit colors by flattening alpha onto the variant background', () => {
    const themes = defineThemes({
      ...builtInThemes,
      child: {
        extends: 'base',
        colors: {
          ansiBlue: {
            dark: '#3994BC33',
          },
          background: {
            dark: '#191A1B',
          },
        },
      },
    });

    const resolvedTheme = resolveTheme(themes, 'child');
    const yaml = exportForWarp(resolvedTheme, { name: 'Child Dark', variant: 'dark' });
    const warpTheme = parse(yaml) as WarpExportObject;

    expect(yaml).not.toContain('#3994BC33');
    expect(warpTheme.accent).toBe('#1F323B');
    expect(warpTheme.terminal_colors.normal.blue).toBe('#1F323B');
    expect(warpTheme.terminal_colors.normal.blue).toMatch(/^#[0-9A-F]{6}$/);
  });
});
