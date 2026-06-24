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
  const area = boss.additionAreaId
  if (area === 'add-carry-basic') {
    return {
      base: '#ff9f54',
      outline: '#773112',
      shadow: '#cf632c',
      highlight: '#ffd0a2',
      accent: '#fff06a',
      glow: '#ffd0a8',
    }
  }
  if (area === 'add-two-digit-carry') {
    return {
      base: '#ff6f9d',
      outline: '#741f43',
      shadow: '#cf3f70',
      highlight: '#ffd7e6',
      accent: '#ffe66b',
      glow: '#ffb8d3',
    }
  }
  if (area === 'add-three-digit') {
    return {
      base: '#ffd15e',
      outline: '#74501a',
      shadow: '#c78929',
      highlight: '#fff1b2',
      accent: '#ff8d5a',
      glow: '#ffe08a',
    }
  }
  if (area === 'add-two-digit-no-carry') {
    return {
      base: '#b89cff',
      outline: '#402772',
      shadow: '#7759c8',
      highlight: '#efe8ff',
      accent: '#7de0ff',
      glow: '#d8ccff',
    }
  }
  if (area === 'add-within-10') {
    return {
      base: '#79d9ff',
      outline: '#16466b',
      shadow: '#35a8d6',
      highlight: '#d8fbff',
      accent: '#f9d85d',
      glow: '#b8ecff',
    }
  }
  return {
    base: '#ffe987',
    outline: '#6c5411',
    shadow: '#d4b43d',
    highlight: '#fff7c7',
    accent: '#58c97a',
    glow: '#fef3a8',
  }
}

export function AdditionBossSprite({
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
  const motif = locked ? '?' : boss.no - 12
  return (
    <svg
      className={classNames('addition-boss-sprite', compact && 'compact', className)}
      viewBox="0 0 128 128"
      role="img"
      aria-label={locked ? 'みかいほうたしざんぼす' : boss.label}
      shapeRendering="crispEdges"
    >
      <circle cx="64" cy="66" r="54" fill={colors.glow} opacity={locked ? 0.1 : 0.22} />
      <rect x="28" y="22" width="72" height="82" rx="18" fill={colors.outline} />
      <rect x="34" y="28" width="60" height="70" rx="15" fill={colors.base} />
      <rect x="34" y="72" width="60" height="26" rx="12" fill={colors.shadow} opacity="0.5" />
      <rect x="45" y="35" width="38" height="14" rx="7" fill={colors.highlight} opacity="0.82" />
      <rect x="59" y="42" width="10" height="44" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <rect x="42" y="59" width="44" height="10" fill={colors.accent} opacity={locked ? 0.34 : 0.95} />
      <path
        d="M64 13 L74 28 L64 24 L54 28 Z"
        fill={colors.accent}
        opacity={locked ? 0.35 : 0.95}
      />
      <rect x="45" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="73" y="58" width="10" height="10" fill="#07172d" opacity={locked ? 0 : 1} />
      <rect x="52" y="84" width="24" height="8" fill="#07172d" opacity={locked ? 0 : 1} />
      <text
        x="64"
        y="116"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill={colors.accent}
      >
        +{motif}
      </text>
    </svg>
  )
}
