import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createReview,
  deleteReview,
  deleteReviewMedia,
  getEligibleReviewItems,
  getReview,
  getUserReviews,
  resolveReviewId,
  updateReview,
  uploadReviewMedia,
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['user-reviews'] })

  const createMutation = useMutation({
    mutationFn: async ({ payload, files = [] }) => {
      const created = await createReview(payload)
      const reviewId = resolveReviewId(created)
      if (files.length && !reviewId) {
        throw new Error('Review was created, but its ID was missing so media could not be uploaded')
      }
      if (files.length) await uploadReviewMedia(reviewId, files)
      return created
    },
    onSuccess: async () => {
      await refresh()
      notify.success('Review submitted successfully')
      onSaved?.()
    },
    onError: (error) => notify.fromError(error, 'Failed to submit review'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ reviewId, payload, files = [] }) => {
      const updated = await updateReview({ reviewId, payload })
      if (files.length) await uploadReviewMedia(reviewId, files)
      return updated
    },
    onSuccess: async () => {
      await refresh()
      notify.success('Review updated successfully')
      onSaved?.()
    },
    onError: (error) => notify.fromError(error, 'Failed to update review'),
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
