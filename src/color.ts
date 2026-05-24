import { normal } from 'color-blend';

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(color: string, label = 'color'): RgbaColor {
  const rgba = Bun.color(color, '{rgba}');

  if (!rgba) {
    throw new Error(`Invalid ${label} value: ${color}`);
  }

  return rgba;
}

export function compositeColor(backgroundColor: string, color: string): RgbaColor {
  return normal(parseColor(backgroundColor, 'background color'), parseColor(color));
}

export function isTransparentColor(color: string): boolean {
  return parseColor(color).a === 0;
}

function toHexByte(value: number): string {
  const byte = Math.max(0, Math.min(255, Math.round(value)));

  return byte.toString(16).padStart(2, '0').toUpperCase();
}

export function toSixDigitHex({ r, g, b }: RgbaColor): string {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

export function toOpaqueHex(backgroundColor: string, color: string): string {
  return toSixDigitHex(compositeColor(backgroundColor, color));
}

export function toOpaqueBackgroundHex(color: string): string {
  const rgba = parseColor(color, 'background color');

  if (rgba.a !== 1) {
    throw new Error(`Background color must be opaque: ${color}`);
  }

  return toSixDigitHex(rgba);
}
