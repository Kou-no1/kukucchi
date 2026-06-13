import { getDanSpriteColors, normalizeDan } from '../../data/danPalette'
import type { DanSpriteColors } from '../../data/danPalette'
import type { BossDifficultyId } from '../../types/save'

export type PixelCell = {
  x: number
  y: number
}

export type MonsterSpriteDefinition = {
  left: number
  right: number
  dan: number
  shapeId: string
  colors: DanSpriteColors
  outline: PixelCell[]
  body: PixelCell[]
  highlights: PixelCell[]
  accents: PixelCell[]
  eyes: PixelCell[]
  mouth: PixelCell[]
  signature: string
}

export type TrophySpriteKind = 'medal' | 'trophy'

export type TrophySpriteDefinition = {
  kind: TrophySpriteKind
  danLabel: string
  accentDan: number
  difficulty: BossDifficultyId
  colors: {
    metal: string
    shade: string
    highlight: string
    outline: string
    accent: string
    accentDark: string
  }
  signature: string
}

const monsterShapeMasks = [
  {
    id: 'invader',
    rows: [
      '001101100',
      '011111110',
      '111111111',
      '101111101',
      '111111111',
      '011101110',
      '010101010',
      '110000011',
      '100000001',
    ],
  },
  {
    id: 'round-blob',
    rows: [
      '000111000',
      '011111110',
      '111111111',
      '111111111',
      '111111111',
      '111111111',
      '011111110',
      '001111100',
      '010000010',
    ],
  },
  {
    id: 'antenna-bot',
    rows: [
      '010000010',
      '001000100',
      '011111110',
      '111111111',
      '111111111',
      '101111101',
      '001111100',
      '011000110',
      '110000011',
    ],
  },
  {
    id: 'star-scout',
    rows: [
      '000010000',
      '000111000',
      '101111101',
      '011111110',
      '111111111',
      '011111110',
      '101111101',
      '001000100',
      '010000010',
    ],
  },
  {
    id: 'ghost',
    rows: [
      '001111100',
      '011111110',
      '111111111',
      '111111111',
      '111111111',
      '111111111',
      '111111111',
      '110101011',
      '100000001',
    ],
  },
  {
    id: 'spike',
    rows: [
      '100010001',
      '010111010',
      '111111111',
      '011111110',
      '111111111',
      '111111111',
      '011111110',
      '101010101',
      '100000001',
    ],
  },
  {
    id: 'saucer',
    rows: [
      '000111000',
      '001111100',
      '011111110',
      '111111111',
      '111111111',
      '011111110',
      '001010100',
      '010000010',
      '100000001',
    ],
  },
  {
    id: 'comet',
    rows: [
      '000011000',
      '000111100',
      '001111110',
      '011111111',
      '111111110',
      '011111100',
      '001111000',
      '010010000',
      '100001000',
    ],
  },
  {
    id: 'crystal',
    rows: [
      '000010000',
      '000111000',
      '001111100',
      '011111110',
      '111111111',
      '011111110',
      '001111100',
      '000111000',
      '001000100',
    ],
  },
] as const

const trophyMetals: Record<BossDifficultyId, { metal: string; shade: string; highlight: string; outline: string }> = {
  normal: { metal: '#c78343', shade: '#7a4524', highlight: '#f4c179', outline: '#402715' },
  hard: { metal: '#d7e1f2', shade: '#74849d', highlight: '#ffffff', outline: '#354052' },
  fast: { metal: '#ffd86a', shade: '#a36a13', highlight: '#fff6ba', outline: '#563407' },
  gekimuzu: { metal: '#f9dc5c', shade: '#7d3bd1', highlight: '#8cf8ff', outline: '#33115f' },
}

function clampFactor(value: number): number {
  return Math.max(1, Math.min(9, Math.round(value)))
}

function maskCells(rows: readonly string[]): PixelCell[] {
  const cells: PixelCell[] = []
  rows.forEach((row, y) => {
    row.split('').forEach((value, x) => {
      if (value === '1') {
        cells.push({ x: x + 2, y: y + 2 })
      }
    })
  })
  return cells
}

