import { type Theme } from './theme';
import { exportForIterm2 } from './iterm2';

const base: Theme = {
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
};

await Bun.write(Bun.file('Base.itermcolors'), exportForIterm2(base));
