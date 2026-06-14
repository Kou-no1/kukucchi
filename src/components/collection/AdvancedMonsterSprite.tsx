import { memo } from 'react'
import type { AdvancedMonsterDefinition } from '../../data/advancedMonsters'
import { buildAdvancedMonsterSprite } from '../../game-engine/collection/advancedPixelSprites'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

export const AdvancedMonsterSprite = memo(function AdvancedMonsterSprite({
  monster,
  locked = false,
  className,
}: {
  monster: AdvancedMonsterDefinition
  locked?: boolean
  className?: string
}) {
  const sprite = buildAdvancedMonsterSprite(monster)
  const cellColor = (color: string) => (locked ? '#31415e' : color)
  return (
    <svg
      className={classNames('advanced-monster-sprite', className)}
      viewBox="0 0 96 96"
      role="img"
      aria-label={locked ? '未入手の高学年なかま' : monster.name}
      shapeRendering="crispEdges"
    >
      <rect x="7" y="7" width="82" height="82" rx="10" fill={locked ? '#0a1630' : '#07172d'} opacity="0.28" />
      {sprite.rings.map((ring, index) => (
        <ellipse
          key={`${ring.color}-${index}`}
          cx={ring.cx}
          cy={ring.cy}
          rx={ring.rx}
          ry={ring.ry}
          fill="none"
          stroke={locked ? '#71809b' : ring.color}
          strokeWidth="4"
          opacity={locked ? 0.34 : 0.78}
          transform={`rotate(${ring.rotate} ${ring.cx} ${ring.cy})`}
        />
      ))}
      {sprite.cells.map((cell, index) => (
        <rect
          key={`${cell.x}-${cell.y}-${index}`}
          x={cell.x}
          y={cell.y}
          width={monster.category === 'square' && (monster.squareRoot ?? 0) >= 7 ? 5 : 7}
          height={monster.category === 'square' && (monster.squareRoot ?? 0) >= 7 ? 5 : 7}
          fill={cellColor(cell.color)}
          opacity={locked ? 0.45 : cell.opacity ?? 0.95}
        />
      ))}
      {sprite.label ? (
        <text x="48" y="84" textAnchor="middle" className="pixel-sprite-label">
          {locked ? '?' : sprite.label}
        </text>
      ) : null}
    </svg>
  )
})
