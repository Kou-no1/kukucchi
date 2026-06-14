import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { TutorialModal } from '../../components/common/TutorialModal'
import { playerIcons } from '../../data/playerIcons'
import { defaultShipName, normalizeShipNameInput, validateShipName } from '../../data/shipName'
import { createFactProgress } from '../../game-engine/mastery/mastery'
import { DAILY_BUDGET_OPTIONS, type DailyBudgetMinutes } from '../../game-engine/school/dailyUsage'
import { useSaveData } from '../../hooks/useSaveData'
import { parseSaveData } from '../../storage/saveData'

const teacherSettingsCode = '9631'

export function SettingsPage() {
  const { saveData, setSaveData, updateSaveData, resetSaveData } = useSaveData()
  const [importText, setImportText] = useState('')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [shipNameInput, setShipNameInput] = useState(saveData.player?.shipName ?? defaultShipName)
  const [shipNameMessage, setShipNameMessage] = useState('かな5もじまで')
  const [teacherUnlocked, setTeacherUnlocked] = useState(false)
  const [teacherCodeInput, setTeacherCodeInput] = useState('')
  const [teacherMessage, setTeacherMessage] = useState('せんせいコードがひつようです')
  const backupText = useMemo(() => JSON.stringify(saveData, null, 2), [saveData])
  const ownedTitles = saveData.player?.titles.length ? saveData.player.titles : ['はじめのいっぽ']

  function updateSetting(key: 'soundEnabled' | 'speechEnabled' | 'reduceMotion') {
    updateSaveData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: !current.settings[key],
      },
    }))
  }

  function updateDailyBudget(dailyBudgetMinutes: DailyBudgetMinutes) {
    updateSaveData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        dailyBudgetMinutes,
      },
    }))
  }

  function unlockTeacherSettings() {
    if (teacherCodeInput === teacherSettingsCode) {
      setTeacherUnlocked(true)
      setTeacherMessage('ひらきました')
      setTeacherCodeInput('')
      return
    }
    setTeacherMessage('せんせいに きいてね')
    setTeacherCodeInput('')
  }

  function updateIcon(icon: string) {
    updateSaveData((current) => ({
      ...current,
      player: current.player
        ? {
            ...current.player,
            icon,
          }
        : current.player,
    }))
  }

  function updateShipName(value: string) {
    const nextValue = normalizeShipNameInput(value)
    const result = validateShipName(nextValue)
    setShipNameInput(nextValue)
    setShipNameMessage(result.message)
    if (!result.ok) {
      return
    }
    updateSaveData((current) => ({
      ...current,
      player: current.player
        ? {
            ...current.player,
            shipName: result.value,
          }
        : current.player,
    }))
  }

  function updateCurrentTitle(title: string) {
    updateSaveData((current) => ({
      ...current,
      player: current.player
        ? {
            ...current.player,
            currentTitle: title,
          }
        : current.player,
    }))
  }

  function downloadBackup() {
    const blob = new Blob([backupText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `kukucchi-save-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function restoreFromText(text: string) {
    if (!text.trim()) {
      return
    }
    if (!window.confirm('データをひきつぎます。今のデータは上書きされます。')) {
      return
    }
    try {
      const nextSave = parseSaveData(text)
      setSaveData(nextSave)
      setShipNameInput(nextSave.player?.shipName ?? defaultShipName)
      setShipNameMessage('かな5もじまで')
      setImportText('')
    } catch (error) {
      console.error('ひきつぎに失敗しました', error)
      window.alert('データを読みこめませんでした')
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    restoreFromText(await file.text())
    event.target.value = ''
  }

  function unlockAllStages() {
    updateSaveData((current) => {
      const facts = { ...current.progress.facts }
      for (let left = 2; left <= 9; left += 1) {
        for (let right = 1; right <= 9; right += 1) {
          const fact = createFactProgress(left, right)
          facts[fact.id] = {
            ...fact,
            correctCount: 5,
            consecutiveCorrect: 5,
            masteryLevel: 4,
            averageResponseTimeMs: 2500,
            bestResponseTimeMs: 1800,
          }
        }
      }
      return {
        ...current,
        progress: { ...current.progress, facts },
      }
    })
  }

  return (
    <AppShell title="せってい" backTo="/home">
      <section className="settings-section" aria-labelledby="icon-title">
        <h2 id="icon-title">アイコン</h2>
        <div className="segmented icon-picker">
          {playerIcons.map((icon) => (
            <button
              className={saveData.player?.icon === icon.id ? 'selected' : ''}
              type="button"
              key={icon.id}
              onClick={() => updateIcon(icon.id)}
              aria-pressed={saveData.player?.icon === icon.id}
            >
              <span aria-hidden="true">{icon.emoji}</span>
              {icon.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section" aria-labelledby="ship-title">
        <h2 id="ship-title">うちゅうせん</h2>
        <label>
          ふねのなまえ
          <input
            value={shipNameInput}
            maxLength={5}
            onChange={(event) => updateShipName(event.target.value)}
            placeholder={defaultShipName}
            aria-describedby="ship-name-help"
          />
        </label>
        <p
          className={shipNameMessage === 'ほぞんしました' ? 'quiet-text' : 'form-help'}
          id="ship-name-help"
        >
          {shipNameMessage}
        </p>
        <label>
          ホームのしょうごう
          <select
            value={saveData.player?.currentTitle ?? ownedTitles[0]}
            onChange={(event) => updateCurrentTitle(event.target.value)}
          >
            {ownedTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="settings-section" aria-labelledby="sound-title">
        <h2 id="sound-title">音と動き</h2>
        <button className="secondary-action wide" type="button" onClick={() => setTutorialOpen(true)}>
          あそびかた
        </button>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={saveData.settings.soundEnabled}
            onChange={() => updateSetting('soundEnabled')}
          />
          効果音
        </label>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={saveData.settings.speechEnabled}
            onChange={() => updateSetting('speechEnabled')}
          />
          読み上げ
        </label>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={saveData.settings.reduceMotion}
            onChange={() => updateSetting('reduceMotion')}
          />
          アニメーション軽減
        </label>
      </section>

      <details className="settings-section">
        <summary>せんせい・ほごしゃ</summary>
        <div className="teacher-settings-panel">
          {!teacherUnlocked ? (
            <div className="teacher-lock-panel">
              <p className="quiet-text">
                ここは せんせい・ほごしゃが つかいます。
              </p>
              <label>
                せんせいコード
                <input
                  value={teacherCodeInput}
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) =>
                    setTeacherCodeInput(event.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      unlockTeacherSettings()
                    }
                  }}
                  aria-describedby="teacher-code-help"
                />
              </label>
              <p className="form-help" id="teacher-code-help">
                {teacherMessage}
              </p>
              <button className="secondary-action wide" type="button" onClick={unlockTeacherSettings}>
                ひらく
              </button>
            </div>
          ) : (
            <div className="teacher-budget-panel">
              <h2>1日のじかん</h2>
              <p className="quiet-text">
                じかんをすぎても あそべます。コインとEXPだけ とまります。
              </p>
              <div className="segmented budget-segmented" aria-label="1日のじかん">
                {DAILY_BUDGET_OPTIONS.map((minutes) => (
                  <button
                    className={saveData.settings.dailyBudgetMinutes === minutes ? 'selected' : ''}
                    key={minutes}
                    type="button"
                    onClick={() => updateDailyBudget(minutes)}
                    aria-pressed={saveData.settings.dailyBudgetMinutes === minutes}
                  >
                    {minutes === 0 ? 'オフ' : `${minutes}分`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </details>

      <section className="settings-section" aria-labelledby="backup-title">
        <h2 id="backup-title">データ</h2>
        <p className="quiet-text">保護者・先生向け: JSONで保存とひきつぎができます。</p>
        <button className="secondary-action wide" type="button" onClick={downloadBackup}>
          データをほぞんする
        </button>
        <textarea value={backupText} readOnly aria-label="コピー用セーブデータ" />
        <label className="file-button">
          ファイルからひきつぐ
          <input type="file" accept="application/json,.json" onChange={handleFile} />
        </label>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="ここにデータを貼り付け"
          aria-label="貼り付け用セーブデータ"
        />
        <button
          className="secondary-action wide"
          type="button"
          onClick={() => restoreFromText(importText)}
        >
          データをひきつぐ
        </button>
      </section>

      <details className="settings-section">
        <summary>せんせいメニュー</summary>
        <div className="dev-actions">
          <button
            type="button"
            onClick={() =>
              updateSaveData((current) => ({
                ...current,
                player: current.player
                  ? { ...current.player, coins: current.player.coins + 100 }
                  : current.player,
              }))
            }
          >
            テスト用コイン追加
          </button>
          <button type="button" onClick={unlockAllStages}>
            全ステージ解放
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('セーブデータを初期化します。')) {
                resetSaveData()
              }
            }}
          >
            セーブ初期化
          </button>
        </div>
      </details>

      <Link className="primary-action wide" to="/home">
        ホームへ
      </Link>
      {tutorialOpen ? <TutorialModal onClose={() => setTutorialOpen(false)} /> : null}
    </AppShell>
  )
}
