import { useEffect, useMemo, useRef, useState } from 'react'
import StoreSearchWorker from '../workers/storeSearch.worker?worker'
import {
  buildStoreSearchIndex,
  filterStoreSearchIndex,
  pickStoresByIds,
} from '../utils/storeSearchIndex'

const SEARCH_DEBOUNCE_MS = 300

function applySearchResult({ ids, query, stores, lastResultsRef }) {
  const nextIds = new Set((Array.isArray(ids) ? ids : []).map(String))
  const next = pickStoresByIds(stores, [...nextIds])
  lastResultsRef.current = next
  return {
    matchedIds: nextIds,
    resolvedQuery: String(query ?? ''),
    filteredStores: next,
  }
}

export function useStoreDirectorySearch(stores, draftQuery, debounceMs = SEARCH_DEBOUNCE_MS) {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [matchedIds, setMatchedIds] = useState(null)
  const [resolvedQuery, setResolvedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const workerRef = useRef(null)
  const requestIdRef = useRef(0)
  const lastResultsRef = useRef(stores)
  const storesRef = useRef(stores)
  const searchIndex = useMemo(() => buildStoreSearchIndex(stores), [stores])

  storesRef.current = stores

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(draftQuery.trim())
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [draftQuery, debounceMs])

  useEffect(() => {
    if (typeof Worker === 'undefined') return undefined

    const worker = new StoreSearchWorker()
    workerRef.current = worker

    worker.onmessage = (event) => {
      const { requestId, ids, query } = event.data ?? {}
      if (requestId !== requestIdRef.current) return

      const result = applySearchResult({
        ids,
        query,
        stores: storesRef.current,
        lastResultsRef,
      })

      setMatchedIds(result.matchedIds)
      setResolvedQuery(result.resolvedQuery)
      setIsSearching(false)
    }

    worker.onerror = () => {
      setIsSearching(false)
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    const needle = debouncedQuery.trim().toLowerCase()

    if (!needle) {
      setMatchedIds(null)
      setResolvedQuery('')
      setIsSearching(false)
      lastResultsRef.current = stores
      return
    }

    if (!searchIndex.length) {
      setMatchedIds(new Set())
      setResolvedQuery(needle)
      setIsSearching(false)
      lastResultsRef.current = []
      return
    }

    setIsSearching(true)
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const worker = workerRef.current
    if (worker) {
      worker.postMessage({
        requestId,
        query: needle,
        stores: searchIndex,
      })
      return
    }

    const result = applySearchResult({
      ids: filterStoreSearchIndex(searchIndex, needle),
      query: needle,
      stores,
      lastResultsRef,
    })

    setMatchedIds(result.matchedIds)
    setResolvedQuery(result.resolvedQuery)
    setIsSearching(false)
  }, [debouncedQuery, searchIndex, stores])

  const filteredStores = useMemo(() => {
    if (!debouncedQuery.trim()) {
      lastResultsRef.current = stores
      return stores
    }

    if (resolvedQuery === debouncedQuery.trim().toLowerCase() && matchedIds) {
      const next = pickStoresByIds(stores, [...matchedIds])
      lastResultsRef.current = next
      return next
    }

    return lastResultsRef.current
  }, [stores, debouncedQuery, matchedIds, resolvedQuery])

  const isPendingSearch =
    Boolean(draftQuery.trim()) && draftQuery.trim() !== debouncedQuery.trim()
  const isPendingResults =
    Boolean(debouncedQuery.trim()) && resolvedQuery !== debouncedQuery.trim().toLowerCase()

  return {
    debouncedQuery,
    filteredStores,
    isSearching: isPendingSearch || isPendingResults || isSearching,
  }
}
