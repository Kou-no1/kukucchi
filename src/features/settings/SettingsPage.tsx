import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { TutorialModal } from '../../components/common/TutorialModal'
import { createFactProgress } from '../../game-engine/mastery/mastery'
import { useSaveData } from '../../hooks/useSaveData'
import { parseSaveData } from '../../storage/saveData'

export function SettingsPage() {
  const { saveData, setSaveData, updateSaveData, resetSaveData } = useSaveData()
  const [importText, setImportText] = useState('')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const backupText = useMemo(() => JSON.stringify(saveData, null, 2), [saveData])

  function updateSetting(key: 'soundEnabled' | 'speechEnabled' | 'reduceMotion') {
    updateSaveData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: !current.settings[key],
      },
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
      setSaveData(parseSaveData(text))
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
