import { memo } from 'react'
import type { BossDifficultyId } from '../../types/save'
import { buildTrophySprite } from '../../game-engine/collection/pixelSprites'
import type { TrophySpriteKind } from '../../game-engine/collection/pixelSprites'

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function TrophyBody({
  colors,
  label,
  locked,
}: {
  colors: ReturnType<typeof buildTrophySprite>['colors']
  label: string
  locked: boolean
}) {
  return (
    <>
      <rect x="24" y="20" width="72" height="10" fill={colors.outline} />
      <rect x="32" y="30" width="56" height="10" fill={colors.highlight} opacity={locked ? 0.35 : 0.9} />
      <rect x="28" y="40" width="64" height="18" fill={colors.metal} />
      <rect x="20" y="40" width="12" height="24" fill={colors.outline} />
      <rect x="88" y="40" width="12" height="24" fill={colors.outline} />
      <rect x="16" y="48" width="12" height="10" fill={colors.metal} />
      <rect x="92" y="48" width="12" height="10" fill={colors.metal} />
      <rect x="36" y="58" width="48" height="10" fill={colors.shade} />
      <rect x="48" y="68" width="24" height="10" fill={colors.outline} />
      <rect x="36" y="78" width="48" height="10" fill={colors.metal} />
      <rect x="28" y="88" width="64" height="8" fill={colors.outline} />
      <rect x="40" y="44" width="40" height="16" fill="#07172d" opacity={locked ? 0.46 : 0.72} />
      <text x="60" y="57" textAnchor="middle" className="pixel-sprite-label">
        {label}
      </text>
    </>
  )
}

function MedalBody({
  colors,
  label,
  locked,
}: {
  colors: ReturnType<typeof buildTrophySprite>['colors']
  label: string
  locked: boolean
}) {
  return (
    <>
      <rect x="30" y="10" width="18" height="28" fill={colors.accentDark} />
      <rect x="72" y="10" width="18" height="28" fill={colors.accentDark} />
      <rect x="48" y="10" width="24" height="32" fill={colors.accent} opacity={locked ? 0.35 : 0.95} />
      <rect x="34" y="36" width="52" height="8" fill={colors.outline} />
      <rect x="26" y="44" width="68" height="12" fill={colors.outline} />
      <rect x="18" y="56" width="84" height="24" fill={colors.metal} />
      <rect x="26" y="80" width="68" height="12" fill={colors.shade} />
      <rect x="34" y="52" width="52" height="8" fill={colors.highlight} opacity={locked ? 0.35 : 0.88} />
      <rect x="38" y="62" width="44" height="20" fill="#07172d" opacity={locked ? 0.46 : 0.72} />
      <text x="60" y="78" textAnchor="middle" className="pixel-sprite-label">
        {label}
      </text>
    </>
  )
}

export const TrophySprite = memo(function TrophySprite({
  danLabel,
  accentDan,
  difficulty,
  kind,
  locked = false,
  className,
}: {
  danLabel: string
  accentDan: number
  difficulty: BossDifficultyId
  kind?: TrophySpriteKind
  locked?: boolean
  className?: string
}) {
  const sprite = buildTrophySprite({ danLabel, accentDan, difficulty, kind })
  const colors = locked
    ? {
        metal: '#31415e',
        shade: '#24324e',
        highlight: '#71809b',
        outline: '#13213b',
        accent: '#4a5876',
        accentDark: '#24324e',
      }
    : sprite.colors
  return (
    <svg
      className={classNames('trophy-pixel-sprite', className)}
      viewBox="0 0 120 104"
      role="img"
      aria-label={locked ? '未入手のおたから' : `${danLabel} ${difficulty} ${sprite.kind}`}
      shapeRendering="crispEdges"
    >
      <rect x="8" y="8" width="104" height="88" rx="4" fill={colors.accentDark} opacity={locked ? 0.2 : 0.26} />
      {sprite.kind === 'trophy' ? (
        <TrophyBody colors={colors} label={danLabel} locked={locked} />
      ) : (
        <MedalBody colors={colors} label={danLabel} locked={locked} />
      )}
      {difficulty === 'gekimuzu' && !locked ? (
        <>
          <rect x="18" y="96" width="20" height="4" fill="#8cf8ff" />
          <rect x="38" y="96" width="20" height="4" fill="#a78bfa" />
          <rect x="58" y="96" width="20" height="4" fill="#f472b6" />
          <rect x="78" y="96" width="20" height="4" fill="#facc15" />
        </>
      ) : null}
    </svg>
  )
})
