import { Link, useLocation } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { StatPill } from '../../components/common/StatPill'
import { expProgressToNextLevel, expToLevel } from '../../game-engine/rewards/rewards'
import { useSaveData } from '../../hooks/useSaveData'
import type { GameSessionSummary } from '../../types/game'

function replayPath(mode: GameSessionSummary['mode']): string {
  if (mode === 'speed') {
    return '/speed'
  }
  if (mode === 'review') {
    return '/review'
  }
  if (mode === 'battle') {
    return '/battle'
  }
  if (mode === 'boss') {
    return '/battle'
  }
  if (mode === 'treasure') {
    return '/treasure'
  }
  if (mode === 'rocket') {
    return '/rocket'
  }
  if (mode === 'advanced') {
    return '/advanced'
  }
  return '/learn'
}

function detailNumber(summary: GameSessionSummary, key: string): number | null {
  const value = summary.details?.[key]
  return typeof value === 'number' ? value : null
}

function detailString(summary: GameSessionSummary, key: string): string | null {
  const value = summary.details?.[key]
  return typeof value === 'string' ? value : null
}

function detailStrings(summary: GameSessionSummary, key: string): string[] {
  const value = summary.details?.[key]
  return Array.isArray(value) ? value : []
}

function ModeResultDetails({ summary }: { summary: GameSessionSummary }) {
  if (summary.mode === 'speed') {
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">すぴーど</h2>
        <div className="stats-row compact-stats">
          <StatPill label="せいかい" value={`${summary.correctCount}/${summary.totalQuestions}`} />
          <StatPill label="スコア" value={summary.score} />
          <StatPill label="コンボ" value={summary.maxCombo} />
        </div>
      </section>
    )
  }

  if (summary.mode === 'learn') {
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">できるようになったもんだい</h2>
        <p className="title-line">{summary.masteredFacts.length}こ ふえました</p>
      </section>
    )
  }

  if (summary.mode === 'rocket') {
    const distance = detailNumber(summary, 'rocketDistance') ?? summary.score
    const nextBadgeName = detailString(summary, 'nextRocketBadgeName')
    const nextBadgeDistance = detailNumber(summary, 'nextRocketBadgeDistance')
    const remaining = nextBadgeDistance === null ? 0 : Math.max(0, nextBadgeDistance - distance)
    const badges = detailStrings(summary, 'rocketBadges')
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">ろけっと</h2>
        <div className="stats-row compact-stats">
          <StatPill label="きょり" value={`${distance}m`} />
          <StatPill label="ばっじ" value={badges.length > 0 ? badges.join('、') : 'つぎへ'} />
        </div>
        <p className="title-line">
          {nextBadgeName ? `${nextBadgeName}まで あと${remaining}m！` : 'ばっじを ぜんぶ たっせい！'}
        </p>
      </section>
    )
  }

  if (summary.mode === 'battle') {
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">もんすたーばとる</h2>
        <div className="stats-row compact-stats">
          <StatPill label="はーと" value={detailNumber(summary, 'heartsLeft') ?? 0} />
          <StatPill label="ひっさつ" value={detailNumber(summary, 'specialUses') ?? 0} />
          <StatPill label="コイン" value={`+${summary.earnedCoins}`} />
        </div>
      </section>
    )
  }

  if (summary.mode === 'treasure') {
    const chests = detailStrings(summary, 'chestLabels')
    const keyNames = detailStrings(summary, 'treasureKeyNames')
    const itemName = detailString(summary, 'treasureItemName')
    const duplicate = summary.details?.treasureDuplicate === true
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">たからばこ</h2>
        <div className="stats-row compact-stats">
          <StatPill label="かぎ" value={detailNumber(summary, 'keys') ?? 0} />
          <StatPill label="あけた" value={detailNumber(summary, 'openedChests') ?? 0} />
          <StatPill label="コイン" value={`+${summary.earnedCoins}`} />
        </div>
        {keyNames.length > 0 ? <p className="title-line">カギ: {keyNames.join('、')}</p> : null}
        {itemName ? (
          <p className="title-line">
            {duplicate ? `ダブった！ ${itemName} が コインになったよ` : `${itemName} をみつけたよ`}
          </p>
        ) : null}
        {chests.length > 0 ? <p className="title-line">{chests.join('、')} をあけたよ</p> : null}
      </section>
    )
  }

  if (summary.mode === 'advanced') {
    const rates = detailStrings(summary, 'advancedCategoryRates')
    return (
      <section className="mode-result-card" aria-labelledby="mode-result-title">
        <h2 id="mode-result-title">スーパー計算</h2>
        <div className="fact-list">
          {(rates.length > 0 ? rates : ['けいさん 0%']).map((rate) => (
            <span key={rate}>{rate}</span>
          ))}
        </div>
      </section>
    )
  }

  return null
}

export function ResultPage() {
  const location = useLocation()
  const { saveData } = useSaveData()
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

  const playerExp = saveData.player?.exp ?? summary.earnedExp
  const previousLevel = expToLevel(Math.max(0, playerExp - summary.earnedExp))
  const currentProgress = expProgressToNextLevel(playerExp)
  const levelSpan = currentProgress.nextLevelExp - currentProgress.currentLevelExp
  const levelUp = currentProgress.level > previousLevel

  return (
    <AppShell title="けっか">
      <section className="result-hero">
        <p className="welcome">よくできました</p>
        <h2>
          {summary.correctCount}/{summary.totalQuestions} もん
        </h2>
        <div className="result-badges">
          {summary.bestUpdated ? <strong className="best-badge">じこベスト</strong> : null}
          {levelUp ? <strong className="best-badge">レベルアップ！</strong> : null}
        </div>
      </section>

      <section className="stats-row result-stats" aria-label="結果">
        <StatPill label="正答率" value={`${summary.accuracy}%`} />
        <StatPill label="平均" value={`${(summary.averageResponseTimeMs / 1000).toFixed(1)}秒`} />
        <StatPill label="最大コンボ" value={summary.maxCombo} />
        <StatPill label="コイン" value={`+${summary.earnedCoins}`} />
        <StatPill label="EXP" value={`+${summary.earnedExp}`} />
      </section>

      <section className="exp-progress-card" aria-label="つぎのレベル">
        <div>
          <h2>つぎのレベルまで あと{currentProgress.remainingExp}EXP</h2>
          <span>Lv {currentProgress.level}</span>
        </div>
        <div className="exp-progress-track" aria-hidden="true">
          <span style={{ width: `${currentProgress.percent}%` }} />
        </div>
        <p className="quiet-text">
          {currentProgress.gainedInLevel}/{levelSpan} EXP
        </p>
      </section>

      <ModeResultDetails summary={summary} />

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
        <h2 id="result-weak">まちがえたモンスター</h2>
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
        <Link className="primary-action" to={replayPath(summary.mode)}>
          もう一回
        </Link>
        <Link className="secondary-action" to="/home">
          ホームへ
        </Link>
      </section>
    </AppShell>
  )
}
