import {
  useCategoriesWithChildren,
  useParentCategories,
} from './useAdminCategories'

export { useParentCategories, useCategoriesWithChildren }

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
