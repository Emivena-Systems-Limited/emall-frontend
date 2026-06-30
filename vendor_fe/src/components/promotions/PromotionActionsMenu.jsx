import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Square,
  Trash2,
} from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import {
  canEditPromotion,
  canEndPromotion,
  canPausePromotion,
  canResumePromotion,
} from '../../utils/promotionActions'

function PromotionMenuAction({ icon: Icon, tone, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-[1.03] ${
          danger ? 'bg-red-50 text-red-600 ring-red-100' : tone
        }`}
      >
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${danger ? 'text-red-700' : 'text-slate-900'}`}>
        {label}
      </span>
    </button>
  )
}

export default function PromotionActionsMenu({
  promotion,
  onDuplicate,
  onPause,
  onResume,
  onEnd,
  onDelete,
  hideViewDetails = false,
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const close = () => setOpen(false)
  const run = (action) => {
    action()
    close()
  }

  return (
    <div className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex cursor-pointer items-center justify-center rounded-lg p-2 ring-1 transition-all ${
          open
            ? 'bg-brand-light/30 text-brand ring-brand/25 shadow-sm'
            : 'text-slate-500 ring-transparent hover:bg-slate-100 hover:text-slate-800'
        }`}
        aria-label={`Actions for ${promotion.name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      <PortalMenu
        open={open}
        onClose={close}
        triggerRef={triggerRef}
        menuWidth={248}
        className="overflow-hidden py-0 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Actions
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-950">{promotion.name}</p>
        </div>

        <div className="max-h-[min(18rem,calc(100dvh-5rem))] overflow-y-auto overscroll-contain py-0.5">
          {!hideViewDetails && (
            <PromotionMenuAction
              icon={Eye}
              tone="bg-cyan-50 text-cyan-700 ring-cyan-100"
              label="View Details"
              onClick={() => run(() => navigate(`/promotions/${promotion.id}`))}
            />
          )}
          {canEditPromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Pencil}
              tone="bg-slate-100 text-slate-700 ring-slate-200"
              label="Edit Promotion"
              onClick={() => run(() => navigate(`/promotions/${promotion.id}/edit`))}
            />
          )}
          <PromotionMenuAction
            icon={Copy}
            tone="bg-violet-50 text-violet-700 ring-violet-100"
            label="Duplicate Promotion"
            onClick={() => run(() => onDuplicate(promotion))}
          />
          {canPausePromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Pause}
              tone="bg-amber-50 text-amber-700 ring-amber-100"
              label="Pause Promotion"
              onClick={() => run(() => onPause(promotion))}
            />
          )}
          {canResumePromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Play}
              tone="bg-emerald-50 text-emerald-700 ring-emerald-100"
              label="Resume Promotion"
              onClick={() => run(() => onResume(promotion))}
            />
          )}
          {canEndPromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Square}
              tone="bg-orange-50 text-orange-700 ring-orange-100"
              label="End Promotion"
              onClick={() => run(() => onEnd(promotion))}
            />
          )}
          <div className="mx-2.5 my-0.5 border-t border-slate-100" role="separator" />
          <PromotionMenuAction
            icon={Trash2}
            label="Delete Promotion"
            onClick={() => run(() => onDelete(promotion))}
            danger
          />
        </div>
      </PortalMenu>
    </div>
  )
}
