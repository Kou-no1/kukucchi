import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'

const modes = [
  {
    label: 'おぼえる',
    href: '/learn',
    ready: true,
    icon: '×',
    badge: '01',
    subtitle: 'まとまりを見てすすむ',
  },
  {
    label: 'スピード',
    href: '/speed',
    ready: true,
    icon: '+',
    badge: '02',
    subtitle: '30秒でワープ',
  },
  {
    label: 'ロケット',
    href: '/rocket',
    ready: true,
    icon: '🚀',
    badge: '03',
    subtitle: 'スピードで うちゅうのはてへ！',
  },
  {
    label: 'にがてモンスター',
    href: '/review',
    ready: true,
    icon: '👾',
    badge: '04',
    subtitle: 'なかまにしよう',
  },
  {
    label: 'モンスターバトル',
    href: '/monster-battle',
    ready: true,
    icon: '👾',
    badge: '05',
    subtitle: 'コンボで ひっさつわざ！',
  },
  {
    label: 'ボスバトル',
    href: '/battle',
    ready: true,
    icon: '🛡️',
    badge: '06',
    subtitle: 'だんボスに挑戦',
  },
  {
    label: '宝箱',
    href: '/treasure',
    ready: true,
    icon: '🗝️',
    badge: '07',
    subtitle: 'ゆっくり おたからゲット',
  },
  {
    label: '高学年チャレンジ',
    href: '/advanced',
    ready: true,
    icon: 'abc',
    badge: '08',
    subtitle: 'スーパー計算',
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
              <span>スタート</span>
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
              <span>じゅんび中</span>
            </div>
          ),
        )}
      </section>
    </AppShell>
  )
}
