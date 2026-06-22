import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { AdvancedBossSprite } from '../../components/collection/AdvancedBossSprite'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { advancedBossCategoryLabels, bosses } from '../../data/bosses'
import {
  advancedBossDisplayNames,
  advancedBossVariantForBossId,
} from '../../game-engine/collection/advancedPixelSprites'
import {
  getClearedStars,
  isBossUnlocked,
  remainingQuestionsToUnlockBoss,
} from '../../game-engine/bosses/bossEngine'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateAdvancedQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useDailyUsage } from '../../hooks/useDailyUsage'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

type AdvancedCategory = 'mixed' | 'square' | 'pi' | 'development'
type AdvancedPhase = 'ready' | 'running'

const advancedGoal = 8

const advancedCategoryLabels: Record<AdvancedCategory, string> = {
  mixed: 'ミックス',
  square: '平方数',
  pi: '円周率',
  development: '発展',
}

const advancedCategoryDescriptions: Record<AdvancedCategory, string> = {
  mixed: '平方数・円周率・発展をまぜてれんしゅう',
  square: '11×11から20×20までの平方数',
  pi: '3.14をつかった円周率計算',
  development: '約数・倍数・素数などの発展計算',
}

function categoryFromQuestionId(questionId: string): string {
  if (questionId.startsWith('square-')) {
    return '平方数'
  }
  if (questionId.startsWith('pi-')) {
    return '3.14'
  }
  return '発展'
}

function categorySpriteVariant(category: AdvancedCategory) {
  if (category === 'square') {
    return 'square'
  }
  if (category === 'pi') {
    return 'pi'
  }
  return 'mixed'
}

function categorySpriteName(category: AdvancedCategory) {
  return advancedBossDisplayNames[categorySpriteVariant(category)]
}

export function AdvancedPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const { rewardBudgetReached } = useDailyUsage()
  const [phase, setPhase] = useState<AdvancedPhase>('ready')
  const [category, setCategory] = useState<AdvancedCategory>('mixed')
  const [question, setQuestion] = useState<Question>(() => generateAdvancedQuestion('mixed'))
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())

  function resetQuestion(nextCategory = category) {
    setQuestion(generateAdvancedQuestion(nextCategory))
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function changeCategory(nextCategory: AdvancedCategory) {
    setCategory(nextCategory)
    if (phase === 'running') {
      resetQuestion(nextCategory)
    }
  }

  function startAdvanced() {
    setQuestion(generateAdvancedQuestion(category))
    setFeedback('idle')
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    startedAtRef.current = Date.now()
    setPhase('running')
  }

  function finish(nextResults = results, nextScoreState = scoreState) {
    const categoryScores = nextResults.reduce<Record<string, { correct: number; total: number }>>(
      (scores, result) => {
        const label = categoryFromQuestionId(result.questionId)
        const current = scores[label] ?? { correct: 0, total: 0 }
        scores[label] = {
          correct: current.correct + (result.correct ? 1 : 0),
          total: current.total + 1,
        }
        return scores
      },
      {},
    )
    const rawSummary = buildSessionSummary({
      id: createId('advanced'),
      mode: 'advanced',
      maxCombo: nextScoreState.maxCombo,
      score: nextScoreState.score,
      results: nextResults,
      details: {
        advancedCategoryRates: Object.entries(categoryScores).map(
          ([label, score]) => `${label} ${Math.round((score.correct / score.total) * 100)}%`,
        ),
      },
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
      if (nextResults.length >= advancedGoal) {
        finish(nextResults, nextScoreState)
      } else {
        resetQuestion()
      }
    }, 700)
  }

  return (
    <AppShell
      title="スーパー計算"
      backTo="/home"
      className={phase === 'running' ? 'game-shell' : 'mode-ready-shell advanced-ready-shell'}
    >
      {phase === 'ready' ? (
        <ModeStartScreen
          title={`${advancedCategoryLabels[category]} チャレンジ`}
          eyebrow="けいさんをえらぼう"
          description={advancedCategoryDescriptions[category]}
          level={saveData.player?.level ?? 1}
          backTo="/planet/multiply"
          onStart={startAdvanced}
        >
          <div className="duration-select-panel advanced-start-panel" aria-label="けいさんをえらぶ">
            <strong>けいさん</strong>
            <div className="segmented advanced-start-segmented">
              {(['mixed', 'square', 'pi', 'development'] as const).map((nextCategory) => (
                <button
                  className={category === nextCategory ? 'selected' : ''}
                  key={nextCategory}
                  type="button"
                  onClick={() => changeCategory(nextCategory)}
                  aria-pressed={category === nextCategory}
                >
                  {advancedCategoryLabels[nextCategory]}
                </button>
              ))}
            </div>
          </div>

          <div className="advanced-ready-boss-list" aria-label="高学年ボス">
            {bosses
              .filter((boss) => boss.group === 'advanced')
              .map((boss) => {
                const unlocked = isBossUnlocked(boss, saveData)
                const stars = getClearedStars(saveData, boss.id)
                const remainingToUnlock = remainingQuestionsToUnlockBoss(boss, saveData)
                const bossVariant = advancedBossVariantForBossId(boss.id)
                return (
                  <Link
                    className={unlocked ? 'advanced-ready-boss-card' : 'advanced-ready-boss-card locked'}
                    key={boss.id}
                    to={unlocked ? `/boss/${boss.id}` : '#'}
                    aria-disabled={!unlocked}
                  >
                    {bossVariant ? (
                      <AdvancedBossSprite
                        variant={bossVariant}
                        locked={!unlocked}
                        compact
                        className="boss-card-sprite"
                      />
                    ) : null}
                    {boss.advancedCategory ? (
                      <small className="advanced-boss-category">
                        {advancedBossCategoryLabels[boss.advancedCategory]}
                      </small>
                    ) : null}
                    <span>{unlocked ? boss.label : '？？？'}</span>
                    {!unlocked && remainingToUnlock !== null ? (
                      <p className="boss-unlock-progress">あと {remainingToUnlock}もん で かいほう！</p>
                    ) : null}
                    <strong>{'★'.repeat(stars) || '未クリア'}</strong>
                  </Link>
                )
              })}
          </div>
        </ModeStartScreen>
      ) : (
        <>
          <section className="advanced-command" aria-label="スーパー計算メニュー">
            <div className="advanced-command-guardian">
              <AdvancedBossSprite
                variant={categorySpriteVariant(category)}
                compact
                className="advanced-command-sprite"
              />
              <span>{categorySpriteName(category)}</span>
            </div>
            <div>
              <p className="welcome">{advancedCategoryLabels[category]}</p>
              <h2>スーパー計算</h2>
              <p className="title-line">{advancedCategoryDescriptions[category]}</p>
            </div>
          </section>

          <section className="game-panel" aria-labelledby="advanced-question">
            <div className="question-header">
              <span>
                {results.length}/{advancedGoal}
              </span>
              <span>{scoreState.score} pt</span>
            </div>
            <h2 id="advanced-question" className="question-prompt">
              {question.prompt}
            </h2>
            {feedback !== 'idle' && question.explanation ? (
              <p className="quiet-text">{question.explanation}</p>
            ) : null}
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
        </>
      )}
    </AppShell>
  )
}
