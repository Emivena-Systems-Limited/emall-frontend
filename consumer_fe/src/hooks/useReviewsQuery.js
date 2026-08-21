import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createReview,
  deleteReview,
  deleteReviewMedia,
  getEligibleReviewItems,
  getReview,
  getUserReviews,
  updateReview,
} from '../services/reviewService'
import { notify } from '../lib/notify'

export function useUserReviewsQuery(options = {}) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return useQuery({
    queryKey: ['user-reviews'],
    queryFn: getUserReviews,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
    refetchOnMount: 'always',
    ...options,
  })
}

export function useEligibleReviewItemsQuery(options = {}) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return useQuery({
    queryKey: ['eligible-review-items'],
    queryFn: getEligibleReviewItems,
    enabled: isAuthenticated,
    staleTime: 30_000,
    ...options,
  })
}

export function useReviewQuery(reviewId, options = {}) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return useQuery({
    queryKey: ['user-review', reviewId],
    queryFn: () => getReview(reviewId),
    enabled: isAuthenticated && Boolean(reviewId),
    ...options,
  })
}

export function useReviewMutations({ onSaved, onDeleted } = {}) {
  const queryClient = useQueryClient()

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['user-reviews'] }),
    queryClient.invalidateQueries({ queryKey: ['eligible-review-items'] }),
  ])

  const createMutation = useMutation({
    mutationFn: ({ payload, files = [] }) => createReview(payload, files),
    onSuccess: async () => {
      await refresh()
      notify.success('Review submitted successfully')
      onSaved?.()
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.warn(
          '[reviews] Create failed:',
          error?.response?.data ? JSON.stringify(error.response.data) : error?.message || error,
        )
      }
      notify.fromError(error, 'Failed to submit review')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ reviewId, payload, files = [] }) =>
      updateReview({ reviewId, payload, files }),
    onSuccess: async () => {
      await refresh()
      notify.success('Review updated successfully')
      onSaved?.()
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.warn(
          '[reviews] Update failed:',
          error?.response?.data ? JSON.stringify(error.response.data) : error?.message || error,
        )
      }
      notify.fromError(error, 'Failed to update review')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: async () => {
      await refresh()
      notify.success('Review deleted')
      onDeleted?.()
    },
    onError: (error) => notify.fromError(error, 'Failed to delete review'),
  })

  const deleteMediaMutation = useMutation({
    mutationFn: deleteReviewMedia,
    onSuccess: async () => {
      await refresh()
      notify.success('Review media removed')
    },
    onError: (error) => notify.fromError(error, 'Failed to remove review media'),
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMediaMutation,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
