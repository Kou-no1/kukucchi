import { Link, useLocation } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import type { GameSessionSummary } from '../../types/game'

export function ResultPage() {
  const location = useLocation()
  const summary = (location.state as { summary?: GameSessionSummary } | null)?.summary

  if (!summary) {
    return (
      <AppShell title="けっか">
        <section className="empty-state">
          <p>けっかが見つかりませんでした</p>
          <Link className="primary-action" to="/home">
            ホームへ
          </Link>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell title="けっか">
      <section className="result-hero">
        <p className="welcome">よくできました</p>
        <h2>
          {summary.correctCount}/{summary.totalQuestions} もん
        </h2>
        {summary.bestUpdated ? <strong className="best-badge">自己ベスト</strong> : null}
      </section>

      <section className="stats-row result-stats" aria-label="結果">
        <StatPill label="正答率" value={`${summary.accuracy}%`} />
        <StatPill label="平均" value={`${(summary.averageResponseTimeMs / 1000).toFixed(1)}秒`} />
        <StatPill label="最大コンボ" value={summary.maxCombo} />
        <StatPill label="コイン" value={`+${summary.earnedCoins}`} />
        <StatPill label="EXP" value={`+${summary.earnedExp}`} />
      </section>

      {summary.newTitles.length > 0 ? (
        <section className="mission-section" aria-labelledby="title-earned">
          <h2 id="title-earned">新しい称号</h2>
          <div className="fact-list">
            {summary.newTitles.map((title) => (
              <span key={title}>{title}</span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="weak-section" aria-labelledby="result-weak">
        <h2 id="result-weak">にがてになった問題</h2>
        {summary.weakFacts.length === 0 ? (
          <p className="quiet-text">今はありません</p>
        ) : (
          <div className="fact-list">
            {summary.weakFacts.map((fact) => (
              <span key={fact.id}>
                {fact.left} × {fact.right}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="weak-section" aria-labelledby="result-mastered">
        <h2 id="result-mastered">習得した問題</h2>
        {summary.masteredFacts.length === 0 ? (
          <p className="quiet-text">これから増えます</p>
        ) : (
          <div className="fact-list">
            {summary.masteredFacts.slice(0, 6).map((fact) => (
              <span key={fact.id}>
                {fact.left} × {fact.right}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="action-band">
        <Link className="primary-action" to={summary.mode === 'speed' ? '/speed' : '/learn'}>
          もう一回
        </Link>
        <Link className="secondary-action" to="/home">
          ホームへ
        </Link>
      </section>
    </AppShell>
  )
}
