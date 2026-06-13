import type { KeyType } from '../../data/keys'

export function KeyIcon({
  keyType,
  locked = false,
  className,
}: {
  keyType: KeyType
  locked?: boolean
  className?: string
}) {
  const color = locked ? '#31415e' : keyType.color
  const accent = locked ? '#71809b' : keyType.accent
  const decorations = Math.min(4, keyType.no)
  return (
    <svg className={className} viewBox="0 0 112 72" role="img" aria-label={keyType.name}>
      <circle cx="30" cy="34" r="18" fill={color} opacity={locked ? 0.45 : 0.96} />
      <circle cx="30" cy="34" r="8" fill="#07172d" opacity="0.78" />
      <rect x="44" y="29" width="48" height="10" rx="5" fill={color} opacity={locked ? 0.45 : 0.96} />
      <rect x="78" y="38" width="8" height="13" rx="2" fill={color} opacity={locked ? 0.45 : 0.96} />
      <rect x="90" y="38" width="8" height="19" rx="2" fill={color} opacity={locked ? 0.45 : 0.96} />
      <path d="M20 16 25 6 30 16 40 18 32 25 34 36 25 31 16 36 18 25 10 18Z" fill={accent} />
      {Array.from({ length: decorations }).map((_, index) => (
        <circle key={index} cx={54 + index * 10} cy="24" r="3" fill={accent} opacity={locked ? 0.55 : 1} />
      ))}
    </svg>
  )
}
