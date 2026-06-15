import type { HomeShipVisuals } from '../../data/shopItems'

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
}: {
  mood?: 'happy' | 'thinking' | 'cheer'
  level?: number
  visual?: KukucchiShipVisuals
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
    <div className={rootClassName} aria-label="くくっち">
      <div className="ufo-ring">
        <span className="kukucchi-window-layer" aria-hidden="true" />
        <span className="kukucchi-effect-layer" aria-hidden="true" />
        <div className="ufo-cockpit">
          <div className="kukucchi-body">
            <span className="antenna antenna-left" />
            <span className="antenna antenna-right" />
            <span className="kukucchi-wear-layer" aria-hidden="true" />
            <span className="kukucchi-hat-layer" aria-hidden="true" />
            <span className="eye left-eye" />
            <span className="eye right-eye" />
            <span className="mouth" />
            <span className="belly">{level}</span>
          </div>
        </div>
        <span className="kukucchi-furniture-layer" aria-hidden="true" />
        <div className="ufo-ship">
          <span className="ufo-light light-a" />
          <span className="ufo-light light-b" />
          <span className="ufo-light light-c" />
          <span className="ufo-light light-d" />
        </div>
        <span className="kukucchi-buddy-layer" aria-hidden="true" />
      </div>
      <div className="kukucchi-shadow" />
    </div>
  )
}
