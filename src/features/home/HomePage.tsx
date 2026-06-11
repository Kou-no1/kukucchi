import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import { KukucchiCharacter } from '../../components/character/KukucchiCharacter'
import { getWeakFacts } from '../../game-engine/review/weakFacts'
import { useSaveData } from '../../hooks/useSaveData'

export function HomePage() {
  const { saveData } = useSaveData()
  const player = saveData.player
  const weakFacts = getWeakFacts(saveData.progress.facts, 3)

  return (
    <AppShell title="ホーム">
      <section className="home-hero">
        <div>
          <p className="welcome">またあえてうれしい！</p>
          <h2>{player?.nickname ?? 'くくとも'}</h2>
          <p className="title-line">{player?.currentTitle ?? 'はじめのいっぽ'}</p>
        </div>
        <KukucchiCharacter level={player?.level ?? 1} mood="happy" />
      </section>

      <section className="stats-row" aria-label="プレイヤー情報">
        <StatPill label="Lv" value={player?.level ?? 1} />
        <StatPill label="EXP" value={player?.exp ?? 0} />
        <StatPill label="コイン" value={player?.coins ?? 0} />
      </section>

      <section className="action-band">
        <Link className="primary-action" to="/games">
          あそぶ
        </Link>
        <Link className="secondary-action" to="/learn">
          おぼえる
        </Link>
        <Link className="secondary-action" to="/speed">
          スピード
        </Link>
      </section>

      <section className="mission-section" aria-labelledby="mission-title">
        <h2 id="mission-title">今日のミッション</h2>
        <div className="mission-list">
          {saveData.progress.missions.map((mission) => (
            <div className="mission-item" key={mission.id}>
              <span>{mission.label}</span>
              <strong>
                {mission.progress}/{mission.target}
              </strong>
            </div>
          ))}
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

      <section className="feature-grid" aria-label="そのほか">
        <Link to="/settings">せってい</Link>
        <span>ショップ</span>
        <span>図かん</span>
        <span>高学年</span>
      </section>
    </AppShell>
  )
}