function cellKey(cell: PixelCell): string {
  return `${cell.x},${cell.y}`
}

function uniqueCells(cells: PixelCell[]): PixelCell[] {
  const byKey = new Map<string, PixelCell>()
  for (const cell of cells) {
    byKey.set(cellKey(cell), cell)
  }
  return Array.from(byKey.values()).sort((a, b) => a.y - b.y || a.x - b.x)
}

function makeOutline(body: PixelCell[]): PixelCell[] {
  const bodyKeys = new Set(body.map(cellKey))
  const outline: PixelCell[] = []
  for (const cell of body) {
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const next = { x: cell.x + dx, y: cell.y + dy }
      if (next.x < 0 || next.x > 12 || next.y < 0 || next.y > 12) {
        continue
      }
      if (!bodyKeys.has(cellKey(next))) {
        outline.push(next)
      }
    }
  }
  return uniqueCells(outline)
}

function seededValue(left: number, right: number): number {
  return left * 97 + right * 53 + left * right * 11
}

function selectBodyCells(body: PixelCell[], seed: number, count: number, offset: number): PixelCell[] {
  return body
    .filter((cell) => cell.y <= 8 && (cell.x * 17 + cell.y * 31 + seed + offset) % 13 === 0)
    .slice(0, count)
}

export function buildMonsterSprite(left: number, right: number): MonsterSpriteDefinition {
  const dan = normalizeDan(left)
  const factor = clampFactor(right)
  const seed = seededValue(dan, factor)
  const shape = monsterShapeMasks[(factor - 1) % monsterShapeMasks.length]
  const body = maskCells(shape.rows)
  const eyeMode = seed % 3
  const eyes =
    eyeMode === 0
      ? [
          { x: 4, y: 5 },
          { x: 8, y: 5 },
        ]
      : eyeMode === 1
        ? [{ x: 6, y: 5 }]
        : [
            { x: 4, y: 5 },
            { x: 6, y: 4 },
            { x: 8, y: 5 },
          ]
  const mouthMode = Math.floor(seed / 3) % 3
  const mouth =
    mouthMode === 0
      ? [
          { x: 5, y: 8 },
          { x: 6, y: 8 },
          { x: 7, y: 8 },
        ]
      : mouthMode === 1
        ? [
            { x: 5, y: 8 },
            { x: 7, y: 8 },
          ]
        : [
            { x: 5, y: 8 },
            { x: 6, y: 9 },
            { x: 7, y: 8 },
          ]
  const highlights = selectBodyCells(body, seed, 5, 3)
  const accents = selectBodyCells(body, seed, 4, 19)

  return {
    left: dan,
    right: factor,
    dan,
    shapeId: shape.id,
    colors: getDanSpriteColors(dan),
    outline: makeOutline(body),
    body,
    highlights,
    accents,
    eyes,
    mouth,
    signature: [
      `m:${dan}x${factor}`,
      shape.id,
      `eye:${eyeMode}`,
      `mouth:${mouthMode}`,
      `hi:${highlights.map(cellKey).join('|')}`,
      `ac:${accents.map(cellKey).join('|')}`,
    ].join(';'),
  }
}

export function getTrophyKindForDifficulty(difficulty: BossDifficultyId): TrophySpriteKind {
  return difficulty === 'fast' || difficulty === 'gekimuzu' ? 'trophy' : 'medal'
}

export function buildTrophySprite({
  danLabel,
  accentDan,
  difficulty,
  kind = getTrophyKindForDifficulty(difficulty),
}: {
  danLabel: string
  accentDan: number
  difficulty: BossDifficultyId
  kind?: TrophySpriteKind
}): TrophySpriteDefinition {
  const accent = getDanSpriteColors(accentDan)
  const metal = trophyMetals[difficulty]
  return {
    kind,
    danLabel,
    accentDan: normalizeDan(accentDan),
    difficulty,
    colors: {
      ...metal,
      accent: accent.base,
      accentDark: accent.outline,
    },
    signature: [`t:${kind}`, `dan:${danLabel}`, `accent:${normalizeDan(accentDan)}`, `difficulty:${difficulty}`].join(';'),
  }
}
