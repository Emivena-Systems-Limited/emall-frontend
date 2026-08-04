import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReview, deleteReview, getUserReviews, updateReview } from '../services/reviewService'
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

export function useReviewMutations({ onSaved, onDeleted } = {}) {
  const queryClient = useQueryClient()

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['user-reviews'] })

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      await refresh()
      notify.success('Review submitted successfully')
      onSaved?.()
    },
    onError: (error) => notify.fromError(error, 'Failed to submit review'),
  })

  const updateMutation = useMutation({
    mutationFn: updateReview,
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

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
