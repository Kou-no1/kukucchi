import type { CSSProperties, ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'
import { AdditionBossSprite } from '../../components/collection/AdditionBossSprite'
import { bosses } from '../../data/bosses'
import { additionAreas, getPlanetById, type PlanetId } from '../../data/planets'
import {
  getClearedStars,
  isBossUnlocked,
  remainingQuestionsToUnlockBoss,
} from '../../game-engine/bosses/bossEngine'
import { useSaveData } from '../../hooks/useSaveData'
import { PlayerCommandPanel, WeakFactsPanel } from '../home/HomePanels'

type PlanetMode = {
  label: string
  href?: string
  ready: boolean
  icon: string
  badge: string
  subtitle: string
  callToAction?: string
}

const planetIds: PlanetId[] = ['multiply', 'add', 'subtract']

const multiplyModes: PlanetMode[] = [
  {
    label: 'あそぶ',
    href: '/monster-battle',
    ready: true,
    icon: 'VS',
    badge: '01',
    subtitle: 'もんすたーばとる',
  },
  {
    label: 'おぼえる',
    href: '/learn?planet=multiply',
    ready: true,
    icon: '×',
    badge: '02',
    subtitle: 'だんをれんしゅう',
  },
  {
    label: 'スピード',
    href: '/speed',
    ready: true,
    icon: '30',
    badge: '03',
    subtitle: '30びょうチャレンジ',
  },
  {
    label: '高学年',
    href: '/advanced',
    ready: true,
    icon: 'abc',
    badge: '04',
    subtitle: '平方数・円周率',
  },
  {
    label: 'にがてもんすたー',
    href: '/review',
    ready: true,
    icon: 'Mx',
    badge: '05',
    subtitle: 'にがてをなかまに',
  },
  {
    label: 'ぼすばとる',
    href: '/battle',
    ready: true,
    icon: '盾',
    badge: '06',
    subtitle: 'だんぼすにちょうせん',
  },
  {
    label: 'ろけっと',
    href: '/rocket',
    ready: true,
    icon: '🚀',
    badge: '07',
    subtitle: 'はやさでうちゅうへ',
  },
  {
    label: 'たからばこ',
    href: '/treasure',
    ready: true,
    icon: '鍵',
    badge: '08',
    subtitle: 'ゆっくりおたから',
  },
]

const additionModes: PlanetMode[] = [
  {
    label: 'おぼえる',
    href: '/learn?planet=add',
    ready: true,
    icon: '+',
    badge: '01',
    subtitle: '6エリアをれんしゅう',
  },
  {
    label: 'あそぶ',
    href: '/rocket?planet=add',
    ready: true,
    icon: 'VS',
    badge: '02',
    subtitle: 'たしざんロケット',
  },
  {
    label: 'スピード',
    href: '/speed?planet=add',
    ready: true,
    icon: '30',
    badge: '03',
    subtitle: 'たしざんタイム',
  },
]

function isPlanetId(value: string | undefined): value is PlanetId {
  return planetIds.some((id) => id === value)
}

function planetSymbol(planetId: PlanetId) {
  if (planetId === 'multiply') {
    return '×'
  }
  if (planetId === 'add') {
    return '+'
  }
  return '-'
}

function modeCard(mode: PlanetMode): ReactNode {
  const content = (
    <>
      <span className="mode-icon" aria-hidden="true">
        {mode.icon}
      </span>
      <span className="mode-badge" aria-hidden="true">
        {mode.badge}
      </span>
      <strong>{mode.label}</strong>
      <small>{mode.subtitle}</small>
      <span>{mode.callToAction ?? (mode.ready ? 'スタート' : 'じゅんびちゅう')}</span>
    </>
  )

  if (mode.ready && mode.href) {
    return (
      <Link className="mode-card planet-mode-card" key={mode.label} to={mode.href}>
        {content}
      </Link>
    )
  }

  return (
    <div className="mode-card planet-mode-card locked" key={mode.label} aria-disabled="true">
      {content}
    </div>
  )
}

export function PlanetMenuPage() {
  const { planetId } = useParams()
  const { saveData } = useSaveData()
  if (!isPlanetId(planetId)) {
    return <Navigate to="/home" replace />
  }

  const planet = getPlanetById(planetId)
  const style = {
    '--planet-primary': planet.theme.primary,
    '--planet-accent': planet.theme.accent,
    '--planet-surface': planet.theme.surface,
    '--planet-text': planet.theme.text,
  } as CSSProperties
  const modes = planet.id === 'add' ? additionModes : multiplyModes
  const additionBosses = bosses.filter((boss) => boss.group === 'addition')

  return (
    <AppShell title={planet.shortName} backTo="/home" className="planet-menu-shell">
      <section className="planet-menu-hero" style={style} aria-labelledby="planet-menu-title">
        <span className="planet-orb planet-menu-orb" aria-hidden="true">
          {planetSymbol(planet.id)}
        </span>
        <div className="planet-menu-copy">
          <p className="welcome">ほしのメニュー</p>
          <h2 id="planet-menu-title">{planet.name}</h2>
          <p className="title-line">
            {planet.status === 'live'
              ? 'このほしで あそびかたをえらぼう。'
              : 'このほしは じゅんびちゅうです。'}
          </p>
        </div>
        <span className="planet-status planet-menu-status">
          {planet.status === 'live' ? 'あそべる' : 'じゅんびちゅう'}
        </span>
      </section>

      {planet.status === 'live' ? (
        <>
          <PlayerCommandPanel className="planet-command-panel" />

          <section className="mode-grid planet-mode-grid" aria-label={`${planet.name}のメニュー`}>
            {modes.map(modeCard)}
          </section>

          {planet.id === 'add' ? (
            <>
              <section className="planet-area-list" aria-labelledby="addition-area-menu-title">
                <div className="section-heading-row">
                  <div>
                    <p className="welcome">たしざん</p>
                    <h2 id="addition-area-menu-title">エリアれんしゅう</h2>
                  </div>
                </div>
                <div className="stage-chip-grid addition-area-grid">
                  {additionAreas.map((area) => (
                    <Link
                      className="stage-chip addition-area-chip"
                      key={area.id}
                      to={`/learn?planet=add&area=${area.id}`}
                    >
                      <strong>{area.name}</strong>
                      <span>{area.description}</span>
                    </Link>
                  ))}
                </div>
              </section>
              <section className="planet-area-list addition-boss-list" aria-labelledby="addition-boss-menu-title">
                <div className="section-heading-row">
                  <div>
                    <p className="welcome">B2</p>
                    <h2 id="addition-boss-menu-title">たしざんボス</h2>
                  </div>
                </div>
                <div className="stage-chip-grid addition-area-grid">
                  {additionBosses.map((boss) => {
                    const unlocked = isBossUnlocked(boss, saveData)
                    const remaining = remainingQuestionsToUnlockBoss(boss, saveData)
                    return (
                      <Link
                        className={unlocked ? 'stage-chip addition-area-chip' : 'stage-chip addition-area-chip locked'}
                        key={boss.id}
                        to={`/boss/${boss.id}`}
                      >
                        <AdditionBossSprite
                          boss={boss}
                          locked={!unlocked}
                          compact
                          className="planet-boss-chip-sprite"
                        />
                        <strong>{unlocked ? boss.label : '？？？'}</strong>
                        <span>
                          {'★'.repeat(getClearedStars(saveData, boss.id)) ||
                            (remaining !== null ? `あと${remaining}もん` : boss.shortLabel)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            </>
          ) : null}

          <WeakFactsPanel className="planet-weak-panel" />
        </>
      ) : (
        <section className="mode-grid planet-mode-grid" aria-label={`${planet.name}のメニュー`}>
          <div className="mode-card planet-mode-card locked" aria-disabled="true">
            <span className="mode-icon" aria-hidden="true">
              {planetSymbol(planet.id)}
            </span>
            <span className="mode-badge" aria-hidden="true">
              00
            </span>
            <strong>じゅんびちゅう</strong>
            <small>べつのほしをえらんでね</small>
            <span>またあとで</span>
          </div>
        </section>
      )}
    </AppShell>
  )
}
