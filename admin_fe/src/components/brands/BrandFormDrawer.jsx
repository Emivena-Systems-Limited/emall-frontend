import { useEffect, useRef, useState } from 'react'
import { Award, Loader2, Pencil } from 'lucide-react'
import SlideDrawer from '../vendors/SlideDrawer'
import FieldError from '../auth/FieldError'
import { getBrandStatusMeta } from '../../constants/brands'
import { useCreateBrandMutation, useUpdateBrandMutation } from '../../hooks/useAdminBrands'
import { getBrandAvatarTone, getBrandInitials } from '../../utils/normalizeAdminBrands'

const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60'

function BrandForm({ mode, brand, onClose }) {
  const isEdit = mode === 'edit'
  const createMutation = useCreateBrandMutation()
  const updateMutation = useUpdateBrandMutation()
  const mutation = isEdit ? updateMutation : createMutation
  const busy = mutation.isPending

  const [name, setName] = useState(brand?.name ?? '')
  const [fieldErrors, setFieldErrors] = useState({})
  const errorSummaryRef = useRef(null)
  const nameRef = useRef(null)

  const previewName = name.trim() || 'Brand name'
  const previewStatus = isEdit ? getBrandStatusMeta(brand?.status) : null
  const errorEntries = Object.entries(fieldErrors).filter(([, message]) => message)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const validate = () => {
    const nextName = name.trim()
    const errors = {}
    if (!nextName) errors.name = 'Add a brand name.'
    setFieldErrors(errors)
    return { ok: Object.keys(errors).length === 0, nextName }
  }

  const handleSave = async () => {
    const { ok, nextName } = validate()
    if (!ok) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    if (isEdit && nextName === String(brand?.name ?? '').trim()) {
      onClose()
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: brand.id, name: nextName })
      } else {
        await createMutation.mutateAsync({ name: nextName })
      }
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <SlideDrawer
      open
      onClose={handleClose}
      labelledBy="brand-form-title"
      title={isEdit ? 'Edit brand' : 'New brand'}
      subtitle={isEdit ? brand?.name : 'Add a label shoppers will recognise'}
      icon={isEdit ? Pencil : Award}
      widthClass="max-w-lg"
      footer={(
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="flex-[1.4] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isEdit ? 'Save changes' : 'Create brand'}
          </button>
        </div>
      )}
    >
      <div className="space-y-4">
        {errorEntries.length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="brand-form-errors"
            className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <h3 id="brand-form-errors" className="text-sm font-bold text-rose-900">
              There is a problem
            </h3>
            <ul className="mt-2 space-y-1">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#brand-${field}`}
                    className="text-xs font-semibold text-rose-800 underline-offset-2 hover:underline"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative flex items-center gap-4 bg-slate-950 px-4 py-6">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] bg-brand"
            />
            <span className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ring-1 ${getBrandAvatarTone(brand?.id ?? 'new-brand')}`}>
              {getBrandInitials(previewName)}
            </span>
            <div className="min-w-0">
              {previewStatus ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  {previewStatus.label}
                </p>
              ) : (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  New brand
                </p>
              )}
              <p className="mt-1 truncate text-lg font-bold text-white">{previewName}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block" htmlFor="brand-name">
            <span className="text-xs font-semibold text-slate-700">Name</span>
            <input
              ref={nameRef}
              id="brand-name"
              value={name}
              disabled={busy}
              onChange={(event) => {
                setName(event.target.value)
                if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: '' }))
              }}
              placeholder="Google Pixel"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'brand-name-error' : undefined}
              className={`${INPUT_CLASS} ${
                fieldErrors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
              }`}
            />
            {fieldErrors.name ? <FieldError id="brand-name-error" message={fieldErrors.name} /> : null}
          </label>
        </section>
      </div>
    </SlideDrawer>
  )
}

export default function BrandFormDrawer({
  open,
  mode = 'create',
  brand = null,
  onClose,
}) {
  if (!open) return null
  if (mode === 'edit' && !brand) return null

  return (
    <BrandForm
      key={mode === 'edit' ? brand.id : 'create'}
      mode={mode}
      brand={brand}
      onClose={onClose}
    />
  )
}
