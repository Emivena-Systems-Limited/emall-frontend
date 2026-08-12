import { PROMOTION_ENDPOINTS } from '../constants/promotions'
import {
  duplicatePromotionRecord as duplicateMockPromotion,
  getPromotionById as getMockPromotionById,
  getVendorPromotions as getMockPromotions,
  removeVendorPromotion as removeMockPromotion,
  saveVendorPromotion as saveMockPromotion,
} from '../mocks/promotionMockData'

const MOCK_DELAY_MS = 450

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// TODO: Replace mock implementation when Promotions API is available.
export async function getPromotions() {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] GET (mock)', PROMOTION_ENDPOINTS.LIST)
  }

  return getMockPromotions()
}

// TODO: Connect promotion details API.
export async function getPromotion(promotionId) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] GET (mock)', PROMOTION_ENDPOINTS.byId(promotionId))
  }

  const promotion = getMockPromotionById(promotionId)
  if (!promotion) {
    throw new Error('Promotion not found.')
  }

  return promotion
}

// TODO: Connect create promotion API.
export async function createPromotion(promotion) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] POST (mock)', PROMOTION_ENDPOINTS.CREATE, promotion)
  }

  saveMockPromotion(promotion)
  return promotion
}

// TODO: Connect update promotion API.
export async function updatePromotion(promotionId, promotion) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] PUT (mock)', PROMOTION_ENDPOINTS.byId(promotionId), promotion)
  }

  saveMockPromotion({ ...promotion, id: promotionId })
  return getMockPromotionById(promotionId)
}

// TODO: Connect draft promotion API.
export async function saveDraft(promotion) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] POST (mock)', PROMOTION_ENDPOINTS.DRAFT, promotion)
  }

  saveMockPromotion({ ...promotion, status: 'draft' })
  const saved = getMockPromotionById(promotion.id)
  if (!saved) {
    throw new Error('Failed to save draft.')
  }
  return saved
}

// TODO: Connect delete promotion API.
export async function deletePromotion(promotionId) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] DELETE (mock)', PROMOTION_ENDPOINTS.byId(promotionId))
  }

  removeMockPromotion(promotionId)
}

// TODO: Connect promotion status API.
export async function updatePromotionStatus(promotionId, status) {
  await delay()

  if (import.meta.env.DEV) {
    console.info('[promotions] PATCH (mock)', PROMOTION_ENDPOINTS.STATUS(promotionId), { status })
  }

  const promotion = getMockPromotionById(promotionId)
  if (!promotion) {
    throw new Error('Promotion not found.')
  }

  saveMockPromotion({ ...promotion, status })
  return getMockPromotionById(promotionId)
}

// TODO: Connect duplicate promotion API.
export async function duplicatePromotion(promotion) {
  await delay()

  const copy = duplicateMockPromotion(promotion)
  saveMockPromotion(copy)
  return copy
}
