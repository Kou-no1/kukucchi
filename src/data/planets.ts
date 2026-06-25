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

export type SubtractionAreaId =
  | 'sub-within-9'
  | 'sub-within-10'
  | 'sub-borrow-basic'
  | 'sub-two-digit-no-borrow'
  | 'sub-two-digit-borrow'
  | 'sub-three-digit'

export type AdditionGeneratorRule =
  | 'sum-within-9'
  | 'sum-within-10'
  | 'one-digit-carry'
  | 'two-digit-no-carry'
  | 'two-digit-carry'
  | 'three-digit'

export type SubtractionGeneratorRule =
  | 'subtract-within-9'
  | 'subtract-within-10'
  | 'one-digit-borrow'
  | 'two-digit-no-borrow'
  | 'two-digit-borrow'
  | 'three-digit-borrow'

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
  | {
      operation: 'subtraction'
      areaId: SubtractionAreaId
      rule: SubtractionGeneratorRule
      category: QuestionCategory
      minMinuend: number
      maxMinuend: number
      minSubtrahend: number
      maxSubtrahend: number
    }

export type AdditionAreaDefinition = {
  id: AdditionAreaId
  no: number
  name: string
  shortName: string
  description: string
  generator: Extract<GeneratorSpec, { operation: 'addition' }>
}

export type SubtractionAreaDefinition = {
  id: SubtractionAreaId
  no: number
  name: string
  shortName: string
  description: string
  generator: Extract<GeneratorSpec, { operation: 'subtraction' }>
}

export type AreaDefinition = AdditionAreaDefinition | SubtractionAreaDefinition

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

export const additionAreas: AdditionAreaDefinition[] = [
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

export const subtractionAreas: SubtractionAreaDefinition[] = [
  {
    id: 'sub-within-9',
    no: 1,
    name: '1〜9のひきざん',
    shortName: '1〜9',
    description: 'こたえが1から8',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-within-9',
      rule: 'subtract-within-9',
      category: 'subtraction-within-9',
      minMinuend: 2,
      maxMinuend: 9,
      minSubtrahend: 1,
      maxSubtrahend: 8,
    },
  },
  {
    id: 'sub-within-10',
    no: 2,
    name: '10からのひきざん',
    shortName: '10から',
    description: '10までからひく',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-within-10',
      rule: 'subtract-within-10',
      category: 'subtraction-within-10',
      minMinuend: 2,
      maxMinuend: 10,
      minSubtrahend: 1,
      maxSubtrahend: 10,
    },
  },
  {
    id: 'sub-borrow-basic',
    no: 3,
    name: 'くりさがりのひきざん',
    shortName: 'くりさがり',
    description: '10をかりてひく',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-borrow-basic',
      rule: 'one-digit-borrow',
      category: 'subtraction-borrow-basic',
      minMinuend: 11,
      maxMinuend: 18,
      minSubtrahend: 2,
      maxSubtrahend: 9,
    },
  },
  {
    id: 'sub-two-digit-no-borrow',
    no: 4,
    name: '2けたのひきざん',
    shortName: '2けた',
    description: 'くりさがりなし',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-two-digit-no-borrow',
      rule: 'two-digit-no-borrow',
      category: 'subtraction-two-digit-no-borrow',
      minMinuend: 10,
      maxMinuend: 99,
      minSubtrahend: 10,
      maxSubtrahend: 99,
    },
  },
  {
    id: 'sub-two-digit-borrow',
    no: 5,
    name: '2けたのひきざん（くりさがり）',
    shortName: '2けたくりさがり',
    description: 'いちのくらいでかりる',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-two-digit-borrow',
      rule: 'two-digit-borrow',
      category: 'subtraction-two-digit-borrow',
      minMinuend: 10,
      maxMinuend: 99,
      minSubtrahend: 10,
      maxSubtrahend: 99,
    },
  },
  {
    id: 'sub-three-digit',
    no: 6,
    name: 'おおきいかずのひきざん',
    shortName: 'おおきいかず',
    description: '3けた-3けた',
    generator: {
      operation: 'subtraction',
      areaId: 'sub-three-digit',
      rule: 'three-digit-borrow',
      category: 'subtraction-three-digit',
      minMinuend: 100,
      maxMinuend: 999,
      minSubtrahend: 100,
      maxSubtrahend: 999,
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
    status: 'live',
    theme: {
      primary: '#d9663d',
      accent: '#ffd166',
      surface: '#fff4df',
      text: '#4f2314',
      motif: 'ゆうやけのくれーたー',
    },
    generator: subtractionAreas[0].generator,
    areas: subtractionAreas,
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

export function getAdditionAreaById(areaId: AdditionAreaId): AdditionAreaDefinition {
  return additionAreas.find((area) => area.id === areaId) ?? additionAreas[0]
}

export function isAdditionAreaId(value: string | null | undefined): value is AdditionAreaId {
  return additionAreas.some((area) => area.id === value)
}

export function getSubtractionAreaById(areaId: SubtractionAreaId): SubtractionAreaDefinition {
  return subtractionAreas.find((area) => area.id === areaId) ?? subtractionAreas[0]
}

export function isSubtractionAreaId(
  value: string | null | undefined,
): value is SubtractionAreaId {
  return subtractionAreas.some((area) => area.id === value)
}
