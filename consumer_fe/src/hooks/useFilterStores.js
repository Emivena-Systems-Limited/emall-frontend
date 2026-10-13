import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getStores } from '../services/storeService'
import {
  extractStoreDirectoryPagination,
  normalizeStoreDirectory,
} from '../utils/storefront'

async function fetchStoresPage(page) {
  const payload = await getStores(null, { page, perPage: 20 })
  const stores = normalizeStoreDirectory(payload).map((store) => ({
    id: store.id,
    name: store.name,
  }))
  const pagination = extractStoreDirectoryPagination(payload)

  return {
    stores,
    pagination: {
      ...pagination,
      hasMore: pagination.currentPage < pagination.lastPage,
    },
  }
}

export function useFilterStores({ enabled = true } = {}) {
  const query = useInfiniteQuery({
    queryKey: ['filter-stores'],
    queryFn: ({ pageParam = 1 }) => fetchStoresPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) return undefined
      return (lastPage.pagination.currentPage || 1) + 1
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const stores = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.stores ?? []),
    [query.data],
  )

  const total = query.data?.pages?.[0]?.pagination?.total ?? stores.length

  return {
    stores,
    total,
    isLoading: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
    refetch: query.refetch,
  }
}
