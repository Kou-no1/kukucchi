import { getLevelIconById, type LevelIconDefinition } from '../../data/levelIcons'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function renderMotif(icon: LevelIconDefinition, locked: boolean) {
  const base = locked ? '#52617a' : icon.colors.base
  const accent = locked ? '#71809b' : icon.colors.accent
  const glow = locked ? '#31415e' : icon.colors.glow
  if (icon.motif === 'star') {
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
  if (icon.motif === 'moon') {
    return (
      <>
        <circle cx="55" cy="50" r="30" fill={base} />
        <circle cx="68" cy="42" r="29" fill="#102042" />
        <circle cx="43" cy="35" r="4" fill={accent} opacity="0.8" />
      </>
    )
  }
  if (icon.motif === 'rocket') {
    return (
      <>
        <path d="M52 16 C70 31 73 56 60 77 H44 C31 56 34 31 52 16 Z" fill={base} />
        <circle cx="52" cy="42" r="10" fill={accent} />
        <path d="M44 76 L36 90 L52 83 L68 90 L60 76 Z" fill="#ff72b6" />
      </>
    )
  }
  if (icon.motif === 'ufo') {
    return (
      <>
        <ellipse cx="52" cy="55" rx="34" ry="14" fill={base} />
        <path d="M34 53 C37 32 67 32 70 53 Z" fill={accent} opacity="0.9" />
        <circle cx="42" cy="59" r="4" fill="#fff7bf" />
        <circle cx="52" cy="61" r="4" fill="#ff72b6" />
        <circle cx="62" cy="59" r="4" fill="#76f0a8" />
      </>
    )
  }
  if (icon.motif === 'galaxy') {
    return (
      <>
        <ellipse cx="52" cy="52" rx="35" ry="13" fill={accent} transform="rotate(-20 52 52)" />
        <ellipse cx="52" cy="52" rx="23" ry="9" fill={base} transform="rotate(-20 52 52)" />
        <circle cx="52" cy="52" r="9" fill="#fff7bf" />
      </>
    )
  }
  if (icon.motif === 'comet') {
    return (
      <>
        <path d="M18 70 C38 42 63 28 88 19 C70 40 55 58 38 83 Z" fill={glow} opacity="0.75" />
        <circle cx="38" cy="66" r="17" fill={base} />
        <circle cx="32" cy="59" r="5" fill={accent} opacity="0.75" />
      </>
    )
  }
  if (icon.motif === 'planet') {
    return (
      <>
        <ellipse cx="52" cy="54" rx="40" ry="11" fill={accent} transform="rotate(-14 52 54)" />
        <circle cx="52" cy="52" r="27" fill={base} />
        <path d="M27 53 C43 63 61 64 79 50" fill="none" stroke="#102042" strokeWidth="6" opacity="0.28" />
      </>
    )
  }
  return (
    <>
      <path d="M24 74 L32 35 L47 58 L52 24 L57 58 L72 35 L80 74 Z" fill={base} />
      <rect x="28" y="73" width="48" height="10" rx="4" fill={accent} />
      <circle cx="52" cy="44" r="5" fill="#fff7bf" />
    </>
  )
}

export function LevelIconBadge({
  icon,
  iconId,
  locked = false,
  className,
}: {
  icon?: LevelIconDefinition
  iconId?: string | null
  locked?: boolean
  className?: string
}) {
  const resolvedIcon = icon ?? getLevelIconById(iconId)
  if (!resolvedIcon) {
    return null
  }
  const colors = locked
    ? { glow: '#31415e', base: '#52617a' }
    : { glow: resolvedIcon.colors.glow, base: resolvedIcon.colors.base }
  return (
    <svg
      className={classNames('level-icon-badge-svg', className)}
      viewBox="0 0 104 104"
      role="img"
      aria-label={locked ? '未解放アイコン' : resolvedIcon.label}
    >
      <circle cx="52" cy="52" r="47" fill={colors.glow} opacity={locked ? 0.14 : 0.24} />
      <circle
        cx="52"
        cy="52"
        r="44"
        fill="rgba(6, 21, 40, 0.86)"
        stroke={colors.base}
        strokeWidth="4"
      />
      {renderMotif(resolvedIcon, locked)}
    </svg>
  )
}
