import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'

const modes = [
  {
    label: 'おぼえる',
    href: '/learn',
    ready: true,
    icon: '×',
    badge: '01',
    subtitle: 'まとまりをみてすすむ',
  },
  {
    label: 'すぴーど',
    href: '/speed',
    ready: true,
    icon: '+',
    badge: '02',
    subtitle: '30びょうでわーぷ',
  },
  {
    label: 'ろけっと',
    href: '/rocket',
    ready: true,
    icon: '🚀',
    badge: '03',
    subtitle: 'はやさで うちゅうのはてへ！',
  },
  {
    label: 'にがてもんすたー',
    href: '/review',
    ready: true,
    icon: 'Mx',
    badge: '04',
    subtitle: 'なかまにしよう',
  },
  {
    label: 'もんすたーばとる',
    href: '/monster-battle',
    ready: true,
    icon: 'VS',
    badge: '05',
    subtitle: 'れんぞくで ひっさつわざ！',
  },
  {
    label: 'ぼすばとる',
    href: '/battle',
    ready: true,
    icon: '🛡️',
    badge: '06',
    subtitle: 'だんぼすにちょうせん',
  },
  {
    label: 'たからばこ',
    href: '/treasure',
    ready: true,
    icon: '🗝️',
    badge: '07',
    subtitle: 'ゆっくり おたからげっと',
  },
  {
    label: 'こうがくねんちゃれんじ',
    href: '/advanced',
    ready: true,
    icon: 'abc',
    badge: '08',
    subtitle: 'すーぱーけいさん',
  },
]

export function GameSelectPage() {
  return (
    <AppShell title="あそぶ" backTo="/home">
      <section className="mode-grid" aria-label="ゲームモード">
        {modes.map((mode) =>
          mode.ready ? (
            <Link className="mode-card" key={mode.label} to={mode.href}>
              <span className="mode-icon" aria-hidden="true">
                {mode.icon}
              </span>
              <span className="mode-badge" aria-hidden="true">
                {mode.badge}
              </span>
              <strong>{mode.label}</strong>
              <small>{mode.subtitle}</small>
              <span>すたーと</span>
            </Link>
          ) : (
            <div className="mode-card locked" key={mode.label} aria-disabled="true">
              <span className="mode-icon" aria-hidden="true">
                {mode.icon}
              </span>
              <span className="mode-badge" aria-hidden="true">
                {mode.badge}
              </span>
              <strong>{mode.label}</strong>
              <small>{mode.subtitle}</small>
              <span>じゅんびちゅう</span>
            </div>
          ),
        )}
      </section>
    </AppShell>
  )
}
