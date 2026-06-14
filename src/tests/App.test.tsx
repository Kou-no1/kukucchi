import { render, screen, waitFor, within } from '@testing-library/react'
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

  it('hides learning level setup and reflects player icon changes on home', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByText('れべる')).not.toBeInTheDocument()
    expect(screen.queryByText('九九にちょうせん')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('よびな'), 'みらい')
    await user.click(screen.getByRole('button', { name: /ほし/ }))
    await user.click(screen.getByRole('button', { name: 'はじめる' }))
    expect(await screen.findByLabelText('ほしアイコン')).toBeInTheDocument()

    await user.click(screen.getAllByRole('link', { name: 'せってい' })[0])
    expect(await screen.findByRole('heading', { name: 'せってい' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /はな/ }))
    await user.click(screen.getByRole('link', { name: 'ホームへ' }))
    expect(await screen.findByLabelText('はなアイコン')).toBeInTheDocument()
  })

  it('starts learn mode, answers, shows result, and persists progress', async () => {
    const user = await completeOnboarding()
    await user.click(screen.getByRole('link', { name: 'あそぶ' }))
    await user.click(screen.getByRole('link', { name: /おぼえる/ }))
    expect(await screen.findByRole('heading', { name: 'おぼえる' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2のだん れんしゅう' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '上がり 1→9' }))
    await user.click(screen.getByRole('button', { name: 'スタート！' }))
    expect(await screen.findByRole('heading', { level: 2, name: /×/ }, { timeout: 3000 })).toBeInTheDocument()

    for (let index = 0; index < 9; index += 1) {
      await answerCurrentQuestion(user)
      expect(await screen.findByText(/できた/)).toBeInTheDocument()
      if (index < 8) {
        await waitFor(
          () => expect(screen.queryByText(/できた/)).not.toBeInTheDocument(),
          { timeout: 2000 },
        )
      }
    }

    await user.click(screen.getByRole('button', { name: 'けっかへ' }))
    expect(await screen.findByRole('heading', { name: 'けっか' })).toBeInTheDocument()
    expect(screen.getByText('正答率')).toBeInTheDocument()
    expect(screen.getByText(/つぎのレベルまで/)).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'ホームへ' }))
    expect(await screen.findByText('みらい')).toBeInTheDocument()

    const stats = screen.getByLabelText('プレイヤー情報')
    expect(within(stats).getByText('コイン')).toBeInTheDocument()
  })
})
