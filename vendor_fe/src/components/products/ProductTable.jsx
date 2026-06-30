import { useRef, useState } from 'react'
import { Copy, Eye, Layers3, MoreHorizontal, Package, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { canActivateProduct, canDeactivateProduct } from '../../utils/productStatusActions'

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-500',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  },
  inactive: {
    label: 'Inactive',
    dot: 'bg-red-500',
    className: 'bg-red-50 text-red-700 ring-red-200/80',
  },
  draft: {
    label: 'Draft',
    dot: 'bg-amber-500',
    className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  },
}

function ProductStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}

function ProductThumbnail({ product }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
      />
    )
  }

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
      <Package className="size-5" strokeWidth={1.5} />
    </span>
  )
}

function ProductActionsMenu({
  product,
  onView,
  onEditProductInfo,
  onEditVariations,
  onActivate,
  onDeactivate,
  onDuplicate,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const run = (action) => {
    action(product)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label={`Actions for ${product.name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      <PortalMenu
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        menuWidth={210}
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onView)}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <Eye className="size-4" /> View
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onEditProductInfo)}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="size-4" /> Edit product info
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onEditVariations)}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <Layers3 className="size-4" /> Manage variations
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onDuplicate)}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <Copy className="size-4" /> Duplicate
        </button>
        {canActivateProduct(product.status) && (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onActivate)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
          >
            <Power className="size-4" /> Activate
          </button>
        )}
        {canDeactivateProduct(product.status) && (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onDeactivate)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
          >
            <PowerOff className="size-4" /> Deactivate
          </button>
        )}
        <div className="my-1 border-t border-slate-100" role="separator" />
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onDelete)}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </PortalMenu>
    </>
  )
}

function formatProductPrice(value) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500'

const TABLE_PRICE_CLASS = 'whitespace-nowrap px-4 py-4 text-sm tabular-nums text-slate-700'

function ProductNameCell({ product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumbnail product={product} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900" title={product.name}>
          {product.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500" title={product.sku}>
          {product.sku}
        </p>
      </div>
    </div>
  )
}

function ProductActionsCell(props) {
  return (
    <ProductActionsMenu
      product={props.product}
      onView={props.onView}
      onEditProductInfo={props.onEditProductInfo}
      onEditVariations={props.onEditVariations}
      onActivate={props.onActivate}
      onDeactivate={props.onDeactivate}
      onDuplicate={props.onDuplicate}
      onDelete={props.onDelete}
    />
  )
}

function ProductMobileCard({
  product,
  isSelected,
  onToggleOne,
  ...actionProps
}) {
  const salePrice = formatProductPrice(product.salePrice ?? product.price)
  const regularPrice = formatProductPrice(product.regularPrice ?? product.listPrice)

  return (
    <article
      className={`px-4 py-4 sm:px-5 ${isSelected ? 'bg-brand-light/10' : 'bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleOne(product.id)}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-brand rounded"
          aria-label={`Select ${product.name}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <ProductThumbnail product={product} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                {product.name}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">{product.sku}</p>
            </div>
            <div className="shrink-0">
              <ProductActionsCell product={product} {...actionProps} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ProductStatusBadge status={product.status} />
            <span className="text-xs text-slate-500">
              Stock:{' '}
              <span className="font-semibold text-slate-800">
                {product.stock == null ? '—' : product.stock}
              </span>
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-semibold uppercase tracking-wide text-slate-400">Category</dt>
              <dd className="mt-0.5 truncate font-medium text-slate-800">{product.category}</dd>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-semibold uppercase tracking-wide text-slate-400">Brand</dt>
              <dd className="mt-0.5 truncate font-medium text-slate-800">{product.brand}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-semibold uppercase tracking-wide text-slate-400">Regular</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-slate-800">GH₵ {regularPrice}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-semibold uppercase tracking-wide text-slate-400">Sale</dt>
              <dd
                className={`mt-0.5 font-medium tabular-nums ${
                  product.hasDiscount ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                GH₵ {salePrice}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}

function ProductMobileList({
  products,
  selectedIds,
  onToggleAll,
  onToggleOne,
  allSelected,
  someSelected,
  actionProps,
}) {
  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = someSelected && !allSelected
          }}
          onChange={(event) => onToggleAll(event.target.checked)}
          className="size-4 cursor-pointer accent-brand rounded"
          aria-label="Select all products"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Select all
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {products.map((product) => (
          <ProductMobileCard
            key={product.id}
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggleOne={onToggleOne}
            {...actionProps}
          />
        ))}
      </div>
    </div>
  )
}

function ProductDesktopTable({
  products,
  selectedIds,
  onToggleAll,
  onToggleOne,
  allSelected,
  someSelected,
  actionProps,
}) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[960px] table-fixed divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected && !allSelected
                }}
                onChange={(event) => onToggleAll(event.target.checked)}
                className="size-4 cursor-pointer accent-brand rounded"
                aria-label="Select all products"
              />
            </th>
            <th className={`${TABLE_HEAD_CLASS} w-[28%]`}>Product</th>
            <th className={`${TABLE_HEAD_CLASS} w-[14%]`}>Category</th>
            <th className={`${TABLE_HEAD_CLASS} w-[12%]`}>Brand</th>
            <th className={`${TABLE_HEAD_CLASS} w-[12%]`}>Regular price</th>
            <th className={`${TABLE_HEAD_CLASS} w-[12%]`}>Sale price</th>
            <th className={`${TABLE_HEAD_CLASS} w-[8%]`}>Stock</th>
            <th className={`${TABLE_HEAD_CLASS} w-[10%]`}>Status</th>
            <th className={`${TABLE_HEAD_CLASS} w-[4%] text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {products.map((product) => {
            const isSelected = selectedIds.has(product.id)

            return (
              <tr key={product.id} className={isSelected ? 'bg-brand-light/10' : 'hover:bg-slate-50/70'}>
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleOne(product.id)}
                    className="size-4 cursor-pointer accent-brand rounded"
                    aria-label={`Select ${product.name}`}
                  />
                </td>
                <td className="max-w-0 px-4 py-4">
                  <ProductNameCell product={product} />
                </td>
                <td className="max-w-0 truncate px-4 py-4 text-sm text-slate-700" title={product.category}>
                  {product.category}
                </td>
                <td className="max-w-0 truncate px-4 py-4 text-sm text-slate-700" title={product.brand}>
                  {product.brand}
                </td>
                <td className={TABLE_PRICE_CLASS}>
                  GH₵&nbsp;{formatProductPrice(product.regularPrice ?? product.listPrice)}
                </td>
                <td className={TABLE_PRICE_CLASS}>
                  <span
                    className={
                      product.hasDiscount
                        ? 'font-semibold text-emerald-700'
                        : 'text-slate-700'
                    }
                  >
                    GH₵&nbsp;{formatProductPrice(product.salePrice ?? product.price)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {product.stock == null ? '—' : product.stock}
                </td>
                <td className="px-4 py-4">
                  <ProductStatusBadge status={product.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <ProductActionsCell product={product} {...actionProps} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function ProductTable({
  products,
  selectedIds,
  onToggleAll,
  onToggleOne,
  onView,
  onEditProductInfo,
  onEditVariations,
  onActivate,
  onDeactivate,
  onDuplicate,
  onDelete,
}) {
  const allSelected = products.length > 0 && products.every((product) => selectedIds.has(product.id))
  const someSelected = products.some((product) => selectedIds.has(product.id))

  const actionProps = {
    onView,
    onEditProductInfo,
    onEditVariations,
    onActivate,
    onDeactivate,
    onDuplicate,
    onDelete,
  }

  const sharedProps = {
    products,
    selectedIds,
    onToggleAll,
    onToggleOne,
    allSelected,
    someSelected,
    actionProps,
  }

  return (
    <>
      <ProductMobileList {...sharedProps} />
      <ProductDesktopTable {...sharedProps} />
    </>
  )
}
