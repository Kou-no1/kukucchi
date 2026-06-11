import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { initializeAudio } from '../../services/audioService'
import { createPlayerFromOnboarding } from '../../storage/saveData'
import type { LearningLevel } from '../../types/game'
import { useSaveData } from '../../hooks/useSaveData'

const iconOptions = ['たまご', 'ほし', 'はな', 'そら']
const levelOptions: Array<{ value: LearningLevel; label: string }> = [
  { value: 'first', label: 'はじめて' },
  { value: 'practicing', label: 'れんしゅう中' },
  { value: 'challenge', label: '九九にちょうせん' },
  { value: 'advanced', label: '高学年チャレンジ' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { saveData, setSaveData } = useSaveData()
  const [nickname, setNickname] = useState('')
  const [icon, setIcon] = useState(iconOptions[0])
  const [learningLevel, setLearningLevel] = useState<LearningLevel>('first')
  const [soundEnabled, setSoundEnabled] = useState(true)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await initializeAudio()
    setSaveData(
      createPlayerFromOnboarding({
        nickname,
        icon,
        learningLevel,
        soundEnabled,
      }),
    )
    navigate('/home')
  }

  if (saveData.player) {
    return <Navigate to="/home" replace />
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-panel" aria-labelledby="onboarding-title">
        <span className="brand-mark big" aria-hidden="true">
          く
        </span>
        <h1 id="onboarding-title">くくっち</h1>
        <form onSubmit={handleSubmit} className="setup-form">
          <label>
            よびな
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={12}
              placeholder="くくとも"
            />
          </label>

          <fieldset>
            <legend>アイコン</legend>
            <div className="segmented">
              {iconOptions.map((option) => (
                <button
                  className={option === icon ? 'selected' : ''}
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  aria-pressed={option === icon}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>れべる</legend>
            <div className="level-list">
              {levelOptions.map((option) => (
                <label key={option.value} className="radio-card">
                  <input
                    type="radio"
                    name="learning-level"
                    value={option.value}
                    checked={learningLevel === option.value}
                    onChange={() => setLearningLevel(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
            />
            音をならす
          </label>

          <button className="primary-action" type="submit">
            はじめる
          </button>
        </form>
      </section>
    </main>
  )
}
