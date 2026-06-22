import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { MonsterSprite } from '../../components/collection/MonsterSprite'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import {
  generateAdaptiveMultiplicationQuestion,
  generateMultiplicationFactQuestion,
} from '../../game-engine/questions/questionGenerator'
import { formatFactLabel } from '../../game-engine/questions/factIds'
import {
  getMonsterFacts,
  getMonsterOvercomeProgress,
  getReviewQueue,
} from '../../game-engine/review/weakFacts'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { isTokuiFact, resultIncorrectStreak } from '../../game-engine/school/schoolMode2'
import { useDailyUsage } from '../../hooks/useDailyUsage'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

const reviewGoal = 6

export function ReviewPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const { rewardBudgetReached } = useDailyUsage()
  const reviewQueue = useMemo(
    () => getReviewQueue(saveData.progress.facts, new Date(), reviewGoal, { operation: 'multiplication' }),
    [saveData.progress.facts],
  )
  const monsters = useMemo(
    () => getMonsterFacts(saveData.progress.facts, 6),
    [saveData.progress.facts],
  )
  const [started, setStarted] = useState(false)
  const [question, setQuestion] = useState<Question>(() =>
    saveData.settings.schoolMode2Enabled
      ? generateAdaptiveMultiplicationQuestion(saveData.progress.facts, {
          schoolMode2Enabled: true,
        })
      : reviewQueue[0]
        ? generateMultiplicationFactQuestion(reviewQueue[0].left, reviewQueue[0].right)
        : generateAdaptiveMultiplicationQuestion(saveData.progress.facts),
  )
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())

  function createReviewQuestion(index: number, completedResults = results): Question {
    if (saveData.settings.schoolMode2Enabled) {
      return generateAdaptiveMultiplicationQuestion(saveData.progress.facts, {
        schoolMode2Enabled: true,
        recentIncorrectCount: resultIncorrectStreak(completedResults),
      })
    }
    const fact = reviewQueue[index % Math.max(1, reviewQueue.length)]
    if (fact) {
      return generateMultiplicationFactQuestion(fact.left, fact.right)
    }
    return generateAdaptiveMultiplicationQuestion(saveData.progress.facts)
  }

  function startReview() {
    setStarted(true)
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    setFeedback('idle')
    setQuestion(createReviewQuestion(0))
    startedAtRef.current = Date.now()
  }

  function finish(nextResults = results, nextScoreState = scoreState) {
    const rawSummary = buildSessionSummary({
      id: createId('review'),
      mode: 'review',
      maxCombo: nextScoreState.maxCombo,
      score: nextScoreState.score,
      results: nextResults,
      finishedAt: new Date().toISOString(),
    })
    const applied = applySessionResult(saveData, rawSummary, {
      rewardBudgetPaused: rewardBudgetReached,
    })
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
      difficulty: question.difficulty,
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
      if (nextResults.length >= reviewGoal) {
        finish(nextResults, nextScoreState)
      } else {
        setQuestion(createReviewQuestion(nextResults.length, nextResults))
        setFeedback('idle')
        startedAtRef.current = Date.now()
      }
    }, 700)
  }

  return (
    <AppShell title="にがてモンスター" backTo="/planet/multiply" className={started ? 'game-shell' : ''}>
      {!started ? (
        <section className="review-start" aria-labelledby="review-title">
          <p className="welcome">苦手はたからもの</p>
          <h2 id="review-title">モンスターをなかまにしよう</h2>
          <p className="title-line">
            最近まちがえた式、復習の日が来た式、ゆっくりだった式から出題します。
          </p>
          <div className="monster-grid" aria-label="出現中のモンスター">
            {(monsters.length > 0 ? monsters : reviewQueue).slice(0, 6).map((fact) => {
              const showOvercomeProgress =
                monsters.includes(fact) && !saveData.progress.monsterBook.includes(fact.id)
              const overcomeProgress = showOvercomeProgress
                ? getMonsterOvercomeProgress(fact)
                : null
              return (
                <span className="monster-chip" key={fact.id}>
                  <MonsterSprite left={fact.left} right={fact.right} className="monster-chip-sprite" />
                  <span>
                    {formatFactLabel(fact)}
                    <small>Lv {fact.masteryLevel}</small>
                    {isTokuiFact(fact) ? <small className="tokui-mark">★ とくい</small> : null}
                    {overcomeProgress?.message ? (
                      <small className="monster-overcome-progress">
                        {overcomeProgress.message}
                      </small>
                    ) : null}
                  </span>
                </span>
              )
            })}
            {monsters.length === 0 && reviewQueue.length === 0 ? (
              <span className="monster-chip">
                🌟 まだ平和
                <small>まずは遊ぼう</small>
              </span>
            ) : null}
          </div>
          <button className="primary-action wide" type="button" onClick={startReview}>
            復習スタート
          </button>
        </section>
      ) : (
        <section className="game-panel" aria-labelledby="review-question">
          <div className="question-header">
            <span>
              {results.length}/{reviewGoal}
            </span>
            <span>{scoreState.combo} コンボ</span>
          </div>
          <h2 id="review-question" className="question-prompt">
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
      )}
    </AppShell>
  )
}
