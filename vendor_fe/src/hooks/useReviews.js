import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getVendorReviews,
  getVendorReviewsSummary,
  replyToVendorReview,
} from '../services/reviewService'

const STALE_TIME = 60 * 1000

export const reviewQueryKeys = {
  all: ['vendor-reviews'],
  list: (filters = {}) => [...reviewQueryKeys.all, 'list', filters],
  summary: () => [...reviewQueryKeys.all, 'summary'],
}

export function useVendorReviews(filters = {}, { enabled = true } = {}) {
  const queryFilters = {
    startDate: filters.startDate ?? '',
    endDate: filters.endDate ?? '',
    search: filters.search ?? '',
    ratingFilter: filters.ratingFilter ?? 'all',
    replyFilter: filters.replyFilter ?? 'all',
    sortOrder: filters.sortOrder ?? 'desc',
    page: filters.page ?? 1,
    perPage: filters.perPage ?? 8,
  }

  return useQuery({
    queryKey: reviewQueryKeys.list(queryFilters),
    queryFn: () => getVendorReviews(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  })
}

export function useVendorReviewsSummary({ enabled = true } = {}) {
  return useQuery({
    queryKey: reviewQueryKeys.summary(),
    queryFn: getVendorReviewsSummary,
    enabled,
    staleTime: STALE_TIME,
  })
}

export function useReplyToVendorReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, text }) => replyToVendorReview(reviewId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all })
    },
  })
}
