import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LOCK_PURCHASE_ACTIONS } from '../config/featureFlags'
import { getProductById } from '../services/landingPageService'
import { resolveProductDisplayPrices } from '../utils/extractProductVariantFacets'
import {
  collectVariantImageUrls,
  isSimpleListingProduct,
  resolveVariantLowStockThreshold,
  resolveVariantStock,
  sumVariantAvailableStock,
} from '../utils/productVariantFields'
import {
  applyVariantOptionSelection,
  buildFamilyLeafSelections,
  buildVariantOptionGroups,
  buildVisibleOptionGroups,
  detectVariantFamilies,
  findLeafVariant,
  findPurchasableLeaf,
  getVisibleFamilySecondaryGroups,
  resolveInitialFamilyState,
  resolveInitialOptionSelections,
} from '../utils/variantOptionTree'

function readMetadata(metadata, key) {
  if (!Array.isArray(metadata)) return ''
  const item = metadata.find((entry) => entry?.key === key || entry?.meta_key === key)
  return String(item?.value ?? item?.meta_value ?? '').trim()
}

function resolveCatalogImage(apiProduct, fallback = '') {
  const images = Array.isArray(apiProduct?.images) ? [...apiProduct.images] : []
  images.sort((left, right) => {
    const leftPrimary = left?.is_primary === true || left?.is_primary === 1 || left?.is_primary === '1'
    const rightPrimary = right?.is_primary === true || right?.is_primary === 1 || right?.is_primary === '1'
    if (leftPrimary !== rightPrimary) return leftPrimary ? -1 : 1
    return Number(left?.sort_order ?? 0) - Number(right?.sort_order ?? 0)
  })
  return String(images[0]?.image_url ?? fallback ?? '').trim()
}

function buildQuickAddCatalog(apiProduct, cardProduct) {
  const variants = Array.isArray(apiProduct?.variants) ? apiProduct.variants : []
  const simple = isSimpleListingProduct({
    name: apiProduct?.name,
    metadata: apiProduct?.metadata,
    variants,
  })
  const mainAttributeValue = readMetadata(apiProduct?.metadata, 'main_attribute_value')

  return {
    id: apiProduct?.id ?? cardProduct?.backendId ?? cardProduct?.id,
    name: apiProduct?.name ?? cardProduct?.name ?? 'Product',
    slug: apiProduct?.slug ?? '',
    image: resolveCatalogImage(apiProduct, cardProduct?.image),
    variants,
    families: simple ? [] : detectVariantFamilies(variants),
    optionGroups: simple ? [] : buildVariantOptionGroups(variants),
    isSimpleListing: simple,
    mainAttributeValue,
    fallbackPrice: Number(cardProduct?.price) || 0,
    fallbackCompareAt: cardProduct?.compareAt ?? null,
  }
}

const EMPTY_FAMILIES = []
const EMPTY_GROUPS = []

