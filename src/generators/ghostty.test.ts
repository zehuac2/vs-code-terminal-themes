import { describe, expect, it } from 'bun:test';
import { exportForGhostty, type GhosttyExportObject } from '@/generators/ghostty';
import { defineThemes, resolveTheme } from '@/theme';
import { themes as builtInThemes } from '@/themes';

describe('exportForGhostty', () => {
  it('exports core colors and the 16-entry ANSI palette', () => {
    const resolvedTheme = resolveTheme(builtInThemes, '2026');
    const config = exportForGhostty(resolvedTheme, { variant: 'dark' });

    expect(config).toContain('background = #191A1B');
    expect(config).toContain('foreground = #CCCCCC');
    // ANSI index 4 = ansiBlue, index 12 = ansiBrightBlue
    expect(config).toContain('palette = 4=#2472C8');
    expect(config).toContain('palette = 12=#3B8EEA');
    // cursor is defined on the 2026 theme
    expect(config).toContain('cursor-color = #BFBFBF');
  });

  it('exports only 24-bit colors by flattening alpha onto the variant background', () => {
    const themes = defineThemes({
      ...builtInThemes,
      child: {
        extends: '2026',
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
    const config = exportForGhostty(resolvedTheme, { variant: 'dark' });
    const object = exportForGhostty(resolvedTheme, { variant: 'dark' }, 'object');

    expect(config).not.toContain('#3994BC33');
    // palette index 4 = ansiBlue
    expect(object.palette[4]).toMatch(/^#[0-9A-F]{6}$/);
    expect(object.palette[4]).toBe('#1F323B');
  });
});
