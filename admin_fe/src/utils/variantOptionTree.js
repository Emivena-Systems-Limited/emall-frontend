import {
  collectVariantImageUrls,
  getVariantAttributeValue,
  isSameVariantOption,
  normalizeVariantAttributeEntries,
  resolveCanonicalVariantOption,
} from './productPayload'

function formatGroupLabel(key) {
  return String(key ?? '').charAt(0).toUpperCase() + String(key ?? '').slice(1).replace(/_/g, ' ')
}

function attributeKeysMatch(left, right) {
  return String(left ?? '').trim().toLowerCase() === String(right ?? '').trim().toLowerCase()
}

function resolvePrimaryAttribute(variant) {
  const entries = normalizeVariantAttributeEntries(variant?.attributes)
  return entries.find((entry) => entry.is_primary) ?? entries[0] ?? null
}

function resolveSecondaryStoreKey(store, attributeName) {
  const existing = Object.keys(store).find((key) => attributeKeysMatch(key, attributeName))
  return existing || attributeName
}

function buildFamilyFromLeaves(leaves = []) {
  let primaryKey = ''
  for (const variant of leaves) {
    const primary = resolvePrimaryAttribute(variant)
    if (primary?.name) { primaryKey = primary.name; break }
  }

  const primaryValues = []
  const primaryImages = {}
  const seenPrimary = new Set()
  const secondaryKeyMap = {}

  leaves.forEach((variant) => {
    const entries = normalizeVariantAttributeEntries(variant.attributes)
    const primaryEntry = primaryKey
      ? (entries.find((entry) => attributeKeysMatch(entry.name, primaryKey)) ?? entries.find((entry) => entry.is_primary))
      : entries.find((entry) => entry.is_primary)
    const primaryVal = primaryEntry?.value ?? ''

    if (primaryVal && !seenPrimary.has(primaryVal.toLowerCase())) {
      seenPrimary.add(primaryVal.toLowerCase())
      primaryValues.push(primaryVal)
      const imgs = collectVariantImageUrls(variant)
      if (imgs[0]) primaryImages[primaryVal] = imgs[0]
    }

    entries
      .filter((entry) => !attributeKeysMatch(entry.name, primaryKey))
      .forEach((entry) => {
        const storeKey = resolveSecondaryStoreKey(secondaryKeyMap, entry.name)
        if (!secondaryKeyMap[storeKey]) secondaryKeyMap[storeKey] = new Set()
        secondaryKeyMap[storeKey].add(entry.value)
      })
  })

  const secondaryGroups = Object.entries(secondaryKeyMap).map(([key, vals]) => ({
    key,
    label: formatGroupLabel(key),
    values: [...vals],
    images: {},
  }))

  return {
    id: leaves[0]?.id ?? String(Math.random()),
    leaves,
    primaryKey,
    primaryLabel: formatGroupLabel(primaryKey),
    primaryValues,
    primaryImages,
    secondaryGroups,
  }
}

function mergeFamiliesByPrimaryKey(families = []) {
  const merged = []
  const indexByKey = new Map()

  families.forEach((family) => {
    const key = String(family.primaryKey ?? '').trim().toLowerCase() || '__default__'
    const existingIndex = indexByKey.get(key)
    if (existingIndex == null) {
      indexByKey.set(key, merged.length)
      merged.push(family)
      return
    }

    merged[existingIndex] = buildFamilyFromLeaves([
      ...merged[existingIndex].leaves,
      ...family.leaves,
    ])
  })

  return merged
}

export function getFamilySecondaryValues(family, primaryVal, group) {
  const seen = new Set()
  const values = []

  ;(family?.leaves ?? []).forEach((leaf) => {
    if (primaryVal && !isSameVariantOption(getVariantAttributeValue(leaf, family.primaryKey), primaryVal)) return
    const value = getVariantAttributeValue(leaf, group?.key)
    const key = String(value).trim().toLowerCase()
    if (!value || seen.has(key)) return
    seen.add(key)
    values.push(value)
  })

  return values
}

export function getVisibleFamilySecondaryGroups(family, primaryVal) {
  return (family?.secondaryGroups ?? [])
    .map((group) => ({
      ...group,
      values: getFamilySecondaryValues(family, primaryVal, group),
    }))
    .filter((group) => group.values.length > 0)
}

export function detectVariantFamilies(variants = []) {
  if (!variants.length) return []

  const parentIds = new Set(
    variants.map((variant) => variant.primary_variant_id).filter(Boolean).map(String),
  )

  const assignedIds = new Set()
  const families = []

  for (const variant of variants) {
    if (!parentIds.has(String(variant.id))) continue
    const children = variants.filter((child) => String(child.primary_variant_id) === String(variant.id))
    const familyLeaves = [variant, ...children]
    families.push(buildFamilyFromLeaves(familyLeaves))
    familyLeaves.forEach((leaf) => assignedIds.add(String(leaf.id)))
  }

  const standaloneLeaves = variants.filter((variant) => !variant.primary_variant_id && !assignedIds.has(String(variant.id)))

  if (standaloneLeaves.length > 0) {
    const byPrimaryKey = {}
    standaloneLeaves.forEach((variant) => {
      const primary = resolvePrimaryAttribute(variant)
      const key = primary?.name ?? '__default__'
      const existing = Object.keys(byPrimaryKey).find((item) => attributeKeysMatch(item, key))
      const groupKey = existing || key
      if (!byPrimaryKey[groupKey]) byPrimaryKey[groupKey] = []
      byPrimaryKey[groupKey].push(variant)
    })
    Object.values(byPrimaryKey).forEach((leaves) => families.push(buildFamilyFromLeaves(leaves)))
  }

  return mergeFamiliesByPrimaryKey(families)
}

