import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import { AdvancedBossSprite } from '../../components/collection/AdvancedBossSprite'
import { UfoBadge } from '../../components/collection/UfoBadge'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { bossDifficultyIds, bosses, getBossDifficulty, getBossLimitedItem } from '../../data/bosses'
import type { BossDefinition, BossDifficulty } from '../../data/bosses'
import { getUfoById, getUfoForBoss } from '../../data/ufos'
import {
  applyBossClearReward,
  getClearedStars,
  getDifficultyProgress,
  isBossUnlocked,
  isDifficultyUnlocked,
  remainingQuestionsToUnlockBoss,
} from '../../game-engine/bosses/bossEngine'
import { advancedBossVariantForBossId } from '../../game-engine/collection/advancedPixelSprites'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { createMultiplicationFactPool } from '../../game-engine/questions/factDifficulty'
import {
  generateAdvancedQuestion,
  generateMissingFactorQuestion,
  generateMultiplicationFactQuestion,
} from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import type { BossDifficultyId } from '../../types/save'
import { createId } from '../../utils/id'

type BossPhase = 'select' | 'ready' | 'running' | 'result'

type BossBattleResult = {
  boss: BossDefinition
  difficulty: BossDifficulty
  cleared: boolean
  firstClear: boolean
  damage: number
  elapsedMs: number
  rewardItemIds: string[]
  rewardUfoIds: string[]
  rewardTitles: string[]
  grandReward: boolean
}

const difficultyIds: BossDifficultyId[] = [...bossDifficultyIds]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0]
}

function createBossQuestion(boss: BossDefinition, difficulty: BossDifficulty): Question {
  if (boss.advancedCategory) {
    return generateAdvancedQuestion(boss.advancedCategory)
  }
  const pool = createMultiplicationFactPool({
    stages: boss.stages ?? [2],
    minDifficulty: difficulty.minDifficulty,
  })
  const fact = pick(pool)
  if (difficulty.id === 'gekimuzu' && Math.random() < 0.3) {
    return generateMissingFactorQuestion(fact.left, fact.right)
  }
  return generateMultiplicationFactQuestion(fact.left, fact.right)
}

function formatSeconds(milliseconds: number): string {
  return `${Math.max(0, milliseconds / 1000).toFixed(1)}秒`
}

