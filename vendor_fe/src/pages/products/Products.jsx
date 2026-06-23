import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, PackagePlus } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import ProductCatalogToolbar from '../../components/products/ProductCatalogToolbar'
import ProductSummaryCards from '../../components/products/ProductSummaryCards'
import ProductTable from '../../components/products/ProductTable'
import {
  getCatalogSummary,
  SUMMARY_FILTERS,
} from '../../constants/productCatalog'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import notify from '../../lib/notify'
import { useDeleteProductsMutation, useReplicateProductMutation } from '../../hooks/useProductMutations'
import { useProducts, productQueryKeys } from '../../hooks/useProducts'
import { exportProductsToExcel, exportProductsToPdf } from '../../utils/exportProductCatalog'
import { buildCatalogFilterOptions, filterProductCatalog } from '../../utils/productCatalogFilters'

export default function Products() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: products = [], isLoading, isError, refetch } = useProducts()
  const deleteProductsMutation = useDeleteProductsMutation()
  const replicateProductMutation = useReplicateProductMutation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [summaryFilter, setSummaryFilter] = useState(SUMMARY_FILTERS.ALL)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleteRequest, setDeleteRequest] = useState(null)

  const { categoryOptions, brandOptions } = useMemo(
    () => buildCatalogFilterOptions(products),
    [products],
  )

  const summary = useMemo(() => getCatalogSummary(products), [products])

  const filteredProducts = useMemo(
    () => filterProductCatalog(products, { search, category, brand, summaryFilter }),
    [products, search, category, brand, summaryFilter],
  )

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds],
  )

  const preset = EMPTY_STATE_PRESETS.products
  const visibleSelectedCount = filteredProducts.filter((product) => selectedIds.has(product.id)).length

  const updateProducts = (updater) => {
    queryClient.setQueryData(productQueryKeys.list(), (current = []) => (
      typeof updater === 'function' ? updater(current) : updater
    ))
  }

  const deleteModalCopy = useMemo(() => {
    if (!deleteRequest) return null

    if (deleteRequest.type === 'single') {
      return {
        title: 'Delete product?',
        description: `"${deleteRequest.product.name}" will be permanently removed from your catalogue. This action cannot be undone.`,
        confirmLabel: 'Delete product',
      }
    }

    const count = deleteRequest.productIds.length
    return {
      title: `Delete ${count} product${count === 1 ? '' : 's'}?`,
      description: `The selected product${count === 1 ? '' : 's'} will be permanently removed from your catalogue. This action cannot be undone.`,
      confirmLabel: `Delete ${count} product${count === 1 ? '' : 's'}`,
    }
  }, [deleteRequest])

  const closeDeleteModal = () => {
    if (deleteProductsMutation.isPending) return
    setDeleteRequest(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteRequest) return

    const productIds = deleteRequest.type === 'single'
      ? [deleteRequest.product.id]
      : deleteRequest.productIds

    try {
      await deleteProductsMutation.mutateAsync(productIds)
      setDeleteRequest(null)
      clearSelection()
    } catch {
      /* error toast handled in mutation */
    }
  }

  const toggleOne = (productId) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const toggleAll = (checked) => {
    if (!checked) {
      setSelectedIds((current) => {
        const next = new Set(current)
        filteredProducts.forEach((product) => next.delete(product.id))
        return next
      })
      return
    }

    setSelectedIds((current) => {
      const next = new Set(current)
      filteredProducts.forEach((product) => next.add(product.id))
      return next
    })
  }

  const updateSelectedStatus = (status) => {
    if (selectedIds.size === 0) return

    updateProducts((current) =>
      current.map((product) => (
        selectedIds.has(product.id) ? { ...product, status } : product
      )),
    )
    notify.success(`Updated ${selectedIds.size} product${selectedIds.size === 1 ? '' : 's'}`)
    clearSelection()
  }

  const clearSelection = () => setSelectedIds(new Set())

  const openBulkDeleteModal = () => {
    if (selectedIds.size === 0) return
    setDeleteRequest({
      type: 'bulk',
      productIds: Array.from(selectedIds),
    })
  }

  const handleExport = (items, label) => {
    if (items.length === 0) {
      notify.info('No products to export')
      return
    }
    exportProductsToExcel(items, `${label}.csv`)
    notify.success(`Exported ${items.length} product${items.length === 1 ? '' : 's'} to Excel`)
  }

  const handleExportPdf = (items, title) => {
    if (items.length === 0) {
      notify.info('No products to export')
      return
    }
    const opened = exportProductsToPdf(items, title)
    if (!opened) notify.error('Could not open print window. Allow pop-ups and try again.')
  }

  const handleView = (product) => {
    notify.info(`Viewing ${product.name}. Product detail page coming soon.`)
  }

  const handleEdit = (product) => {
    navigate(`/products/${product.id}/edit`)
  }

  const handleDuplicate = async (product) => {
    try {
      await replicateProductMutation.mutateAsync(product.id)
    } catch {
      /* error toast handled in mutation */
    }
  }

  const handleDelete = (product) => {
    setDeleteRequest({ type: 'single', product })
  }

  return (
    <DashboardLayout pageTitle="All Products">
      <div className="page-enter space-y-4">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Product catalogue</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">All Products</h1>
          </div>
          <Link
            to="/products/new"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.24)] transition-colors hover:bg-brand-hover"
          >
            <PackagePlus className="size-4" />
            Add product
          </Link>
        </section>

        <ProductSummaryCards
          summary={summary}
          activeFilter={summaryFilter}
          onFilterChange={setSummaryFilter}
        />

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Could not load your products.{' '}
            <button
              type="button"
              onClick={() => refetch()}
              className="cursor-pointer font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-950">All Products</h2>
            <p className="mt-1 text-xs text-slate-500">
              Search, filter, export, and manage your product listings.
            </p>
          </div>

          <div className="border-b border-slate-100 px-5 py-4">
            <ProductCatalogToolbar
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              brand={brand}
              onBrandChange={setBrand}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              onExportExcel={() => handleExport(filteredProducts, 'all-products')}
              onExportPdf={() => handleExportPdf(filteredProducts, 'All Products')}
              selectedCount={visibleSelectedCount}
              onActivateSelected={() => updateSelectedStatus('active')}
              onDeactivateSelected={() => updateSelectedStatus('inactive')}
              onDeleteSelected={openBulkDeleteModal}
              onExportSelected={() => handleExport(selectedProducts, 'selected-products')}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm font-semibold text-slate-500">
              <Loader2 className="size-4 animate-spin text-brand" />
              Loading products…
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={preset.icon}
              title={products.length === 0 ? preset.title : 'No products match your filters'}
              description={
                products.length === 0
                  ? preset.description
                  : 'Try adjusting your search, category, brand, or summary filters.'
              }
              action={
                products.length === 0 ? (
                  <Link
                    to="/products/new"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
                  >
                    <PackagePlus className="size-4" />
                    Add your first product
                  </Link>
                ) : null
              }
            />
          ) : (
            <ProductTable
              products={filteredProducts}
              selectedIds={selectedIds}
              onToggleAll={toggleAll}
              onToggleOne={toggleOne}
              onView={handleView}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          )}
        </section>

        <ConfirmModal
          open={Boolean(deleteRequest && deleteModalCopy)}
          title={deleteModalCopy?.title}
          description={deleteModalCopy?.description}
          confirmLabel={deleteModalCopy?.confirmLabel}
          onConfirm={handleConfirmDelete}
          onClose={closeDeleteModal}
          isLoading={deleteProductsMutation.isPending}
          tone="danger"
        />
      </div>
    </DashboardLayout>
  )
}
