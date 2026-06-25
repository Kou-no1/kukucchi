import type { BossDefinition } from '../../data/bosses'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function bossColors(boss: BossDefinition, locked: boolean) {
  if (locked) {
    return {
      base: '#31415e',
      outline: '#13213b',
      shadow: '#24324e',
      highlight: '#71809b',
      accent: '#71809b',
      glow: '#31415e',
    }
  }
  if (boss.divisionAreaId === 'divide-with-remainder') {
    return {
      base: '#a979ff',
      outline: '#33175f',
      shadow: '#6d4bd1',
      highlight: '#eadcff',
      accent: '#9ff3ff',
      glow: '#ccb2ff',
    }
  }
  if (boss.divisionAreaId === 'divide-large') {
    return {
      base: '#7868e6',
      outline: '#21164d',
      shadow: '#4e43a8',
      highlight: '#d9d2ff',
      accent: '#ffd166',
      glow: '#b5aaff',
    }
  }
  return {
    base: '#8fb7ff',
    outline: '#1b2f70',
    shadow: '#586fd4',
    highlight: '#dce8ff',
    accent: '#f3f0ff',
    glow: '#bdd2ff',
  }
}

export function DivisionBossSprite({
  boss,
  locked = false,
  compact = false,
  className,
}: {
  boss: BossDefinition
  locked?: boolean
  compact?: boolean
  className?: string
}) {
  const colors = bossColors(boss, locked)
  const motif = locked ? '?' : boss.no - 24
  return (
    <svg
      className={classNames('addition-boss-sprite division-boss-sprite', compact && 'compact', className)}
      viewBox="0 0 128 128"
      role="img"
      aria-label={locked ? 'みかいほうのわりざんボス' : boss.label}
      shapeRendering="crispEdges"
    >
      <circle cx="64" cy="66" r="54" fill={colors.glow} opacity={locked ? 0.1 : 0.24} />
      <path d="M30 30 H98 L92 101 H36 Z" fill={colors.outline} />
      <path d="M39 37 H89 L84 94 H44 Z" fill={colors.base} />
      <path d="M44 72 H84 L81 94 H47 Z" fill={colors.shadow} opacity="0.52" />
      <path d="M47 40 H80 L76 54 H43 Z" fill={colors.highlight} opacity="0.78" />
      <rect x="42" y="62" width="44" height="8" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <circle cx="64" cy="53" r="6" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <circle cx="64" cy="79" r="6" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <path d="M64 38 V96" stroke={colors.outline} strokeWidth="5" opacity={locked ? 0.25 : 0.5} />
      <rect x="46" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="72" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="54" y="86" width="20" height="8" fill="#07172d" opacity={locked ? 0 : 1} />
      <text
        x="64"
        y="116"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill={colors.accent}
      >
        ÷{motif}
      </text>
    </svg>
  )
}
