import { useRef, useState } from 'react'
import { Ban, Eye, MoreHorizontal, RefreshCw, Store, Wallet } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { payoutMenuActions } from '../../constants/finance'

const ITEMS = {
  view: { label: 'View payout details', icon: Eye },
  vendor: { label: 'View vendor', icon: Store },
  approve: { label: 'Process payout', icon: Wallet },
  retry: { label: 'Retry failed payout', icon: RefreshCw },
  cancel: { label: 'Cancel payout', icon: Ban, danger: true },
}

export default function PayoutActions({ payout, canManage, onAction }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const actions = payoutMenuActions(payout, canManage)

  const run = (action) => {
    setOpen(false)
    onAction(payout, action)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${payout.id}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
      <PortalMenu open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} menuWidth={220}>
        {actions.map((action, index) => {
          const item = ITEMS[action]
          const Icon = item.icon
          const danger = item.danger
          const previous = actions[index - 1]
          const split = danger && previous && !ITEMS[previous].danger
          return (
            <div key={action}>
              {split ? <div className="my-1 border-t border-slate-100" role="separator" /> : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => run(action)}
                className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  danger
                    ? 'text-rose-700 hover:bg-rose-50'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                {item.label}
              </button>
            </div>
          )
        })}
      </PortalMenu>
    </>
  )
}
