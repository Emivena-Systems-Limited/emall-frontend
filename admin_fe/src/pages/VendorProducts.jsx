import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Package } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ProductCatalogLoader from '../components/products/ProductCatalogLoader'
import ProductCatalogToolbar from '../components/products/ProductCatalogToolbar'
import ProductRemoveModal from '../components/products/ProductRemoveModal'
import ProductStatusModal from '../components/products/ProductStatusModal'
import ProductSummaryCards from '../components/products/ProductSummaryCards'
import ProductTable from '../components/products/ProductTable'
import ProductVisibilityModal from '../components/products/ProductVisibilityModal'
import VendorWorkspace from '../components/vendors/VendorWorkspace'
import { getCatalogSummary, SUMMARY_FILTERS } from '../constants/productCatalog'
import { useAdminVendorProducts } from '../hooks/useAdminVendorProducts'
import useNavigationState from '../hooks/useNavigationState'
import notify from '../lib/notify'
import { exportProductsToExcel } from '../utils/exportProductCatalog'
import { parseApiError } from '../utils/parseApiError'
import {
  buildCatalogFilterOptions,
  filterProductCatalog,
  sortCatalogProductsLatestFirst,
} from '../utils/productCatalogFilters'

export default function VendorProducts() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const navigationState = useNavigationState()
  const { products, isLoading, isError, error, refetch } = useAdminVendorProducts(vendorId)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [summaryFilter, setSummaryFilter] = useState(SUMMARY_FILTERS.ALL)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [statusProduct, setStatusProduct] = useState(null)
  const [visibilityProduct, setVisibilityProduct] = useState(null)
  const [removing, setRemoving] = useState(null)

  const { categoryOptions, brandOptions } = useMemo(
    () => buildCatalogFilterOptions(products),
    [products],
  )

  const summary = useMemo(() => getCatalogSummary(products), [products])

  const filteredProducts = useMemo(
    () => sortCatalogProductsLatestFirst(
      filterProductCatalog(products, { search, category, brand, summaryFilter }),
    ),
    [products, search, category, brand, summaryFilter],
  )

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds],
  )

  const visibleSelectedCount = filteredProducts.filter((product) => selectedIds.has(product.id)).length

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

  const handleExport = (items, label) => {
    if (items.length === 0) {
      notify.info('No products to export')
      return
    }
    exportProductsToExcel(items, `${label}.csv`)
    notify.success(`Exported ${items.length} product${items.length === 1 ? '' : 's'} to Excel`)
  }

  return (
    <VendorWorkspace vendorId={vendorId} current="products" pageTitle="Products">
      {(vendor) => (
          <>
            <DashboardReveal index={0}>
              {isLoading ? (
                <ProductCatalogLoader />
              ) : (
                <div className="space-y-4">
                  {isError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                      {parseApiError(error, 'Could not load store products.').message}{' '}
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="cursor-pointer font-semibold underline underline-offset-2"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  <ProductSummaryCards
                    summary={summary}
                    activeFilter={summaryFilter}
                    onFilterChange={setSummaryFilter}
                  />

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h3 className="text-sm font-bold text-slate-950">All products</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {summary.listed} listing{summary.listed === 1 ? '' : 's'} returned for {vendor.store}.
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
                        onExportExcel={() => handleExport(filteredProducts, `${vendor.store}-products`)}
                        selectedCount={visibleSelectedCount}
                        onDeleteSelected={() => {
                          if (selectedProducts.length === 1) {
                            setRemoving(selectedProducts[0])
                            return
                          }
                          notify.info('Select one listing at a time to remove from here.')
                        }}
                        onExportSelected={() => handleExport(selectedProducts, `${vendor.store}-selected-products`)}
                      />
                    </div>

                    {filteredProducts.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title={products.length === 0 ? 'No products on this store yet' : 'No products match your filters'}
                        description={
                          products.length === 0
                            ? 'Pending review accounts usually have an empty catalogue until they are approved.'
                            : 'Try adjusting your search, category, brand, or summary filters.'
                        }
                      />
                    ) : (
                      <ProductTable
                        mode="admin"
                        products={filteredProducts}
                        selectedIds={selectedIds}
                        onToggleAll={toggleAll}
                        onToggleOne={toggleOne}
                        onView={(product) => navigate(`/products/${product.id}`, { state: navigationState })}
                        onEditProductInfo={(product) => navigate(`/products/${product.id}/edit?section=info`, { state: navigationState })}
                        onEditVariations={(product) => navigate(`/products/${product.id}/edit?section=variations`, { state: navigationState })}
                        onReview={setStatusProduct}
                        onVisibility={setVisibilityProduct}
                        onDelete={setRemoving}
                      />
                    )}
                  </section>
                </div>
              )}
            </DashboardReveal>

            <ProductStatusModal
              open={Boolean(statusProduct)}
              product={statusProduct}
              onClose={() => setStatusProduct(null)}
            />
            <ProductVisibilityModal
              open={Boolean(visibilityProduct)}
              product={visibilityProduct}
              onClose={() => setVisibilityProduct(null)}
            />
            <ProductRemoveModal
              open={Boolean(removing)}
              product={removing}
              onClose={() => setRemoving(null)}
              onRemoved={() => refetch()}
            />
          </>
      )}
    </VendorWorkspace>
  )
}
