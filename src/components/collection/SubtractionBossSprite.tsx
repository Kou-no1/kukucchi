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
  const area = boss.subtractionAreaId
  if (area === 'sub-borrow-basic') {
    return {
      base: '#ff7a59',
      outline: '#742514',
      shadow: '#cc4933',
      highlight: '#ffc7b6',
      accent: '#ffe66b',
      glow: '#ffb19b',
    }
  }
  if (area === 'sub-two-digit-borrow') {
    return {
      base: '#ff6682',
      outline: '#702033',
      shadow: '#cc3657',
      highlight: '#ffd3dc',
      accent: '#ffd166',
      glow: '#ffafc0',
    }
  }
  if (area === 'sub-three-digit') {
    return {
      base: '#f8a64f',
      outline: '#6e3218',
      shadow: '#bf6330',
      highlight: '#ffe1b6',
      accent: '#ff6b6b',
      glow: '#ffc078',
    }
  }
  if (area === 'sub-two-digit-no-borrow') {
    return {
      base: '#c782ff',
      outline: '#48205e',
      shadow: '#8b4ec7',
      highlight: '#efd8ff',
      accent: '#ffb26b',
      glow: '#d8adff',
    }
  }
  if (area === 'sub-within-10') {
    return {
      base: '#ffcf73',
      outline: '#6f4218',
      shadow: '#d9943b',
      highlight: '#fff2bf',
      accent: '#f06f59',
      glow: '#ffdf9d',
    }
  }
  return {
    base: '#ffb26b',
    outline: '#6b2d12',
    shadow: '#d66d3f',
    highlight: '#ffe0b7',
    accent: '#fff0a6',
    glow: '#ffd0a0',
  }
}

export function SubtractionBossSprite({
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
  const motif = locked ? '?' : boss.no - 18
  return (
    <svg
      className={classNames('addition-boss-sprite subtraction-boss-sprite', compact && 'compact', className)}
      viewBox="0 0 128 128"
      role="img"
      aria-label={locked ? 'みかいほうひきざんぼす' : boss.label}
      shapeRendering="crispEdges"
    >
      <circle cx="64" cy="66" r="54" fill={colors.glow} opacity={locked ? 0.1 : 0.24} />
      <path d="M30 28 H98 L90 104 H38 Z" fill={colors.outline} />
      <path d="M38 34 H90 L84 96 H44 Z" fill={colors.base} />
      <path d="M44 73 H84 L81 96 H47 Z" fill={colors.shadow} opacity="0.52" />
      <path d="M47 38 H80 L76 52 H43 Z" fill={colors.highlight} opacity="0.78" />
      <rect x="42" y="60" width="44" height="10" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <path
        d="M64 92 L52 76 H60 V48 H68 V76 H76 Z"
        fill={colors.accent}
        opacity={locked ? 0.32 : 0.88}
      />
      <rect x="46" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="72" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="52" y="84" width="24" height="8" fill="#07172d" opacity={locked ? 0 : 1} />
      <text
        x="64"
        y="116"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill={colors.accent}
      >
        -{motif}
      </text>
    </svg>
  )
}
