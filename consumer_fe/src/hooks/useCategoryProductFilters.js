import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  applyCategoryFilters,
  buildCategoryFilterGroups,
  countActiveFilters,
  createEmptyCategoryFilters,
  sortCategoryProducts,
} from '../utils/categoryProductFilters'

export function useCategoryProductFilters(products, subcategories = [], resetKey = '', categoryContext = {}) {
  const [filters, setFilters] = useState(createEmptyCategoryFilters)
  const [draftFilters, setDraftFilters] = useState(createEmptyCategoryFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activePanelId, setActivePanelId] = useState(null)
  const [activeSection, setActiveSection] = useState('all')

  const filterGroups = useMemo(
    () => buildCategoryFilterGroups(products, subcategories, categoryContext),
    [products, subcategories, categoryContext.categoryLabel, categoryContext.subcategoryLabel],
  )

  const filteredProducts = useMemo(() => {
    const filtered = applyCategoryFilters(products, filters)
    return sortCategoryProducts(filtered, filters.sort)
  }, [products, filters])

  const draftResultCount = useMemo(() => {
    return applyCategoryFilters(products, draftFilters).length
  }, [products, draftFilters])

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters])
  const draftFilterCount = useMemo(() => countActiveFilters(draftFilters), [draftFilters])

  const resetFilters = useCallback(() => {
    const empty = createEmptyCategoryFilters()
    setFilters(empty)
    setDraftFilters(empty)
    setActivePanelId(null)
  }, [])

  const openDrawer = useCallback((section = 'all') => {
    setDraftFilters(filters)
    setActiveSection(section)
    setActivePanelId(null)
    setDrawerOpen(true)
  }, [filters])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const togglePanel = useCallback((panelId) => {
    if (panelId === 'all') {
      openDrawer('all')
      return
    }

    setDrawerOpen(false)

    if (activePanelId === panelId) {
      setActivePanelId(null)
      return
    }

    setDraftFilters(filters)
    setActivePanelId(panelId)
  }, [filters, activePanelId, openDrawer])

  const applyPanel = useCallback(() => {
    setFilters(draftFilters)
    setActivePanelId(null)
  }, [draftFilters])

  const applyDraftFilters = useCallback(() => {
    setFilters(draftFilters)
    setDrawerOpen(false)
    setActivePanelId(null)
  }, [draftFilters])

  useEffect(() => {
    resetFilters()
    setDrawerOpen(false)
    setActivePanelId(null)
  }, [resetKey, resetFilters])

  return {
    filters,
    setFilters,
    draftFilters,
    setDraftFilters,
    drawerOpen,
    activePanelId,
    activeSection,
    setActiveSection,
    filterGroups,
    filteredProducts,
    draftResultCount,
    activeFilterCount,
    draftFilterCount,
    resetFilters,
    openDrawer,
    closeDrawer,
    togglePanel,
    applyPanel,
    applyDraftFilters,
  }
}
