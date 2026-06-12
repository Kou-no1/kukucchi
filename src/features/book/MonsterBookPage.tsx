import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { getMasteredFacts, getMonsterFacts } from '../../game-engine/review/weakFacts'
import { useSaveData } from '../../hooks/useSaveData'

export function MonsterBookPage() {
  const { saveData } = useSaveData()
  const masteredFacts = getMasteredFacts(saveData.progress.facts)
  const activeMonsters = getMonsterFacts(saveData.progress.facts, 12)
  const registered = new Set(saveData.progress.monsterBook)

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
    </AppShell>
  )
}
