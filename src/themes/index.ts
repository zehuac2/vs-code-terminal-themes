import { type Theme } from '@/theme';
import { pairedColor, pairedDefaults, withExtras } from './builders';

const visualStudioBase = {
  ...pairedDefaults('light', 'dark'),
  selectionBackground: pairedColor('#E5EBF1', '#3A3D41'),
};

// Plus is identical to Visual Studio.
const plusBase = visualStudioBase;

const modernBase = {
  ...plusBase,
  foreground: pairedColor('#3B3B3B', '#CCCCCC'),
  cursor: { ...plusBase.cursor, light: '#005FB8' },
  selectionBackground: { ...plusBase.selectionBackground, light: '#E5EBF1' },
  tabActiveBorder: pairedColor('#005FB8', '#0078D4'),
};

const highContrastBase = {
  ...pairedDefaults('hcLight', 'hcDark'),
};

const the2026Base = {
  ...modernBase,
  background: { ...modernBase.background, dark: '#191A1B' },
  selectionBackground: pairedColor('#0069CC26', '#3994BC33'),
  cursor: pairedColor('#202020', '#bfbfbf'),
  cursorText: pairedColor('#FFFFFF', '#191A1B'),
  border: { ...modernBase.border, dark: '#2A2B2CFF' },
  tabActiveBorder: { ...modernBase.tabActiveBorder, dark: '#3994BC00' },
};

/**
 * The built-in themes, already resolved. The `'2026'` key is integer-index-like,
 * so JS enumeration hoists it to the front regardless of literal order.
 */
export const themes = {
  'Visual Studio': { displayName: 'Visual Studio', colors: withExtras(visualStudioBase) },
  Plus: { displayName: 'Plus', colors: withExtras(plusBase) },
  Modern: { displayName: 'Modern', colors: withExtras(modernBase) },
  'High Contrast': { displayName: 'High Contrast', colors: withExtras(highContrastBase) },
  '2026': { displayName: '2026', colors: withExtras(the2026Base) },
} satisfies Record<string, Theme>;
