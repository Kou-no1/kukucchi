import { formatAnswerValue } from '../../game-engine/questions/answer'
import type { AnswerValue } from '../../types/game'

export function GameFeedback({
  state,
  correctAnswer,
}: {
  state: 'idle' | 'correct' | 'incorrect'
  correctAnswer: AnswerValue
}) {
  if (state === 'idle') {
    return <p className="feedback feedback-idle">ゆっくりでだいじょうぶ</p>
  }
  if (state === 'correct') {
    return <p className="feedback feedback-correct">できた！ コインきらり</p>
  }
  return (
    <p className="feedback feedback-incorrect">
      おしい！ こたえは <strong>{formatAnswerValue(correctAnswer)}</strong>
    </p>
  )
}
