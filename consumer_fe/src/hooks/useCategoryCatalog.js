import { useQuery } from '@tanstack/react-query'
import { getCategoriesWithChildren, getParentCategories } from '../services/categoryService'

const STALE_TIME = 5 * 60 * 1000

export function useCategoryCatalog() {
  const parentsQuery = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: STALE_TIME,
    retry: 1,
  })

  const treeQuery = useQuery({
    queryKey: ['categories-with-children'],
    queryFn: getCategoriesWithChildren,
    staleTime: STALE_TIME,
    retry: 1,
  })

  return {
    parentCategories: parentsQuery.data ?? [],
    categoryTree: treeQuery.data ?? [],
    isLoading: parentsQuery.isLoading || treeQuery.isLoading,
    isError: parentsQuery.isError || treeQuery.isError,
  }
}
