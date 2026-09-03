import {
  SEARCH_LOG_PAGE_SIZE,
  SEARCH_MIX_SLICE_LIMIT,
  SEARCH_OUTCOME_MIX,
  SEARCH_SOURCE_FALLBACK_COLORS,
  SEARCH_SOURCE_META,
} from '../constants/searchAnalytics'
import { unwrapApiEnvelope } from './parseApiError'
import { composeFullName } from './profileUtils'
import { sortLatestFirst } from './sortLatestFirst'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function firstText(...values) {
  for (const value of values) {
    if (value == null || isRecord(value) || Array.isArray(value)) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const raw = source?.[key]
    if (raw == null || raw === '' || Array.isArray(raw) || isRecord(raw)) continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

function titleCaseName(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function unwrapStats(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (!isRecord(payload)) return {}
  if (Array.isArray(payload.data) && ('current_page' in payload || 'last_page' in payload)) return {}
  if (isRecord(payload.stats)) return payload.stats
  if (isRecord(payload.analytics)) return payload.analytics
  if (isRecord(payload.summary)) return payload.summary
  return payload
}

function humanizeSource(value) {
  return String(value ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function resolveSearchSource(rawKey) {
  const key = String(rawKey ?? '').trim().toLowerCase()
  if (!key) return null
  const known = SEARCH_SOURCE_META[key]
  if (known) return { ...known }
  return {
    key,
    label: humanizeSource(key) || 'Storefront',
    accent: SEARCH_SOURCE_FALLBACK_COLORS[Math.abs(key.length) % SEARCH_SOURCE_FALLBACK_COLORS.length],
  }
}

function sourceEntries(raw) {
  if (Array.isArray(raw)) return raw
  if (isRecord(raw)) return Object.entries(raw).map(([source, count]) => ({ source, count }))
  return []
}

function normalizeSourceSlice(entry, index) {
  if (typeof entry === 'string') {
    const meta = resolveSearchSource(entry)
    return meta ? { ...meta, count: 0 } : null
  }
  if (!isRecord(entry)) return null
  const meta = resolveSearchSource(firstText(entry.source, entry.key, entry.name, entry.channel, entry.origin))
  if (!meta) return null
  const count = pickNumber(entry, ['count', 'searches', 'total', 'value'], 0)
  if (count <= 0) return null
  return { ...meta, id: `${meta.key}-${index + 1}`, count }
}

function foldSourceMix(slices) {
  const grouped = new Map()
  slices.forEach((slice) => {
    const current = grouped.get(slice.key)
    if (current) {
      current.count += slice.count
      return
    }
    grouped.set(slice.key, { ...slice })
  })

  const ranked = [...grouped.values()].sort((left, right) => right.count - left.count)
  if (ranked.length <= SEARCH_MIX_SLICE_LIMIT) return ranked

  const kept = ranked.slice(0, SEARCH_MIX_SLICE_LIMIT - 1)
  const restCount = ranked.slice(SEARCH_MIX_SLICE_LIMIT - 1).reduce((sum, slice) => sum + slice.count, 0)
  if (restCount > 0) {
    kept.push({
      key: 'other',
      label: 'Other',
      accent: '#64748b',
      count: restCount,
    })
  }
  return kept
}

function buildOutcomeMix(total, zeroResults) {
  const found = Math.max(0, total - zeroResults)
  return [
    { ...SEARCH_OUTCOME_MIX.found, count: found },
    { ...SEARCH_OUTCOME_MIX.none, count: zeroResults },
  ].filter((slice) => slice.count > 0)
}

export function normalizeSearchStats(body) {
  const source = unwrapStats(body)
  const total = pickNumber(source, ['total_searches', 'searches', 'total'])
  const zeroResults = pickNumber(source, ['zero_result_searches', 'zero_results', 'empty_searches'])
  const sourceMix = foldSourceMix(
    sourceEntries(source.by_source ?? source.sources ?? source.source_counts)
      .map((entry, index) => normalizeSourceSlice(entry, index))
      .filter(Boolean),
  )

  return {
    total,
    uniqueQueries: pickNumber(source, ['unique_queries', 'distinct_queries', 'queries']),
    todaySearches: pickNumber(source, ['today_searches', 'today']),
    weekSearches: pickNumber(source, ['week_searches', 'this_week']),
    zeroResults,
    sourceMix,
    outcomeMix: buildOutcomeMix(total, zeroResults),
  }
}

function extractNamedList(body, keys) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

export function normalizeSearchQuery(record, index) {
  if (typeof record === 'string') {
    const query = record.trim()
    return query ? { id: `query-${index + 1}`, query, searches: 0, shoppers: 0, misses: 0 } : null
  }
  if (!isRecord(record)) return null
  const query = firstText(record.query, record.term, record.search_query, record.keyword, record.q)
  if (!query) return null
  return {
    id: firstText(record.id, query) || `query-${index + 1}`,
    query,
    searches: pickNumber(record, ['search_count', 'searches', 'count', 'hits', 'times']),
    shoppers: pickNumber(record, ['users_count', 'unique_users', 'shoppers']),
    misses: pickNumber(record, ['zero_result_count', 'zero_results', 'empty_count']),
  }
}

export function normalizeSearchTopQueries(body) {
  return extractNamedList(body, ['queries', 'data', 'top_queries', 'terms'])
    .map((record, index) => normalizeSearchQuery(record, index))
    .filter(Boolean)
    .sort((left, right) => {
      if (right.searches !== left.searches) return right.searches - left.searches
      return right.shoppers - left.shoppers
    })
}

function extractLogList(body) {
  return extractNamedList(body, ['data', 'logs', 'searches', 'records', 'items'])
}

function pickPaginationSource(payload) {
  if (!isRecord(payload) || Array.isArray(payload)) return {}
  const nested = isRecord(payload.pagination) ? payload.pagination : {}
  const meta = isRecord(payload.meta) ? payload.meta : {}
  return { ...payload, ...meta, ...nested }
}

export function extractSearchLogPagination(body) {
  const envelope = unwrapApiEnvelope(body)
  const payload = envelope?.data ?? envelope
  const list = extractLogList(body)
  const source = pickPaginationSource(payload)
  const page = Number(source.current_page ?? source.currentPage ?? 1)
  const perPage = Number(source.per_page ?? source.perPage ?? SEARCH_LOG_PAGE_SIZE)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : SEARCH_LOG_PAGE_SIZE
  const total = Number(source.total ?? list.length)
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : list.length
  const inferredLastPage = Math.max(1, Math.ceil((safeTotal || 1) / safePerPage))
  const lastPage = Number(source.last_page ?? source.lastPage ?? inferredLastPage)
  const inferredFrom = list.length ? (safePage - 1) * safePerPage + 1 : 0
  const inferredTo = list.length ? inferredFrom + list.length - 1 : 0
  const fromRaw = Number(source.from)
  const toRaw = Number(source.to)

  return {
    page: safePage,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: safePerPage,
    total: Number.isFinite(safeTotal) ? safeTotal : 0,
    from: Number.isFinite(fromRaw) && fromRaw > 0 ? fromRaw : inferredFrom,
    to: Number.isFinite(toRaw) && toRaw > 0 ? toRaw : inferredTo,
  }
}

export function normalizeSearchLog(record, index) {
  if (!isRecord(record)) return null
  const query = firstText(record.query, record.term, record.search_query, record.keyword, record.q)
  const id = firstText(record.id)
  if (!id && !query) return null

  const user = isRecord(record.user) ? record.user : {}
  const shopperId = firstText(record.user_id, user.id)
  const shopperName = titleCaseName(composeFullName(user.first_name, user.last_name))
    || titleCaseName(firstText(user.name, user.full_name))
  const sourceMeta = resolveSearchSource(firstText(record.source, record.channel, record.origin))
  const resultsCount = pickNumber(record, ['results_count', 'result_count', 'hits', 'results'])

  return {
    id: id || `log-${index + 1}`,
    query: query || 'Search',
    shopperId,
    shopperName: shopperName || (shopperId ? 'Shopper' : 'Guest'),
    shopperEmail: firstText(user.email),
    sourceLabel: sourceMeta?.label || '',
    resultsCount,
    createdAt: firstText(record.created_at, record.searched_at, record.timestamp),
  }
}

export function normalizeSearchLogs(body) {
  return sortLatestFirst(
    extractLogList(body).map((record, index) => normalizeSearchLog(record, index)).filter(Boolean),
    ['createdAt', 'id'],
  )
}

export function formatSearchAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function emptySearchPagination() {
  return {
    page: 1,
    lastPage: 1,
    total: 0,
    perPage: SEARCH_LOG_PAGE_SIZE,
    from: 0,
    to: 0,
  }
}

export function emptySearchStats() {
  return {
    total: 0,
    uniqueQueries: 0,
    todaySearches: 0,
    weekSearches: 0,
    zeroResults: 0,
    sourceMix: [],
    outcomeMix: [],
  }
}
