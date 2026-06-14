import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { KukuReadingRuby } from '../../components/game/KukuReadingRuby'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { QuestionVisual } from '../../components/game/QuestionVisual'
import { getKukuReading } from '../../data/kukuReadings'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateMultiplicationFactQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound, speakJapanese } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerMode, AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

const stages = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const goalQuestions = 9

type LearnPhase = 'ready' | 'running'
type LearnOrder = 'random' | 'ascending' | 'descending'
type VisualMode = 'groups' | 'line' | 'addition' | 'reading'

const learnOrderLabels: Record<LearnOrder, string> = {
  random: 'ランダム',
  ascending: '上がり 1→9',
  descending: '下がり 9→1',
}

function shuffleNumbers(values: number[]): number[] {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[target]
    copy[target] = current
  }
  return copy
}

function createLearnOrder(order: LearnOrder): number[] {
  const rights = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  if (order === 'ascending') {
    return rights
  }
  if (order === 'descending') {
    return [...rights].reverse()
  }
  return shuffleNumbers(rights)
}

function createQuestion(stage: number, answerMode: AnswerMode, right: number): Question {
  return generateMultiplicationFactQuestion(stage, right, { answerMode })
}

export function LearnPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const [phase, setPhase] = useState<LearnPhase>('ready')
  const [stage, setStage] = useState(2)
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice')
  const [learnOrder, setLearnOrder] = useState<LearnOrder>('random')
  const [questionOrder, setQuestionOrder] = useState<number[]>(() => createLearnOrder('ascending'))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [visualMode, setVisualMode] = useState<VisualMode>('groups')
  const [showReading, setShowReading] = useState(true)
  const [question, setQuestion] = useState(() => createQuestion(2, 'choice', 1))
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())
  const autoAdvanceTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current)
      }
    }
  }, [])

  function clearAutoAdvanceTimeout() {
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
  }

  function resetQuestion(nextIndex = questionIndex) {
    clearAutoAdvanceTimeout()
    setQuestion(createQuestion(stage, answerMode, questionOrder[nextIndex] ?? 1))
    setQuestionIndex(nextIndex)
    setInputValue('')
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function startLearn() {
    const nextOrder = createLearnOrder(learnOrder)
    clearAutoAdvanceTimeout()
    setQuestionOrder(nextOrder)
    setQuestionIndex(0)
    setQuestion(createQuestion(stage, answerMode, nextOrder[0] ?? 1))
    setInputValue('')
    setFeedback('idle')
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    setVisualMode('groups')
    startedAtRef.current = Date.now()
    setPhase('running')
  }

  function advanceQuestion() {
    const nextIndex = questionIndex + 1
    if (nextIndex >= goalQuestions) {
      return
    }
    resetQuestion(nextIndex)
  }

  function handleAnswer(answer: number | string) {
    if (phase !== 'running' || feedback !== 'idle') {
      return
    }
    const correct = isCorrectAnswer(question, answer)
    const responseTimeMs = Date.now() - startedAtRef.current
    const answeredAt = new Date().toISOString()
    const result: AnswerResult = {
      questionId: question.id,
      prompt: question.prompt,
      expectedAnswer: question.answer,
      givenAnswer: answer,
      correct,
      difficulty: question.difficulty,
      responseTimeMs,
      answeredAt,
    }
    setResults((current) => [...current, result])
    setScoreState((current) => applyAnswerToScore(current, correct, responseTimeMs))
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      playCorrectSound(saveData.settings.soundEnabled)
      const left = Number(question.metadata?.left ?? 2)
      const right = Number(question.metadata?.right ?? 1)
      speakJapanese(getKukuReading(left, right), saveData.settings.speechEnabled)
      if (results.length + 1 < goalQuestions) {
        clearAutoAdvanceTimeout()
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          advanceQuestion()
        }, 700)
      }
    }
  }

  function handleSpeak() {
    const left = Number(question.metadata?.left ?? 2)
    const right = Number(question.metadata?.right ?? 1)
    speakJapanese(getKukuReading(left, right), saveData.settings.speechEnabled)
    setVisualMode('reading')
  }

  const left = Number(question.metadata?.left ?? 2)
  const right = Number(question.metadata?.right ?? 1)
  const revealReading = feedback === 'correct' || visualMode === 'reading'

  function finish() {
    const rawSummary = buildSessionSummary({
      id: createId('learn'),
      mode: 'learn',
      maxCombo: scoreState.maxCombo,
      score: scoreState.score,
      results,
      finishedAt: new Date().toISOString(),
    })
    const applied = applySessionResult(saveData, rawSummary)
    setSaveData(applied.save)
    navigate('/result', { state: { summary: applied.summary } })
  }

  return (
    <AppShell
      title="おぼえる"
      backTo="/games"
      className={phase === 'running' ? 'game-shell learn-game-shell' : 'mode-ready-shell learn-ready-shell'}
    >
      {phase === 'ready' ? (
        <ModeStartScreen
          title={`${stage}のだん れんしゅう`}
          eyebrow="9もんぜんぶチャレンジ"
          description="だんとじゅんばんをえらんで、スタートしよう！"
          level={saveData.player?.level ?? 1}
          backTo="/games"
          onStart={startLearn}
        >
          <div className="stage-select-panel" aria-label="れんしゅうするだん">
            <div className="start-option-header">
              <strong>れんしゅうするだん</strong>
              <span>{stage}のだん</span>
            </div>
            <div className="stage-chip-grid">
              {stages.map((value) => (
                <button
                  className={stage === value ? 'stage-chip selected' : 'stage-chip'}
                  key={value}
                  type="button"
                  onClick={() => setStage(value)}
                  aria-pressed={stage === value}
                >
                  <strong>{value}のだん</strong>
                  <span>9もん</span>
                </button>
              ))}
            </div>
          </div>

          <div className="duration-select-panel" aria-label="じゅんばんをえらぶ">
            <strong>じゅんばん</strong>
            <div className="segmented learn-start-segmented">
              {(['random', 'ascending', 'descending'] as const).map((order) => (
                <button
                  className={learnOrder === order ? 'selected' : ''}
                  key={order}
                  type="button"
                  onClick={() => setLearnOrder(order)}
                  aria-pressed={learnOrder === order}
                >
                  {learnOrderLabels[order]}
                </button>
              ))}
            </div>
          </div>

          <div className="duration-select-panel" aria-label="こたえかたをえらぶ">
            <strong>こたえかた</strong>
            <div className="segmented learn-start-segmented">
              <button
                className={answerMode === 'choice' ? 'selected' : ''}
                type="button"
                onClick={() => setAnswerMode('choice')}
                aria-pressed={answerMode === 'choice'}
              >
                4たく
              </button>
              <button
                className={answerMode === 'input' ? 'selected' : ''}
                type="button"
                onClick={() => setAnswerMode('input')}
                aria-pressed={answerMode === 'input'}
              >
                入力
              </button>
            </div>
          </div>
        </ModeStartScreen>
      ) : (
        <>
          <section className="learn-console learn-run-console" aria-label="練習設定">
            <div className="learn-run-status">
              <span>{stage}のだん</span>
              <strong>{learnOrderLabels[learnOrder]}</strong>
              <small>9もんぜんぶ</small>
            </div>

            <aside className="character-window" aria-label="宇宙ぼうけん">
              <KukucchiCharacter level={saveData.player?.level ?? 1} mood="cheer" />
              <div className="character-window-copy">
                <p className="welcome">くくっち号、しゅっぱつ！</p>
                <h2>{stage}のだんステーション</h2>
              </div>
            </aside>
          </section>

          <section className="game-panel" aria-labelledby="question-title">
            <div className="question-header">
              <span>
                {results.length}/{goalQuestions}
              </span>
              <button type="button" onClick={handleSpeak}>
                聞く
              </button>
            </div>
            <h2 id="question-title" className="question-prompt">
              <KukuReadingRuby
                left={left}
                right={right}
                revealAnswer={revealReading}
                visible={showReading}
              />
              {question.prompt}
            </h2>
            <QuestionVisual
              question={question}
              mode={visualMode}
              hideAnswer={feedback === 'idle'}
              revealReading={revealReading}
            />
            <div className="visual-switches" aria-label="表示を変える">
              {(['groups', 'line', 'addition', 'reading'] as const).map((mode) => (
                <button
                  className={visualMode === mode ? 'selected' : ''}
                  key={mode}
                  type="button"
                  onClick={() => setVisualMode(mode)}
                >
                  {mode === 'groups'
                    ? 'まとまり'
                    : mode === 'line'
                      ? '数直線'
                      : mode === 'addition'
                        ? 'たし算'
                        : '読み'}
                </button>
              ))}
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={showReading}
                  onChange={(event) => setShowReading(event.target.checked)}
                />
                九九の読み方
              </label>
            </div>
            <GameFeedback state={feedback} correctAnswer={question.answer} />
            <AnswerControls
              question={question}
              answerMode={answerMode}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onAnswer={handleAnswer}
              disabled={feedback !== 'idle'}
            />
            <div className="game-actions">
              {feedback === 'incorrect' && results.length < goalQuestions ? (
                <button className="primary-action" type="button" onClick={advanceQuestion}>
                  つぎへ
                </button>
              ) : null}
              {results.length >= goalQuestions ? (
                <button className="primary-action" type="button" onClick={finish}>
                  けっかへ
                </button>
              ) : null}
            </div>
          </section>
        </>
      )}
    </AppShell>
  )
}
