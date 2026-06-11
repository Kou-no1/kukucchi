import { Link } from 'react-router-dom'
import { AppShell } from '../../components/common/AppShell'

const modes = [
  { label: 'おぼえる', href: '/learn', ready: true },
  { label: 'スピード', href: '/speed', ready: true },
  { label: 'ランダムゲーム', href: '/games', ready: false },
  { label: 'にがてモンスター', href: '/games', ready: false },
  { label: 'ボスバトル', href: '/games', ready: false },
  { label: '高学年チャレンジ', href: '/games', ready: false },
]

export function GameSelectPage() {
  return (
    <AppShell title="あそぶ" backTo="/home">
      <section className="mode-grid" aria-label="ゲームモード">
        {modes.map((mode) =>
          mode.ready ? (
            <Link className="mode-card" key={mode.label} to={mode.href}>
              <strong>{mode.label}</strong>
              <span>スタート</span>
            </Link>
          ) : (
            <div className="mode-card locked" key={mode.label} aria-disabled="true">
              <strong>{mode.label}</strong>
              <span>じゅんび中</span>
            </div>
          ),
        )}
      </section>
    </AppShell>
  )
}
