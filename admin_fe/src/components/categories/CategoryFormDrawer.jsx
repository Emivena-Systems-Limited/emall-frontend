import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, FolderPlus, Image as ImageIcon, Loader2, Pencil } from 'lucide-react'
import SlideDrawer from '../vendors/SlideDrawer'
import FieldError from '../auth/FieldError'
import CategoryImage from './CategoryImage'
import CategoryImageField from './CategoryImageField'
import { CATEGORY_KINDS, CATEGORY_WRITE_ENABLED } from '../../constants/categories'
import notify from '../../lib/notify'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../hooks/useAdminCategories'
import {
  findCategoryById,
  getCategoryParentOptions,
  slugifyCategoryName,
} from '../../utils/normalizeAdminCategories'

const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60'

function useFilePreview(file, fallbackUrl = null) {
  const [url, setUrl] = useState(fallbackUrl)

  useEffect(() => {
    if (!file) {
      setUrl(fallbackUrl || null)
      return undefined
    }

    const nextUrl = URL.createObjectURL(file)
    setUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file, fallbackUrl])

  return url
}

function SwitchField({ id, label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? 'bg-brand' : 'bg-slate-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function CategoryForm({ mode, category, parentId, tree, onClose }) {
  const isEdit = mode === 'edit'
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const mutation = isEdit ? updateMutation : createMutation
  const busy = mutation.isPending

  const initialParentId = isEdit
    ? (category?.parentId ? String(category.parentId) : '')
    : (parentId ? String(parentId) : '')

  const lockedUnderParent = !isEdit && Boolean(parentId)
  const [kind, setKind] = useState(initialParentId ? 'subcategory' : 'department')
  const [name, setName] = useState(category?.name ?? '')
  const [selectedParentId, setSelectedParentId] = useState(initialParentId)
  const [isActive, setIsActive] = useState(category?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(Boolean(category?.isFeatured))
  const [imageFile, setImageFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const errorSummaryRef = useRef(null)
  const nameRef = useRef(null)

  const parentOptions = useMemo(
    () => getCategoryParentOptions(tree, isEdit ? category?.id : null),
    [tree, isEdit, category?.id],
  )
  const parent = findCategoryById(tree, selectedParentId)
  const errorEntries = Object.entries(fieldErrors).filter(([, message]) => message)
  const previewCover = useFilePreview(imageFile, category?.imageUrl)
  const previewThumb = useFilePreview(thumbnailFile, category?.thumbnailUrl)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const handleKindChange = (nextKind) => {
    if (lockedUnderParent) return
    setKind(nextKind)
    if (nextKind === 'department') setSelectedParentId('')
    setFieldErrors((current) => ({ ...current, parent: '' }))
  }

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const validate = () => {
    const nextName = name.trim()
    const errors = {}
    if (!nextName) errors.name = 'Add a category name.'
    if (kind === 'subcategory' && !selectedParentId) {
      errors.parent = 'Choose the department this sits under.'
    }
    setFieldErrors(errors)
    return { ok: Object.keys(errors).length === 0, nextName, errors }
  }

  const handleSave = async () => {
    const { ok, nextName } = validate()
    if (!ok) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    const payload = {
      name: nextName,
      slug: slugifyCategoryName(nextName),
      parentId: kind === 'subcategory' ? (lockedUnderParent ? String(parentId) : selectedParentId) : null,
      isActive,
      isFeatured,
      imageFile,
      thumbnailFile,
    }

    if (!CATEGORY_WRITE_ENABLED) {
      notify.info('This category cannot be saved yet. Your details stay in the form.')
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: category.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
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
      labelledBy="category-form-title"
      title={isEdit ? 'Edit category' : lockedUnderParent ? 'New subcategory' : 'New category'}
      subtitle={
        isEdit
          ? category?.name
          : lockedUnderParent
            ? (parent?.name ? `Nested under ${parent.name}` : 'Nested under this department')
            : kind === 'subcategory'
              ? (parent?.name ? `Nested under ${parent.name}` : 'Choose a department to nest under')
              : 'A top-level shop section'
      }
      icon={isEdit ? Pencil : FolderPlus}
      widthClass="max-w-xl"
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
            {isEdit ? 'Save changes' : lockedUnderParent ? 'Create subcategory' : 'Create category'}
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
            aria-labelledby="category-form-errors"
            className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <h3 id="category-form-errors" className="text-sm font-bold text-rose-900">
              There is a problem
            </h3>
            <ul className="mt-2 space-y-1">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#category-${field}`}
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
          <div className="relative aspect-[16/7] bg-slate-200">
            {previewCover ? (
              <img src={previewCover} alt="" className="absolute inset-0 h-full w-full max-w-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-slate-400">
                <ImageIcon className="size-8" strokeWidth={1.5} aria-hidden="true" />
              </span>
            )}
            <div className="absolute -bottom-6 left-4">
              <CategoryImage src={previewThumb || previewCover} size="lg" roundedClass="rounded-2xl ring-4 ring-white" />
            </div>
          </div>
          <div className="px-4 pt-8 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              {kind === 'subcategory' ? 'Subcategory' : 'Department'}
            </p>
            <p className="mt-1 truncate text-base font-bold text-slate-950">
              {name.trim() || 'Category name'}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700">Placement</p>
          {lockedUnderParent ? (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">Subcategory</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {parent?.name ? `Sits under ${parent.name}` : 'Sits under this department'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                It will nest under this department.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CATEGORY_KINDS.map((item) => {
                  const active = kind === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={busy}
                      onClick={() => handleKindChange(item.key)}
                      className={`rounded-2xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={`mt-1 block text-[11px] leading-snug ${active ? 'text-white/70' : 'text-slate-400'}`}>
                        {item.hint}
                      </span>
                    </button>
                  )
                })}
              </div>

              {kind === 'subcategory' && (
                <div className="relative mt-3">
                  <label htmlFor="category-parent" className="text-xs font-semibold text-slate-700">
                    Sits under
                  </label>
                  <select
                    id="category-parent"
                    value={selectedParentId}
                    disabled={busy}
                    onChange={(event) => {
                      setSelectedParentId(event.target.value)
                      if (fieldErrors.parent) setFieldErrors((current) => ({ ...current, parent: '' }))
                    }}
                    aria-invalid={Boolean(fieldErrors.parent)}
                    className={`${INPUT_CLASS} cursor-pointer appearance-none pr-9 ${
                      fieldErrors.parent ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                    }`}
                  >
                    <option value="">Select a department</option>
                    {parentOptions.filter((option) => option.value).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 bottom-3 size-4 text-slate-400" aria-hidden="true" />
                  {fieldErrors.parent ? <FieldError message={fieldErrors.parent} /> : null}
                </div>
              )}
            </>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block" htmlFor="category-name">
            <span className="text-xs font-semibold text-slate-700">Name</span>
            <input
              ref={nameRef}
              id="category-name"
              value={name}
              disabled={busy}
              onChange={(event) => {
                setName(event.target.value)
                if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: '' }))
              }}
              placeholder="Home & Kitchen"
              aria-invalid={Boolean(fieldErrors.name)}
              className={`${INPUT_CLASS} ${
                fieldErrors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
              }`}
            />
            {fieldErrors.name ? <FieldError message={fieldErrors.name} /> : null}
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700">Images</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Cover shows on the storefront. Thumbnail shows in lists.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_1fr]">
            <CategoryImageField
              id="category-image-url"
              label="Cover image"
              hint="Category cover"
              existingUrl={category?.imageUrl}
              file={imageFile}
              onFileChange={setImageFile}
              disabled={busy}
              aspectClass="aspect-[4/3]"
            />
            <CategoryImageField
              id="category-thumbnail-url"
              label="Thumbnail"
              hint="List thumbnail"
              existingUrl={category?.thumbnailUrl}
              file={thumbnailFile}
              onFileChange={setThumbnailFile}
              disabled={busy}
              aspectClass="aspect-square"
            />
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2">
          <SwitchField
            id="category-active"
            label="Active"
            hint="Visible to shoppers"
            checked={isActive}
            onChange={setIsActive}
            disabled={busy}
          />
          <SwitchField
            id="category-featured"
            label="Featured"
            hint="Highlight on the storefront"
            checked={isFeatured}
            onChange={setIsFeatured}
            disabled={busy}
          />
        </section>
      </div>
    </SlideDrawer>
  )
}

export default function CategoryFormDrawer({
  open,
  mode = 'create',
  category = null,
  parentId = null,
  tree = [],
  onClose,
}) {
  if (!open) return null
  if (mode === 'edit' && !category) return null

  return (
    <CategoryForm
      key={mode === 'edit' ? category.id : `create-${parentId ?? 'root'}`}
      mode={mode}
      category={category}
      parentId={parentId}
      tree={tree}
      onClose={onClose}
    />
  )
}
