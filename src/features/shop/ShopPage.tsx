import { AppShell } from '../../components/common/AppShell'
import { shopItems } from '../../data/shopItems'
import { useSaveData } from '../../hooks/useSaveData'

export function ShopPage() {
  const { saveData, updateSaveData } = useSaveData()
  const coins = saveData.player?.coins ?? 0

  function buyItem(itemId: string) {
    const item = shopItems.find((candidate) => candidate.id === itemId)
    if (!item) {
      return
    }
    updateSaveData((current) => {
      if (!current.player || current.progress.ownedItems.includes(item.id)) {
        return current
      }
      if (current.player.coins < item.price) {
        return current
      }
      return {
        ...current,
        player: {
          ...current.player,
          coins: current.player.coins - item.price,
        },
        progress: {
          ...current.progress,
          ownedItems: [...current.progress.ownedItems, item.id],
        },
      }
    })
  }

  function equipItem(itemId: string) {
    updateSaveData((current) => {
      if (!current.progress.ownedItems.includes(itemId)) {
        return current
      }
      return {
        ...current,
        progress: {
          ...current.progress,
          equippedItems: [itemId],
        },
      }
    })
  }

  return (
    <AppShell title="ショップ" backTo="/home">
      <section className="shop-command" aria-label="ショップ情報">
        <p className="welcome">くくっち号カスタム</p>
        <h2>{coins} コイン</h2>
        <p className="title-line">ゲームで集めたコインで、船内アイテムをふやせます。</p>
      </section>

      <section className="shop-grid" aria-label="商品">
        {shopItems.map((item) => {
          const owned = saveData.progress.ownedItems.includes(item.id)
          const equipped = saveData.progress.equippedItems.includes(item.id)
          const canBuy = coins >= item.price
          return (
            <article className="shop-card" key={item.id}>
              <span className="shop-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <div>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
              </div>
              <strong>{item.price} コイン</strong>
              {owned ? (
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => equipItem(item.id)}
                  disabled={equipped}
                >
                  {equipped ? 'そうび中' : 'そうび'}
                </button>
              ) : (
                <button
                  className="primary-action"
                  type="button"
                  onClick={() => buyItem(item.id)}
                  disabled={!canBuy}
                >
                  買う
                </button>
              )}
            </article>
          )
        })}
      </section>
    </AppShell>
  )
}
