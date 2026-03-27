import { defineThemes } from './theme';

export const themes = defineThemes({
  base: {
    displayName: 'Base',
    colors: {
      ansiBlack: {
        light: '#000000',
        dark: '#000000',
        hcDark: '#000000',
        hcLight: '#292929',
      },
      ansiRed: {
        light: '#cd3131',
        dark: '#cd3131',
        hcDark: '#cd0000',
        hcLight: '#cd3131',
      },
      ansiGreen: {
        light: '#107C10',
        dark: '#0DBC79',
        hcDark: '#00cd00',
        hcLight: '#136C13',
      },
      ansiYellow: {
        light: '#949800',
        dark: '#e5e510',
        hcDark: '#cdcd00',
        hcLight: '#949800',
      },
      ansiBlue: {
        light: '#0451a5',
        dark: '#2472c8',
        hcDark: '#0000ee',
        hcLight: '#0451a5',
      },
      ansiMagenta: {
        light: '#bc05bc',
        dark: '#bc3fbc',
        hcDark: '#cd00cd',
        hcLight: '#bc05bc',
      },
      ansiCyan: {
        light: '#0598bc',
        dark: '#11a8cd',
        hcDark: '#00cdcd',
        hcLight: '#0598bc',
      },
      ansiWhite: {
        light: '#555555',
        dark: '#e5e5e5',
        hcDark: '#e5e5e5',
        hcLight: '#555555',
      },
      ansiBrightBlack: {
        light: '#666666',
        dark: '#666666',
        hcDark: '#7f7f7f',
        hcLight: '#666666',
      },
      ansiBrightRed: {
        light: '#cd3131',
        dark: '#f14c4c',
        hcDark: '#ff0000',
        hcLight: '#cd3131',
      },
      ansiBrightGreen: {
        light: '#14CE14',
        dark: '#23d18b',
        hcDark: '#00ff00',
        hcLight: '#00bc00',
      },
      ansiBrightYellow: {
        light: '#b5ba00',
        dark: '#f5f543',
        hcDark: '#ffff00',
        hcLight: '#b5ba00',
      },
      ansiBrightBlue: {
        light: '#0451a5',
        dark: '#3b8eea',
        hcDark: '#5c5cff',
        hcLight: '#0451a5',
      },
      ansiBrightMagenta: {
        light: '#bc05bc',
        dark: '#d670d6',
        hcDark: '#ff00ff',
        hcLight: '#bc05bc',
      },
      ansiBrightCyan: {
        light: '#0598bc',
        dark: '#29b8db',
        hcDark: '#00ffff',
        hcLight: '#0598bc',
      },
      ansiBrightWhite: {
        light: '#a5a5a5',
        dark: '#e5e5e5',
        hcDark: '#ffffff',
        hcLight: '#a5a5a5',
      },
      background: {
        light: '#ffffff',
        dark: '#1f1f1f',
        hcDark: '#000000',
        hcLight: '#ffffff',
      },
      foreground: {
        light: '#333333',
        dark: '#cccccc',
        hcDark: '#ffffff',
        hcLight: '#292929',
      },
      selectionBackground: {
        light: '#add6ff',
        dark: '#264f78',
        hcDark: '#f38518',
        hcLight: '#0f4a85',
      },
      selectionForeground: {
        light: '#000000',
        dark: '#ffffff',
        hcDark: '#000000',
        hcLight: '#ffffff',
      },
      cursor: {
        light: '#000000',
        dark: '#aeafad',
        hcDark: '#ffffff',
        hcLight: '#0f4a85',
      },
      cursorText: {
        light: '#ffffff',
        dark: '#1f1f1f',
        hcDark: '#000000',
        hcLight: '#ffffff',
      },
    },
  },
  vsCode: {
    displayName: 'VS Code',
    extends: 'base',
    colors: {
      background: {
        dark: '#191A1B',
        hcDark: '#191A1B',
      },
      selectionBackground: {
        light: '#0069CC26',
        dark: '#3994BC33',
        hcDark: '#3994BC33',
      },
      cursor: {
        dark: '#bfbfbf',
        hcDark: '#bfbfbf',
      },
      cursorText: {
        dark: '#191A1B',
        hcDark: '#191A1B',
      },
      border: {
        light: '#2A2B2CFF',
        dark: '#2A2B2CFF',
        hcDark: '#2A2B2CFF',
        hcLight: '#2A2B2CFF',
      },
      tabActiveBorder: {
        light: '#3994BC00',
        dark: '#3994BC00',
        hcDark: '#3994BC00',
        hcLight: '#3994BC00',
      },
    },
  },
});
