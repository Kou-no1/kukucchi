import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { UfoBadge } from '../../components/collection/UfoBadge'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { miniGameMinDifficulty } from '../../data/factDifficulty'
import { earnedRocketBadges, rocketBadges } from '../../data/rocketBadges'
import { getUfoById } from '../../data/ufos'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateMultiplicationQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, GameMode, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

type MiniGameVariant = Extract<GameMode, 'battle' | 'treasure' | 'rocket'>
type MiniGamePhase = 'ready' | 'running' | 'chests'

const battleGoal = 12
const battleTimeLimitMs = 6000
const treasureGoal = 9
const rocketGoal = 14
const specialGaugeMax = 3

const treasureChests = [
  { id: 'small', label: 'ちいさなたからばこ', hint: 'こいんすこし', coins: 8, icon: '🪙' },
  { id: 'middle', label: 'ほしのたからばこ', hint: 'こいんふつう', coins: 12, icon: '⭐' },
  { id: 'large', label: 'ひかるたからばこ', hint: 'こいんたっぷり', coins: 16, icon: '💎' },
]

const gameConfig: Record<
  MiniGameVariant,
  {
    title: string
    eyebrow: string
    heading: string
    description: string
    startDescription: string
    goal: number
    statLabel: string
    icon: string
  }
> = {
  battle: {
    title: 'もんすたーばとる',
    eyebrow: 'れんぞくで ひっさつわざ！',
    heading: 'はーとをまもってあたっく',
    description: '3ハートで、ひっさつわざをねらおう',
    startDescription: 'れんぞくせいかいでゲージをためて、ひっさつわざ！',
    goal: battleGoal,
    statLabel: 'もんすたーたいりょく',
    icon: '👾',
  },
  treasure: {
    title: 'たからばこ',
    eyebrow: 'ゆっくりかんがえて おたからげっと',
    heading: '3もんれんぞくでかぎ',
    description: 'じかんせいげんなし。かぎでたからばこをあけよう',
    startDescription: 'あせらずせいかくに。3もんれんぞくでかぎ1ぽん！',
    goal: treasureGoal,
    statLabel: 'かぎ',
    icon: '🗝️',
  },
  rocket: {
    title: 'ろけっと',
    eyebrow: 'はやさで うちゅうのはてへ！',
    heading: 'ねんりょうをためてとおくへ',
    description: 'はやいせいかいほどぐんぐんかそく',
    startDescription: 'ねんりょうをきらさず、じぶんのきろくにちょうせん！',
    goal: rocketGoal,
    statLabel: 'きょり',
    icon: '🚀',
  },
}

function createMiniQuestion(): Question {
  return generateMultiplicationQuestion({
    answerMode: 'choice',
    minDifficulty: miniGameMinDifficulty,
  })
}

