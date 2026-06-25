import { useQuery } from '@tanstack/react-query'
import { getCategoriesWithChildren, getParentCategories } from '../services/categoriesService'

const STALE_TIME = 5 * 60 * 1000

export function useParentCategories(options = {}) {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: getParentCategories,
    staleTime: STALE_TIME,
    ...options,
  })
}

export function useCategoriesWithChildren(options = {}) {
  return useQuery({
    queryKey: ['categories', 'with-children'],
    queryFn: getCategoriesWithChildren,
    staleTime: STALE_TIME,
    ...options,
  })
}

export function useProductCategoryOptions(options = {}) {
  const { enabled = true, ...queryOptions } = options
  const parentsQuery = useParentCategories({ enabled, ...queryOptions })
  const treeQuery = useCategoriesWithChildren({ enabled, ...queryOptions })

  return {
    parentCategories: parentsQuery.data ?? [],
    categoryTree: treeQuery.data ?? [],
    isLoading: parentsQuery.isLoading || treeQuery.isLoading,
    isError: parentsQuery.isError || treeQuery.isError,
    refetch: () => Promise.all([parentsQuery.refetch(), treeQuery.refetch()]),
  }
}
