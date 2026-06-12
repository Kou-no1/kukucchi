import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { bossDifficulties, bosses, bossLimitedItems } from '../../data/bosses'
import { getDifficultyProgress } from '../../game-engine/bosses/bossEngine'
import { getMasteredFacts, getMonsterFacts } from '../../game-engine/review/weakFacts'
import { useSaveData } from '../../hooks/useSaveData'
import type { BossDifficultyId } from '../../types/save'

const difficultyIds: BossDifficultyId[] = ['normal', 'hard', 'fast']

function formatBestTime(milliseconds: number | null): string {
  return milliseconds === null ? '記録なし' : `${(milliseconds / 1000).toFixed(1)}秒`
}

export function MonsterBookPage() {
  const { saveData } = useSaveData()
  const masteredFacts = getMasteredFacts(saveData.progress.facts)
  const activeMonsters = getMonsterFacts(saveData.progress.facts, 12)
  const registered = new Set(saveData.progress.monsterBook)
  const ownedBossItems = new Set(saveData.progress.bossItems)
  const clearedBossCount = bosses.filter((boss) =>
    difficultyIds.some((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).cleared),
  ).length
  const ownedBossItemCount = bossLimitedItems.filter((item) => ownedBossItems.has(item.id)).length

  return (
    <AppShell title="図かん" backTo="/home">
      <section className="book-command" aria-labelledby="book-title">
        <p className="welcome">なかまになったモンスター</p>
        <h2 id="book-title">{registered.size} たい登録</h2>
        <p className="title-line">苦手な式を克服すると、ここに仲間として記録されます。</p>
      </section>

      <section className="monster-grid book-grid" aria-label="図鑑リスト">
        {masteredFacts.length === 0 ? (
          <div className="empty-card">
            <strong>まだ登録はありません</strong>
            <p>にがてモンスターを復習して、なかまをふやそう。</p>
            <Link className="primary-action" to="/review">
              復習へ
            </Link>
          </div>
        ) : (
          masteredFacts.map((fact) => (
            <article className="book-card" key={fact.id}>
              <span aria-hidden="true">👾</span>
              <h2>
                {fact.left} × {fact.right}
              </h2>
              <p>マスターLv {fact.masteryLevel}</p>
              <small>{registered.has(fact.id) ? '図鑑登録済み' : 'もうすぐ登録'}</small>
            </article>
          ))
        )}
      </section>

      {activeMonsters.length > 0 ? (
        <section className="weak-section" aria-labelledby="active-monsters-title">
          <h2 id="active-monsters-title">出現中</h2>
          <div className="fact-list">
            {activeMonsters.map((fact) => (
              <span key={fact.id}>
                {fact.left} × {fact.right}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="book-command" aria-labelledby="boss-book-title">
        <p className="welcome">ボスコレクション</p>
        <h2 id="boss-book-title">
          {clearedBossCount}/{bosses.length} たい討伐
        </h2>
        <p className="title-line">コンプリートまで あと{bosses.length - clearedBossCount}たい！</p>
      </section>

      <section className="monster-grid book-grid" aria-label="ボス図鑑">
        {bosses.map((boss) => {
          const clearedDifficulties = difficultyIds.filter((difficulty) =>
            getDifficultyProgress(saveData, boss.id, difficulty).cleared,
          )
          const revealed = clearedDifficulties.length > 0
          return (
            <article className={revealed ? 'book-card' : 'book-card silhouette'} key={boss.id}>
              <span className="boss-no">No.{String(boss.no).padStart(2, '0')}</span>
              <span aria-hidden="true">{revealed ? boss.emoji : '◆'}</span>
              <h2>{revealed ? boss.label : '？？？'}</h2>
              <p>{revealed ? '討伐バッジ獲得' : 'まだ出会っていません'}</p>
              <small>
                {difficultyIds
                  .map((difficulty) =>
                    getDifficultyProgress(saveData, boss.id, difficulty).cleared
                      ? bossDifficulties[difficulty].label
                      : '未',
                  )
                  .join(' / ')}
              </small>
              <small>
                ベスト{' '}
                {formatBestTime(
                  Math.min(
                    ...difficultyIds
                      .map((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).bestTimeMs)
                      .filter((time): time is number => time !== null),
                    Infinity,
                  ) === Infinity
                    ? null
                    : Math.min(
                        ...difficultyIds
                          .map((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).bestTimeMs)
                          .filter((time): time is number => time !== null),
                      ),
                )}
              </small>
            </article>
          )
        })}
      </section>

      <section className="book-command" aria-labelledby="treasure-book-title">
        <p className="welcome">おたから</p>
        <h2 id="treasure-book-title">
          {ownedBossItemCount}/{bossLimitedItems.length} こ入手
        </h2>
        <p className="title-line">
          コンプリートまで あと{bossLimitedItems.length - ownedBossItemCount}こ！
        </p>
      </section>

      <section className="monster-grid book-grid" aria-label="ボス限定おたから">
        {bossLimitedItems.map((item) => {
          const owned = ownedBossItems.has(item.id)
          return (
            <article className={owned ? 'book-card' : 'book-card silhouette'} key={item.id}>
              <span className="boss-no">No.{String(item.no).padStart(2, '0')}</span>
              <span aria-hidden="true">{owned ? item.emoji : '◆'}</span>
              <h2>{owned ? item.name : '？？？'}</h2>
              <p>{owned ? item.description : 'ボスをクリアすると手に入ります'}</p>
              <small>{item.tag}</small>
            </article>
          )
        })}
      </section>
    </AppShell>
  )
}
