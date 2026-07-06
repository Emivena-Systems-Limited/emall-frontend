import { formatFacetLabel, normalizeFacetKey, toNumber } from './extractProductVariantFacets'
import { PRODUCT_CONDITION_FILTERS } from '../constants/productConditions'
import { getAnticipatedFacetDefinitions, getAnticipatedFacetPriority } from '../constants/categoryFacetPriorities'

export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'discount', label: 'Biggest Discount' },
]

export const PRICE_PRESETS = [
  { id: 'under-50', label: 'Under GHS 50', min: null, max: 50 },
  { id: '50-100', label: 'GHS 50 – 100', min: 50, max: 100 },
  { id: '100-250', label: 'GHS 100 – 250', min: 100, max: 250 },
  { id: '250-500', label: 'GHS 250 – 500', min: 250, max: 500 },
  { id: '500-plus', label: 'GHS 500+', min: 500, max: null },
]

export const RATING_OPTIONS = [
  { id: '4', min: 4 },
  { id: '3', min: 3 },
  { id: '2', min: 2 },
  { id: '1', min: 1 },
]

export function createEmptyCategoryFilters() {
  return {
    sort: 'recommended',
    subcategorySlugs: [],
    colors: [],
    sizes: [],
    attributes: {},
    brands: [],
    conditions: [],
    pricePreset: null,
    priceMin: null,
    priceMax: null,
    minRating: null,
  }
}

function getVariantAttributeValue(variant, facetKey) {
  const normalized = normalizeFacetKey(facetKey)
  if (normalized === 'color') return variant.color
  if (normalized === 'size') return variant.size
  if (normalized === 'style') return variant.variantName
  return variant.attributes?.[normalized] ?? null
}

function variantMatchesFacetFilters(variant, filters) {
  if (filters.colors.length && !filters.colors.includes(String(variant.color ?? ''))) return false
  if (filters.sizes.length && !filters.sizes.includes(String(variant.size ?? ''))) return false

  return Object.entries(filters.attributes).every(([facetKey, selectedValues]) => {
    if (!selectedValues.length) return true
    const value = getVariantAttributeValue(variant, facetKey)
    return value != null && selectedValues.includes(String(value))
  })
}

function productMatchesFacetFilters(product, filters) {
  const facets = product.variantFacets ?? {}

  if (filters.colors.length && !filters.colors.some((value) => facets.color?.includes(value))) return false
  if (filters.sizes.length && !filters.sizes.some((value) => facets.size?.includes(value))) return false

  return Object.entries(filters.attributes).every(([facetKey, selectedValues]) => {
    if (!selectedValues.length) return true
    const normalized = normalizeFacetKey(facetKey)
    const available = facets[normalized] ?? []
    return selectedValues.some((value) => available.includes(value))
  })
}

function hasVariantFacetFilters(filters) {
  if (filters.colors.length || filters.sizes.length) return true
  return Object.values(filters.attributes).some((values) => values.length > 0)
}

function productMatchesVariantFilters(product, filters) {
  if (!hasVariantFacetFilters(filters)) return true

  const variants = product.variants ?? []
  if (variants.length) {
    return variants.some((variant) => variantMatchesFacetFilters(variant, filters))
  }

  return productMatchesFacetFilters(product, filters)
}

function productMatchesPrice(product, filters) {
  const min = filters.priceMin
  const max = filters.priceMax
  if (min == null && max == null) return true

  const productMin = product.minPrice ?? product.price ?? 0
  const productMax = product.maxPrice ?? product.price ?? productMin

  if (min != null && productMax < min) return false
  if (max != null && productMin > max) return false
  return true
}

export function applyCategoryFilters(products, filters) {
  return products.filter((product) => {
    if (filters.subcategorySlugs.length) {
      const slug = product.subcategorySlug
      if (!slug || !filters.subcategorySlugs.includes(slug)) return false
    }

    if (filters.brands.length && !filters.brands.includes(product.brand)) return false

    if (filters.conditions.length) {
      const condition = String(product.condition ?? '').trim().toLowerCase()
      if (!filters.conditions.some((value) => condition === String(value).toLowerCase())) return false
    }

    if (filters.minRating != null && (product.rating ?? 0) < filters.minRating) return false

    if (!productMatchesPrice(product, filters)) return false
    if (!productMatchesVariantFilters(product, filters)) return false

    return true
  })
}

