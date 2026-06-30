import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDown, Package } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { buildViewProductPath } from '../../utils/orderProductNavigation'

export default function OrderProductSwitcher({ orderId, products, currentProductId }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  if (!products || products.length <= 1) return null

  const currentIndex = products.findIndex((item) => item.productId === currentProductId)
  const current = products[currentIndex] ?? products[0]

  const switchTo = (productId) => {
    navigate(buildViewProductPath(productId, orderId))
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Package className="size-4 text-slate-500" />
        <span className="max-w-[180px] truncate">{current.productName}</span>
        <span className="text-xs text-slate-400">
          {currentIndex + 1}/{products.length}
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      <PortalMenu
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        menuWidth={280}
      >
        {products.map((item, index) => {
          const isActive = item.productId === currentProductId

          return (
            <button
              key={item.productId}
              type="button"
              role="menuitem"
              onClick={() => switchTo(item.productId)}
              className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                isActive ? 'bg-brand-light/20 text-brand' : 'text-slate-700'
              }`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                  <Package className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{item.productName}</span>
                <span className="block truncate text-xs text-slate-500">SKU: {item.sku}</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">{index + 1}</span>
            </button>
          )
        })}
      </PortalMenu>
    </div>
  )
}
