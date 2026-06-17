import { memo } from 'react'
import { buildBuddySprite } from '../../game-engine/collection/buddySprites'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

export const BuddySprite = memo(function BuddySprite({
  buddyId,
  locked = false,
  className,
}: {
  buddyId: string
  locked?: boolean
  className?: string
}) {
  const sprite = buildBuddySprite(buddyId)
  const colors = locked
    ? {
        base: '#31415e',
        shade: '#24324e',
        highlight: '#71809b',
        outline: '#13213b',
        accent: '#71809b',
        glow: '#31415e',
      }
    : sprite.colors
  const cellSize = 8
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
      className={classNames('buddy-pixel-sprite', className)}
      viewBox="0 0 104 104"
      role="img"
      aria-label={locked ? '未入手なかま' : 'なかま'}
      shapeRendering="crispEdges"
    >
      <circle cx="52" cy="52" r="45" fill={colors.glow} opacity={locked ? 0.1 : 0.18} />
      {sprite.outline.map((cell) => renderCell(cell, colors.outline, `outline-${cell.x}-${cell.y}`))}
      {sprite.body.map((cell) => renderCell(cell, colors.base, `body-${cell.x}-${cell.y}`))}
      {sprite.body
        .filter((cell) => cell.y >= 8)
        .map((cell) => renderCell(cell, colors.shade, `shade-${cell.x}-${cell.y}`, locked ? 0.35 : 0.38))}
      {sprite.highlights.map((cell) =>
        renderCell(cell, colors.highlight, `highlight-${cell.x}-${cell.y}`, locked ? 0.36 : 0.86),
      )}
      {sprite.accents.map((cell) =>
        renderCell(cell, colors.accent, `accent-${cell.x}-${cell.y}`, locked ? 0.34 : 0.86),
      )}
      {!locked
        ? sprite.eyes.map((cell) => renderCell(cell, '#07172d', `eye-${cell.x}-${cell.y}`))
        : null}
    </svg>
  )
})
