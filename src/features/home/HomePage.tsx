import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import { TutorialModal } from '../../components/common/TutorialModal'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { UfoBadge } from '../../components/collection/UfoBadge'
import { getPlayerIcon } from '../../data/playerIcons'
import { equipmentSlots, getEquippedItemForSlot } from '../../data/shopItems'
import { getUfoById } from '../../data/ufos'
import { getWeakFacts } from '../../game-engine/review/weakFacts'
import { useSaveData } from '../../hooks/useSaveData'

export function HomePage() {
  const { saveData, updateSaveData } = useSaveData()
  const player = saveData.player
  const weakFacts = getWeakFacts(saveData.progress.facts, 3)
  const equippedUfo = getUfoById(saveData.progress.equippedUfoId)
  const [tutorialOpen, setTutorialOpen] = useState(!saveData.tutorial.homeSeen)
  const titles = player?.titles.length ? player.titles : ['はじめのいっぽ']
  const playerIcon = getPlayerIcon(player?.icon)

  function closeTutorial() {
    setTutorialOpen(false)
    updateSaveData((current) => ({
      ...current,
      tutorial: {
        ...current.tutorial,
        homeSeen: true,
      },
    }))
  }

  function chooseTitle(title: string) {
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

  return (
    <AppShell
      title="ホーム"
      rightAction={
        <button className="top-help-button" type="button" onClick={() => setTutorialOpen(true)}>
          あそびかた
        </button>
      }
    >
      <section className="home-command">
        <div className="home-profile">
          <div className="home-title-block">
            <div className="home-name-row">
              <span className="player-icon-badge" aria-label={`${playerIcon.label}アイコン`}>
                {playerIcon.emoji}
              </span>
              <h2>{player?.nickname ?? 'くくとも'}</h2>
            </div>
            <p className="title-line">{player?.currentTitle ?? 'はじめのいっぽ'}</p>
          </div>

          <section className="home-mission-compact" aria-labelledby="mission-title">
            <h2 id="mission-title">今日のミッション</h2>
            <div className="mission-list">
              {saveData.progress.missions.slice(0, 3).map((mission) => (
                <div className="mission-item" key={mission.id}>
                  <span>{mission.label}</span>
                  <strong>
                    {mission.progress}/{mission.target}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="home-stats-mini" aria-label="プレイヤー情報">
            <StatPill label="Lv" value={player?.level ?? 1} icon="01" />
            <StatPill label="EXP" value={player?.exp ?? 0} icon="★" />
            <StatPill label="コイン" value={player?.coins ?? 0} icon="●" />
          </section>

          <section className="home-equipment-slots" aria-label="そうび">
            {equipmentSlots.map((slot) => {
              const item = getEquippedItemForSlot(saveData.progress.equippedItems, slot.id)
              return (
                <div className={item ? 'equipment-slot equipped' : 'equipment-slot'} key={slot.id}>
                  <span aria-hidden="true">{item?.emoji ?? '◇'}</span>
                  <small>{slot.label}</small>
                  <strong>{item?.name ?? slot.emptyLabel}</strong>
                </div>
              )
            })}
          </section>
        </div>

        <aside className="character-window home-character-window" aria-label="くくっち">
          {equippedUfo ? <UfoBadge ufo={equippedUfo} compact className="home-equipped-ufo" /> : null}
          <KukucchiCharacter level={player?.level ?? 1} mood="happy" />
          <div className="character-window-copy">
            <p className="welcome">クルー待機中</p>
            <h2>くくっち号</h2>
          </div>
        </aside>
      </section>

      <section className="home-card-grid home-main-actions" aria-label="メインメニュー">
        <Link className="home-menu-card home-menu-card-large" to="/games" aria-label="あそぶ">
          <span className="home-card-emoji" aria-hidden="true">
            🚀
          </span>
          <strong>あそぶ</strong>
          <small>ゲームへワープ</small>
        </Link>
        <Link className="home-menu-card home-menu-card-large" to="/learn" aria-label="おぼえる">
          <span className="home-card-emoji" aria-hidden="true">
            🌟
          </span>
          <strong>おぼえる</strong>
          <small>
            だんを
            <br />
            れんしゅう
          </small>
        </Link>
        <Link className="home-menu-card home-menu-card-large" to="/speed" aria-label="スピード">
          <span className="home-card-emoji" aria-hidden="true">
            ⚡
          </span>
          <strong>スピード</strong>
          <small>
            30秒
            <br />
            チャレンジ
          </small>
        </Link>
      </section>

      <section className="home-card-grid home-sub-actions" aria-label="そのほか">
        <Link className="home-menu-card" to="/advanced" aria-label="高学年">
          <span className="home-card-emoji" aria-hidden="true">
            🪐
          </span>
          <strong>高学年</strong>
          <small>スーパー計算</small>
        </Link>
        <Link className="home-menu-card" to="/book" aria-label="図かん">
          <span className="home-card-emoji" aria-hidden="true">
            📘
          </span>
          <strong>図かん</strong>
          <small>モンスター</small>
        </Link>
        <Link className="home-menu-card" to="/shop" aria-label="ショップ">
          <span className="home-card-emoji" aria-hidden="true">
            🛸
          </span>
          <strong>ショップ</strong>
          <small>船内カスタム</small>
        </Link>
        <Link className="home-menu-card" to="/settings" aria-label="せってい">
          <span className="home-card-emoji" aria-hidden="true">
            ⚙️
          </span>
          <strong>せってい</strong>
          <small>音と表示</small>
        </Link>
      </section>

      <section className="title-card-section" aria-labelledby="title-card-heading">
        <h2 id="title-card-heading">しょうごうカード</h2>
        <div className="title-card-strip">
          {titles.slice(0, 6).map((title) => {
            const selected = player?.currentTitle === title
            return (
              <button
                className={selected ? 'title-card selected' : 'title-card'}
                type="button"
                key={title}
                onClick={() => chooseTitle(title)}
                aria-pressed={selected}
              >
                <span aria-hidden="true">🏷️</span>
                <strong>{title}</strong>
              </button>
            )
          })}
        </div>
      </section>

      <section className="weak-section" aria-labelledby="weak-title">
        <h2 id="weak-title">にがて</h2>
        {weakFacts.length === 0 ? (
          <p className="quiet-text">まだありません</p>
        ) : (
          <div className="fact-list">
            {weakFacts.map((fact) => (
              <span key={fact.id}>
                {fact.left} × {fact.right}
              </span>
            ))}
          </div>
        )}
      </section>

      {tutorialOpen ? <TutorialModal onClose={closeTutorial} /> : null}

    </AppShell>
  )
}
