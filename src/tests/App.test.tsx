import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

async function completeOnboarding() {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText('よびな'), 'みらい')
  await user.click(screen.getByRole('button', { name: 'はじめる' }))
  expect(await screen.findByRole('heading', { name: 'ホーム' })).toBeInTheDocument()
  return user
}

async function answerCurrentQuestion(user: ReturnType<typeof userEvent.setup>) {
  const prompt = screen.getByRole('heading', { level: 2, name: /×/ }).textContent ?? ''
  const match = prompt.match(/(\d+)\s*×\s*(\d+)/)
  if (!match) {
    throw new Error(`question prompt did not match: ${prompt}`)
  }
  const answer = Number(match[1]) * Number(match[2])
  await user.click(screen.getByRole('button', { name: String(answer) }))
}

describe('app flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.location.hash = ''
  })

  it('moves from onboarding to home and saves settings', async () => {
    const user = await completeOnboarding()
    await user.click(screen.getAllByRole('link', { name: 'せってい' })[0])
    expect(await screen.findByRole('heading', { name: 'せってい' })).toBeInTheDocument()
    const sound = screen.getByLabelText('効果音')
    await user.click(sound)
    expect(sound).not.toBeChecked()
  })

  it('starts learn mode, answers, shows result, and persists progress', async () => {
    const user = await completeOnboarding()
    await user.click(screen.getByRole('link', { name: 'あそぶ' }))
    await user.click(screen.getByRole('link', { name: /おぼえる/ }))
    expect(await screen.findByRole('heading', { name: 'おぼえる' })).toBeInTheDocument()

    for (let index = 0; index < 5; index += 1) {
      await answerCurrentQuestion(user)
      expect(await screen.findByText(/できた/)).toBeInTheDocument()
      const nextButton = screen.queryByRole('button', { name: 'つぎへ' })
      if (nextButton) {
        await user.click(nextButton)
      }
    }

    await user.click(screen.getByRole('button', { name: 'けっかへ' }))
    expect(await screen.findByRole('heading', { name: 'けっか' })).toBeInTheDocument()
    expect(screen.getByText('正答率')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'ホームへ' }))
    expect(await screen.findByText('みらい')).toBeInTheDocument()

    const stats = screen.getByLabelText('プレイヤー情報')
    expect(within(stats).getByText('コイン')).toBeInTheDocument()
  })
})
