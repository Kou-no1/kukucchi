import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { UfoBadge } from '../../components/collection/UfoBadge'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { getUfoById } from '../../data/ufos'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateAdaptiveMultiplicationQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, GameMode, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

type MiniGameVariant = Extract<GameMode, 'battle' | 'treasure' | 'rocket'>

const gameConfig: Record<
  MiniGameVariant,
  {
    title: string
    eyebrow: string
    heading: string
    description: string
    goal: number
    statLabel: string
    icon: string
  }
> = {
  battle: {
    title: 'モンスターバトル',
    eyebrow: 'まちがえても だいじょうぶ',
    heading: 'ミニモンスターにアタック',
    description: '10もんでシールドをけずろう',
    goal: 10,
    statLabel: 'ボスHP',
    icon: '🛡️',
  },
  treasure: {
    title: '宝箱',
    eyebrow: '3もん正解で かぎ1本',
    heading: 'スター宝箱チャレンジ',
    description: 'かぎをあつめて宝箱をひらこう',
    goal: 9,
    statLabel: 'かぎ',
    icon: '🗝️',
  },
  rocket: {
    title: 'ロケット',
    eyebrow: 'はやく正確にこたえよう',
    heading: 'ロケットチャレンジ',
    description: '燃料をためて遠い星へすすもう',
    goal: 8,
    statLabel: '燃料',
    icon: '🚀',
  },
}

function calculateVariantStat(variant: MiniGameVariant, results: AnswerResult[]): string {
  const correctCount = results.filter((result) => result.correct).length
  if (variant === 'battle') {
    return `${Math.max(0, 100 - correctCount * 12)}`
  }
  if (variant === 'treasure') {
    return `${Math.floor(correctCount / 3)}`
  }
  const fastBonus = results.filter(
    (result) => result.correct && result.responseTimeMs <= 2500,
  ).length
  return `${correctCount * 10 + fastBonus * 5}`
}

export function MiniGamePage({ variant }: { variant: MiniGameVariant }) {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const config = gameConfig[variant]
  const equippedUfo = getUfoById(saveData.progress.equippedUfoId)
  const [question, setQuestion] = useState<Question>(() =>
    generateAdaptiveMultiplicationQuestion(saveData.progress.facts, { answerMode: 'choice' }),
  )
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())

  function nextQuestion() {
    setQuestion(generateAdaptiveMultiplicationQuestion(saveData.progress.facts, { answerMode: 'choice' }))
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function finish(nextResults = results, nextScoreState = scoreState) {
    const rawSummary = buildSessionSummary({
      id: createId(variant),
      mode: variant,
      maxCombo: nextScoreState.maxCombo,
      score: nextScoreState.score,
      results: nextResults,
      finishedAt: new Date().toISOString(),
    })
    const applied = applySessionResult(saveData, rawSummary)
    setSaveData(applied.save)
    navigate('/result', { state: { summary: applied.summary } })
  }

  function handleAnswer(answer: number | string) {
    if (feedback !== 'idle') {
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
    const nextResults = [...results, result]
    const nextScoreState = applyAnswerToScore(scoreState, correct, responseTimeMs)
    setResults(nextResults)
    setScoreState(nextScoreState)
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      playCorrectSound(saveData.settings.soundEnabled)
    }
    window.setTimeout(() => {
      if (nextResults.length >= config.goal) {
        finish(nextResults, nextScoreState)
      } else {
        nextQuestion()
      }
    }, 650)
  }

  return (
    <AppShell title={config.title} backTo="/games">
      <section className="mission-companion mini-game-command" aria-label={config.title}>
        {variant === 'rocket' && equippedUfo ? (
          <UfoBadge ufo={equippedUfo} compact className="mini-equipped-ufo" />
        ) : (
          <KukucchiCharacter level={saveData.player?.level ?? 1} mood="cheer" />
        )}
        <div>
          <p className="welcome">{config.eyebrow}</p>
          <h2>{config.heading}</h2>
          <p className="title-line">{config.description}</p>
        </div>
        <div className="mini-game-meter" aria-label={config.statLabel}>
          <span aria-hidden="true">{config.icon}</span>
          <strong>{calculateVariantStat(variant, results)}</strong>
          <small>{config.statLabel}</small>
        </div>
      </section>

      <section className="game-panel" aria-labelledby="mini-question">
        <div className="question-header">
          <span>
            {results.length}/{config.goal}
          </span>
          <span>{scoreState.score} pt</span>
        </div>
        <h2 id="mini-question" className="question-prompt">
          {question.prompt}
        </h2>
        <GameFeedback state={feedback} correctAnswer={question.answer} />
        <AnswerControls
          question={question}
          answerMode="choice"
          inputValue=""
          onInputChange={() => undefined}
          onAnswer={handleAnswer}
          disabled={feedback !== 'idle'}
        />
      </section>
    </AppShell>
  )
}
