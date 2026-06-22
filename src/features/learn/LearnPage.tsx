import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { AnswerControls } from '../../components/game/AnswerControls'
import { GameFeedback } from '../../components/game/GameFeedback'
import { KukuReadingRuby } from '../../components/game/KukuReadingRuby'
import { ModeStartScreen } from '../../components/game/ModeStartScreen'
import { QuestionVisual } from '../../components/game/QuestionVisual'
import {
  additionAreas,
  getAdditionAreaById,
  isAdditionAreaId,
  type AdditionAreaId,
} from '../../data/planets'
import { getKukuReading } from '../../data/kukuReadings'
import { isCorrectAnswer } from '../../game-engine/questions/answer'
import {
  generateAdditionQuestion,
  generateAdaptiveAdditionQuestion,
  generateAdvancedQuestion,
  generateMultiplicationFactQuestion,
} from '../../game-engine/questions/questionGenerator'
import { buildSessionSummary } from '../../game-engine/rewards/rewards'
import { applyAnswerToScore } from '../../game-engine/scoring/score'
import { resultIncorrectStreak } from '../../game-engine/school/schoolMode2'
import { useDailyUsage } from '../../hooks/useDailyUsage'
import { useSaveData } from '../../hooks/useSaveData'
import { playCorrectSound, speakJapanese } from '../../services/audioService'
import { applySessionResult } from '../../services/resultService'
import type { AnswerMode, AnswerResult, Question, ScoreState } from '../../types/game'
import { createId } from '../../utils/id'

const stages = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const goalQuestions = 9

type LearnPhase = 'ready' | 'running'
type LearnKind = 'kuku' | 'addition' | 'square' | 'pi'
type LearnOrder = 'random' | 'ascending' | 'descending'
type VisualMode = 'groups' | 'line' | 'addition' | 'reading'

const learnKindLabels: Record<LearnKind, string> = {
  kuku: '九九',
  addition: 'たしざん',
  square: '平方数',
  pi: '円周率',
}

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

function createKukuQuestion(stage: number, answerMode: AnswerMode, right: number): Question {
  return generateMultiplicationFactQuestion(stage, right, { answerMode })
}

function createLearnQuestion(
  {
    kind,
    stage,
    answerMode,
    right,
    additionAreaId,
    facts,
    schoolMode2Enabled,
    recentIncorrectCount,
  }: {
    kind: LearnKind
    stage: number
    answerMode: AnswerMode
    right: number
    additionAreaId: AdditionAreaId
    facts: Parameters<typeof generateAdaptiveAdditionQuestion>[0]
    schoolMode2Enabled: boolean
    recentIncorrectCount: number
  },
): Question {
  if (kind === 'addition') {
    return generateAdaptiveAdditionQuestion(facts, additionAreaId, {
      schoolMode2Enabled,
      recentIncorrectCount,
    })
  }
  if (kind === 'square') {
    return generateAdvancedQuestion('square')
  }
  if (kind === 'pi') {
    return generateAdvancedQuestion('pi')
  }
  return createKukuQuestion(stage, answerMode, right)
}

