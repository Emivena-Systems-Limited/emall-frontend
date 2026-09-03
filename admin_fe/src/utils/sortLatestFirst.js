export const LATEST_FIRST_QUERY = {
  sort: 'created_at',
  direction: 'desc',
}

function toTime(value) {
  if (value == null || value === '') return Number.NaN
  const time = value instanceof Date ? value.getTime() : Date.parse(value)
  return Number.isFinite(time) ? time : Number.NaN
}

function compareIds(left, right) {
  const leftId = String(left ?? '')
  const rightId = String(right ?? '')
  if (!leftId || !rightId || leftId === rightId) return 0

  const leftNum = Number(leftId)
  const rightNum = Number(rightId)
  if (Number.isFinite(leftNum) && Number.isFinite(rightNum) && leftNum !== rightNum) {
    return rightNum - leftNum
  }

  return rightId.localeCompare(leftId)
}

export function compareLatest(left, right, keys = ['createdAt', 'id']) {
  for (const key of keys) {
    const leftTime = toTime(left?.[key])
    const rightTime = toTime(right?.[key])
    const leftValid = Number.isFinite(leftTime)
    const rightValid = Number.isFinite(rightTime)
    if (leftValid && rightValid && leftTime !== rightTime) return rightTime - leftTime
    if (leftValid !== rightValid) return leftValid ? -1 : 1
  }

  return compareIds(left?.id, right?.id)
}

export function sortLatestFirst(items, keys = ['createdAt', 'id']) {
  return [...(items ?? [])].sort((left, right) => compareLatest(left, right, keys))
}
