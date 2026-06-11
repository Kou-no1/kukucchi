import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateMultiplicationQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

const durationSeconds = 30

function createQuestion(): Question {
  return generateMultiplicationQuestion({ answerMode: 'choice' })
}

export function SpeedPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [question, setQuestion] = useState(createQuestion)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) {
      return
    }
    finishedRef.current = true
    const rawSummary = buildSessionSummary({
      id: createId('speed'),
      mode: 'speed',
      maxCombo: scoreState.maxCombo,
      score: scoreState.score,
      results,
      finishedAt: new Date().toISOString(),
    })
    const applied = applySessionResult(saveData, rawSummary)
    setSaveData(applied.save)
    navigate('/result', { state: { summary: applied.summary } })
  }, [navigate, results, saveData, scoreState.maxCombo, scoreState.score, setSaveData])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeLeft === 0) {
      finish()
    }
  }, [finish, timeLeft])

  function nextQuestion() {
    setQuestion(createQuestion())
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function handleAnswer(answer: number | string) {
    if (feedback !== 'idle' || timeLeft <= 0) {
      return
    }
    const correct = isCorrectAnswer(question, answer)
    const responseTimeMs = Date.now() - startedAtRef.current
    const result: AnswerResult = {
      questionId: question.id,
      prompt: question.prompt,
      expectedAnswer: question.answer,
      givenAnswer: answer,
      correct,
      responseTimeMs,
      answeredAt: new Date().toISOString(),
    }
    setResults((current) => [...current, result])
    setScoreState((current) => applyAnswerToScore(current, correct, responseTimeMs))
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      playCorrectSound(saveData.settings.soundEnabled)
    }
    window.setTimeout(nextQuestion, 550)
  }

  return (
    <AppShell title="スピード" backTo="/games">
      <section className="speed-summary" aria-label="スピード情報">
        <div>
          <span>のこり</span>
          <strong>{timeLeft}</strong>
        </div>
        <div>
          <span>スコア</span>
          <strong>{scoreState.score}</strong>
        </div>
        <div>
          <span>コンボ</span>
          <strong>{scoreState.combo}</strong>
        </div>
      </section>

      <section className="game-panel" aria-labelledby="speed-question">
        <h2 id="speed-question" className="question-prompt">
          {question.prompt}
        </h2>
        <GameFeedback state={feedback} correctAnswer={question.answer} />
        <AnswerControls
          question={question}
          answerMode="choice"
          inputValue=""
          onInputChange={() => undefined}
          onAnswer={handleAnswer}
          disabled={feedback !== 'idle' || timeLeft <= 0}
        />
        <button className="secondary-action wide" type="button" onClick={finish}>
          けっかへ
        </button>
      </section>
    </AppShell>
  )
}
