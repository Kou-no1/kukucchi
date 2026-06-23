import { memo } from 'react'
import type { AdditionMonsterDefinition } from '../../data/additionMonsters'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function motifCells(monster: AdditionMonsterDefinition): Array<{ x: number; y: number }> {
  if (monster.motif === 'arrow') {
    return [
      { x: 6, y: 2 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
    ]
  }
  if (monster.motif === 'double') {
    return [
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 7, y: 7 },
      { x: 8, y: 7 },
    ]
  }
  if (monster.motif === 'burst') {
    return [
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ]
  }
  if (monster.motif === 'large') {
    return [
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 7, y: 6 },
      { x: 8, y: 6 },
      { x: 9, y: 6 },
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ]
  }
  return [
    { x: 6, y: 3 },
    { x: 6, y: 4 },
    { x: 4, y: 5 },
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 6, y: 6 },
    { x: 6, y: 7 },
  ]
}

function buildBodyCells(monster: AdditionMonsterDefinition): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = []
  const centerX = 6
  const centerY = monster.motif === 'large' ? 6 : 7
  const radiusX = monster.motif === 'double' ? 4 : monster.variant === 3 ? 4 : 3
  const radiusY = monster.motif === 'large' ? 5 : monster.variant === 1 ? 3 : 4
  for (let y = 2; y <= 11; y += 1) {
    for (let x = 2; x <= 10; x += 1) {
      const normalized =
        ((x - centerX) * (x - centerX)) / (radiusX * radiusX) +
        ((y - centerY) * (y - centerY)) / (radiusY * radiusY)
      if (normalized <= 1) {
        cells.push({ x, y })
      }
    }
  }
  return cells
}

export const AdditionMonsterSprite = memo(function AdditionMonsterSprite({
  monster,
  locked = false,
  className,
}: {
  monster: AdditionMonsterDefinition
  locked?: boolean
  className?: string
}) {
  const colors = locked
    ? {
        base: '#31415e',
        outline: '#13213b',
        shadow: '#24324e',
        highlight: '#71809b',
        glow: '#31415e',
        accent: '#71809b',
      }
    : monster.colors
  const cellSize = 8
  const body = buildBodyCells(monster)
  const outline = body.flatMap((cell) => [
    { x: cell.x - 1, y: cell.y },
    { x: cell.x + 1, y: cell.y },
    { x: cell.x, y: cell.y - 1 },
    { x: cell.x, y: cell.y + 1 },
  ])
  const bodyKeys = new Set(body.map((cell) => `${cell.x}:${cell.y}`))
  const outlineCells = Array.from(
    new Map(
      outline
        .filter((cell) => !bodyKeys.has(`${cell.x}:${cell.y}`))
        .map((cell) => [`${cell.x}:${cell.y}`, cell]),
    ).values(),
  )
  const accents = motifCells(monster)
  const renderCell = (cell: { x: number; y: number }, fill: string, key: string, opacity = 1) => (
    <rect
      key={key}
      x={cell.x * cellSize}
      y={cell.y * cellSize}
      width={cellSize}
      height={cellSize}
      fill={fill}
      opacity={opacity}
    />
  )

  return (
    <svg
      className={classNames('monster-pixel-sprite addition-monster-sprite', className)}
      viewBox="0 0 104 104"
      role="img"
      aria-label={locked ? '未入手たしざんモンスター' : monster.name}
      shapeRendering="crispEdges"
    >
      <circle cx="52" cy="52" r="45" fill={colors.glow} opacity={locked ? 0.1 : 0.2} />
      {outlineCells.map((cell) => renderCell(cell, colors.outline, `outline-${cell.x}-${cell.y}`))}
      {body.map((cell) => renderCell(cell, colors.base, `body-${cell.x}-${cell.y}`))}
      {body
        .filter((cell) => cell.y >= 8)
        .map((cell) => renderCell(cell, colors.shadow, `shadow-${cell.x}-${cell.y}`, locked ? 0.36 : 0.44))}
      {body
        .filter((cell) => cell.y <= 5 && cell.x >= 4 && cell.x <= 8)
        .map((cell) => renderCell(cell, colors.highlight, `highlight-${cell.x}-${cell.y}`, locked ? 0.3 : 0.76))}
      {accents.map((cell) =>
        renderCell(cell, colors.accent, `accent-${cell.x}-${cell.y}`, locked ? 0.3 : 0.92),
      )}
      {!locked ? (
        <>
          {renderCell({ x: 4, y: 7 }, '#07172d', 'eye-left')}
          {renderCell({ x: 8, y: 7 }, '#07172d', 'eye-right')}
          {renderCell({ x: 5, y: 9 }, '#07172d', 'mouth-left')}
          {renderCell({ x: 6, y: 9 }, '#07172d', 'mouth-mid')}
          {renderCell({ x: 7, y: 9 }, '#07172d', 'mouth-right')}
        </>
      ) : null}
    </svg>
  )
})
