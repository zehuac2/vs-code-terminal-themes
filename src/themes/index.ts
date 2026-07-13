import { defineThemes } from '@/theme';
import { EXTRA_SELECTOR_COLORS, pairedColor, pairedDefaultColors } from './builders';

export const themes = defineThemes({
  'Visual Studio': {
    displayName: 'Visual Studio',
    colors: {
      ...pairedDefaultColors('light', 'dark'),
      selectionBackground: pairedColor('#E5EBF1', '#3A3D41'),
      ...EXTRA_SELECTOR_COLORS,
    },
  },
  Plus: {
    displayName: 'Plus',
    extends: 'Visual Studio',
  },
  Modern: {
    displayName: 'Modern',
    extends: 'Plus',
    colors: {
      foreground: pairedColor('#3B3B3B', '#CCCCCC'),
      cursor: {
        light: '#005FB8',
      },
      selectionBackground: {
        light: '#E5EBF1',
      },
      tabActiveBorder: pairedColor('#005FB8', '#0078D4'),
    },
  },
  'High Contrast': {
    displayName: 'High Contrast',
    colors: {
      ...pairedDefaultColors('hcLight', 'hcDark'),
      ...EXTRA_SELECTOR_COLORS,
    },
  },
  '2026': {
    displayName: '2026',
    extends: 'Modern',
    colors: {
      background: {
        dark: '#191A1B',
      },
      selectionBackground: pairedColor('#0069CC26', '#3994BC33'),
      cursor: pairedColor('#202020', '#bfbfbf'),
      cursorText: pairedColor('#FFFFFF', '#191A1B'),
      border: {
        dark: '#2A2B2CFF',
      },
      tabActiveBorder: {
        dark: '#3994BC00',
      },
    },
  },
});