export function LearnPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { saveData, setSaveData } = useSaveData()
  const { rewardBudgetReached } = useDailyUsage()
  const fromAdditionPlanet = searchParams.get('planet') === 'add'
  const initialLearnKind: LearnKind = fromAdditionPlanet ? 'addition' : 'kuku'
  const requestedAreaId = searchParams.get('area')
  const initialAdditionAreaId: AdditionAreaId = isAdditionAreaId(requestedAreaId)
    ? requestedAreaId
    : 'add-within-9'
  const [phase, setPhase] = useState<LearnPhase>('ready')
  const [learnKind, setLearnKind] = useState<LearnKind>(initialLearnKind)
  const [additionAreaId, setAdditionAreaId] = useState<AdditionAreaId>(initialAdditionAreaId)
  const [stage, setStage] = useState(2)
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice')
  const [learnOrder, setLearnOrder] = useState<LearnOrder>('random')
  const [questionOrder, setQuestionOrder] = useState<number[]>(() => createLearnOrder('ascending'))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [visualMode, setVisualMode] = useState<VisualMode>('groups')
  const [showReading, setShowReading] = useState(true)
  const [question, setQuestion] = useState(() =>
    initialLearnKind === 'addition'
      ? generateAdditionQuestion(initialAdditionAreaId)
      : createKukuQuestion(2, 'choice', 1),
  )
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

  const selectedAdditionArea = getAdditionAreaById(additionAreaId)

  function createCurrentQuestion(nextIndex: number, completedResults: AnswerResult[]): Question {
    const activeAnswerMode = learnKind === 'pi' || learnKind === 'addition' ? 'choice' : answerMode
    return createLearnQuestion({
      kind: learnKind,
      stage,
      answerMode: activeAnswerMode,
      right: questionOrder[nextIndex] ?? 1,
      additionAreaId,
      facts: saveData.progress.facts,
      schoolMode2Enabled: saveData.settings.schoolMode2Enabled,
      recentIncorrectCount: resultIncorrectStreak(completedResults),
    })
  }

  function resetQuestion(nextIndex = questionIndex, completedResults = results) {
    clearAutoAdvanceTimeout()
    setQuestion(createCurrentQuestion(nextIndex, completedResults))
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
    setQuestion(
      createLearnQuestion({
        kind: learnKind,
        stage,
        answerMode: learnKind === 'pi' || learnKind === 'addition' ? 'choice' : answerMode,
        right: nextOrder[0] ?? 1,
        additionAreaId,
        facts: saveData.progress.facts,
        schoolMode2Enabled: saveData.settings.schoolMode2Enabled,
        recentIncorrectCount: 0,
      }),
    )
    setInputValue('')
    setFeedback('idle')
    setResults([])
    setScoreState({ score: 0, combo: 0, maxCombo: 0 })
    setVisualMode('groups')
    startedAtRef.current = Date.now()
    setPhase('running')
  }

  function changeLearnKind(nextKind: LearnKind) {
    setLearnKind(nextKind)
    if (nextKind !== 'kuku') {
      setAnswerMode('choice')
    }
  }

  function advanceQuestion(completedResults = results) {
    const nextIndex = questionIndex + 1
    if (nextIndex >= goalQuestions) {
      return
    }
    resetQuestion(nextIndex, completedResults)
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
    const nextResults = [...results, result]
    setResults(nextResults)
    setScoreState((current) => applyAnswerToScore(current, correct, responseTimeMs))
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) {
      playCorrectSound(saveData.settings.soundEnabled)
      if (learnKind === 'kuku') {
        const left = Number(question.metadata?.left ?? 2)
        const right = Number(question.metadata?.right ?? 1)
        speakJapanese(getKukuReading(left, right), saveData.settings.speechEnabled)
      }
      if (nextResults.length < goalQuestions) {
        clearAutoAdvanceTimeout()
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          advanceQuestion(nextResults)
        }, 700)
      }
    }
  }

  function handleSpeak() {
    if (learnKind !== 'kuku') {
      speakJapanese(`${question.prompt}、こたえは ${question.answer}`, saveData.settings.speechEnabled)
      return
    }
    const left = Number(question.metadata?.left ?? 2)
    const right = Number(question.metadata?.right ?? 1)
    speakJapanese(getKukuReading(left, right), saveData.settings.speechEnabled)
    setVisualMode('reading')
  }

  const left = Number(question.metadata?.left ?? 2)
  const right = Number(question.metadata?.right ?? 1)
  const revealReading = learnKind === 'kuku' && (feedback === 'correct' || visualMode === 'reading')
  const activeAnswerMode = learnKind === 'pi' || learnKind === 'addition' ? 'choice' : answerMode
  const backToPlanet = learnKind === 'addition' ? '/planet/add' : '/planet/multiply'

  function finish() {
    const rawSummary = buildSessionSummary({
      id: createId('learn'),
      mode: 'learn',
      maxCombo: scoreState.maxCombo,
      score: scoreState.score,
      results,
      details: {
        learnKind,
        planet: learnKind === 'addition' ? 'add' : 'multiply',
        areaId: learnKind === 'addition' ? additionAreaId : null,
        areaName: learnKind === 'addition' ? selectedAdditionArea.name : null,
      },
      finishedAt: new Date().toISOString(),
    })
    const applied = applySessionResult(saveData, rawSummary, {
      rewardBudgetPaused: rewardBudgetReached,
    })
    setSaveData(applied.save)
    navigate('/result', { state: { summary: applied.summary } })
  }

  return (
    <AppShell
      title="おぼえる"
      backTo={backToPlanet}
      className={phase === 'running' ? 'game-shell learn-game-shell' : 'mode-ready-shell learn-ready-shell'}
    >
      {phase === 'ready' ? (
        <ModeStartScreen
          title={
            learnKind === 'kuku'
              ? `${stage}のだん れんしゅう`
              : learnKind === 'addition'
                ? `${selectedAdditionArea.name} れんしゅう`
                : `${learnKindLabels[learnKind]} れんしゅう`
          }
          eyebrow="9もんぜんぶチャレンジ"
          description="けいさんとこたえかたをえらんで、スタートしよう！"
          level={saveData.player?.level ?? 1}
          backTo={backToPlanet}
          onStart={startLearn}
        >
          {!fromAdditionPlanet ? (
            <div className="duration-select-panel learn-kind-panel" aria-label="けいさんをえらぶ">
              <strong>けいさん</strong>
              <div className="segmented learn-start-segmented">
                {(['kuku', 'addition', 'square', 'pi'] as const).map((kind) => (
                  <button
                    className={learnKind === kind ? 'selected' : ''}
                    key={kind}
                    type="button"
                    onClick={() => changeLearnKind(kind)}
                    aria-pressed={learnKind === kind}
                  >
                    {learnKindLabels[kind]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {learnKind === 'kuku' ? (
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
          ) : null}

          {learnKind === 'addition' ? (
            <div className="stage-select-panel addition-area-panel" aria-label="れんしゅうするエリア">
              <div className="start-option-header">
                <strong>れんしゅうするエリア</strong>
                <span>{selectedAdditionArea.shortName}</span>
              </div>
              <div className="stage-chip-grid addition-area-grid">
                {additionAreas.map((area) => (
                  <button
                    className={additionAreaId === area.id ? 'stage-chip selected addition-area-chip' : 'stage-chip addition-area-chip'}
                    key={area.id}
                    type="button"
                    onClick={() => setAdditionAreaId(area.id)}
                    aria-pressed={additionAreaId === area.id}
                  >
                    <strong>{area.name}</strong>
                    <span>{area.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {learnKind === 'kuku' ? (
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
          ) : null}

          <div className="duration-select-panel" aria-label="こたえかたをえらぶ">
            <strong>こたえかた</strong>
            <div className="segmented learn-start-segmented">
              <button
                className={activeAnswerMode === 'choice' ? 'selected' : ''}
                type="button"
                onClick={() => setAnswerMode('choice')}
                aria-pressed={activeAnswerMode === 'choice'}
              >
                4たく
              </button>
              <button
                className={activeAnswerMode === 'input' ? 'selected' : ''}
                type="button"
                onClick={() => setAnswerMode('input')}
                aria-pressed={activeAnswerMode === 'input'}
                disabled={learnKind === 'pi' || learnKind === 'addition'}
                aria-disabled={learnKind === 'pi' || learnKind === 'addition'}
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
              <span>
                {learnKind === 'kuku'
                  ? `${stage}のだん`
                  : learnKind === 'addition'
                    ? 'たしざんのほし'
                    : learnKindLabels[learnKind]}
              </span>
              <strong>
                {learnKind === 'kuku'
                  ? learnOrderLabels[learnOrder]
                  : learnKind === 'addition'
                    ? selectedAdditionArea.name
                    : '9もんチャレンジ'}
              </strong>
              <small>9もんぜんぶ</small>
            </div>

            <aside className="character-window" aria-label="宇宙ぼうけん">
              <KukucchiCharacter level={saveData.player?.level ?? 1} mood="cheer" />
              <div className="character-window-copy">
                <p className="welcome">くくっち号、しゅっぱつ！</p>
                <h2>{learnKind === 'kuku' ? `${stage}のだんステーション` : `${learnKindLabels[learnKind]}ステーション`}</h2>
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
              {learnKind === 'kuku' ? (
                <KukuReadingRuby
                  left={left}
                  right={right}
                  revealAnswer={revealReading}
                  visible={showReading}
                />
              ) : null}
              {question.prompt}
            </h2>
            {learnKind === 'kuku' ? (
              <>
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
              </>
            ) : feedback !== 'idle' && question.explanation ? (
              <p className="quiet-text">{question.explanation}</p>
            ) : null}
            <GameFeedback state={feedback} correctAnswer={question.answer} />
            <AnswerControls
              question={question}
              answerMode={activeAnswerMode}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onAnswer={handleAnswer}
              disabled={feedback !== 'idle'}
            />
            <div className="game-actions">
              {feedback === 'incorrect' && results.length < goalQuestions ? (
                <button className="primary-action" type="button" onClick={() => advanceQuestion(results)}>
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
