import { useDailyUsage } from '../../hooks/useDailyUsage'

export function DailyBudgetNoticeModal({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  const { acknowledgeNotice, budgetMinutes } = useDailyUsage()

  if (!open) {
    return null
  }

  function close() {
    acknowledgeNotice()
    onDismiss()
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="tutorial-modal reward-budget-modal" role="dialog" aria-modal="true">
        <div className="tutorial-visual" aria-hidden="true">
          🌟
        </div>
        <h2>{budgetMinutes}分 たったよ</h2>
        <p>このあとは コインとけいけんちは たまらないよ。</p>
        <p>あそびと きろくは そのまま つづけられるよ。</p>
        <button className="primary-action wide" type="button" onClick={close}>
          OK
        </button>
      </section>
    </div>
  )
}
