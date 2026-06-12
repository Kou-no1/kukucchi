import { getKukuReadingParts } from '../../data/kukuReadings'

export function KukuReadingRuby({
  left,
  right,
  revealAnswer,
  visible = true,
}: {
  left: number
  right: number
  revealAnswer: boolean
  visible?: boolean
}) {
  if (!visible) {
    return null
  }

  const reading = getKukuReadingParts(left, right)
  return (
    <span className="kuku-ruby" aria-label="九九の読み方">
      <span>{reading.question}</span>
      <span>{revealAnswer ? reading.answer : '？'}</span>
    </span>
  )
}
