import { AppShell } from '../../components/common/AppShell'
import {
  equipShopItem,
  isShopTier2Unlocked,
  purchasedShopItemCount,
  shopItems,
  shopTier2UnlockPurchaseCount,
} from '../../data/shopItems'
import { useSaveData } from '../../hooks/useSaveData'

function kindLabel(kind: string): string {
  const labels: Record<string, string> = {
    wear: 'ふく',
    hat: 'ぼうし',
    furniture: 'かぐ',
    wallpaper: 'かべがみ',
    background: 'はいけい',
    effect: 'ひかり',
    pet: 'なかま',
  }
  return labels[kind] ?? kind
}

export function ShopPage() {
  const { saveData, updateSaveData } = useSaveData()
  const coins = saveData.player?.coins ?? 0
  const purchasedCount = purchasedShopItemCount(saveData.progress.ownedItems)
  const tier2Unlocked = isShopTier2Unlocked(saveData.progress.ownedItems)
  const visibleItems = shopItems.filter((item) => item.no <= 10 || tier2Unlocked)
  const unlockRemaining = Math.max(0, shopTier2UnlockPurchaseCount - purchasedCount)

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
          equippedItems: equipShopItem(current.progress.equippedItems, itemId),
        },
      }
    })
  }

  return (
    <AppShell title="しょっぷ" backTo="/home">
      <section className="shop-command" aria-label="しょっぷじょうほう">
        <p className="welcome">くくっちごうカスタム</p>
        <h2>{coins} コイン</h2>
        <p className="title-line">ゲームであつめたコインで、そうびをふやせます。</p>
        {tier2Unlocked ? (
          <p className="shop-unlock-message">あたらしい おみせが ひらいたよ！</p>
        ) : (
          <p className="shop-unlock-message">
            あと{unlockRemaining}こ かうと あたらしい おみせが ひらく！
          </p>
        )}
      </section>

      <section className="shop-grid" aria-label="しょうひん">
        {visibleItems.map((item) => {
          const owned = saveData.progress.ownedItems.includes(item.id)
          const equipped = saveData.progress.equippedItems.includes(item.id)
          const canBuy = coins >= item.price
          const hiddenTier2 = item.no > 10 && !owned
          return (
            <article className={hiddenTier2 ? 'shop-card silhouette' : 'shop-card'} key={item.id}>
              <span className="shop-emoji" aria-hidden="true">
                {hiddenTier2 ? '◆' : item.emoji}
              </span>
              <div>
                <h2>{hiddenTier2 ? '？？？' : item.name}</h2>
                <p>
                  {hiddenTier2
                    ? 'なかみは きまっているよ。かったら しょうたいが わかるよ。'
                    : item.description}
                </p>
                <small>{kindLabel(item.kind)}</small>
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
                  かう
                </button>
              )}
            </article>
          )
        })}
      </section>

      {!tier2Unlocked ? (
        <p className="quiet-text shop-teaser">？？？が ねむっている…</p>
      ) : null}
    </AppShell>
  )
}
