import { useId } from 'react'
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
  const rawId = useId().replace(/:/g, '')
  const baseGradientId = `key-base-${rawId}`
  const shineGradientId = `key-shine-${rawId}`
  const color = locked ? '#31415e' : keyType.color
  const accent = locked ? '#71809b' : keyType.accent
  const decorations = Math.min(5, keyType.no)
  const keyOpacity = locked ? 0.46 : 0.98
  const innerColor = locked ? '#07172d' : '#0e1a30'
  return (
    <svg className={className} viewBox="0 0 320 180" role="img" aria-label={keyType.name}>
      <defs>
        <linearGradient id={baseGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={shineGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={locked ? '#a7b1c6' : '#f7edd0'} />
          <stop offset="1" stopColor={locked ? '#71809b' : accent} />
        </linearGradient>
      </defs>

      <rect
        x="122"
        y="86"
        width="118"
        height="18"
        rx="9"
        fill={`url(#${baseGradientId})`}
        opacity={keyOpacity}
      />
      <rect
        x="197"
        y="95"
        width="14"
        height="28"
        rx="5"
        fill={`url(#${baseGradientId})`}
        opacity={keyOpacity}
      />
      <rect
        x="219"
        y="95"
        width="14"
        height="40"
        rx="5"
        fill={`url(#${baseGradientId})`}
        opacity={keyOpacity}
      />
      <circle
        cx="104"
        cy="95"
        r="24"
        fill="none"
        stroke={`url(#${baseGradientId})`}
        strokeWidth="18"
        opacity={keyOpacity}
      />
      <circle cx="104" cy="95" r="14" fill={innerColor} opacity={locked ? 0.68 : 0.82} />
      <rect x="140" y="89" width="78" height="4" rx="2" fill={accent} opacity={locked ? 0.25 : 0.55} />

      {keyType.id === 'star' ? (
        <g transform="rotate(-12 86 70)">
          <path
            d="M86 44 L92.5 61.1 L110.7 62 L96.5 73.4 L101.3 91 L86 81 L70.7 91 L75.5 73.4 L61.3 62 L79.5 61.1 Z"
            fill={`url(#${shineGradientId})`}
            stroke={locked ? '#71809b' : '#d9be86'}
            strokeLinejoin="round"
            strokeWidth="1.5"
            opacity={locked ? 0.55 : 1}
          />
        </g>
      ) : (
        <circle cx="88" cy="70" r={10 + keyType.no} fill={`url(#${shineGradientId})`} opacity={locked ? 0.35 : 0.9} />
      )}

      {Array.from({ length: decorations }).map((_, index) => (
        <circle
          key={index}
          cx={142 + index * 18}
          cy="114"
          r="4"
          fill={`url(#${shineGradientId})`}
          opacity={locked ? 0.35 : 0.9}
        />
      ))}
    </svg>
  )
}
