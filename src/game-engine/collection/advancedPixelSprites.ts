import { danPalette, getDanSpriteColors } from '../../data/danPalette'
import type { AdvancedMonsterCategory, AdvancedMonsterDefinition } from '../../data/advancedMonsters'

export type AdvancedBossVariant = AdvancedMonsterCategory

export const advancedBossDisplayNames: Record<AdvancedBossVariant, string> = {
  square: 'クリスタルゴーレム',
  pi: 'リングプラネット',
  mixed: 'にじいろキング',
}

const advancedBossShortLabels: Record<AdvancedBossVariant, string> = {
  square: 'クリ',
  pi: 'リング',
  mixed: 'にじ',
}

export type AdvancedPixelCell = {
  x: number
  y: number
  color: string
  opacity?: number
}

export type AdvancedMonsterSpriteDefinition = {
  id: string
  category: AdvancedMonsterCategory
  cells: AdvancedPixelCell[]
  rings: Array<{ cx: number; cy: number; rx: number; ry: number; rotate: number; color: string }>
  label: string
  signature: string
}

export type AdvancedBossSpriteDefinition = {
  variant: AdvancedBossVariant
  cells: AdvancedPixelCell[]
  rings: Array<{ cx: number; cy: number; rx: number; ry: number; rotate: number; color: string }>
  name: string
  label: string
  signature: string
}

const piPalette = ['#7c8cff', '#8de8ff', '#ba8dff', '#5be9f4', '#dffcff'] as const

const mixedMask = [
  '001111100',
  '011111110',
  '111111111',
  '111111111',
  '111111111',
  '011111110',
  '101111101',
  '001010100',
  '010000010',
] as const

const bossMasks: Record<AdvancedBossVariant, readonly string[]> = {
  square: [
    '00011110000',
    '00111111000',
    '01111111100',
    '11110111110',
    '11111111110',
    '01111111100',
    '00111111000',
    '00011110000',
    '00101010000',
    '01100011000',
  ],
  pi: [
    '00011111000',
    '00111111100',
    '01111111110',
    '11111111111',
    '11111111111',
    '01111111110',
    '00111111100',
    '00011111000',
    '00100010000',
    '01000001000',
  ],
  mixed: [
    '10101010101',
    '01111111110',
    '11111111111',
    '11111111111',
    '01111111110',
    '11111111111',
    '10111111101',
    '00111111000',
    '01010101000',
    '10000000100',
  ],
}

function rectCell(x: number, y: number, color: string, opacity?: number): AdvancedPixelCell {
  return { x, y, color, opacity }
}

function danColor(index: number): string {
  const key = ((index % 9) + 1) as keyof typeof danPalette
  return danPalette[key].base
}

function squareCells(monster: AdvancedMonsterDefinition): AdvancedPixelCell[] {
  const root = monster.squareRoot ?? 2
  const colors = getDanSpriteColors(root)
  const size = root >= 7 ? 5 : root >= 5 ? 6 : 8
  const gap = 1
  const total = root * size + (root - 1) * gap
  const start = Math.round((96 - total) / 2)
  const cells: AdvancedPixelCell[] = []
  for (let row = 0; row < root; row += 1) {
    for (let column = 0; column < root; column += 1) {
      const tone = (row + column + monster.seed) % 4
      const color = tone === 0 ? colors.highlight : tone === 1 ? colors.base : colors.shadow
      cells.push(rectCell(start + column * (size + gap), start + row * (size + gap), color))
    }
  }
  cells.push(rectCell(start - 3, start - 3, colors.outline, 0.85))
  cells.push(rectCell(start + total, start + total, colors.outline, 0.85))
  cells.push(rectCell(41, 45, '#07172d'))
  cells.push(rectCell(53, 45, '#07172d'))
  cells.push(rectCell(43, 60, '#07172d', 0.9))
  cells.push(rectCell(50, 60, '#07172d', 0.9))
  return cells
}

function piCells(monster: AdvancedMonsterDefinition): AdvancedPixelCell[] {
  const seed = monster.seed
  const cells: AdvancedPixelCell[] = []
  for (let y = 0; y < 11; y += 1) {
    for (let x = 0; x < 11; x += 1) {
      const dx = x - 5
      const dy = y - 5
      if (dx * dx + dy * dy <= 24) {
        cells.push(rectCell(18 + x * 6, 16 + y * 6, piPalette[(x + y + seed) % piPalette.length]))
      }
    }
  }
  cells.push(rectCell(42, 44, '#07172d'))
  cells.push(rectCell(54, 44, '#07172d'))
  cells.push(rectCell(45, 59, '#07172d', 0.9))
  cells.push(rectCell(51, 59, '#07172d', 0.9))
  return cells
}

