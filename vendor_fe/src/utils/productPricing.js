function roundMoney(value) {
  return Math.round(value * 100) / 100
}

export { roundMoney }

export function formatMoney(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function resolveSalesPrice(regularPrice, discountMode, discountPrice, discountPercent) {
  const price = Number(regularPrice)
  if (!price || price <= 0) return null

  if (discountMode === 'percent') {
    if (discountPercent === '' || discountPercent == null) return null
    const percent = Number(discountPercent)
    if (Number.isNaN(percent) || percent <= 0 || percent >= 100) return null
    return roundMoney(price * (1 - percent / 100))
  }

  if (discountPrice === '' || discountPrice == null) return null
  const amount = Number(discountPrice)
  if (Number.isNaN(amount) || amount <= 0 || amount >= price) return null
  return roundMoney(amount)
}

export function getDiscountSummary(regularPrice, discountMode, discountPrice, discountPercent) {
  const price = Number(regularPrice) || 0
  const salesPrice = resolveSalesPrice(regularPrice, discountMode, discountPrice, discountPercent)

  if (!price || salesPrice == null) {
    return { salesPrice: null, savings: 0, percentOff: 0, hasDiscount: false }
  }

  const savings = roundMoney(price - salesPrice)
  const percentOff = roundMoney((savings / price) * 100)

  return {
    salesPrice,
    savings,
    percentOff,
    hasDiscount: true,
  }
}

export function convertDiscountAmountToPercent(regularPrice, discountAmount) {
  const price = Number(regularPrice)
  const amount = Number(discountAmount)
  if (!price || price <= 0 || Number.isNaN(amount) || amount <= 0 || amount >= price) return ''
  return String(roundMoney(((price - amount) / price) * 100))
}

export function convertDiscountPercentToAmount(regularPrice, discountPercent) {
  const price = Number(regularPrice)
  const percent = Number(discountPercent)
  if (!price || price <= 0 || Number.isNaN(percent) || percent <= 0 || percent >= 100) return ''
  return String(roundMoney(price * (1 - percent / 100)))
}

export function getParentProductPricing(productValues) {
  const regularPrice = roundMoney(Number(productValues.price) || 0)
  const salePrice = resolveSalesPrice(
    productValues.price,
    productValues.discount_mode ?? 'amount',
    productValues.discount_price,
    productValues.discount_percent,
  )
  const discountRatio =
    regularPrice > 0 && salePrice != null ? roundMoney(salePrice / regularPrice) : 1

  return {
    regularPrice,
    salePrice,
    discountRatio,
    hasDiscount: salePrice != null,
  }
}

/**
 * Resolves variant list and sale prices from parent pricing.
 * Empty variant price inherits parent amounts; overrides keep the parent discount rate.
 */
export function resolveVariantPricing(variantValue, productValues) {
  const parent = getParentProductPricing(productValues)
  const rawPrice = variantValue.price
  const rawSale = variantValue.discount_price

  const hasPriceOverride =
    rawPrice !== '' && rawPrice != null && !Number.isNaN(Number(rawPrice))
  const hasSaleOverride =
    rawSale !== '' && rawSale != null && !Number.isNaN(Number(rawSale))

  const listPrice = hasPriceOverride
    ? roundMoney(Number(rawPrice))
    : parent.regularPrice

  let salePrice = null
  if (hasSaleOverride) {
    const sale = roundMoney(Number(rawSale))
    if (sale > 0 && sale < listPrice) salePrice = sale
  } else if (parent.hasDiscount && listPrice > 0) {
    salePrice = hasPriceOverride
      ? roundMoney(listPrice * parent.discountRatio)
      : parent.salePrice
  }

  const customerPrice = salePrice ?? listPrice

  return {
    listPrice,
    salePrice,
    customerPrice,
    isInherited: !hasPriceOverride,
    isSaleInherited: !hasSaleOverride && parent.hasDiscount,
    hasSaleOverride,
    hasDiscount: salePrice != null,
    parent,
  }
}

export function getVariationCustomerPriceRange(variations, productValues) {
  const prices = (variations ?? []).flatMap((variation) =>
    variation.values.map((val) => resolveVariantPricing(val, productValues).customerPrice),
  ).filter((price) => price > 0)

  if (prices.length === 0) return null

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return { min: roundMoney(min), max: roundMoney(max), isRange: min !== max }
}

export function formatCustomerPriceRange(range) {
  if (!range) return null
  if (!range.isRange) return `GH₵ ${formatMoney(range.min)}`
  return `GH₵ ${formatMoney(range.min)} – GH₵ ${formatMoney(range.max)}`
}