export function useQuickAddCatalog({ open, cardProduct }) {
  const productId = String(cardProduct?.backendId ?? cardProduct?.id ?? '').trim()
  const productQuery = useQuery({
    queryKey: ['quick-add-product', productId],
    queryFn: () => getProductById(productId),
    enabled: Boolean(open && productId),
    staleTime: 60 * 1000,
    retry: 1,
  })

  const catalog = useMemo(
    () => (productQuery.data ? buildQuickAddCatalog(productQuery.data, cardProduct) : null),
    [productQuery.data, cardProduct],
  )

  const families = catalog?.families ?? EMPTY_FAMILIES
  const optionGroups = catalog?.optionGroups ?? EMPTY_GROUPS
  const isMultiFamily = families.length > 1
  const initialFamilyState = useMemo(
    () => resolveInitialFamilyState(families, catalog?.mainAttributeValue),
    [families, catalog?.mainAttributeValue],
  )
  const initialSelections = useMemo(
    () => resolveInitialOptionSelections(
      catalog?.variants ?? [],
      optionGroups,
      catalog?.mainAttributeValue,
    ),
    [catalog?.variants, optionGroups, catalog?.mainAttributeValue],
  )
  const [activeFamilyId, setActiveFamilyId] = useState(initialFamilyState.activeFamilyId)
  const [familyPrimary, setFamilyPrimary] = useState(initialFamilyState.familyPrimary)
  const [familySecondary, setFamilySecondary] = useState(initialFamilyState.familySecondary)
  const [selectedOptions, setSelectedOptions] = useState(initialSelections)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setActiveFamilyId(initialFamilyState.activeFamilyId)
    setFamilyPrimary(initialFamilyState.familyPrimary)
    setFamilySecondary(initialFamilyState.familySecondary)
    setSelectedOptions(initialSelections)
    setQuantity(1)
  }, [initialFamilyState, initialSelections])

  const activeFamily = families.find((family) => family.id === activeFamilyId) ?? families[0] ?? null

  const visibleSecondaries = useMemo(() => {
    if (!activeFamily) return []
    return getVisibleFamilySecondaryGroups(activeFamily, familyPrimary[activeFamily.id] ?? '')
  }, [activeFamily, familyPrimary])

  const visibleOptionGroups = useMemo(
    () => buildVisibleOptionGroups(catalog?.variants ?? [], optionGroups, selectedOptions),
    [catalog?.variants, optionGroups, selectedOptions],
  )

  const activeVariant = useMemo(() => {
    if (!catalog) return null
    if (catalog.isSimpleListing) return catalog.variants[0] ?? null
    if (isMultiFamily && activeFamily) {
      const selections = buildFamilyLeafSelections(
        activeFamily,
        familyPrimary[activeFamily.id] ?? '',
        familySecondary[activeFamily.id] ?? {},
      )
      return findPurchasableLeaf(catalog.variants, selections, activeFamily)
    }
    return findPurchasableLeaf(catalog.variants, selectedOptions)
      ?? findLeafVariant(catalog.variants, selectedOptions)
  }, [catalog, isMultiFamily, activeFamily, familyPrimary, familySecondary, selectedOptions])

  const pricing = resolveProductDisplayPrices(productQuery.data ?? cardProduct, activeVariant)
  const previewImage = collectVariantImageUrls(activeVariant)[0] || catalog?.image || cardProduct?.image
  const stockCount = activeVariant
    ? resolveVariantStock(activeVariant, 0)
    : sumVariantAvailableStock(catalog?.variants)
  const lowStockThreshold = resolveVariantLowStockThreshold(
    activeVariant,
    Number(readMetadata(productQuery.data?.metadata, 'low_stock_threshold')) || 10,
  )
  const outOfStock = stockCount <= 0
  const availableQuantity = Math.max(0, Math.floor(stockCount))
  const maxQuantity = availableQuantity > 0
    ? availableQuantity
    : (LOCK_PURCHASE_ACTIONS ? 0 : 1)

  useEffect(() => {
    setQuantity(1)
  }, [activeVariant?.id])

  const selectFamilyPrimary = (familyId, value) => {
    const family = families.find((item) => item.id === familyId)
    setActiveFamilyId(familyId)
    setFamilyPrimary((prev) => ({ ...prev, [familyId]: value }))
    if (!family) return
    const secMap = {}
    getVisibleFamilySecondaryGroups(family, value).forEach((group) => {
      secMap[group.key] = group.values[0] ?? ''
    })
    setFamilySecondary((prev) => ({ ...prev, [familyId]: secMap }))
  }

  const selectFamilySecondary = (familyId, secKey, value) => {
    setFamilySecondary((prev) => ({
      ...prev,
      [familyId]: { ...(prev[familyId] ?? {}), [secKey]: value },
    }))
  }

  const selectOption = (groupKey, value) => {
    setSelectedOptions((current) => applyVariantOptionSelection({
      variants: catalog?.variants ?? [],
      groups: optionGroups,
      currentSelections: current,
      groupKey,
      value,
    }))
  }

  const selectedLabel = isMultiFamily
    ? Object.values({
      ...(activeFamily ? { [activeFamily.primaryKey]: familyPrimary[activeFamily.id] } : {}),
      ...(familySecondary[activeFamily?.id] ?? {}),
    }).filter(Boolean).join(' · ')
    : Object.values(selectedOptions).filter(Boolean).join(' · ')

  return {
    productQuery,
    catalog,
    families,
    isMultiFamily,
    activeFamily,
    activeFamilyId,
    familyPrimary,
    visibleSecondaries,
    visibleOptionGroups,
    selectedOptions,
    selectedSecondary: familySecondary[activeFamily?.id] ?? {},
    selectFamilyPrimary,
    selectFamilySecondary,
    selectOption,
    activeVariant,
    pricing,
    previewImage,
    stockCount,
    lowStockThreshold,
    outOfStock,
    maxQuantity,
    quantity: Math.min(quantity, maxQuantity),
    setQuantity,
    selectedLabel,
    apiProduct: productQuery.data,
  }
}
