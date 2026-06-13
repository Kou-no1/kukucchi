import type { TreasureItem } from '../../data/treasureItems'

const rarityColors = {
  1: { fill: '#75e6f2', accent: '#dffcff' },
  2: { fill: '#8bdc84', accent: '#f2ffd8' },
  3: { fill: '#9a7cff', accent: '#ffe1ff' },
  4: { fill: '#ffd86a', accent: '#7cf5ff' },
} as const

export function TreasureIcon({
  item,
  locked = false,
  className,
}: {
  item?: TreasureItem
  locked?: boolean
  className?: string
}) {
  const rarity = item?.rarity ?? 1
  const colors = locked ? { fill: '#31415e', accent: '#71809b' } : rarityColors[rarity]
  const theme = item?.theme ?? 'star'
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      role="img"
      aria-label={locked ? '未入手' : item?.name}
    >
      <defs>
        <filter id={`treasure-glow-${item?.id ?? 'locked'}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="48" cy="48" r="34" fill={colors.fill} opacity={locked ? 0.35 : 0.9} />
      <path
        d="M48 17 56 37 78 39 61 53 66 75 48 63 30 75 35 53 18 39 40 37Z"
        fill={colors.accent}
        opacity={locked ? 0.55 : 0.95}
        filter={`url(#treasure-glow-${item?.id ?? 'locked'})`}
      />
      {theme === 'space' ? <circle cx="60" cy="35" r="7" fill="#142347" opacity="0.55" /> : null}
      {theme === 'sparkle' ? <path d="M21 25h12M27 19v12M68 66h10M73 61v10" stroke="#fff" strokeWidth="4" strokeLinecap="round" /> : null}
      {theme === 'creature' ? (
        <>
          <circle cx="37" cy="45" r="4" fill="#12203a" />
          <circle cx="58" cy="45" r="4" fill="#12203a" />
          <path d="M38 58c6 6 15 6 21 0" stroke="#12203a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : null}
      {theme === 'sweets' ? <path d="M25 52c12-8 34-8 46 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" /> : null}
      {Array.from({ length: Math.max(0, rarity - 1) }).map((_, index) => (
        <circle
          key={index}
          cx={24 + index * 24}
          cy="78"
          r="4"
          fill={colors.accent}
          opacity={locked ? 0.45 : 1}
        />
      ))}
    </svg>
  )
}
