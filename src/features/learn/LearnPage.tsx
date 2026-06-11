import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { QuestionVisual } from '../../components/game/QuestionVisual'
import { getKukuReading } from '../../data/kukuReadings'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import { generateMultiplicationQuestion } from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound, speakJapanese } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerMode, AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

const stages = [2, 3, 4, 5, 6, 7, 8, 9]
const goalQuestions = 5

type VisualMode = 'groups' | 'line' | 'addition' | 'reading'

function createQuestion(stage: number, answerMode: AnswerMode): Question {
  return generateMultiplicationQuestion({ stage, answerMode })
}

export function LearnPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const [stage, setStage] = useState(2)
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice')
  const [visualMode, setVisualMode] = useState<VisualMode>('groups')
  const [hideAnswer, setHideAnswer] = useState(false)
  const [question, setQuestion] = useState(() => createQuestion(2, 'choice'))
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
  })
  const startedAtRef = useRef(Date.now())

  function resetQuestion(nextStage = stage, nextMode = answerMode) {
    setQuestion(createQuestion(nextStage, nextMode))
    setInputValue('')
    setFeedback('idle')
    startedAtRef.current = Date.now()
  }

  function handleStageChange(nextStage: number) {
    setStage(nextStage)
    resetQuestion(nextStage, answerMode)
  }

  function handleModeChange(nextMode: AnswerMode) {
    setAnswerMode(nextMode)
    resetQuestion(stage, nextMode)
  }

  function handleAnswer(answer: number | string) {
    if (feedback !== 'idle') {
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
      responseTimeMs,
      answeredAt,
    }
    setResults((current) => [...current, result])
    setScoreState((current) => applyAnswerToScore(current, correct, responseTimeMs))
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      playCorrectSound(saveData.settings.soundEnabled)
    }
  }

  function handleSpeak() {
    const left = Number(question.metadata?.left ?? 2)
    const right = Number(question.metadata?.right ?? 1)
    speakJapanese(getKukuReading(left, right), saveData.settings.speechEnabled)
    setVisualMode('reading')
  }

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
    <AppShell title="おぼえる" backTo="/games">
      <section className="practice-tools" aria-label="練習設定">
        <div className="stage-strip">
          {stages.map((value) => (
            <button
              className={stage === value ? 'selected' : ''}
              key={value}
              type="button"
              onClick={() => handleStageChange(value)}
            >
              {value}のだん
            </button>
          ))}
        </div>
        <div className="segmented">
          <button
            className={answerMode === 'choice' ? 'selected' : ''}
            type="button"
            onClick={() => handleModeChange('choice')}
          >
            4たく
          </button>
          <button
            className={answerMode === 'input' ? 'selected' : ''}
            type="button"
            onClick={() => handleModeChange('input')}
          >
            入力
          </button>
        </div>
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
          {question.prompt}
        </h2>
        <QuestionVisual question={question} mode={visualMode} hideAnswer={hideAnswer} />
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
              checked={hideAnswer}
              onChange={(event) => setHideAnswer(event.target.checked)}
            />
            答えをかくす
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
          {feedback !== 'idle' && results.length < goalQuestions ? (
            <button className="primary-action" type="button" onClick={() => resetQuestion()}>
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
    </AppShell>
  )
}
