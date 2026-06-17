import { homeShipPreviewLayers, type HomeShipVisuals } from '../../data/shopItems'
import type { ReactNode } from 'react'

export type KukucchiShipVisuals = HomeShipVisuals & {
  ufo?: string
}

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function visualClass(layer: string, variant: string | undefined): string | undefined {
  return variant ? `kukucchi-${layer}-${variant}` : undefined
}

export function KukucchiCharacter({
  mood = 'happy',
  level = 1,
  visual,
  buddyContent,
  label = 'くくっち',
}: {
  mood?: 'happy' | 'thinking' | 'cheer'
  level?: number
  visual?: KukucchiShipVisuals
  buddyContent?: ReactNode
  label?: string
}) {
  const rootClassName = classNames(
    'kukucchi',
    `kukucchi-${mood}`,
    visualClass('wear', visual?.wear),
    visualClass('hat', visual?.hat),
    visualClass('window', visual?.window),
    visualClass('furniture', visual?.furniture),
    visualClass('effect', visual?.effect),
    visualClass('buddy', visual?.buddy),
    visualClass('ufo', visual?.ufo),
  )

  return (
    <div className={rootClassName} aria-label={label}>
      <div className="ufo-ring" data-preview-layers={homeShipPreviewLayers.join('>')}>
        <span className="kukucchi-window-layer" data-preview-layer="window" aria-hidden="true" />
        <div className="ufo-ship" data-preview-layer="ufo">
          <span className="ufo-light light-a" />
          <span className="ufo-light light-b" />
          <span className="ufo-light light-c" />
          <span className="ufo-light light-d" />
        </div>
        <div className="ufo-cockpit" data-preview-layer="body">
          <div className="kukucchi-body">
            <span className="antenna antenna-left" />
            <span className="antenna antenna-right" />
            <span className="kukucchi-wear-layer" aria-hidden="true" />
            <span className="kukucchi-hat-layer" data-preview-layer="hat" aria-hidden="true" />
            <span className="eye left-eye" />
            <span className="eye right-eye" />
            <span className="mouth" />
            <span className="belly">{level}</span>
          </div>
        </div>
        <span className="kukucchi-furniture-layer" aria-hidden="true" />
        <span
          className={classNames('kukucchi-buddy-layer', buddyContent ? 'has-buddy' : undefined)}
          data-preview-layer="buddy"
          aria-hidden="true"
        >
          {buddyContent}
        </span>
        <span className="kukucchi-effect-layer" data-preview-layer="effect" aria-hidden="true" />
      </div>
      <div className="kukucchi-shadow" />
    </div>
  )
}
