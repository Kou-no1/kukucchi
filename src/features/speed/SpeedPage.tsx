import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { defaultSpeedStages, speedDurations } from '../../data/factDifficulty'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { averageStageDifficulty } from '../../game-engine/questions/factDifficulty'
import { generateMultiplicationQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

type SpeedPhase = 'ready' | 'running'

const allStages = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function createSpeedQuestion(selectedStages: number[]): Question {
  return generateMultiplicationQuestion({
    answerMode: 'choice',
    stages: selectedStages,
    minDifficulty: 1,
  })
}

function stageStars(stage: number): string {
  return '★'.repeat(Math.max(1, Math.round(averageStageDifficulty(stage))))
}

export function SpeedPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData, updateSaveData } = useSaveData()
  const savedSpeedSettings = saveData.progress.speedSettings
  const initialStages =
    savedSpeedSettings.selectedStages.length > 0
      ? savedSpeedSettings.selectedStages
      : [...defaultSpeedStages]
  const [phase, setPhase] = useState<SpeedPhase>('ready')
  const [selectedStages, setSelectedStages] = useState<number[]>(initialStages)
  const [durationSeconds, setDurationSeconds] = useState(savedSpeedSettings.durationSeconds)
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [question, setQuestion] = useState(() => createSpeedQuestion(initialStages))
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())
  const finishedRef = useRef(false)

  const sortedStages = useMemo(
    () => [...selectedStages].sort((left, right) => left - right),
    [selectedStages],
  )

  const createQuestion = useCallback(
    () => createSpeedQuestion(sortedStages),
    [sortedStages],
  )

  const saveSpeedSettings = useCallback(
    (nextStages: number[], nextDuration = durationSeconds) => {
      updateSaveData((current) => ({
        ...current,
        progress: {
          ...current.progress,
          speedSettings: {
            selectedStages: nextStages,
            durationSeconds: nextDuration,
          },
        },
      }))
    },
    [durationSeconds, updateSaveData],
  )

  const finish = useCallback(() => {
    if (finishedRef.current || phase !== 'running') {
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
  }, [navigate, phase, results, saveData, scoreState.maxCombo, scoreState.score, setSaveData])

  useEffect(() => {
    if (phase !== 'running') {
      return undefined
    }
    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase === 'running' && timeLeft === 0) {
      finish()
    }
  }, [finish, phase, timeLeft])

  function toggleStage(stage: number) {
    const exists = selectedStages.includes(stage)
    const nextStages = exists
      ? selectedStages.filter((candidate) => candidate !== stage)
      : [...selectedStages, stage]
    if (nextStages.length === 0) {
      return
    }
    const sorted = nextStages.sort((left, right) => left - right)
    setSelectedStages(sorted)
    saveSpeedSettings(sorted)
  }

  function toggleAllStages() {
    const nextStages = selectedStages.length === allStages.length ? [2] : [...allStages]
    setSelectedStages(nextStages)
    saveSpeedSettings(nextStages)
  }

  function changeDuration(nextDuration: number) {
    setDurationSeconds(nextDuration)
    saveSpeedSettings(selectedStages, nextDuration)
  }

  function startGame() {
    finishedRef.current = false
    setPhase('running')
    setTimeLeft(durationSeconds)
    setQuestion(createQuestion())
    setFeedback('idle')
    setResults([])
    setScoreState({
      score: 0,
      combo: 0,
      maxCombo: 0,
    })
    startedAtRef.current = Date.now()
  }

  function nextQuestion() {
    setQuestion(createQuestion())
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function handleAnswer(answer: number | string) {
    if (phase !== 'running' || feedback !== 'idle' || timeLeft <= 0) {
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
      {phase === 'ready' ? (
        <ModeStartScreen
          title={`${durationSeconds}秒チャレンジ`}
          eyebrow="ワープ準備OK"
          description="だんをえらんで、じぶんのきろくにちょうせん！"
          level={saveData.player?.level ?? 1}
          backTo="/games"
          onStart={startGame}
        >
          <div className="stage-select-panel" aria-label="だんをえらぶ">
            <div className="start-option-header">
              <strong>だん選択</strong>
              <button className="secondary-action compact-action" type="button" onClick={toggleAllStages}>
                ぜんぶ
              </button>
            </div>
            <div className="stage-chip-grid">
              {allStages.map((stage) => {
                const selected = selectedStages.includes(stage)
                const stars = stageStars(stage)
                return (
                  <button
                    className={selected ? 'stage-chip selected' : 'stage-chip'}
                    key={stage}
                    type="button"
                    onClick={() => toggleStage(stage)}
                    aria-pressed={selected}
                  >
                    <strong>{stage}のだん</strong>
                    <span>{stars}</span>
                    {stars.length >= 4 ? <small>けいけんちアップ！</small> : null}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="duration-select-panel" aria-label="チャレンジ時間">
            <strong>チャレンジ</strong>
            <div className="segmented">
              {speedDurations.map((duration) => (
                <button
                  className={durationSeconds === duration ? 'selected' : ''}
                  key={duration}
                  type="button"
                  onClick={() => changeDuration(duration)}
                >
                  {duration}秒
                </button>
              ))}
            </div>
          </div>
        </ModeStartScreen>
      ) : (
        <>
          <section className="speed-command" aria-label="スピード情報">
            <div className="speed-summary">
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
            </div>

            <aside className="mission-companion speed-companion" aria-label="宇宙ぼうけん">
              <KukucchiCharacter level={saveData.player?.level ?? 1} mood="cheer" />
              <div>
                <p className="welcome">タイムワープ中</p>
                <h2>{durationSeconds}秒チャレンジ</h2>
                <p className="title-line">{sortedStages.join('・')}のだんから出題中</p>
              </div>
            </aside>
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
        </>
      )}
    </AppShell>
  )
}
