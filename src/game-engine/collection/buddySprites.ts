import { getBuddyById, type BuddyTheme } from '../../data/buddies'

export type BuddyPixelCell = {
  x: number
  y: number
}

export type BuddySpriteDefinition = {
  id: string
  theme: BuddyTheme
  body: BuddyPixelCell[]
  outline: BuddyPixelCell[]
  highlights: BuddyPixelCell[]
  eyes: BuddyPixelCell[]
  accents: BuddyPixelCell[]
  colors: {
    base: string
    shade: string
    highlight: string
    outline: string
    accent: string
    glow: string
  }
  signature: string
}

const themeMasks: Record<BuddyTheme, readonly string[]> = {
  'space-creature': [
    '000111000',
    '001111100',
    '011111110',
    '111111111',
    '111111111',
    '011111110',
    '001111100',
    '010101010',
    '100010001',
  ],
  celestial: [
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
  robot: [
    '010000010',
    '001000100',
    '011111110',
    '111111111',
    '101111101',
    '111111111',
    '011111110',
    '001111100',
    '011000110',
  ],
}

const themeColors: Record<
  BuddyTheme,
  Array<{
    base: string
    shade: string
    highlight: string
    outline: string
    accent: string
    glow: string
  }>
> = {
  'space-creature': [
    {
      base: '#7cf5ff',
      shade: '#35a8d8',
      highlight: '#dffcff',
      outline: '#12375e',
      accent: '#ff72b6',
      glow: '#5be9f4',
    },
    {
      base: '#b9f7c8',
      shade: '#5ed8a4',
      highlight: '#f4fff7',
      outline: '#164d40',
      accent: '#ffe36e',
      glow: '#76f0a8',
    },
  ],
  celestial: [
    {
      base: '#ffe36e',
      shade: '#f0a832',
      highlight: '#fff8c7',
      outline: '#5f3a07',
      accent: '#7d8dff',
      glow: '#ffd94a',
    },
    {
      base: '#ff9be0',
      shade: '#b657c5',
      highlight: '#fff0fb',
      outline: '#4c2360',
      accent: '#5be9f4',
      glow: '#ff72b6',
    },
  ],
  robot: [
    {
      base: '#c9e5ff',
      shade: '#6c8fbf',
      highlight: '#ffffff',
      outline: '#263a5f',
      accent: '#5be9f4',
      glow: '#8fd3ff',
    },
    {
      base: '#b7b6ff',
      shade: '#676bd9',
      highlight: '#f1f2ff',
      outline: '#292c66',
      accent: '#ffd94a',
      glow: '#7d8dff',
    },
  ],
}

function cellKey(cell: BuddyPixelCell): string {
  return `${cell.x},${cell.y}`
}

function uniqueCells(cells: BuddyPixelCell[]): BuddyPixelCell[] {
  return Array.from(new Map(cells.map((cell) => [cellKey(cell), cell])).values()).sort(
    (left, right) => left.y - right.y || left.x - right.x,
  )
}

function maskCells(rows: readonly string[]): BuddyPixelCell[] {
  const cells: BuddyPixelCell[] = []
  rows.forEach((row, y) => {
    row.split('').forEach((value, x) => {
      if (value === '1') {
        cells.push({ x: x + 2, y: y + 2 })
      }
    })
  })
  return cells
}

function makeOutline(body: BuddyPixelCell[]): BuddyPixelCell[] {
  const bodyKeys = new Set(body.map(cellKey))
  const outline: BuddyPixelCell[] = []
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

function seedForId(id: string): number {
  return Array.from(id).reduce((seed, char) => seed + char.charCodeAt(0) * 17, 11)
}

function selectCells(body: BuddyPixelCell[], seed: number, modulo: number, count: number) {
  return body
    .filter((cell) => (cell.x * 19 + cell.y * 23 + seed) % modulo === 0)
    .slice(0, count)
}

export function buildBuddySprite(buddyId: string): BuddySpriteDefinition {
  const buddy = getBuddyById(buddyId)
  if (!buddy) {
    throw new Error(`Unknown buddy: ${buddyId}`)
  }
  const seed = seedForId(buddy.id)
  const body = maskCells(themeMasks[buddy.theme])
  const colors = themeColors[buddy.theme][seed % themeColors[buddy.theme].length]
  const eyeY = buddy.theme === 'robot' ? 5 : 6
  const eyes =
    seed % 3 === 0
      ? [
          { x: 4, y: eyeY },
          { x: 8, y: eyeY },
        ]
      : [
          { x: 5, y: eyeY },
          { x: 7, y: eyeY },
        ]
  const accents = selectCells(body, seed, 11, 5)
  const highlights = selectCells(body, seed + 5, 13, 4)

  return {
    id: buddy.id,
    theme: buddy.theme,
    body,
    outline: makeOutline(body),
    highlights,
    eyes,
    accents,
    colors,
    signature: [
      `b:${buddy.id}`,
      `theme:${buddy.theme}`,
      `eyes:${eyes.map(cellKey).join('|')}`,
      `accents:${accents.map(cellKey).join('|')}`,
      `highlights:${highlights.map(cellKey).join('|')}`,
    ].join(';'),
  }
}
