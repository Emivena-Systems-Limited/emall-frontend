import { useEffect, useRef, useState } from 'react'
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

function ProductStatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
    draft: 'bg-amber-50 text-amber-700 ring-amber-100',
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  )
}

function ProductActionsMenu({ product, onView, onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const run = (action) => {
    action(product)
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label={`Actions for ${product.name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          <button
            type="button"
            onClick={() => run(onView)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye className="size-4" /> View
          </button>
          <button
            type="button"
            onClick={() => run(onEdit)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="size-4" /> Edit
          </button>
          <button
            type="button"
            onClick={() => run(onDuplicate)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy className="size-4" /> Duplicate
          </button>
          <button
            type="button"
            onClick={() => run(onDelete)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function formatProductDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProductTable({
  products,
  selectedIds,
  onToggleAll,
  onToggleOne,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const allSelected = products.length > 0 && products.every((product) => selectedIds.has(product.id))
  const someSelected = products.some((product) => selectedIds.has(product.id))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-4 py-3 text-left">
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
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Product</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Category</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Brand</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Price</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Date added</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
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
                <td className="px-4 py-4">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{product.sku}</p>
                      <div className="mt-1">
                        <ProductStatusBadge status={product.status} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{product.category}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{product.brand}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                  GH₵ {product.price.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{product.stock}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{formatProductDate(product.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <ProductActionsMenu
                    product={product}
                    onView={onView}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
