import type { QuestionCategory } from '../types/game'

export type PlanetId = 'multiply' | 'add' | 'subtract'
export type PlanetStatus = 'live' | 'planned'

export type AdditionAreaId =
  | 'add-within-9'
  | 'add-within-10'
  | 'add-carry-basic'
  | 'add-two-digit-no-carry'
  | 'add-two-digit-carry'
  | 'add-three-digit'

export type AdditionGeneratorRule =
  | 'sum-within-9'
  | 'sum-within-10'
  | 'one-digit-carry'
  | 'two-digit-no-carry'
  | 'two-digit-carry'
  | 'three-digit'

export type GeneratorSpec =
  | {
      operation: 'multiplication'
      stages: number[]
    }
  | {
      operation: 'addition'
      areaId: AdditionAreaId
      rule: AdditionGeneratorRule
      category: QuestionCategory
      minAddend: number
      maxAddend: number
    }

export type AreaDefinition = {
  id: AdditionAreaId
  no: number
  name: string
  shortName: string
  description: string
  generator: Extract<GeneratorSpec, { operation: 'addition' }>
}

export type PlanetTheme = {
  primary: string
  accent: string
  surface: string
  text: string
  motif: string
}

export type PlanetDefinition = {
  id: PlanetId
  name: string
  shortName: string
  status: PlanetStatus
  theme: PlanetTheme
  generator: GeneratorSpec
  areas: AreaDefinition[]
}

export const additionAreas: AreaDefinition[] = [
  {
    id: 'add-within-9',
    no: 1,
    name: '1〜9のたしざん',
    shortName: '1〜9',
    description: 'こたえが9まで',
    generator: {
      operation: 'addition',
      areaId: 'add-within-9',
      rule: 'sum-within-9',
      category: 'addition-within-9',
      minAddend: 1,
      maxAddend: 8,
    },
  },
  {
    id: 'add-within-10',
    no: 2,
    name: '10までのたしざん',
    shortName: '10まで',
    description: 'こたえが10まで',
    generator: {
      operation: 'addition',
      areaId: 'add-within-10',
      rule: 'sum-within-10',
      category: 'addition-within-10',
      minAddend: 1,
      maxAddend: 9,
    },
  },
  {
    id: 'add-carry-basic',
    no: 3,
    name: 'くりあがりのたしざん',
    shortName: 'くりあがり',
    description: '1けた+1けた',
    generator: {
      operation: 'addition',
      areaId: 'add-carry-basic',
      rule: 'one-digit-carry',
      category: 'addition-carry-basic',
      minAddend: 1,
      maxAddend: 9,
    },
  },
  {
    id: 'add-two-digit-no-carry',
    no: 4,
    name: '2けたのたしざん',
    shortName: '2けた',
    description: 'くりあがりなし',
    generator: {
      operation: 'addition',
      areaId: 'add-two-digit-no-carry',
      rule: 'two-digit-no-carry',
      category: 'addition-two-digit-no-carry',
      minAddend: 10,
      maxAddend: 99,
    },
  },
  {
    id: 'add-two-digit-carry',
    no: 5,
    name: '2けたのたしざん（くりあがり）',
    shortName: '2けたくりあがり',
    description: 'いちのくらいでくりあがり',
    generator: {
      operation: 'addition',
      areaId: 'add-two-digit-carry',
      rule: 'two-digit-carry',
      category: 'addition-two-digit-carry',
      minAddend: 10,
      maxAddend: 99,
    },
  },
  {
    id: 'add-three-digit',
    no: 6,
    name: 'おおきいかずのたしざん',
    shortName: 'おおきいかず',
    description: '3けた+3けた',
    generator: {
      operation: 'addition',
      areaId: 'add-three-digit',
      rule: 'three-digit',
      category: 'addition-three-digit',
      minAddend: 100,
      maxAddend: 999,
    },
  },
]

export const planets: PlanetDefinition[] = [
  {
    id: 'add',
    name: 'たしざんのほし',
    shortName: 'たしざん',
    status: 'live',
    theme: {
      primary: '#2fa866',
      accent: '#ffb43d',
      surface: '#edfce9',
      text: '#10351f',
      motif: 'みどりのくさばな',
    },
    generator: additionAreas[0].generator,
    areas: additionAreas,
  },
  {
    id: 'subtract',
    name: 'ひきざんのほし',
    shortName: 'ひきざん',
    status: 'planned',
    theme: {
      primary: '#c45a8a',
      accent: '#ffd166',
      surface: '#fff1f5',
      text: '#4f1530',
      motif: 'ゆうやけのクレーター',
    },
    generator: {
      operation: 'addition',
      areaId: 'add-within-10',
      rule: 'sum-within-10',
      category: 'addition-within-10',
      minAddend: 1,
      maxAddend: 9,
    },
    areas: [],
  },
  {
    id: 'multiply',
    name: 'かけざんのほし',
    shortName: 'かけざん',
    status: 'live',
    theme: {
      primary: '#3f7df4',
      accent: '#7fe7ff',
      surface: '#eaf3ff',
      text: '#09245c',
      motif: 'こおりのリング',
    },
    generator: {
      operation: 'multiplication',
      stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    areas: [],
  },
]

export function getPlanetById(planetId: PlanetId): PlanetDefinition {
  return planets.find((planet) => planet.id === planetId) ?? planets[0]
}

export function getAdditionAreaById(areaId: AdditionAreaId): AreaDefinition {
  return additionAreas.find((area) => area.id === areaId) ?? additionAreas[0]
}

export function isAdditionAreaId(value: string | null | undefined): value is AdditionAreaId {
  return additionAreas.some((area) => area.id === value)
}
