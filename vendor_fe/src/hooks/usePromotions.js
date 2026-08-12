import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPromotion,
  deletePromotion,
  duplicatePromotion,
  getPromotion,
  getPromotions,
  saveDraft,
  updatePromotion,
  updatePromotionStatus,
} from '../services/promotionService'

const STALE_TIME = 60 * 1000

export const promotionQueryKeys = {
  all: ['vendor-promotions'],
  list: () => [...promotionQueryKeys.all, 'list'],
  detail: (promotionId) => [...promotionQueryKeys.all, 'detail', promotionId],
}

// TODO: Connect promotion list API — swap queryFn when backend is ready.
export function usePromotions() {
  return useQuery({
    queryKey: promotionQueryKeys.list(),
    queryFn: getPromotions,
    staleTime: STALE_TIME,
  })
}

// TODO: Connect promotion details API.
export function usePromotion(promotionId) {
  return useQuery({
    queryKey: promotionQueryKeys.detail(promotionId),
    queryFn: () => getPromotion(promotionId),
    enabled: Boolean(promotionId),
    staleTime: STALE_TIME,
  })
}

function useInvalidatePromotions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all })
}

export function useCreatePromotionMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: createPromotion,
    onSuccess: invalidate,
  })
}

export function useUpdatePromotionMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: ({ promotionId, promotion }) => updatePromotion(promotionId, promotion),
    onSuccess: invalidate,
  })
}

export function useSaveDraftMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: saveDraft,
    onSuccess: invalidate,
  })
}

export function useDeletePromotionMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: invalidate,
  })
}

export function useUpdatePromotionStatusMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: ({ promotionId, status }) => updatePromotionStatus(promotionId, status),
    onSuccess: invalidate,
  })
}

export function useDuplicatePromotionMutation() {
  const invalidate = useInvalidatePromotions()

  return useMutation({
    mutationFn: duplicatePromotion,
    onSuccess: invalidate,
  })
}