export function sortCategoryProducts(products, sortId) {
  const items = [...products]

  switch (sortId) {
    case 'price-asc':
      return items.sort((a, b) => (a.minPrice ?? a.price) - (b.minPrice ?? b.price))
    case 'price-desc':
      return items.sort((a, b) => (b.maxPrice ?? b.price) - (a.maxPrice ?? a.price))
    case 'rating':
      return items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    case 'discount':
      return items.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    default:
      return items
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function buildSubcategoryOptions(catalogSubcategories = [], products = []) {
  const map = new Map()

  catalogSubcategories.forEach((subcategory) => {
    const slug = subcategory.slug ?? subcategory.id
    if (!slug) return

    map.set(slug, {
      id: slug,
      label: subcategory.label ?? subcategory.name ?? slug.replace(/-/g, ' '),
      image: subcategory.image ?? null,
    })
  })

  products.forEach((product) => {
    const slug = product.subcategorySlug
    if (!slug || map.has(slug)) return

    map.set(slug, {
      id: slug,
      label: product.subcategory ?? slug.replace(/-/g, ' '),
      image: null,
    })
  })

  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
}

function sortFacetsByPriority(facets, priorityList) {
  return [...facets].sort((a, b) => {
    const aRank = priorityList.indexOf(a.id)
    const bRank = priorityList.indexOf(b.id)
    const aScore = aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank
    const bScore = bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank
    if (aScore !== bScore) return aScore - bScore
    return a.label.localeCompare(b.label)
  })
}

export function buildCategoryFilterGroups(products, subcategories = [], categoryContext = {}) {
  const brands = uniqueSorted(products.map((product) => product.brand))
  const facetMap = new Map()

  products.forEach((product) => {
    Object.entries(product.variantFacets ?? {}).forEach(([key, values]) => {
      if (!facetMap.has(key)) facetMap.set(key, new Set())
      values.forEach((value) => facetMap.get(key).add(value))
    })
  })

  const anticipatedFacets = getAnticipatedFacetDefinitions(
    categoryContext.categoryLabel,
    categoryContext.subcategoryLabel,
  )

  anticipatedFacets.forEach(({ id, values }) => {
    if (!facetMap.has(id)) facetMap.set(id, new Set())
    values.forEach((value) => facetMap.get(id).add(value))
  })

  const priorityList = getAnticipatedFacetPriority(
    categoryContext.categoryLabel,
    categoryContext.subcategoryLabel,
  )

  const dynamicFacets = sortFacetsByPriority(
    [...facetMap.entries()]
      .filter(([key]) => !['color', 'size'].includes(key))
      .map(([key, values]) => ({
        id: key,
        label: formatFacetLabel(key),
        values: [...values].sort((a, b) => a.localeCompare(b)),
      })),
    priorityList,
  )

  const colors = uniqueSorted([
    ...products.flatMap((product) => product.variantFacets?.color ?? []),
    ...(anticipatedFacets.find((facet) => facet.id === 'color')?.values ?? []),
  ])
  const sizes = uniqueSorted([
    ...products.flatMap((product) => product.variantFacets?.size ?? []),
    ...(anticipatedFacets.find((facet) => facet.id === 'size')?.values ?? []),
  ])

  // Anticipatory ordering: merge color/size with the dynamic attribute facets
  // and rank the combined set by what's predicted to matter most for this
  // category/subcategory, so the drawer leads with the filters shoppers are
  // most likely to reach for (e.g. Storage + RAM before Color on phones,
  // Size + Color before Material on apparel).
  const variantSections = sortFacetsByPriority(
    [
      colors.length ? { id: 'color', label: 'Color', type: 'color', values: colors } : null,
      sizes.length ? { id: 'size', label: 'Size & fit', type: 'chip', values: sizes } : null,
      ...dynamicFacets.map((facet) => ({ ...facet, type: 'chip' })),
    ].filter(Boolean),
    priorityList,
  )

  const priceMin = products.length
    ? Math.min(...products.map((product) => product.minPrice ?? product.price ?? 0))
    : 0
  const priceMax = products.length
    ? Math.max(...products.map((product) => product.maxPrice ?? product.price ?? 0))
    : 0

  return {
    subcategories: buildSubcategoryOptions(subcategories, products),
    colors,
    sizes,
    dynamicFacets,
    variantSections,
    brands,
    conditions: PRODUCT_CONDITION_FILTERS.map(({ id, label, icon }) => ({
      id,
      label,
      icon,
    })),
    priceMin,
    priceMax,
  }
}

export function countActiveFilters(filters) {
  let count = 0
  count += filters.subcategorySlugs.length
  count += filters.colors.length
  count += filters.sizes.length
  count += filters.brands.length
  count += filters.conditions.length
  count += Object.values(filters.attributes).reduce((sum, values) => sum + values.length, 0)
  if (filters.pricePreset || filters.priceMin != null || filters.priceMax != null) count += 1
  if (filters.minRating != null) count += 1
  if (filters.sort !== 'recommended') count += 1
  return count
}

export function getSortChipLabel(sortId = 'recommended') {
  const option = SORT_OPTIONS.find((item) => item.id === sortId)
  return option ? `Sort by: ${option.label}` : 'Sort by: Relevance'
}

export function getQuickFilterChips(filterGroups, filters = {}, options = {}) {
  const chips = [
    { id: 'sort', label: getSortChipLabel(filters.sort), type: 'sort' },
  ]

  if (filterGroups.subcategories.length > 0 && !options.hideSubcategoryChip) {
    chips.push({ id: 'subcategory', label: 'Category', type: 'subcategory' })
  }

  if (filterGroups.colors.length) {
    chips.push({ id: 'color', label: 'Color', type: 'color' })
  }

  const attributeSections = (filterGroups.variantSections ?? []).filter(
    (section) => !['color', 'size'].includes(section.id),
  )

  attributeSections.forEach((section) => {
    chips.push({
      id: section.id,
      label: section.label,
      type: 'attribute',
      facetId: section.id,
    })
  })

  if (filterGroups.sizes.length) {
    chips.push({ id: 'size', label: 'Size', type: 'size' })
  }

  if (filterGroups.brands.length) {
    chips.push({ id: 'brand', label: 'Brand', type: 'brand' })
  }

  chips.push({ id: 'price', label: 'Price', type: 'price' })

  return chips
}

export function getFilterPanelConfig(chip, filterGroups) {
  switch (chip.type) {
    case 'sort':
      return {
        id: chip.id,
        type: chip.type,
        options: SORT_OPTIONS.map((option) => ({
          id: option.id,
          label: option.label,
          value: option.id,
        })),
      }
    case 'subcategory':
      return {
        id: chip.id,
        type: chip.type,
        options: filterGroups.subcategories.map((subcategory) => ({
          id: subcategory.id,
          label: subcategory.label,
          value: subcategory.id,
        })),
      }
    case 'brand':
      return {
        id: chip.id,
        type: chip.type,
        options: filterGroups.brands.map((brand) => ({
          id: brand,
          label: brand,
          value: brand,
        })),
      }
    case 'color':
      return {
        id: chip.id,
        type: chip.type,
        options: filterGroups.colors.map((color) => ({
          id: color,
          label: color,
          value: color,
        })),
      }
    case 'size':
      return {
        id: chip.id,
        type: chip.type,
        options: filterGroups.sizes.map((size) => ({
          id: size,
          label: size,
          value: size,
        })),
      }
    case 'price':
      return {
        id: chip.id,
        type: chip.type,
        options: PRICE_PRESETS.map((preset) => ({
          id: preset.id,
          label: preset.label,
          value: preset.id,
          preset,
        })),
      }
    case 'attribute': {
      const facet = (filterGroups.variantSections ?? []).find((section) => section.id === chip.facetId)
        ?? filterGroups.dynamicFacets.find((section) => section.id === chip.facetId)

      return {
        id: chip.facetId,
        type: chip.type,
        options: (facet?.values ?? []).map((value) => ({
          id: value,
          label: value,
          value,
        })),
      }
    }
    default:
      return { id: chip.id, type: chip.type, options: [] }
  }
}

export function isFilterPanelValueSelected(filters, panel, value) {
  switch (panel.type) {
    case 'sort':
      return filters.sort === value
    case 'subcategory':
      return filters.subcategorySlugs.includes(value)
    case 'brand':
      return filters.brands.includes(value)
    case 'color':
      return filters.colors.includes(value)
    case 'size':
      return filters.sizes.includes(value)
    case 'price':
      return filters.pricePreset === value
    case 'attribute':
      return (filters.attributes[panel.id] ?? []).includes(value)
    default:
      return false
  }
}

export function toggleFilterPanelValue(filters, panel, value, option = null) {
  switch (panel.type) {
    case 'sort':
      return { ...filters, sort: value }
    case 'subcategory':
      return {
        ...filters,
        subcategorySlugs: toggleFilterValue(filters.subcategorySlugs, value),
      }
    case 'brand':
      return { ...filters, brands: toggleFilterValue(filters.brands, value) }
    case 'color':
      return { ...filters, colors: toggleFilterValue(filters.colors, value) }
    case 'size':
      return { ...filters, sizes: toggleFilterValue(filters.sizes, value) }
    case 'price':
      return filters.pricePreset === value
        ? clearPriceFilters(filters)
        : applyPricePreset(filters, option?.preset ?? PRICE_PRESETS.find((preset) => preset.id === value))
    case 'attribute':
      return toggleAttributeFilter(filters, panel.id, value)
    default:
      return filters
  }
}

export function resetFilterPanelSection(filters, panel) {
  switch (panel.type) {
    case 'sort':
      return { ...filters, sort: 'recommended' }
    case 'subcategory':
      return { ...filters, subcategorySlugs: [] }
    case 'brand':
      return { ...filters, brands: [] }
    case 'color':
      return { ...filters, colors: [] }
    case 'size':
      return { ...filters, sizes: [] }
    case 'price':
      return clearPriceFilters(filters)
    case 'attribute':
      return {
        ...filters,
        attributes: {
          ...filters.attributes,
          [panel.id]: [],
        },
      }
    default:
      return filters
  }
}

export function applyPricePreset(filters, preset) {
  return {
    ...filters,
    pricePreset: preset.id,
    priceMin: preset.min,
    priceMax: preset.max,
  }
}

export function clearPriceFilters(filters) {
  return {
    ...filters,
    pricePreset: null,
    priceMin: null,
    priceMax: null,
  }
}

export function toggleFilterValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function toggleAttributeFilter(filters, facetId, value) {
  const current = filters.attributes[facetId] ?? []
  const next = toggleFilterValue(current, value)

  return {
    ...filters,
    attributes: {
      ...filters.attributes,
      [facetId]: next,
    },
  }
}

export function getChipActiveCount(filters, chip) {
  switch (chip.type) {
    case 'sort':
      return filters.sort !== 'recommended' ? 1 : 0
    case 'price':
      return filters.pricePreset || filters.priceMin != null || filters.priceMax != null ? 1 : 0
    case 'subcategory':
      return filters.subcategorySlugs.length
    case 'color':
      return filters.colors.length
    case 'size':
      return filters.sizes.length
    case 'brand':
      return filters.brands.length
    case 'attribute':
      return (filters.attributes[chip.facetId] ?? []).length
    default:
      return 0
  }
}

export function formatPriceRangeLabel(min, max) {
  if (min != null && max != null) return `GHS ${min} – ${max}`
  if (min != null) return `GHS ${min}+`
  if (max != null) return `Under GHS ${max}`
  return 'Any price'
}
