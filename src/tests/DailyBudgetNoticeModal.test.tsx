import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DailyBudgetNoticeModal } from '../components/common/DailyBudgetNoticeModal'

const dailyUsageMock = vi.hoisted(() => ({
  acknowledgeNotice: vi.fn(),
  budgetMinutes: 10,
}))

vi.mock('../hooks/useDailyUsage', () => ({
  useDailyUsage: () => ({
    acknowledgeNotice: dailyUsageMock.acknowledgeNotice,
    budgetMinutes: dailyUsageMock.budgetMinutes,
  }),
}))

describe('DailyBudgetNoticeModal', () => {
  it('shows the school mode notice as a centered hiragana modal', async () => {
    const onDismiss = vi.fn()
    dailyUsageMock.acknowledgeNotice.mockClear()
    render(<DailyBudgetNoticeModal open onDismiss={onDismiss} />)

    const dialog = screen.getByRole('dialog', { name: '10ぷん たったよ' })
    expect(dialog).toHaveClass('reward-budget-modal')
    expect(dialog.parentElement).toHaveClass('reward-budget-backdrop')
    expect(screen.getByText('このあとは コインとけいけんちは たまらないよ。')).toBeInTheDocument()
    expect(screen.queryByText(/10分|経験値/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'わかった' }))
    expect(dailyUsageMock.acknowledgeNotice).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
