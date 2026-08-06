import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'

export function getVariantPriceDisplay(variantValue, productValues = {}) {
  const pricing = resolveVariantPricing(variantValue, productValues)

  return {
    listPrice: pricing.listPrice,
    customerPrice: pricing.customerPrice,
    hasDiscount: pricing.hasDiscount,
    showPricing: pricing.listPrice > 0,
  }
}

export function formatVariantPriceLabel({ customerPrice, listPrice, hasDiscount }) {
  if (hasDiscount) {
    return {
      primary: `GH₵ ${formatMoney(customerPrice)}`,
      compareAt: `GH₵ ${formatMoney(listPrice)}`,
    }
  }

  return {
    primary: `GH₵ ${formatMoney(listPrice)}`,
    compareAt: null,
  }
}
