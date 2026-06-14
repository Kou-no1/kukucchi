import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AppShell } from '../../components/common/AppShell'
import { AdvancedMonsterSprite } from '../../components/collection/AdvancedMonsterSprite'
import { KeyIcon } from '../../components/collection/KeyIcon'
import { MonsterSprite } from '../../components/collection/MonsterSprite'
import { TreasureIcon } from '../../components/collection/TreasureIcon'
import { TrophySprite } from '../../components/collection/TrophySprite'
import { UfoBadge } from '../../components/collection/UfoBadge'
import {
  advancedMonsterCategoryLabels,
  advancedMonsterDefinitions,
  advancedProgressForCategory,
  isAdvancedMonsterOwned,
} from '../../data/advancedMonsters'
import { bossDifficultyIds, bosses, bossLimitedItems, getBossDifficulty } from '../../data/bosses'
import type { BossDefinition, BossLimitedItem } from '../../data/bosses'
import { keyTypes } from '../../data/keys'
import { rocketBadges } from '../../data/rocketBadges'
import { rarityStars, treasureItems, treasureThemeLabels } from '../../data/treasureItems'
import type { TreasureTheme } from '../../data/treasureItems'
import { ufoDefinitions } from '../../data/ufos'
import { getDifficultyProgress } from '../../game-engine/bosses/bossEngine'
import { calculateBookProgress } from '../../game-engine/collection/bookProgress'
import { getCollectionRecord } from '../../game-engine/collection/collectionRecords'
import type { BookTabId } from '../../game-engine/collection/bookProgress'
import { createMultiplicationFactPool } from '../../game-engine/questions/factDifficulty'
import { useSaveData } from '../../hooks/useSaveData'
import type { BossDifficultyId, SaveData } from '../../types/save'

const difficultyIds: BossDifficultyId[] = [...bossDifficultyIds]
const tabs: Array<{ id: BookTabId; label: string }> = [
  { id: 'kukucchi', label: 'くくっち' },
  { id: 'monsters', label: 'モンスター' },
  { id: 'ufos', label: 'UFO' },
  { id: 'treasures', label: 'おたから' },
  { id: 'collection', label: 'コレクション' },
]

type BookDetail = {
  name: string
  description: string
  acquiredAt: string | null
  method: string
  owned: boolean
}

function formatDate(value: string | null, owned: boolean): string {
  if (!owned) {
    return 'まだです'
  }
  return value ? new Date(value).toLocaleDateString('ja-JP') : 'きろくなし'
}

function formatBestTime(milliseconds: number | null): string {
  return milliseconds === null ? '記録なし' : `${(milliseconds / 1000).toFixed(1)}秒`
}

function keyActivate(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}

function bossDanLabel(boss: BossDefinition): string {
  if (boss.advancedCategory === 'square') {
    return '平'
  }
  if (boss.advancedCategory === 'pi') {
    return '3.14'
  }
  if (!boss.stages?.length) {
    return String(boss.no)
  }
  return boss.stages.length > 3 ? '全' : boss.stages.join('・')
}

function bossAccentDan(boss: BossDefinition): number {
  if (boss.advancedCategory === 'square') {
    return 8
  }
  if (boss.advancedCategory === 'pi') {
    return 3
  }
  return boss.stages?.at(-1) ?? 9
}

function highestClearedDifficulty(saveData: SaveData, boss: BossDefinition): BossDifficultyId {
  return (
    [...difficultyIds]
      .reverse()
      .find((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).cleared) ?? 'normal'
  )
}

function getBossForItem(item: BossLimitedItem): BossDefinition | undefined {
  return bosses.find((boss) => boss.id === item.bossId)
}

