import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { replayPath } from '../features/results/ResultPage'

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

  it('replays monster battle without jumping to boss battle', () => {
    expect(replayPath('battle')).toBe('/monster-battle')
    expect(replayPath('boss')).toBe('/battle')
  })

  it('keeps school time budget behind a teacher code', async () => {
    const user = await completeOnboarding()
    await user.click(screen.getAllByRole('link', { name: 'せってい' })[0])
    expect(await screen.findByRole('heading', { name: 'せってい' })).toBeInTheDocument()
    await user.click(screen.getByText('せんせい・ほごしゃ'))
    expect(screen.getByLabelText('せんせいコード')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'オフ' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('せんせいコード'), '9631')
    await user.click(screen.getByRole('button', { name: 'ひらく' }))
    expect(await screen.findByRole('button', { name: 'オフ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10分' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '15分' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20分' })).toBeInTheDocument()
  })

  it('uses star-first navigation from home', async () => {
    const user = await completeOnboarding()
    expect(screen.getByRole('heading', { name: 'ほしをえらぶ' })).toBeInTheDocument()
    const starRegion = screen.getByRole('region', { name: 'ほしをえらぶ' })
    expect(
      within(starRegion).getAllByText(/(?:たしざん|ひきざん|かけざん)のほし/).map((element) => element.textContent),
    ).toEqual(['たしざんのほし', 'ひきざんのほし', 'かけざんのほし'])
    expect(screen.getByRole('link', { name: /かけざんのほし/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /たしざんのほし/ })).toBeInTheDocument()
    expect(screen.getByText('ひきざんのほし')).toBeInTheDocument()
    expect(screen.getByText('じゅんびちゅう')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'カスタム' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '図かん' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ショップ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'せってい' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /かけざんのほし/ }))
    expect(await screen.findByRole('heading', { name: 'かけざんのほし' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /あそぶ/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /おぼえる/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /スピード/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /高学年/ })).toBeInTheDocument()
    expect(screen.getByText('今日のミッション')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'くくっち' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'もどる' }))
    await user.click(await screen.findByRole('link', { name: /たしざんのほし/ }))
    expect(await screen.findByRole('heading', { name: 'たしざんのほし' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /おぼえる/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /あそぶ/ })).toHaveAttribute('href', '#/rocket?planet=add')
    expect(screen.getByRole('link', { name: /スピード/ })).toHaveAttribute('href', '#/speed?planet=add')
    expect(screen.getByRole('heading', { name: 'たしざんボス' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /おぼえる/ }))
    expect(await screen.findByRole('heading', { name: '1〜9のたしざん れんしゅう' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1〜9のたしざんこたえが9まで' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '九九' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '平方数' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '円周率' })).not.toBeInTheDocument()
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
    await user.click(screen.getByRole('link', { name: /かけざんのほし/ }))
    await user.click(screen.getByRole('link', { name: /おぼえる/ }))
    expect(await screen.findByRole('heading', { name: 'おぼえる' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2のだん れんしゅう' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '平方数' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '円周率' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '平方数' }))
    expect(screen.getByRole('heading', { name: '平方数 れんしゅう' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '九九' }))
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
    expect(screen.getByRole('link', { name: 'あそぶへ' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'ホームへ' }))
    expect(await screen.findByText('みらい')).toBeInTheDocument()

    const stats = screen.getByLabelText('プレイヤー情報')
    expect(within(stats).getByText('コイン')).toBeInTheDocument()
  })

  it('shows a start screen before high grade calculation questions', async () => {
    const user = await completeOnboarding()
    await user.click(screen.getByRole('link', { name: /かけざんのほし/ }))
    await user.click(screen.getByRole('link', { name: /高学年/ }))
    expect(await screen.findByRole('heading', { name: 'スーパー計算' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ミックス チャレンジ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '平方数' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '円周率' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'スタート！' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: /×/ })).not.toBeInTheDocument()
  })
})
