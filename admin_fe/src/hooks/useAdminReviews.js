import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { REVIEW_PAGE_SIZE, REVIEW_STATUS_TABS } from '../constants/reviews'
import {
  deleteAdminReview,
  deleteAdminReviewMedia,
  fetchAdminReviewById,
  fetchAdminReviews,
  updateAdminReviewFeatured,
  updateAdminReviewStatus,
} from '../services/adminReviewService'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import { emptyReviewPagination, normalizeReviewStatus } from '../utils/normalizeAdminReviews'

export const ADMIN_REVIEWS_QUERY_KEY = ['admin-reviews']

const STALE_TIME = 2 * 60 * 1000

export function reviewListQueryKey({
  status = '',
  search = '',
  rating = '',
  featured = '',
  vendorId = '',
  page = 1,
} = {}) {
  return [
    ...ADMIN_REVIEWS_QUERY_KEY,
    'list',
    status ?? '',
    search ?? '',
    rating ?? '',
    featured ?? '',
    vendorId ?? '',
    page,
    REVIEW_PAGE_SIZE,
  ]
}

export function useAdminReviewRoster(filters = {}, page = 1) {
  const query = useQuery({
    queryKey: reviewListQueryKey({ ...filters, page }),
    queryFn: () => fetchAdminReviews({ ...filters, page, perPage: REVIEW_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  return {
    reviews: query.data?.reviews ?? [],
    pagination: query.data?.pagination ?? emptyReviewPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function reviewCountQueryKey(status) {
  return [...ADMIN_REVIEWS_QUERY_KEY, 'count', status ?? '']
}

function bumpReviewCount(queryClient, status, delta) {
  queryClient.setQueryData(reviewCountQueryKey(status ?? ''), (current) => {
    if (!current?.pagination) return current
    return {
      ...current,
      pagination: {
        ...current.pagination,
        total: Math.max(0, Number(current.pagination.total ?? 0) + delta),
      },
    }
  })
}

export function useReviewStatusCounts(currentStatus = '', currentTotal = null) {
  const queries = useQueries({
    queries: REVIEW_STATUS_TABS.map((tab) => ({
      queryKey: reviewCountQueryKey(tab.status),
      queryFn: () => fetchAdminReviews({ status: tab.status, page: 1, perPage: 1 }),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  })

  const summary = { total: 0, visible: 0, hidden: 0 }

  REVIEW_STATUS_TABS.forEach((tab, index) => {
    const fromList = tab.status === currentStatus && currentTotal != null
    const total = fromList ? currentTotal : (queries[index]?.data?.pagination?.total ?? 0)
    if (tab.key === 'all') summary.total = total
    if (tab.key === 'visible') summary.visible = total
    if (tab.key === 'hidden') summary.hidden = total
  })

  return summary
}

export function reviewDetailQueryKey(id) {
  return [...ADMIN_REVIEWS_QUERY_KEY, 'detail', String(id ?? '')]
}

function findCachedReview(queryClient, id) {
  const queries = queryClient.getQueriesData({ queryKey: ADMIN_REVIEWS_QUERY_KEY })
  for (const [, data] of queries) {
    if (data?.id && String(data.id) === String(id)) return data
    const list = Array.isArray(data) ? data : data?.reviews
    if (!Array.isArray(list)) continue
    const match = list.find((item) => String(item.id) === String(id))
    if (match) return match
  }
  return undefined
}

export function useAdminReview(id) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: reviewDetailQueryKey(id),
    queryFn: () => fetchAdminReviewById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME,
    placeholderData: () => findCachedReview(queryClient, id),
  })

  return {
    review: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function prefetchAdminReview(queryClient, id) {
  if (!id) return undefined
  return queryClient.prefetchQuery({
    queryKey: reviewDetailQueryKey(id),
    queryFn: () => fetchAdminReviewById(id),
  })
}

function rememberReview(queryClient, review) {
  if (!review?.id) return
  queryClient.setQueryData(reviewDetailQueryKey(review.id), (current) => (
    current ? { ...current, ...review } : review
  ))
  queryClient.setQueriesData({ queryKey: [...ADMIN_REVIEWS_QUERY_KEY, 'list'] }, (current) => {
    if (!current?.reviews) return current
    return {
      ...current,
      reviews: current.reviews.map((item) => (
        String(item.id) === String(review.id) ? { ...item, ...review } : item
      )),
    }
  })
}

function refreshActiveReviewLists(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: [...ADMIN_REVIEWS_QUERY_KEY, 'list'],
    refetchType: 'active',
  })
}

export function useUpdateReviewStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_REVIEWS_QUERY_KEY, 'status'],
    mutationFn: updateAdminReviewStatus,
    onMutate: ({ id }) => ({
      previous: findCachedReview(queryClient, id),
    }),
    onSuccess: async (data, variables, context) => {
      const fromStatus = normalizeReviewStatus(context?.previous?.status, context?.previous?.approved)
      const toStatus = data?.review?.status ?? (variables.isApproved ? 'visible' : 'hidden')
      if (fromStatus && toStatus && fromStatus !== toStatus) {
        bumpReviewCount(queryClient, fromStatus, -1)
        bumpReviewCount(queryClient, toStatus, 1)
      }
      rememberReview(queryClient, data?.review)
      await refreshActiveReviewLists(queryClient)
      notify.success(data?.message || 'Review visibility updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update review visibility.')
    },
  })
}

export function useUpdateReviewFeaturedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_REVIEWS_QUERY_KEY, 'featured'],
    mutationFn: updateAdminReviewFeatured,
    onSuccess: async (data) => {
      rememberReview(queryClient, data?.review)
      await refreshActiveReviewLists(queryClient)
      notify.success(data?.message || 'Featured state updated.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not update featured review.')
    },
  })
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_REVIEWS_QUERY_KEY, 'delete'],
    mutationFn: ({ id }) => deleteAdminReview(id),
    onSuccess: async (data, variables) => {
      bumpReviewCount(queryClient, '', -1)
      bumpReviewCount(queryClient, variables?.status, -1)
      queryClient.removeQueries({ queryKey: reviewDetailQueryKey(data?.id || variables?.id) })
      await refreshActiveReviewLists(queryClient)
      notify.success(data?.message || 'Review removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove review.')
    },
  })
}

export function useDeleteReviewMediaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...ADMIN_REVIEWS_QUERY_KEY, 'media'],
    mutationFn: deleteAdminReviewMedia,
    onSuccess: async (data, variables) => {
      const mediaId = String(data?.mediaId || variables?.mediaId)
      if (data?.review?.id) {
        rememberReview(queryClient, data.review)
      } else {
        const id = String(data?.id || variables?.id)
        queryClient.setQueryData(reviewDetailQueryKey(id), (current) => {
          if (!current?.media) return current
          return {
            ...current,
            media: current.media.filter((item) => String(item.id) !== mediaId),
          }
        })
        queryClient.setQueriesData({ queryKey: [...ADMIN_REVIEWS_QUERY_KEY, 'list'] }, (current) => {
          if (!current?.reviews) return current
          return {
            ...current,
            reviews: current.reviews.map((item) => {
              if (String(item.id) !== id || !Array.isArray(item.media)) return item
              return {
                ...item,
                media: item.media.filter((entry) => String(entry.id) !== mediaId),
              }
            }),
          }
        })
      }
      notify.success(data?.message || 'Attachment removed.')
    },
    onError: (error) => {
      notify.fromError(error, parseApiError(error).message || 'Could not remove attachment.')
    },
  })
}
