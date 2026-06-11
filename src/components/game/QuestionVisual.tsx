import { getKukuReading } from '../../data/kukuReadings'
import type { Question } from '../../types/game'

function getNumbers(question: Question): { left: number; right: number } {
  return {
    left: Number(question.metadata?.left ?? 2),
    right: Number(question.metadata?.right ?? 1),
  }
}

export function QuestionVisual({
  question,
  mode,
  hideAnswer,
}: {
  question: Question
  mode: 'groups' | 'line' | 'addition' | 'reading'
  hideAnswer: boolean
}) {
  const { left, right } = getNumbers(question)
  const answer = Number(question.answer)

  if (mode === 'line') {
    return (
      <div className="visual-line" aria-label="数直線">
        {Array.from({ length: right + 1 }, (_, index) => (
          <span key={index} className={index === right ? 'line-goal' : ''}>
            {index * left}
          </span>
        ))}
      </div>
    )
  }

  if (mode === 'addition') {
    return (
      <p className="visual-addition">
        {Array.from({ length: right }, () => left).join(' + ')}
        {' = '}
        {hideAnswer ? '?' : answer}
      </p>
    )
  }

  if (mode === 'reading') {
    return <p className="visual-reading">{getKukuReading(left, right)}</p>
  }

  return (
    <div className="visual-groups" aria-label={`${left}こずつが${right}くみ`}>
      {Array.from({ length: right }, (_, row) => (
        <div key={row} className="dot-row">
          {Array.from({ length: left }, (_, col) => (
            <span key={col} className="dot" />
          ))}
        </div>
      ))}
      <span className="visual-answer">{hideAnswer ? '?' : answer}</span>
    </div>
  )
}
