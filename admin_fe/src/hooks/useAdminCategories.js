import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchCategoriesWithChildren,
  fetchParentCategories,
  updateAdminCategory,
} from '../services/categoryService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'

export const ADMIN_CATEGORIES_QUERY_KEY = ['admin-categories']

const STALE_TIME = 5 * 60 * 1000

function notifyWriteError(error, fallback) {
  if (error?.code === 'CATEGORY_WRITE_PENDING') {
    notify.info(error.message)
    return
  }
  notify.fromError(error, parseApiError(error).message || fallback)
}

export function useParentCategories(options = {}) {
  return useQuery({
    queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, 'parents'],
    queryFn: fetchParentCategories,
    staleTime: STALE_TIME,
    ...options,
  })
}

export function useCategoriesWithChildren(options = {}) {
  return useQuery({
    queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, 'tree'],
    queryFn: fetchCategoriesWithChildren,
    staleTime: STALE_TIME,
    ...options,
  })
}

export function useAdminCategories() {
  const parentsQuery = useParentCategories()
  const treeQuery = useCategoriesWithChildren()
  const tree = treeQuery.data ?? parentsQuery.data ?? []
  const parents = parentsQuery.data ?? treeQuery.data ?? []
  const hasRows = tree.length > 0
  const isLoading = !hasRows && (parentsQuery.isLoading || treeQuery.isLoading)
  const isError = !hasRows && !isLoading && parentsQuery.isError && treeQuery.isError

  return {
    parents,
    tree,
    isLoading,
    isFetching: parentsQuery.isFetching || treeQuery.isFetching,
    isError,
    error: isError ? (treeQuery.error ?? parentsQuery.error) : null,
    refetch: () => Promise.all([parentsQuery.refetch(), treeQuery.refetch()]),
  }
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_CATEGORIES_QUERY_KEY, 'create'],
    mutationFn: createAdminCategory,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      notify.success(data?.message || 'Category created.')
    },
    onError: (error) => {
      notifyWriteError(error, 'Could not create category.')
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_CATEGORIES_QUERY_KEY, 'update'],
    mutationFn: updateAdminCategory,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      notify.success(data?.message || 'Category updated.')
    },
    onError: (error) => {
      notifyWriteError(error, 'Could not update category.')
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_CATEGORIES_QUERY_KEY, 'delete'],
    mutationFn: ({ id }) => deleteAdminCategory(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      notify.success(data?.message || 'Category removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove category.')
    },
  })
}
