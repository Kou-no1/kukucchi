import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { AdvancedBossSprite } from '../../components/collection/AdvancedBossSprite'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { bosses } from '../../data/bosses'
import {
  advancedBossDisplayNames,
  advancedBossVariantForBossId,
} from '../../game-engine/collection/advancedPixelSprites'
import { getClearedStars, isBossUnlocked } from '../../game-engine/bosses/bossEngine'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateAdvancedQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

type AdvancedCategory = 'mixed' | 'square' | 'pi' | 'development'

const advancedGoal = 8

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
    resetQuestion(nextCategory)
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
    <AppShell title="スーパー計算" backTo="/home" className="game-shell">
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
          <p className="welcome">スーパー計算</p>
          <h2>平方数と3.14を攻略</h2>
          <p className="title-line">すこしむずかしい計算ステージです。</p>
        </div>
        <div className="segmented">
          <button
            className={category === 'mixed' ? 'selected' : ''}
            type="button"
            onClick={() => changeCategory('mixed')}
          >
            ミックス
          </button>
          <button
            className={category === 'square' ? 'selected' : ''}
            type="button"
            onClick={() => changeCategory('square')}
          >
            平方
          </button>
          <button
            className={category === 'pi' ? 'selected' : ''}
            type="button"
            onClick={() => changeCategory('pi')}
          >
            3.14
          </button>
          <button
            className={category === 'development' ? 'selected' : ''}
            type="button"
            onClick={() => changeCategory('development')}
          >
            発展
          </button>
        </div>
      </section>

      <section className="boss-list compact" aria-label="高学年ボス">
        {bosses
          .filter((boss) => boss.group === 'advanced')
          .map((boss) => {
            const unlocked = isBossUnlocked(boss, saveData)
            const stars = getClearedStars(saveData, boss.id)
            const bossVariant = advancedBossVariantForBossId(boss.id)
            return (
              <Link
                className={unlocked ? 'boss-card' : 'boss-card locked'}
                key={boss.id}
                to={unlocked ? `/boss/${boss.id}` : '#'}
                aria-disabled={!unlocked}
              >
                <span className="boss-no">No.{boss.no}</span>
                {bossVariant ? (
                  <AdvancedBossSprite
                    variant={bossVariant}
                    locked={!unlocked}
                    compact
                    className="boss-card-sprite"
                  />
                ) : (
                  <span className="boss-emoji" aria-hidden="true">
                    {unlocked ? boss.emoji : '◆'}
                  </span>
                )}
                <h2>{unlocked ? boss.label : '？？？'}</h2>
                <p>{unlocked ? boss.description : 'このカテゴリで20もん正解すると解放'}</p>
                <strong>{'★'.repeat(stars) || '未クリア'}</strong>
              </Link>
            )
          })}
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
    </AppShell>
  )
}