export function MonsterBookPage() {
  const { saveData, updateSaveData } = useSaveData()
  const [activeTab, setActiveTab] = useState<BookTabId>('kukucchi')
  const [detail, setDetail] = useState<BookDetail | null>(null)
  const progress = calculateBookProgress(saveData)
  const ownedBossItems = new Set(saveData.progress.bossItems)
  const ownedUfos = new Set(saveData.progress.ownedUfos)
  const ownedTreasureItems = new Set(saveData.progress.ownedTreasureItems.map((item) => item.id))
  const monsterFacts = createMultiplicationFactPool({
    stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    minDifficulty: 1,
  })
  const monsterBook = new Set(saveData.progress.monsterBook)

  function acquiredAt(kind: string, id: string): string | null {
    return getCollectionRecord(saveData.progress.collectionRecords, kind, id)?.acquiredAt ?? null
  }

  function equipUfo(ufoId: string) {
    updateSaveData((current) => {
      if (!current.progress.ownedUfos.includes(ufoId)) {
        return current
      }
      return {
        ...current,
        progress: {
          ...current.progress,
          equippedUfoId: ufoId,
        },
      }
    })
  }

  function cardAction(detailValue: BookDetail) {
    return {
      role: 'button',
      tabIndex: 0,
      onClick: () => setDetail(detailValue),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) =>
        keyActivate(event, () => setDetail(detailValue)),
    }
  }

  const activeProgress = progress.tabs[activeTab]

  return (
    <AppShell title="図かん" backTo="/home">
      <section className="book-command" aria-labelledby="book-title">
        <p className="welcome">ぜんぶのコレクション</p>
        <h2 id="book-title">
          ぜんぶで {progress.overall.owned}/{progress.overall.total}こ あつめた！
        </h2>
        <div className="book-meter" aria-label={`ぜんたい ${progress.overall.percent}%`}>
          <span style={{ width: `${progress.overall.percent}%` }} />
        </div>
      </section>

      <nav className="book-tabs" aria-label="図かんタブ">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? 'selected' : ''}
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="book-command compact-book-command" aria-label="タブのあつめたかず">
        <h2>
          あつめた かず {activeProgress.owned}/{activeProgress.total}こ（{activeProgress.percent}%）
        </h2>
      </section>

      {activeTab === 'kukucchi' ? (
        <section className="monster-grid book-grid" aria-label="くくっちのきろく">
          {[
            {
              no: 1,
              owned: Boolean(saveData.player),
              name: 'はじめのきろく',
              description: 'くくっちとであった日',
              acquiredAt: saveData.player?.createdAt ?? null,
              method: '初回設定',
            },
            {
              no: 2,
              owned: (saveData.player?.level ?? 1) >= 5,
              name: 'すくすくきろく',
              description: 'Lv5になったきろく',
              acquiredAt: null,
              method: 'Lv5',
            },
            {
              no: 3,
              owned: (saveData.player?.level ?? 1) >= 10,
              name: 'うちゅうせんちょう',
              description: 'Lv10になったきろく',
              acquiredAt: null,
              method: 'Lv10',
            },
          ].map((record) => (
            <article
              className={record.owned ? 'book-card' : 'book-card silhouette'}
              key={record.no}
              {...cardAction({
                name: record.owned ? record.name : '？？？',
                description: record.owned ? record.description : 'まだきろくがありません',
                acquiredAt: record.owned ? record.acquiredAt : null,
                method: record.owned ? record.method : '？？？',
                owned: record.owned,
              })}
            >
              <span className="boss-no">No.{String(record.no).padStart(2, '0')}</span>
              <span aria-hidden="true">{record.owned ? '🚀' : '◆'}</span>
              <h2>{record.owned ? record.name : '？？？'}</h2>
              <p>{record.owned ? record.description : 'まだです'}</p>
            </article>
          ))}
          {rocketBadges.map((badge) => {
            const owned = saveData.progress.rocketBadges.includes(badge.id)
            const record = getCollectionRecord(saveData.progress.collectionRecords, 'rocket-badge', badge.id)
            return (
              <article
                className={owned ? 'book-card' : 'book-card silhouette'}
                key={badge.id}
                {...cardAction({
                  name: owned ? badge.name : '？？？',
                  description: owned ? badge.description : `${badge.distance}mにとどくと入手`,
                  acquiredAt: record?.acquiredAt ?? null,
                  method: owned ? record?.method ?? 'ロケットチャレンジ' : '？？？',
                  owned,
                })}
              >
                <span className="boss-no">R-{String(badge.no).padStart(2, '0')}</span>
                <span aria-hidden="true">{owned ? badge.emoji : '◆'}</span>
                <h2>{owned ? badge.name : '？？？'}</h2>
                <p>{owned ? badge.description : `${badge.distance}m`}</p>
              </article>
            )
          })}
        </section>
      ) : null}

      {activeTab === 'monsters' ? (
        <>
          <section className="collection-section" aria-labelledby="low-monsters-title">
            <h2 id="low-monsters-title">ていがくねんの なかま</h2>
            <div className="monster-grid book-grid" aria-label="ていがくねんのモンスター図かん">
              {monsterFacts.map((fact, index) => {
                const factId = `${fact.left}x${fact.right}`
                const owned = monsterBook.has(factId)
                return (
                  <article
                    className={owned ? 'book-card' : 'book-card silhouette'}
                    key={factId}
                    {...cardAction({
                      name: owned ? `${fact.left} × ${fact.right} モンスター` : '？？？',
                      description: owned ? 'ふくしゅうしてなかまになったよ' : 'まちがえた問題をふくしゅうしよう',
                      acquiredAt: acquiredAt('monster', factId),
                      method: owned ? getCollectionRecord(saveData.progress.collectionRecords, 'monster', factId)?.method ?? 'にがてふくしゅう' : '？？？',
                      owned,
                    })}
                  >
                    <span className="boss-no">No.{String(index + 1).padStart(2, '0')}</span>
                    <MonsterSprite
                      left={fact.left}
                      right={fact.right}
                      locked={!owned}
                      className="book-pixel-icon"
                    />
                    <h2>{owned ? `${fact.left} × ${fact.right}` : '？？？'}</h2>
                    <p>{owned ? 'なかま' : 'まだ出会っていません'}</p>
                  </article>
                )
              })}
            </div>
          </section>
          <section className="collection-section" aria-labelledby="advanced-monsters-title">
            <h2 id="advanced-monsters-title">こうがくねんの なかま</h2>
            <div className="monster-grid book-grid">
              {advancedMonsterDefinitions.map((monster) => {
                const owned = isAdvancedMonsterOwned(saveData.progress.categoryCorrect, monster)
                const record = getCollectionRecord(saveData.progress.collectionRecords, 'advanced-monster', monster.id)
                const progressCount = advancedProgressForCategory(saveData.progress.categoryCorrect, monster.category)
                return (
                  <article
                    className={owned ? `book-card advanced-${monster.category}` : 'book-card silhouette'}
                    key={monster.id}
                    {...cardAction({
                      name: owned ? monster.name : '？？？',
                      description: owned ? monster.description : `${advancedMonsterCategoryLabels[monster.category]}をれんしゅうしよう`,
                      acquiredAt: owned ? record?.acquiredAt ?? null : null,
                      method: owned ? record?.method ?? `${advancedMonsterCategoryLabels[monster.category]} ${monster.threshold}もん` : '？？？',
                      owned,
                    })}
                  >
                    <span className="boss-no">A-{String(monster.no).padStart(2, '0')}</span>
                    <AdvancedMonsterSprite
                      monster={monster}
                      locked={!owned}
                      className="book-pixel-icon"
                    />
                    <h2>{owned ? monster.name : '？？？'}</h2>
                    <p>
                      {owned
                        ? monster.description
                        : `${progressCount}/${monster.threshold}もん`}
                    </p>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'ufos' ? (
        <section className="monster-grid book-grid" aria-label="UFO図かん">
          {ufoDefinitions.map((ufo) => {
            const owned = ownedUfos.has(ufo.id)
            const equipped = saveData.progress.equippedUfoId === ufo.id
            return (
              <article
                className={owned ? 'book-card ufo-book-card' : 'book-card silhouette ufo-book-card'}
                key={ufo.id}
                {...cardAction({
                  name: owned ? ufo.name : '？？？',
                  description: owned ? ufo.description : 'げきムズボスをクリアすると入手',
                  acquiredAt: acquiredAt('ufo', ufo.id),
                  method: owned ? getCollectionRecord(saveData.progress.collectionRecords, 'ufo', ufo.id)?.method ?? 'ボスげきムズ' : '？？？',
                  owned,
                })}
              >
                <span className="boss-no">No.{String(ufo.no).padStart(2, '0')}</span>
                <UfoBadge ufo={ufo} locked={!owned} />
                <h2>{owned ? ufo.name : '？？？'}</h2>
                <p>{owned ? ufo.description : 'シルエット'}</p>
                {owned ? (
                  <button
                    className="secondary-action compact-action"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      equipUfo(ufo.id)
                    }}
                    disabled={equipped}
                  >
                    {equipped ? 'そうび中' : 'そうび'}
                  </button>
                ) : null}
              </article>
            )
          })}
        </section>
      ) : null}

      {activeTab === 'treasures' ? (
        <section className="monster-grid book-grid" aria-label="ボスとおたから">
          {bosses.map((boss) => {
            const cleared = difficultyIds.some((difficulty) =>
              getDifficultyProgress(saveData, boss.id, difficulty).cleared,
            )
            const bestTime = Math.min(
              ...difficultyIds
                .map((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).bestTimeMs)
                .filter((time): time is number => time !== null),
              Infinity,
            )
            const firstClearedAt = difficultyIds
              .map((difficulty) => getDifficultyProgress(saveData, boss.id, difficulty).firstClearedAt)
              .find((date): date is string => Boolean(date)) ?? null
            const displayDifficulty = highestClearedDifficulty(saveData, boss)
            return (
              <article
                className={cleared ? 'book-card' : 'book-card silhouette'}
                key={boss.id}
                {...cardAction({
                  name: cleared ? boss.label : '？？？',
                  description: cleared ? `ベスト ${formatBestTime(bestTime === Infinity ? null : bestTime)}` : 'まだ出会っていません',
                  acquiredAt: firstClearedAt,
                  method: cleared ? 'ボス討伐' : '？？？',
                  owned: cleared,
                })}
              >
                <span className="boss-no">B-{String(boss.no).padStart(2, '0')}</span>
                <TrophySprite
                  danLabel={bossDanLabel(boss)}
                  accentDan={bossAccentDan(boss)}
                  difficulty={displayDifficulty}
                  kind="trophy"
                  locked={!cleared}
                  className="book-pixel-icon"
                />
                <h2>{cleared ? boss.label : '？？？'}</h2>
                <small>
                  {difficultyIds
                    .map((difficulty) =>
                      getDifficultyProgress(saveData, boss.id, difficulty).cleared
                        ? getBossDifficulty(boss, difficulty).label
                        : '未',
                    )
                    .join(' / ')}
                </small>
              </article>
            )
          })}
          {bossLimitedItems.map((item) => {
            const owned = ownedBossItems.has(item.id)
            const record = getCollectionRecord(saveData.progress.collectionRecords, 'boss-item', item.id)
            const boss = getBossForItem(item)
            return (
              <article
                className={owned ? 'book-card' : 'book-card silhouette'}
                key={item.id}
                {...cardAction({
                  name: owned ? item.name : '？？？',
                  description: owned ? item.description : 'ボスをクリアすると入手',
                  acquiredAt: record?.acquiredAt ?? null,
                  method: owned ? record?.method ?? item.tag : '？？？',
                  owned,
                })}
              >
                <span className="boss-no">T-{String(item.no).padStart(2, '0')}</span>
                <TrophySprite
                  danLabel={boss ? bossDanLabel(boss) : String(item.no)}
                  accentDan={boss ? bossAccentDan(boss) : 9}
                  difficulty={item.difficulty}
                  locked={!owned}
                  className="book-pixel-icon"
                />
                <h2>{owned ? item.name : '？？？'}</h2>
                <p>{owned ? item.description : 'ボスげんてい'}</p>
              </article>
            )
          })}
        </section>
      ) : null}

      {activeTab === 'collection' ? (
        <>
          <section className="collection-section" aria-labelledby="key-collection-title">
            <h2 id="key-collection-title">カギ</h2>
            <div className="monster-grid book-grid">
              {keyTypes.map((key) => {
                const entry = saveData.progress.treasureKeys[key.id]
                const owned = (entry?.count ?? 0) > 0
                return (
                  <article
                    className={owned ? 'book-card' : 'book-card silhouette'}
                    key={key.id}
                    {...cardAction({
                      name: owned ? key.name : '？？？',
                      description: owned ? key.description : 'たからばこでカギをあつめよう',
                      acquiredAt: entry?.firstAcquiredAt ?? null,
                      method: owned ? 'たからばこチャレンジ' : '？？？',
                      owned,
                    })}
                  >
                    <span className="boss-no">K-{String(key.no).padStart(2, '0')}</span>
                    <KeyIcon keyType={key} locked={!owned} className="book-svg-icon" />
                    <h2>{owned ? key.name : '？？？'}</h2>
                    <p>{owned ? `${entry?.count ?? 0}ほん` : '未入手'}</p>
                  </article>
                )
              })}
            </div>
          </section>
          {(['star', 'space', 'sparkle', 'creature', 'sweets'] as TreasureTheme[]).map((theme) => (
            <section className="collection-section" key={theme} aria-labelledby={`theme-${theme}`}>
              <h2 id={`theme-${theme}`}>{treasureThemeLabels[theme]}系</h2>
              <div className="monster-grid book-grid">
                {treasureItems
                  .filter((item) => item.theme === theme)
                  .map((item) => {
                    const record = saveData.progress.ownedTreasureItems.find((owned) => owned.id === item.id)
                    const owned = ownedTreasureItems.has(item.id)
                    return (
                      <article
                        className={owned ? `book-card rarity-${item.rarity}` : 'book-card silhouette'}
                        key={item.id}
                        {...cardAction({
                          name: owned ? item.name : '？？？',
                          description: owned ? item.description : 'たからばこから入手',
                          acquiredAt: record?.acquiredAt ?? null,
                          method: owned ? record?.method ?? 'たからばこ' : '？？？',
                          owned,
                        })}
                      >
                        <span className="boss-no">C-{String(item.no).padStart(2, '0')}</span>
                        <TreasureIcon item={item} locked={!owned} className="book-svg-icon" />
                        <h2>{owned ? item.name : '？？？'}</h2>
                        <p>{owned ? item.description : 'シルエット'}</p>
                        <small>{rarityStars(item.rarity)}</small>
                      </article>
                    )
                  })}
              </div>
            </section>
          ))}
        </>
      ) : null}

      {detail ? (
        <div className="book-detail-backdrop" role="presentation" onClick={() => setDetail(null)}>
          <section
            className="book-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="book-detail-title">{detail.name}</h2>
            <p>{detail.description}</p>
            <dl>
              <div>
                <dt>入手日</dt>
                <dd>{formatDate(detail.acquiredAt, detail.owned)}</dd>
              </div>
              <div>
                <dt>入手方法</dt>
                <dd>{detail.method}</dd>
              </div>
            </dl>
            <button className="primary-action wide" type="button" onClick={() => setDetail(null)}>
              とじる
            </button>
          </section>
        </div>
      ) : null}
    </AppShell>
  )
}
