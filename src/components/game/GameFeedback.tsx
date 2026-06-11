export function GameFeedback({
  state,
  correctAnswer,
}: {
  state: 'idle' | 'correct' | 'incorrect'
  correctAnswer: number | string
}) {
  if (state === 'idle') {
    return <p className="feedback feedback-idle">ゆっくりでだいじょうぶ</p>
  }
  if (state === 'correct') {
    return <p className="feedback feedback-correct">できた！ コインきらり</p>
  }
  return (
    <p className="feedback feedback-incorrect">
      おしい！ こたえは <strong>{correctAnswer}</strong>
    </p>
  )
}
