import { APPLICATION_TYPES, DISCOUNT_TYPES } from '../constants/promotions'
import { resolveAppliesToLabels } from './promotionCatalogFilters'
import { validatePromotionSchedule } from './promotionSchedule'

export function normalizeApplicationType(value) {
  if (value === 'specific_categories') return APPLICATION_TYPES.CATEGORIES
  if (value === APPLICATION_TYPES.ALL_PRODUCTS) return APPLICATION_TYPES.ALL_PRODUCTS
  if (value === APPLICATION_TYPES.CATEGORIES) return APPLICATION_TYPES.CATEGORIES
  if (value === APPLICATION_TYPES.SPECIFIC_PRODUCTS) return APPLICATION_TYPES.SPECIFIC_PRODUCTS
  return APPLICATION_TYPES.ALL_PRODUCTS
}

function validateDiscountFields(form, errors) {
  const { discountType } = form

  if (discountType === DISCOUNT_TYPES.PERCENTAGE) {
    const value = Number(form.discountValue)
    if (form.discountValue === '' || Number.isNaN(value)) {
      errors.discountValue = 'Discount value is required.'
    } else if (value <= 0) {
      errors.discountValue = 'Discount must be greater than 0%.'
    } else if (value > 100) {
      errors.discountValue = 'Percentage discount cannot exceed 100%.'
    }
  }

  if (discountType === DISCOUNT_TYPES.FIXED) {
    const value = Number(form.discountValue)
    if (form.discountValue === '' || Number.isNaN(value)) {
      errors.discountValue = 'Discount value is required.'
    } else if (value <= 0) {
      errors.discountValue = 'Discount amount must be greater than GH₵ 0.'
    }
  }
}

export function validatePromotionForm(form, { mode = 'publish' } = {}) {
  const errors = {}
  const applicationType = normalizeApplicationType(form.applicationType ?? form.application_type ?? form.appliesTo)

  if (!form.type) {
    errors.type = 'Select a promotion type.'
  }

  if (!form.name?.trim()) {
    errors.name = 'Promotion name is required.'
  }

  if (mode === 'publish' && !form.shortDescription?.trim()) {
    errors.shortDescription = 'Short description is required.'
  }

  if (mode === 'publish') {
    validateDiscountFields(form, errors)

    const scheduleError = validatePromotionSchedule(form)
    if (scheduleError) {
      errors.schedule = scheduleError
    }

    if (
      applicationType === APPLICATION_TYPES.CATEGORIES
      && (!form.categoryIds || form.categoryIds.length === 0)
    ) {
      errors.categoryIds = 'Select at least one category.'
    }

    if (
      applicationType === APPLICATION_TYPES.SPECIFIC_PRODUCTS
      && (!form.productIds || form.productIds.length === 0)
    ) {
      errors.productIds = 'Select at least one product.'
    }
  }

  const firstError = Object.values(errors)[0] ?? null
  return { errors, isValid: Object.keys(errors).length === 0, firstError }
}

export function validatePromotionDraft(form) {
  const errors = {}

  if (!form.name?.trim()) {
    errors.name = 'Promotion name is required to save a draft.'
  }

  const firstError = Object.values(errors)[0] ?? null
  return { errors, isValid: Object.keys(errors).length === 0, firstError }
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

export function isPromotionFormDirty(current, initial) {
  return JSON.stringify(normalizeFormSnapshot(current)) !== JSON.stringify(normalizeFormSnapshot(initial))
}

function normalizeFormSnapshot(form) {
  return {
    name: form?.name ?? '',
    shortDescription: form?.shortDescription ?? '',
    type: form?.type ?? '',
    discountType: form?.discountType ?? '',
    discountValue: String(form?.discountValue ?? ''),
    maximumDiscount: String(form?.maximumDiscount ?? ''),
    startDate: form?.startDate ?? '',
    endDate: form?.endDate ?? '',
    applicationType: form?.applicationType ?? '',
    categoryIds: [...(form?.categoryIds ?? [])].sort(),
    productIds: [...(form?.productIds ?? [])].sort(),
  }
}

// Backward-compatible helper for callers expecting a string error.
export function getPromotionFormError(form, options) {
  return validatePromotionForm(form, options).firstError
}
