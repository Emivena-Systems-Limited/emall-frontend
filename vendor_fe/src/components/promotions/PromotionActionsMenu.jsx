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

function PromotionMenuAction({ icon: Icon, tone, label, helper, onClick, danger = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-[1.03] ${
          danger ? 'bg-red-50 text-red-600 ring-red-100' : tone
        }`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className={`block text-sm font-semibold ${danger ? 'text-red-700' : 'text-slate-900'}`}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">{helper}</span>
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
        menuWidth={300}
        className="overflow-hidden py-0 shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Promotion actions
          </p>
          <p className="mt-1 text-sm font-bold text-slate-950">{promotion.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            View, edit, or manage the lifecycle of this promotion.
          </p>
        </div>

        <div className="py-1.5">
          {!hideViewDetails && (
            <PromotionMenuAction
              icon={Eye}
              tone="bg-cyan-50 text-cyan-700 ring-cyan-100"
              label="View Details"
              helper="See full promotion settings and performance."
              onClick={() => run(() => navigate(`/promotions/${promotion.id}`))}
            />
          )}
          {canEditPromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Pencil}
              tone="bg-slate-100 text-slate-700 ring-slate-200"
              label="Edit Promotion"
              helper="Update discount rules, schedule, or product scope."
              onClick={() => run(() => navigate(`/promotions/${promotion.id}/edit`))}
            />
          )}
          <PromotionMenuAction
            icon={Copy}
            tone="bg-violet-50 text-violet-700 ring-violet-100"
            label="Duplicate Promotion"
            helper="Create a copy as a draft you can customise."
            onClick={() => run(() => onDuplicate(promotion))}
          />
          {canPausePromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Pause}
              tone="bg-amber-50 text-amber-700 ring-amber-100"
              label="Pause Promotion"
              helper="Temporarily stop this promotion from applying."
              onClick={() => run(() => onPause(promotion))}
            />
          )}
          {canResumePromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Play}
              tone="bg-emerald-50 text-emerald-700 ring-emerald-100"
              label="Resume Promotion"
              helper="Reactivate this promotion within its schedule."
              onClick={() => run(() => onResume(promotion))}
            />
          )}
          {canEndPromotion(promotion.status) && (
            <PromotionMenuAction
              icon={Square}
              tone="bg-orange-50 text-orange-700 ring-orange-100"
              label="End Promotion"
              helper="Mark as expired and stop new redemptions."
              onClick={() => run(() => onEnd(promotion))}
            />
          )}
          <div className="mx-3 my-1 border-t border-slate-100" role="separator" />
          <PromotionMenuAction
            icon={Trash2}
            label="Delete Promotion"
            helper="Permanently remove this promotion from your list."
            onClick={() => run(() => onDelete(promotion))}
            danger
          />
        </div>
      </PortalMenu>
    </div>
  )
}
