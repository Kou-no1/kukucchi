import { memo } from 'react'
import {
  buildAdvancedBossSprite,
  type AdvancedBossVariant,
} from '../../game-engine/collection/advancedPixelSprites'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

export const AdvancedBossSprite = memo(function AdvancedBossSprite({
  variant,
  locked = false,
  compact = false,
  className,
}: {
  variant: AdvancedBossVariant
  locked?: boolean
  compact?: boolean
  className?: string
}) {
  const sprite = buildAdvancedBossSprite(variant)
  const cellColor = (color: string) => (locked ? '#31415e' : color)
  return (
    <svg
      className={classNames('advanced-boss-sprite', compact && 'compact', className)}
      viewBox="0 0 112 104"
      role="img"
      aria-label={locked ? '未解放の高学年ボス' : `${sprite.label}ボス`}
      shapeRendering="crispEdges"
    >
      <rect x="7" y="7" width="98" height="90" rx="8" fill="#07172d" opacity={locked ? 0.22 : 0.3} />
      {sprite.rings.map((ring, index) => (
        <ellipse
          key={`${ring.color}-${index}`}
          cx={ring.cx}
          cy={ring.cy}
          rx={ring.rx}
          ry={ring.ry}
          fill="none"
          stroke={locked ? '#71809b' : ring.color}
          strokeWidth="5"
          opacity={locked ? 0.34 : 0.82}
          transform={`rotate(${ring.rotate} ${ring.cx} ${ring.cy})`}
        />
      ))}
      {sprite.cells.map((cell, index) => (
        <rect
          key={`${cell.x}-${cell.y}-${index}`}
          x={cell.x}
          y={cell.y}
          width="7"
          height="7"
          fill={cellColor(cell.color)}
          opacity={locked ? 0.48 : cell.opacity ?? 0.96}
        />
      ))}
      <text x="56" y="92" textAnchor="middle" className="pixel-sprite-label">
        {locked ? '?' : sprite.label}
      </text>
    </svg>
  )
})
