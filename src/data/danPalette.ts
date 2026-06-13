export const danPalette = {
  1: { name: 'あか', base: '#FF6B6B' },
  2: { name: 'むらさき', base: '#A78BFA' },
  3: { name: 'あお', base: '#4D96FF' },
  4: { name: 'みどり', base: '#34D399' },
  5: { name: 'きいろ', base: '#FACC15' },
  6: { name: 'だいだい', base: '#FB923C' },
  7: { name: 'もも', base: '#F472B6' },
  8: { name: 'みずいろ', base: '#22D3EE' },
  9: { name: 'きみどり', base: '#A3E635' },
} as const

export type DanNumber = keyof typeof danPalette

export type DanSpriteColors = {
  name: string
  base: string
  outline: string
  shadow: string
  highlight: string
  glow: string
}

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

function toHex(value: number): string {
  return clampColor(value).toString(16).padStart(2, '0')
}

export function mixHexColor(hex: string, target: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex)
  const [tr, tg, tb] = hexToRgb(target)
  const safeRatio = Math.max(0, Math.min(1, ratio))
  return `#${toHex(r + (tr - r) * safeRatio)}${toHex(g + (tg - g) * safeRatio)}${toHex(
    b + (tb - b) * safeRatio,
  )}`
}

export function normalizeDan(value: number): DanNumber {
  return Math.max(1, Math.min(9, Math.round(value))) as DanNumber
}

export function getDanSpriteColors(value: number): DanSpriteColors {
  const dan = normalizeDan(value)
  const entry = danPalette[dan]
  return {
    name: entry.name,
    base: entry.base,
    outline: mixHexColor(entry.base, '#06142e', 0.58),
    shadow: mixHexColor(entry.base, '#06142e', 0.34),
    highlight: mixHexColor(entry.base, '#ffffff', 0.48),
    glow: mixHexColor(entry.base, '#5be9f4', 0.24),
  }
}
