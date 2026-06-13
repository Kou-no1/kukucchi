import type { CollectionRecord } from '../../types/save'

export function collectionRecordId(kind: string, id: string): string {
  return `${kind}:${id}`
}

export function getCollectionRecord(
  records: CollectionRecord[],
  kind: string,
  id: string,
): CollectionRecord | undefined {
  const recordId = collectionRecordId(kind, id)
  return records.find((record) => record.id === recordId)
}

export function addCollectionRecords(
  records: CollectionRecord[],
  items: Array<{ kind: string; id: string; acquiredAt: string; method: string }>,
): CollectionRecord[] {
  const byId = new Map(records.map((record) => [record.id, record]))
  for (const item of items) {
    const id = collectionRecordId(item.kind, item.id)
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        acquiredAt: item.acquiredAt,
        method: item.method,
      })
    }
  }
  return Array.from(byId.values())
}
