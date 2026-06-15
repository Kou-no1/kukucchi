import { bosses } from './bosses'

export type UfoVariant = 'stage' | 'all' | 'square' | 'pi' | 'mixed' | 'special'

export type UfoDefinition = {
  id: string
  no: number
  bossId: string | null
  name: string
  description: string
  variant: UfoVariant
  lights: number
  motif: string
}

export const specialUfoId = 'ufo-special-master'

const bossUfoSeeds: Record<
  string,
  Pick<UfoDefinition, 'name' | 'description' | 'variant' | 'lights' | 'motif'>
> = {
  'boss-stage-2': {
    name: 'ツインライトごう',
    description: '2つのライトで1・2のだんをてらすUFO。',
    variant: 'stage',
    lights: 2,
    motif: '2',
  },
  'boss-stage-3': {
    name: 'さんかくムーンごう',
    description: '3つのライトと月マークのUFO。',
    variant: 'stage',
    lights: 3,
    motif: '3',
  },
  'boss-stage-4': {
    name: 'フォーライトごう',
    description: '4つのライトで四方をまもるUFO。',
    variant: 'stage',
    lights: 4,
    motif: '4',
  },
  'boss-stage-5': {
    name: 'ごほうびスターごう',
    description: '5つのライトが星みたいに光るUFO。',
    variant: 'stage',
    lights: 5,
    motif: '5',
  },
  'boss-stage-6': {
    name: 'シックスリングごう',
    description: '6つのライトと輪っかがじまんのUFO。',
    variant: 'stage',
    lights: 6,
    motif: '6',
  },
  'boss-stage-7': {
    name: 'セブンコメットごう',
    description: '7つのライトで流れ星を追いかけるUFO。',
    variant: 'stage',
    lights: 7,
    motif: '7',
  },
  'boss-stage-8': {
    name: 'エイトギャラクシーごう',
    description: '8つのライトが銀河みたいに並ぶUFO。',
    variant: 'stage',
    lights: 8,
    motif: '8',
  },
  'boss-stage-9': {
    name: 'ナインロケットごう',
    description: '9つのライトでぐんぐん進むUFO。',
    variant: 'stage',
    lights: 9,
    motif: '9',
  },
  'boss-all-kuku': {
    name: 'ぜんぶのせクラウンごう',
    description: '全九九をこえたしるしの王冠UFO。',
    variant: 'all',
    lights: 9,
    motif: '王',
  },
  'boss-square': {
    name: 'スクエアダイヤごう',
    description: '平方数のきらめきをのせたダイヤUFO。',
    variant: 'square',
    lights: 4,
    motif: '□',
  },
  'boss-pi': {
    name: 'パイくるりんごう',
    description: '3.14のうずをくるりとまとったUFO。',
    variant: 'pi',
    lights: 3,
    motif: 'π',
  },
  'boss-development': {
    name: 'はってんレインボーごう',
    description: 'ミックスと発展の色をぜんぶのせたUFO。',
    variant: 'mixed',
    lights: 9,
    motif: '虹',
  },
}

export const bossUfos: UfoDefinition[] = bosses.map((boss) => ({
  id: `${boss.id}-ufo`,
  no: boss.no,
  bossId: boss.id,
  ...bossUfoSeeds[boss.id],
}))

export const specialUfo: UfoDefinition = {
  id: specialUfoId,
  no: bosses.length + 1,
  bossId: null,
  name: 'にじいろレジェンドごう',
  description: `${bosses.length}体のげきムズボスをすべてこえた特別なUFO。`,
  variant: 'special',
  lights: 12,
  motif: '虹',
}

export const ufoDefinitions: UfoDefinition[] = [...bossUfos, specialUfo]

export function getUfoById(ufoId: string | null | undefined): UfoDefinition | undefined {
  if (!ufoId) {
    return undefined
  }
  return ufoDefinitions.find((ufo) => ufo.id === ufoId)
}

export function getUfoForBoss(bossId: string): UfoDefinition | undefined {
  return bossUfos.find((ufo) => ufo.bossId === bossId)
}