export function MiniGamePage({ variant }: { variant: MiniGameVariant }) {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const config = gameConfig[variant]
  const equippedUfo = getUfoById(saveData.progress.equippedUfoId)
  const [phase, setPhase] = useState<MiniGamePhase>('ready')
  const [question, setQuestion] = useState<Question>(createMiniQuestion)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const [hearts, setHearts] = useState(3)
  const [enemyHp, setEnemyHp] = useState(100)
  const [specialGauge, setSpecialGauge] = useState(0)
  const [keys, setKeys] = useState(0)
  const [treasureStreak, setTreasureStreak] = useState(0)
  const [fuel, setFuel] = useState(35)
  const [distance, setDistance] = useState(0)
  const [timeLeftMs, setTimeLeftMs] = useState(battleTimeLimitMs)
  const startedAtRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const attackWarning = variant === 'battle' && (results.length + 1) % 4 === 0

  function resetRunState() {
    finishedRef.current = false
    setQuestion(createMiniQuestion())
    setFeedback('idle')
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    setHearts(3)
    setEnemyHp(100)
    setSpecialGauge(0)
    setKeys(0)
    setTreasureStreak(0)
    setFuel(35)
    setDistance(0)
    setTimeLeftMs(battleTimeLimitMs)
    startedAtRef.current = Date.now()
  }

  function startGame() {
    resetRunState()
    setPhase('running')
  }

  function nextQuestion() {
    setQuestion(createMiniQuestion())
    setFeedback('idle')
    setTimeLeftMs(battleTimeLimitMs)
    startedAtRef.current = Date.now()
  }

  const finish = useCallback(
    (
      nextResults = results,
      nextScoreState = scoreState,
      options: { treasureBonusCoins?: number; rocketDistance?: number } = {},
    ) => {
      if (finishedRef.current) {
        return
      }
      finishedRef.current = true
      const finalScore =
        variant === 'rocket' ? Math.round(options.rocketDistance ?? distance) : nextScoreState.score
      const rawSummary = buildSessionSummary({
        id: createId(variant),
        mode: variant,
        maxCombo: nextScoreState.maxCombo,
        score: finalScore,
        results: nextResults,
        finishedAt: new Date().toISOString(),
      })
      const summary = {
        ...rawSummary,
        earnedCoins: rawSummary.earnedCoins + (options.treasureBonusCoins ?? 0),
      }
      const applied = applySessionResult(saveData, summary)
      let nextSave = applied.save
      let nextSummary = applied.summary
      if (variant === 'rocket') {
        const finalDistance = Math.round(options.rocketDistance ?? distance)
        const newlyEarnedBadges = earnedRocketBadges(finalDistance)
        const rocketBestUpdated = finalDistance > saveData.progress.rocketBestDistance
        nextSave = {
          ...nextSave,
          progress: {
            ...nextSave.progress,
            rocketBestDistance: Math.max(saveData.progress.rocketBestDistance, finalDistance),
            rocketBadges: Array.from(
              new Set([...saveData.progress.rocketBadges, ...newlyEarnedBadges]),
            ),
          },
        }
        nextSummary = {
          ...nextSummary,
          bestUpdated: nextSummary.bestUpdated || rocketBestUpdated,
        }
      }
      setSaveData(nextSave)
      navigate('/result', { state: { summary: nextSummary } })
    },
    [distance, navigate, results, saveData, scoreState, setSaveData, variant],
  )

  const recordAnswer = useCallback(
    (answer: number | string, forceIncorrect = false) => {
      if (phase !== 'running' || feedback !== 'idle') {
        return
      }
      const responseTimeMs = Date.now() - startedAtRef.current
      const correct = !forceIncorrect && isCorrectAnswer(question, answer)
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

      if (variant === 'battle') {
        const nextEnemyHp = Math.max(0, enemyHp - (correct ? 12 : 0))
        const nextHearts = correct ? hearts : Math.max(0, hearts - 1)
        setEnemyHp(nextEnemyHp)
        setHearts(nextHearts)
        setSpecialGauge((current) => (correct ? Math.min(specialGaugeMax, current + 1) : 0))
        window.setTimeout(() => {
          if (nextEnemyHp <= 0 || nextHearts <= 0 || nextResults.length >= battleGoal) {
            finish(nextResults, nextScoreState)
          } else {
            nextQuestion()
          }
        }, 650)
        return
      }

      if (variant === 'treasure') {
        const nextStreak = correct ? treasureStreak + 1 : 0
        const earnedKey = nextStreak >= 3
        setKeys((current) => current + (earnedKey ? 1 : 0))
        setTreasureStreak(earnedKey ? 0 : nextStreak)
        window.setTimeout(() => {
          if (nextResults.length >= treasureGoal) {
            setPhase('chests')
          } else {
            nextQuestion()
          }
        }, 650)
        return
      }

      const speedBonus = correct && responseTimeMs <= 1500 ? 26 : correct && responseTimeMs <= 2500 ? 16 : 8
      const nextFuel = Math.max(0, fuel + (correct ? 8 : -12))
      const nextDistance = distance + (correct ? 40 + speedBonus : 10)
      setFuel(nextFuel)
      setDistance(nextDistance)
      window.setTimeout(() => {
        if (nextFuel <= 0 || nextResults.length >= rocketGoal) {
          finish(nextResults, nextScoreState, { rocketDistance: nextDistance })
        } else {
          nextQuestion()
        }
      }, 650)
    },
    [
      distance,
      enemyHp,
      feedback,
      finish,
      fuel,
      hearts,
      phase,
      question,
      results,
      saveData.settings.soundEnabled,
      scoreState,
      treasureStreak,
      variant,
    ],
  )

  useEffect(() => {
    if (variant !== 'battle' || phase !== 'running' || feedback !== 'idle') {
      return undefined
    }
    const interval = window.setInterval(() => {
      const remaining = battleTimeLimitMs - (Date.now() - startedAtRef.current)
      setTimeLeftMs(Math.max(0, remaining))
      if (remaining <= 0) {
        window.clearInterval(interval)
        recordAnswer('じかんぎれ', true)
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [feedback, phase, recordAnswer, variant])

  function useSpecialAttack() {
    if (variant !== 'battle' || specialGauge < specialGaugeMax || phase !== 'running') {
      return
    }
    const nextEnemyHp = Math.max(0, enemyHp - 34)
    setEnemyHp(nextEnemyHp)
    setSpecialGauge(0)
    if (nextEnemyHp <= 0) {
      finish(results, scoreState)
    }
  }

  function openChest(bonusCoins: number) {
    finish(results, scoreState, { treasureBonusCoins: bonusCoins })
  }

  if (phase === 'ready') {
    return (
      <AppShell title={config.title} backTo="/games">
        <ModeStartScreen
          title={config.title}
          eyebrow={config.eyebrow}
          description={config.startDescription}
          level={saveData.player?.level ?? 1}
          backTo="/games"
          onStart={startGame}
        />
      </AppShell>
    )
  }

  if (phase === 'chests') {
    return (
      <AppShell title="たからばこ" backTo="/games">
        <section className="treasure-chest-stage" aria-labelledby="treasure-open-title">
          <p className="welcome">かぎ {keys}ほん</p>
          <h2 id="treasure-open-title">ひらくたからばこをえらぼう</h2>
          <p className="title-line">どれもこいんいり。はずれはありません。</p>
          <div className="treasure-chest-grid">
            {treasureChests.map((chest) => (
              <button
                className="treasure-chest-card"
                key={chest.id}
                type="button"
                onClick={() => openChest(keys > 0 ? chest.coins * keys : 0)}
              >
                <span aria-hidden="true">{chest.icon}</span>
                <strong>{chest.label}</strong>
                <small>{chest.hint}</small>
              </button>
            ))}
          </div>
        </section>
      </AppShell>
    )
  }

  const meterValue =
    variant === 'battle' ? enemyHp : variant === 'treasure' ? keys : Math.round(distance)
  const limitPercent = Math.max(0, Math.round((timeLeftMs / battleTimeLimitMs) * 100))

  return (
    <AppShell title={config.title} backTo="/games" className="game-shell">
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
          <strong>{meterValue}</strong>
          <small>{config.statLabel}</small>
        </div>
      </section>

      <section className="game-panel" aria-labelledby="mini-question">
        <div className="question-header">
          <span>
            {results.length}/{config.goal}
          </span>
          {variant === 'battle' ? <span>はーと {'♥'.repeat(hearts) || '0'}</span> : null}
          {variant === 'treasure' ? <span>れんぞく {treasureStreak}/3</span> : null}
          {variant === 'rocket' ? <span>ねんりょう {fuel}</span> : null}
        </div>
        {variant === 'battle' ? (
          <div className="boss-time" aria-label={`のこり ${(timeLeftMs / 1000).toFixed(1)}びょう`}>
            <span>{attackWarning ? 'こうげきよこく！せいかいでまもる' : 'のこり'} {(timeLeftMs / 1000).toFixed(1)}びょう</span>
            <div>
              <i style={{ width: `${limitPercent}%` }} />
            </div>
          </div>
        ) : null}
        <h2 id="mini-question" className="question-prompt">
          {question.prompt}
        </h2>
        <GameFeedback state={feedback} correctAnswer={question.answer} />
        {variant === 'battle' ? (
          <button
            className="secondary-action wide"
            type="button"
            onClick={useSpecialAttack}
            disabled={specialGauge < specialGaugeMax || feedback !== 'idle'}
          >
            ひっさつわざ {specialGauge}/{specialGaugeMax}
          </button>
        ) : null}
        {variant === 'rocket' ? (
          <p className="quiet-text">
            じぶんのきろく {saveData.progress.rocketBestDistance} / つぎのばっじ{' '}
            {rocketBadges.find((badge) => distance < badge.distance)?.name ?? 'ぜんぶたっせい'}
          </p>
        ) : null}
        <AnswerControls
          question={question}
          answerMode="choice"
          inputValue=""
          onInputChange={() => undefined}
          onAnswer={(answer) => recordAnswer(answer)}
          disabled={feedback !== 'idle'}
        />
      </section>
    </AppShell>
  )
}