function mixedCells(monster: AdvancedMonsterDefinition): AdvancedPixelCell[] {
  const cells: AdvancedPixelCell[] = []
  mixedMask.forEach((row, y) => {
    row.split('').forEach((value, x) => {
      if (value === '1') {
        cells.push(rectCell(16 + x * 7, 18 + y * 7, danColor(x + y + monster.seed)))
      }
    })
  })
  cells.push(rectCell(39, 47, '#07172d'))
  cells.push(rectCell(55, 47, '#07172d'))
  cells.push(rectCell(43, 63, '#07172d', 0.9))
  cells.push(rectCell(50, 63, '#07172d', 0.9))
  return cells
}

export function buildAdvancedMonsterSprite(
  monster: AdvancedMonsterDefinition,
): AdvancedMonsterSpriteDefinition {
  if (monster.category === 'square') {
    return {
      id: monster.id,
      category: monster.category,
      cells: squareCells(monster),
      rings: [],
      label: monster.squareRoot && monster.squareRoot >= 7 ? String(monster.squareRoot ** 2) : '',
      signature: `advanced:${monster.id}:square:${monster.squareRoot}`,
    }
  }
  if (monster.category === 'pi') {
    const ringCount = monster.seed % 2 === 0 ? 2 : 1
    return {
      id: monster.id,
      category: monster.category,
      cells: piCells(monster),
      rings: Array.from({ length: ringCount }, (_, index) => ({
        cx: 48,
        cy: 49 + index * 2,
        rx: 38 + index * 7,
        ry: 12 + index * 2,
        rotate: index === 0 ? -18 : 18,
        color: piPalette[(monster.seed + index) % piPalette.length],
      })),
      label: 'π',
      signature: `advanced:${monster.id}:pi:${ringCount}:${monster.seed}`,
    }
  }
  return {
    id: monster.id,
    category: monster.category,
    cells: mixedCells(monster),
    rings: [],
    label: '',
    signature: `advanced:${monster.id}:mixed:${monster.seed}`,
  }
}

function bossCells(variant: AdvancedBossVariant): AdvancedPixelCell[] {
  const mask = bossMasks[variant]
  const cells: AdvancedPixelCell[] = []
  mask.forEach((row, y) => {
    row.split('').forEach((value, x) => {
      if (value !== '1') {
        return
      }
      if (variant === 'square') {
        const colors = getDanSpriteColors(8)
        cells.push(rectCell(15 + x * 7, 10 + y * 7, (x + y) % 3 === 0 ? colors.highlight : colors.base))
        return
      }
      if (variant === 'pi') {
        cells.push(rectCell(15 + x * 7, 10 + y * 7, piPalette[(x * 2 + y) % piPalette.length]))
        return
      }
      cells.push(rectCell(15 + x * 7, 10 + y * 7, danColor(x + y * 2)))
    })
  })
  cells.push(rectCell(43, 43, '#07172d'))
  cells.push(rectCell(57, 43, '#07172d'))
  cells.push(rectCell(45, 60, '#07172d', 0.9))
  cells.push(rectCell(52, 60, '#07172d', 0.9))
  return cells
}

export function buildAdvancedBossSprite(variant: AdvancedBossVariant): AdvancedBossSpriteDefinition {
  const rings =
    variant === 'pi'
      ? [
          { cx: 54, cy: 48, rx: 46, ry: 13, rotate: -16, color: '#ba8dff' },
          { cx: 54, cy: 52, rx: 58, ry: 15, rotate: 15, color: '#5be9f4' },
        ]
      : []
  return {
    variant,
    cells: bossCells(variant),
    rings,
    name: advancedBossDisplayNames[variant],
    label: advancedBossShortLabels[variant],
    signature: `advanced-boss:${variant}:${rings.length}:${bossCells(variant)
      .map((cell) => `${cell.x},${cell.y},${cell.color}`)
      .join('|')}`,
  }
}

export function advancedBossVariantForBossId(bossId: string): AdvancedBossVariant | null {
  if (bossId === 'boss-square') {
    return 'square'
  }
  if (bossId === 'boss-pi') {
    return 'pi'
  }
  if (bossId === 'boss-development') {
    return 'mixed'
  }
  return null
}
