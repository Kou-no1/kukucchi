import type { PlayerIcon } from '../../data/playerIcons'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function renderPlayerMotif(icon: PlayerIcon) {
  const { base, accent, glow } = icon.colors
  if (icon.motif === 'egg') {
    return (
      <>
        <path
          d="M52 16 C72 18 84 38 80 61 C77 82 65 91 52 91 C39 91 27 82 24 61 C20 38 32 18 52 16 Z"
          fill={base}
          stroke={accent}
          strokeWidth="5"
        />
        <path d="M36 63 C45 69 59 69 68 62" fill="none" stroke={glow} strokeWidth="6" strokeLinecap="round" />
        <circle cx="42" cy="44" r="5" fill={accent} opacity="0.7" />
      </>
    )
  }
  if (icon.motif === 'flower') {
    return (
      <>
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            cx="52"
            cy="34"
            rx="13"
            ry="19"
            fill={base}
            stroke={accent}
            strokeWidth="3"
            transform={`rotate(${angle} 52 52)`}
            key={angle}
          />
        ))}
        <circle cx="52" cy="52" r="15" fill={accent} />
        <circle cx="52" cy="52" r="7" fill={glow} />
      </>
    )
  }
  if (icon.motif === 'sky') {
    return (
      <>
        <path d="M25 66 C27 50 40 47 48 55 C53 38 76 40 79 58 C90 59 92 76 80 80 H33 C22 80 17 69 25 66 Z" fill={accent} />
        <path d="M27 67 C29 54 41 52 49 60 C55 45 73 46 76 62 C85 62 86 75 77 77 H34 C25 77 21 69 27 67 Z" fill={base} />
        <circle cx="34" cy="36" r="8" fill={glow} />
        <path d="M31 25 V18 M31 54 V47 M20 36 H13 M49 36 H42" stroke={glow} strokeWidth="4" strokeLinecap="round" />
      </>
    )
  }
  return (
    <path
      d="M52 16 L60 40 L86 40 L65 55 L73 80 L52 65 L31 80 L39 55 L18 40 L44 40 Z"
      fill={base}
      stroke={accent}
      strokeWidth="5"
      strokeLinejoin="round"
    />
  )
}

export function PlayerIconBadge({
  icon,
  className,
}: {
  icon: PlayerIcon
  className?: string
}) {
  return (
    <svg
      className={classNames('player-icon-badge-svg', className)}
      viewBox="0 0 104 104"
      role="img"
      aria-label={`${icon.label}アイコン`}
    >
      <circle cx="52" cy="52" r="47" fill={icon.colors.glow} opacity="0.22" />
      <circle
        cx="52"
        cy="52"
        r="44"
        fill="rgba(6, 21, 40, 0.86)"
        stroke={icon.colors.base}
        strokeWidth="4"
      />
      {renderPlayerMotif(icon)}
    </svg>
  )
}