export function BossBattlePage({ group = 'basic' }: { group?: 'basic' | 'advanced' }) {
  const { bossId } = useParams()
  const { saveData, setSaveData } = useSaveData()
  const [phase, setPhase] = useState<BossPhase>('select')
  const [activeBoss, setActiveBoss] = useState<BossDefinition | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<BossDifficulty | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({ score: 0, combo: 0, maxCombo: 0 })
  const [damage, setDamage] = useState(0)
  const [timeLeftMs, setTimeLeftMs] = useState(0)
  const [battleResult, setBattleResult] = useState<BossBattleResult | null>(null)
  const questionStartedAtRef = useRef(Date.now())
  const battleStartedAtRef = useRef(Date.now())

  const visibleBosses = bosses.filter((boss) => (bossId ? boss.id === bossId : boss.group === group))

  const nextQuestion = useCallback(
    (boss: BossDefinition, difficulty: BossDifficulty, nextIndex: number) => {
      setQuestion(createBossQuestion(boss, difficulty))
      setQuestionIndex(nextIndex)
      setFeedback('idle')
      const limitMs = difficulty.timeLimitSeconds ? difficulty.timeLimitSeconds * 1000 : 0
      setTimeLeftMs(limitMs)
      questionStartedAtRef.current = Date.now()
    },
    [],
  )

  const finishBattle = useCallback(
    (
      boss: BossDefinition,
      difficulty: BossDifficulty,
      nextResults: AnswerResult[],
      nextScoreState: ScoreState,
      nextDamage: number,
    ) => {
      const elapsedMs = Date.now() - battleStartedAtRef.current
      const rawSummary = buildSessionSummary({
        id: createId(`boss-${boss.id}-${difficulty.id}`),
        mode: 'boss',
        maxCombo: nextScoreState.maxCombo,
        score: nextScoreState.score,
        results: nextResults,
        finishedAt: new Date().toISOString(),
      })
      const applied = applySessionResult(saveData, rawSummary)
      const cleared = nextDamage >= difficulty.hp
      const reward = cleared
        ? applyBossClearReward(applied.save, boss.id, difficulty.id, elapsedMs)
        : {
            save: applied.save,
            firstClear: false,
            rewardItemIds: [],
            rewardUfoIds: [],
            rewardTitles: [],
            grandReward: false,
          }
      setSaveData(reward.save)
      setBattleResult({
        boss,
        difficulty,
        cleared,
        firstClear: reward.firstClear,
        damage: nextDamage,
        elapsedMs,
        rewardItemIds: reward.rewardItemIds,
        rewardUfoIds: reward.rewardUfoIds,
        rewardTitles: reward.rewardTitles,
        grandReward: reward.grandReward,
      })
      setPhase('result')
    },
    [saveData, setSaveData],
  )

  const recordAnswer = useCallback(
    (answer: number | string, forceIncorrect = false) => {
      if (phase !== 'running' || feedback !== 'idle' || !activeBoss || !activeDifficulty || !question) {
        return
      }
      const responseTimeMs = Date.now() - questionStartedAtRef.current
      const withinLimit =
        !activeDifficulty.timeLimitSeconds ||
        responseTimeMs <= activeDifficulty.timeLimitSeconds * 1000
      const correct = !forceIncorrect && withinLimit && isCorrectAnswer(question, answer)
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
      const nextDamage = damage + (correct ? 1 : 0)
      setResults(nextResults)
      setScoreState(nextScoreState)
      setDamage(nextDamage)
      setFeedback(correct ? 'correct' : 'incorrect')
      if (correct) {
        playCorrectSound(saveData.settings.soundEnabled)
      }
      window.setTimeout(() => {
        const nextIndex = questionIndex + 1
        if (nextIndex >= activeDifficulty.questionCount) {
          finishBattle(activeBoss, activeDifficulty, nextResults, nextScoreState, nextDamage)
        } else {
          nextQuestion(activeBoss, activeDifficulty, nextIndex)
        }
      }, 650)
    },
    [
      activeBoss,
      activeDifficulty,
      damage,
      feedback,
      finishBattle,
      nextQuestion,
      phase,
      question,
      questionIndex,
      results,
      saveData.settings.soundEnabled,
      scoreState,
    ],
  )

  useEffect(() => {
    if (
      phase !== 'running' ||
      feedback !== 'idle' ||
      !activeDifficulty?.timeLimitSeconds ||
      !question
    ) {
      return undefined
    }
    const limitMs = activeDifficulty.timeLimitSeconds * 1000
    const interval = window.setInterval(() => {
      const remaining = limitMs - (Date.now() - questionStartedAtRef.current)
      setTimeLeftMs(Math.max(0, remaining))
      if (remaining <= 0) {
        window.clearInterval(interval)
        recordAnswer('時間切れ', true)
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [activeDifficulty, feedback, phase, question, recordAnswer])

  function prepareBattle(boss: BossDefinition, difficulty: BossDifficulty) {
    setActiveBoss(boss)
    setActiveDifficulty(difficulty)
    setQuestion(null)
    setBattleResult(null)
    setPhase('ready')
  }

  function startBattle(boss = activeBoss, difficulty = activeDifficulty) {
    if (!boss || !difficulty) {
      return
    }
    setActiveBoss(boss)
    setActiveDifficulty(difficulty)
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    setDamage(0)
    setBattleResult(null)
    battleStartedAtRef.current = Date.now()
    setPhase('running')
    nextQuestion(boss, difficulty, 0)
  }

  if (phase === 'ready' && activeBoss && activeDifficulty) {
    const backTo = activeBoss.group === 'advanced' ? '/advanced' : '/battle'
    return (
      <AppShell title={activeBoss.label} backTo={backTo}>
        <ModeStartScreen
          title={activeBoss.label}
          eyebrow={activeDifficulty.label}
          description={`${activeDifficulty.questionCount}もんで HP${activeDifficulty.hp} をけずろう。げきムズはミスなしでクリア！`}
          level={saveData.player?.level ?? 1}
          backTo={backTo}
          onStart={() => startBattle(activeBoss, activeDifficulty)}
        >
          <div className="boss-start-summary" aria-label="ボスバトルのじゅんび">
            <span>もんだい {activeDifficulty.questionCount}</span>
            <span>HP {activeDifficulty.hp}</span>
            <span>
              {activeDifficulty.timeLimitSeconds
                ? `1もん ${activeDifficulty.timeLimitSeconds}びょう`
                : 'じかんせいげんなし'}
            </span>
          </div>
        </ModeStartScreen>
      </AppShell>
    )
  }

  if (phase === 'running' && activeBoss && activeDifficulty && question) {
    const limitMs = activeDifficulty.timeLimitSeconds ? activeDifficulty.timeLimitSeconds * 1000 : 0
    const timePercent = limitMs ? Math.max(0, Math.round((timeLeftMs / limitMs) * 100)) : 100
    const activeBossVariant = advancedBossVariantForBossId(activeBoss.id)
    return (
      <AppShell
        title={activeBoss.label}
        backTo={activeBoss.group === 'advanced' ? '/advanced' : '/battle'}
        className="game-shell"
      >
        <section className="boss-arena" aria-labelledby="boss-question">
          <div className="boss-hud">
            <strong className="boss-hud-title">
              {activeBossVariant ? (
                <AdvancedBossSprite
                  variant={activeBossVariant}
                  compact
                  className="boss-hud-sprite"
                />
              ) : (
                <span aria-hidden="true">{activeBoss.emoji}</span>
              )}
              HP {Math.max(0, activeDifficulty.hp - damage)}/{activeDifficulty.hp}
            </strong>
            <span>
              {questionIndex + 1}/{activeDifficulty.questionCount}
            </span>
            <span>{activeDifficulty.label}</span>
          </div>
          {activeDifficulty.timeLimitSeconds ? (
            <div className="boss-time" aria-label={`残り ${formatSeconds(timeLeftMs)}`}>
              <span>のこり {formatSeconds(timeLeftMs)}</span>
              <div>
                <i style={{ width: `${timePercent}%` }} />
              </div>
            </div>
          ) : (
            <p className="quiet-text">時間制限なし。おちついていこう！</p>
          )}
          <h2 id="boss-question" className="question-prompt">
            {question.prompt}
          </h2>
          <GameFeedback state={feedback} correctAnswer={question.answer} />
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

  if (phase === 'result' && battleResult) {
    const hasRewards =
      battleResult.rewardItemIds.length > 0 ||
      battleResult.rewardUfoIds.length > 0 ||
      battleResult.rewardTitles.length > 0
    return (
      <AppShell title={battleResult.boss.label} backTo={battleResult.boss.group === 'advanced' ? '/advanced' : '/battle'}>
        {battleResult.grandReward ? (
          <div className="ufo-celebration" role="status" aria-live="polite">
            <span aria-hidden="true">🎉</span>
            <strong>すべてのげきムズをクリア！</strong>
            <small>スペシャルUFOがなかまになりました</small>
          </div>
        ) : null}
        <section className="boss-result">
          <p className="welcome">
            {battleResult.cleared ? 'クリア！' : 'おしい！もういちど！'}
          </p>
          <h2>
            {battleResult.damage}/{battleResult.difficulty.hp} ダメージ
          </h2>
          <p className="title-line">タイム {formatSeconds(battleResult.elapsedMs)}</p>
          <div className="stats-row compact-stats">
            <StatPill label="しょうぶ" value={battleResult.cleared ? 'かち' : 'おしい'} />
            <StatPill
              label="ボスHP"
              value={`${Math.max(0, battleResult.difficulty.hp - battleResult.damage)}`}
            />
            <StatPill label="くくっちHP" value="げんき" />
            <StatPill label="むずかしさ" value={battleResult.difficulty.label} />
          </div>
          {hasRewards ? (
            <div className="boss-reward-list">
              {battleResult.rewardItemIds.map((itemId) => (
                <span key={itemId}>🎁 {getBossLimitedItem(itemId)?.name ?? itemId}</span>
              ))}
              {battleResult.rewardUfoIds.map((ufoId) => (
                <span key={ufoId}>🛸 {getUfoById(ufoId)?.name ?? ufoId}</span>
              ))}
              {battleResult.rewardTitles.map((title) => (
                <span key={title}>🏷️ {title}</span>
              ))}
            </div>
          ) : (
            <p className="quiet-text">
              {battleResult.cleared ? 'クリアコインをもらったよ。' : 'おこられないからだいじょうぶ。もう一回いこう！'}
            </p>
          )}
          <div className="action-band">
            <button
              className="primary-action"
              type="button"
              onClick={() => prepareBattle(battleResult.boss, battleResult.difficulty)}
            >
              もういちど
            </button>
            <button className="secondary-action" type="button" onClick={() => setPhase('select')}>
              ボス一覧
            </button>
          </div>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell title={group === 'advanced' ? '高学年ボス' : 'ボスバトル'} backTo={group === 'advanced' ? '/advanced' : '/games'}>
      <section className="boss-list" aria-label="ボス一覧">
        {visibleBosses.map((boss) => {
          const unlocked = isBossUnlocked(boss, saveData)
          const clearedStars = getClearedStars(saveData, boss.id)
          const bossVariant = advancedBossVariantForBossId(boss.id)
          const rewardUfo = getUfoForBoss(boss.id)
          const remainingToUnlock = remainingQuestionsToUnlockBoss(boss, saveData)
          const ownsRewardUfo = rewardUfo
            ? saveData.progress.ownedUfos.includes(rewardUfo.id)
            : false
          return (
            <article className={unlocked ? 'boss-card' : 'boss-card locked'} key={boss.id}>
              <span className="boss-no">No.{String(boss.no).padStart(2, '0')}</span>
              {bossVariant ? (
                <AdvancedBossSprite
                  variant={bossVariant}
                  locked={!unlocked}
                  className="boss-card-sprite"
                />
              ) : (
                <span className="boss-emoji" aria-hidden="true">
                  {unlocked ? boss.emoji : '◆'}
                </span>
              )}
              <h2>{unlocked ? boss.label : '？？？'}</h2>
              {!unlocked && remainingToUnlock !== null ? (
                <p className="boss-unlock-progress">あと {remainingToUnlock}もん で かいほう！</p>
              ) : null}
              <p>{unlocked ? boss.description : '条件をみたすと出会えます。'}</p>
              <strong>{'★'.repeat(clearedStars) || '未クリア'}</strong>
              {rewardUfo ? (
                <div className="boss-ufo-preview">
                  <UfoBadge ufo={rewardUfo} locked={!ownsRewardUfo} compact />
                  <small>
                    げきムズ初回クリア報酬：{ownsRewardUfo ? rewardUfo.name : '？？？'}
                  </small>
                </div>
              ) : null}
              <div className="boss-difficulty-row">
                {difficultyIds.map((difficultyId) => {
                  const difficulty = getBossDifficulty(boss, difficultyId)
                  const difficultyUnlocked = isDifficultyUnlocked(boss, difficultyId, saveData)
                  const progress = getDifficultyProgress(saveData, boss.id, difficultyId)
                  const label =
                    difficultyId === 'gekimuzu' && !difficultyUnlocked
                      ? '？？？ 🛸'
                      : difficulty.label
                  return (
                    <button
                      className={progress.cleared ? 'selected' : ''}
                      disabled={!difficultyUnlocked}
                      key={difficultyId}
                      type="button"
                      onClick={() => prepareBattle(boss, difficulty)}
                    >
                      {label}
                      {progress.bestTimeMs ? ` ${formatSeconds(progress.bestTimeMs)}` : ''}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </section>
    </AppShell>
  )
}
