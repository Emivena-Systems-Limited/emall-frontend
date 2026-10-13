import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getApprovedBrands } from '../services/brandService'

export function useApprovedBrands({ enabled = true } = {}) {
  const query = useInfiniteQuery({
    queryKey: ['approved-brands'],
    queryFn: ({ pageParam = 1 }) => getApprovedBrands({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) return undefined
      return (lastPage.pagination.currentPage || 1) + 1
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const brands = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.brands ?? []),
    [query.data],
  )

  const total = query.data?.pages?.[0]?.pagination?.total ?? brands.length

  return {
    brands,
    total,
    isLoading: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
    refetch: query.refetch,
  }
}
