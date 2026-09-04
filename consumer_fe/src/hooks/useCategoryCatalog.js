import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCategoriesWithChildren, getParentCategories } from '../services/categoryService'
import { mergeParentsWithTree } from '../utils/normalizeCategories'

const STALE_TIME = 5 * 60 * 1000

const parentQueryOptions = {
  queryKey: ['parent-categories'],
  queryFn: getParentCategories,
  staleTime: STALE_TIME,
  retry: 1,
}

const treeQueryOptions = {
  queryKey: ['categories-with-children'],
  queryFn: getCategoriesWithChildren,
  staleTime: STALE_TIME,
  retry: 1,
}

export function useCategoryCatalog() {
  const parentsQuery = useQuery(parentQueryOptions)
  const treeQuery = useQuery(treeQueryOptions)

  const parentCategories = useMemo(
    () => mergeParentsWithTree(parentsQuery.data ?? [], treeQuery.data ?? []),
    [parentsQuery.data, treeQuery.data],
  )

  return {
    parentCategories,
    categoryTree: treeQuery.data ?? [],
    isLoading: parentsQuery.isPending || treeQuery.isPending,
    isError: Boolean(parentsQuery.isError && treeQuery.isError),
  }
}
