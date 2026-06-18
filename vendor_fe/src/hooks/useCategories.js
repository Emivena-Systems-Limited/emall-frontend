import { useQuery } from '@tanstack/react-query'
import { getCategoriesWithChildren, getParentCategories } from '../services/categoriesService'

const STALE_TIME = 5 * 60 * 1000

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: getParentCategories,
    staleTime: STALE_TIME,
  })
}

export function useCategoriesWithChildren() {
  return useQuery({
    queryKey: ['categories', 'with-children'],
    queryFn: getCategoriesWithChildren,
    staleTime: STALE_TIME,
  })
}

export function useProductCategoryOptions() {
  const parentsQuery = useParentCategories()
  const treeQuery = useCategoriesWithChildren()

  return {
    parentCategories: parentsQuery.data ?? [],
    categoryTree: treeQuery.data ?? [],
    isLoading: parentsQuery.isLoading || treeQuery.isLoading,
    isError: parentsQuery.isError || treeQuery.isError,
    refetch: () => Promise.all([parentsQuery.refetch(), treeQuery.refetch()]),
  }
}
