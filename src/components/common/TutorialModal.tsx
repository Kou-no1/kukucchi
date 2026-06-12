import { useState } from 'react'

const tutorialPages = [
  {
    icon: '🌱',
    title: 'くくっちをそだてよう',
    body: 'せいかいすると EXP と コインがもらえるよ。',
  },
  {
    icon: '🚀',
    title: 'モードしょうかい',
    body: 'おぼえる、スピード、ゲーム、にがて、ボスであそべるよ。',
  },
  {
    icon: '🎁',
    title: 'コインとごほうび',
    body: 'ショップでかざって、図かんでなかまをあつめよう。',
  },
  {
    icon: '✨',
    title: 'さあ、はじめよう！',
    body: 'まちがえてもだいじょうぶ。もういちどチャレンジしよう。',
  },
]

export function TutorialModal({ onClose }: { onClose: () => void }) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = tutorialPages[pageIndex]
  const isLast = pageIndex === tutorialPages.length - 1

  return (
    <div className="tutorial-backdrop" role="presentation">
      <section
        className="tutorial-modal"
        aria-labelledby="tutorial-title"
        aria-modal="true"
        role="dialog"
      >
        <span className="tutorial-icon" aria-hidden="true">
          {page.icon}
        </span>
        <p className="welcome">
          {pageIndex + 1}/{tutorialPages.length}
        </p>
        <h2 id="tutorial-title">{page.title}</h2>
        <p>{page.body}</p>
        <div className="tutorial-dots" aria-hidden="true">
          {tutorialPages.map((item, index) => (
            <span className={index === pageIndex ? 'selected' : ''} key={item.title} />
          ))}
        </div>
        <div className="tutorial-actions">
          <button className="secondary-action" type="button" onClick={onClose}>
            スキップ
          </button>
          <button
            className="primary-action"
            type="button"
            onClick={() => {
              if (isLast) {
                onClose()
              } else {
                setPageIndex((current) => current + 1)
              }
            }}
          >
            {isLast ? 'はじめる' : 'つぎへ'}
          </button>
        </div>
      </section>
    </div>
  )
}
