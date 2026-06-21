import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import { TutorialModal } from '../../components/common/TutorialModal'
import { BuddySprite } from '../../components/collection/BuddySprite'
import { LevelIconBadge } from '../../components/collection/LevelIconBadge'
import { MonsterSprite } from '../../components/collection/MonsterSprite'
import { TitleEmblem } from '../../components/collection/TitleEmblem'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { getLevelIconById } from '../../data/levelIcons'
import { getPlayerIcon } from '../../data/playerIcons'
import {
  equipmentSlots,
  getEquippedItemForSlot,
  getHomeShipPreviewVisuals,
} from '../../data/shopItems'
import { defaultCharacterName, defaultShipName } from '../../data/shipName'
import { getUfoById } from '../../data/ufos'
import {
  coerceEquippedBuddyId,
  parseDedicatedBuddySelectionId,
  parseMonsterBuddySelectionId,
} from '../../game-engine/collection/buddies'
import { formatFactLabel } from '../../game-engine/questions/factIds'
import { getWeakFacts, weakFactHintText } from '../../game-engine/review/weakFacts'
import { useSaveData } from '../../hooks/useSaveData'

function renderSelectedBuddy(selectionId: string | null) {
  const monster = parseMonsterBuddySelectionId(selectionId)
  if (monster) {
    return (
      <MonsterSprite
        left={monster.left}
        right={monster.right}
        className="home-buddy-sprite"
      />
    )
  }
  const buddyId = parseDedicatedBuddySelectionId(selectionId)
  return buddyId ? <BuddySprite buddyId={buddyId} className="home-buddy-sprite" /> : null
}

export function HomePage() {
  const { saveData, updateSaveData } = useSaveData()
  const player = saveData.player
  const weakFacts = getWeakFacts(saveData.progress.facts, 3)
  const equippedUfo = getUfoById(saveData.progress.equippedUfoId)
  const characterVisuals = getHomeShipPreviewVisuals(
    saveData.progress.equippedItems,
    equippedUfo?.variant,
  )
  const equippedBuddyId = coerceEquippedBuddyId(saveData)
  const buddyContent = renderSelectedBuddy(equippedBuddyId)
  const [tutorialOpen, setTutorialOpen] = useState(!saveData.tutorial.homeSeen)
  const playerIcon = getPlayerIcon(player?.icon)
  const levelIcon = getLevelIconById(player?.icon)
  const crewTitle = player?.currentTitle ?? 'はじめのいっぽ'
  const shipName = player?.shipName ?? defaultShipName
  const characterName = player?.characterName ?? defaultCharacterName

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
                {levelIcon ? <LevelIconBadge icon={levelIcon} className="home-level-icon" /> : playerIcon.emoji}
              </span>
              <h2>{player?.nickname ?? 'くくとも'}</h2>
            </div>
            <div className="home-current-title">
              <TitleEmblem title={player?.currentTitle ?? 'はじめのいっぽ'} className="home-title-emblem" />
              <p className="title-line">{player?.currentTitle ?? 'はじめのいっぽ'}</p>
            </div>
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
          <KukucchiCharacter
            level={player?.level ?? 1}
            mood="happy"
            visual={characterVisuals}
            buddyContent={buddyContent}
            label={characterName}
          />
          <TitleEmblem title={crewTitle} className="ship-title-badge" />
          <div className="character-window-copy ship-name-only">
            <strong className="character-name-line">{characterName}</strong>
            <h2>{shipName}号</h2>
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
        <Link className="home-menu-card home-menu-card-large" to="/custom" aria-label="カスタム">
          <span className="home-card-emoji" aria-hidden="true">
            ✨
          </span>
          <strong>カスタム</strong>
          <small>
            もちもの
            <br />
            きせかえ
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
          <small>コインでかう</small>
        </Link>
        <Link className="home-menu-card" to="/settings" aria-label="せってい">
          <span className="home-card-emoji" aria-hidden="true">
            ⚙️
          </span>
          <strong>せってい</strong>
          <small>音と表示</small>
        </Link>
      </section>

      <section className="weak-section" aria-labelledby="weak-title">
        <h2 id="weak-title">にがて</h2>
        <p className="weak-hint">{weakFactHintText}</p>
        {weakFacts.length === 0 ? (
          <p className="quiet-text">まだありません</p>
        ) : (
          <div className="fact-list">
            {weakFacts.map((fact) => (
              <span key={fact.id}>{formatFactLabel(fact)}</span>
            ))}
          </div>
        )}
      </section>

      {tutorialOpen ? <TutorialModal onClose={closeTutorial} /> : null}

    </AppShell>
  )
}
