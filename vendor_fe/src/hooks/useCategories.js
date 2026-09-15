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

  const categoryTree = treeQuery.data ?? []
  const parentCategories = categoryTree.length > 0
    ? categoryTree
    : (parentsQuery.data ?? [])

  const hasOptions = parentCategories.length > 0
  const isLoading = enabled && !hasOptions && (parentsQuery.isLoading || treeQuery.isLoading)
  const isError = enabled && !hasOptions && parentsQuery.isError && treeQuery.isError

  return {
    parentCategories,
    categoryTree: categoryTree.length > 0 ? categoryTree : parentCategories,
    isLoading,
    isError,
    refetch: () => Promise.all([parentsQuery.refetch(), treeQuery.refetch()]),
  }
}
