import { APPLICATION_TYPES } from '../constants/promotions'
import { resolveAppliesToLabels } from './promotionCatalogFilters'
import { validatePromotionSchedule } from './promotionSchedule'

export function normalizeApplicationType(value) {
  if (value === 'specific_categories') return APPLICATION_TYPES.CATEGORIES
  if (value === APPLICATION_TYPES.ALL_PRODUCTS) return APPLICATION_TYPES.ALL_PRODUCTS
  if (value === APPLICATION_TYPES.CATEGORIES) return APPLICATION_TYPES.CATEGORIES
  if (value === APPLICATION_TYPES.SPECIFIC_PRODUCTS) return APPLICATION_TYPES.SPECIFIC_PRODUCTS
  return APPLICATION_TYPES.ALL_PRODUCTS
}

export function validatePromotionForm(form) {
  const applicationType = normalizeApplicationType(form.applicationType ?? form.application_type ?? form.appliesTo)

  if (!form.name.trim()) return 'Promotion name is required.'

  const scheduleError = validatePromotionSchedule(form)
  if (scheduleError) return scheduleError

  if (
    applicationType === APPLICATION_TYPES.CATEGORIES
    && (!form.categoryIds || form.categoryIds.length === 0)
  ) {
    return 'Select at least one category.'
  }
  if (
    applicationType === APPLICATION_TYPES.SPECIFIC_PRODUCTS
    && (!form.productIds || form.productIds.length === 0)
  ) {
    return 'Select at least one product.'
  }
  return null
}

export function buildPromotionPayload(form, status, { categoryOptions, productOptions }) {
  const applicationType = normalizeApplicationType(form.applicationType ?? form.application_type ?? form.appliesTo)
  const categoryIds = applicationType === APPLICATION_TYPES.CATEGORIES ? (form.categoryIds ?? []) : []
  const productIds = applicationType === APPLICATION_TYPES.SPECIFIC_PRODUCTS ? (form.productIds ?? []) : []

  return {
    ...form,
    id: form.id || `promo-${Date.now()}`,
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    status,
    applicationType,
    application_type: applicationType,
    discountValue: Number(form.discountValue) || 0,
    maximumDiscount: Number(form.maximumDiscount) || 0,
    categoryIds,
    productIds,
    appliesToLabels: resolveAppliesToLabels(
      applicationType,
      categoryIds,
      productIds,
      { categories: categoryOptions, products: productOptions },
    ),
    orders: form.orders ?? 0,
    revenue: form.revenue ?? 0,
  }
}