export function resolveInitialFamilyState(families = []) {
  if (!families.length) return { activeFamilyId: null, familyPrimary: {}, familySecondary: {} }

  const familyPrimary = {}
  const familySecondary = {}

  families.forEach((family) => {
    const primaryVal = family.primaryValues[0] ?? ''
    familyPrimary[family.id] = primaryVal

    const secMap = {}
    getVisibleFamilySecondaryGroups(family, primaryVal).forEach((group) => {
      secMap[group.key] = group.values[0] ?? ''
    })
    familySecondary[family.id] = secMap
  })

  return {
    activeFamilyId: families[0].id,
    familyPrimary,
    familySecondary,
  }
}

export function resolveFamilyStateForVariant(families = [], variant) {
  if (!variant || !families.length) return null

  const family = families.find((item) => (
    (item.leaves ?? []).some((leaf) => String(leaf.id) === String(variant.id))
  ))
  if (!family) return null

  const base = resolveInitialFamilyState(families)
  const primaryVal = getVariantAttributeValue(variant, family.primaryKey) || base.familyPrimary[family.id] || ''
  const secondaryMap = { ...(base.familySecondary[family.id] ?? {}) }

  getVisibleFamilySecondaryGroups(family, primaryVal).forEach((group) => {
    const value = getVariantAttributeValue(variant, group.key)
    if (value) secondaryMap[group.key] = value
  })

  return {
    activeFamilyId: family.id,
    familyPrimary: { ...base.familyPrimary, [family.id]: primaryVal },
    familySecondary: { ...base.familySecondary, [family.id]: secondaryMap },
  }
}

export function buildFamilyLeafSelections(family, primaryVal, secondaryMap) {
  const selections = { [family.primaryKey]: primaryVal }
  Object.entries(secondaryMap ?? {}).forEach(([key, value]) => {
    if (value) selections[key] = value
  })
  return selections
}

export function getAvailableOptionValues(variants, group, selections, groups) {
  const groupIndex = (groups ?? []).findIndex((item) => isSameVariantOption(item.key, group.key))
  const constraints = {}

  ;(groups ?? []).forEach((item, index) => {
    if (index >= groupIndex) return
    const selected = selections?.[item.key]
    if (selected) constraints[item.key] = selected
  })

  const matching = (variants ?? []).filter((variant) => (
    Object.entries(constraints).every(([key, selected]) => (
      isSameVariantOption(getVariantAttributeValue(variant, key), selected)
    ))
  ))

  const seen = new Set()
  const available = []
  matching.forEach((variant) => {
    const value = getVariantAttributeValue(variant, group.key)
    const normalized = String(value).trim().toLowerCase()
    if (!value || seen.has(normalized)) return
    seen.add(normalized)
    available.push(value)
  })

  if (!Array.isArray(group?.values) || group.values.length === 0) return available

  return group.values.filter((value) => (
    available.some((item) => isSameVariantOption(item, value))
  ))
}

export function findLeafVariant(variants, selections = {}) {
  const entries = Object.entries(selections).filter(([, value]) => String(value ?? '').trim())
  if (!entries.length) return Array.isArray(variants) ? (variants[0] ?? null) : null

  return (variants ?? []).find((variant) => (
    entries.every(([key, value]) => (
      isSameVariantOption(getVariantAttributeValue(variant, key), value)
    ))
  )) ?? null
}

export function getVariantSelectionMap(variant, groups = []) {
  const selections = {}
  groups.forEach((group) => {
    const raw = variant ? getVariantAttributeValue(variant, group.key) : ''
    selections[group.key] = resolveCanonicalVariantOption(raw, group.values) || raw || ''
  })
  return selections
}

export function applyVariantOptionSelection({
  variants,
  groups = [],
  currentSelections = {},
  groupKey,
  value,
}) {
  const next = { ...currentSelections, [groupKey]: value }
  const changedIndex = groups.findIndex((group) => isSameVariantOption(group.key, groupKey))

  groups.forEach((group, index) => {
    if (index <= changedIndex) return
    const available = getAvailableOptionValues(variants, group, next, groups)
    const current = next[group.key]
    if (current && available.some((item) => isSameVariantOption(item, current))) {
      next[group.key] = resolveCanonicalVariantOption(current, available)
      return
    }
    next[group.key] = available[0] ?? ''
  })

  return next
}

export function buildVisibleOptionGroups(variants, groups = [], selections = {}) {
  return groups
    .map((group) => ({
      ...group,
      values: getAvailableOptionValues(variants, group, selections, groups),
    }))
    .filter((group) => group.values.length > 0)
}
