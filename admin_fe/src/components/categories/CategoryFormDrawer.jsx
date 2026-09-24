import { useEffect, useMemo, useRef, useState } from 'react'
import { Formik } from 'formik'
import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import SlideDrawer from '../vendors/SlideDrawer'
import FieldError from '../auth/FieldError'
import CategoryImage from './CategoryImage'
import CategoryImageField from './CategoryImageField'
import { CATEGORY_KINDS, CATEGORY_WRITE_ENABLED } from '../../constants/categories'
import notify from '../../lib/notify'
import {
  ADMIN_CATEGORIES_QUERY_KEY,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../hooks/useAdminCategories'
import { createAdminCategory } from '../../services/categoryService'
import { parseApiError } from '../../utils/parseApiError'
import { getCategoryFormSchema } from '../../utils/validationSchemas'
import {
  findCategoryById,
  findParentIdInTree,
  getCategoryParentOptions,
  getSubcategoriesUnderParent,
  slugifyCategoryName,
} from '../../utils/normalizeAdminCategories'

const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:opacity-60'

const EMPTY_CONTINUE_VALUES = {
  kind: 'subcategory',
  name: '',
  parentId: '',
  isActive: true,
  isFeatured: false,
  imageFile: null,
  thumbnailFile: null,
}

const CATEGORY_FIELD_MAP = {
  category_name: 'name',
  slug: 'name',
  parent_id: 'parentId',
  is_active: 'isActive',
  is_featured: 'isFeatured',
  'images.0.image_url': 'imageFile',
  'images.0.type': 'imageFile',
  'images[0][image_url]': 'imageFile',
  'images.1.image_url': 'thumbnailFile',
  'images.1.type': 'thumbnailFile',
  'images[1][image_url]': 'thumbnailFile',
  'images.image_url': 'imageFile',
  'images[image_url]': 'imageFile',
  image_url: 'imageFile',
  'images.thumbnail_image_url': 'thumbnailFile',
  'images[thumbnail_image_url]': 'thumbnailFile',
  thumbnail_image_url: 'thumbnailFile',
}

function getCategoryFormValues({ mode, category, parentId, tree = [] }) {
  const isEdit = mode === 'edit'
  const initialParentId = isEdit
    ? String(category?.parentId || findParentIdInTree(tree, category?.id) || '')
    : String(parentId || '')

  return {
    kind: initialParentId ? 'subcategory' : 'department',
    name: category?.name ?? '',
    parentId: initialParentId,
    isActive: category?.isActive ?? true,
    isFeatured: Boolean(category?.isFeatured),
    imageFile: null,
    thumbnailFile: null,
    subcategories: [],
  }
}

let subcategoryDraftCounter = 0

function createEmptySubcategoryDraft() {
  subcategoryDraftCounter += 1
  return {
    key: `subcategory-draft-${Date.now()}-${subcategoryDraftCounter}`,
    name: '',
    isActive: true,
    isFeatured: false,
    imageFile: null,
    thumbnailFile: null,
  }
}

function buildSubcategoryCreatePayload(row, parentId) {
  const name = row.name.trim()
  return {
    name,
    slug: slugifyCategoryName(name),
    parentId,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    imageFile: row.imageFile,
    thumbnailFile: row.thumbnailFile,
    imageUrl: '',
    thumbnailUrl: '',
    images: [],
  }
}

function applyCategoryServerErrors(error, setErrors) {
  const parsed = parseApiError(error)
  const next = {}
  Object.entries(parsed.fieldErrors ?? {}).forEach(([field, message]) => {
    const key = CATEGORY_FIELD_MAP[field] || field
    if (message && !next[key]) next[key] = message
  })
  if (Object.keys(next).length > 0) setErrors(next)
}

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

function DrawerSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  placeholder,
  options,
  hint,
  selectRef,
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          value={value}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${INPUT_CLASS} cursor-pointer appearance-none pr-9 ${
            error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-3 size-4 text-slate-400" aria-hidden="true" />
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p> : null}
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
    </div>
  )
}

function valuesFromCategory(next, fallbackParentId = '') {
  return {
    kind: next?.parentId || fallbackParentId ? 'subcategory' : 'department',
    name: next?.name ?? '',
    parentId: String(next?.parentId || fallbackParentId || ''),
    isActive: next?.isActive ?? true,
    isFeatured: Boolean(next?.isFeatured),
    imageFile: null,
    thumbnailFile: null,
  }
}

function CategorySuccessPanel({ name, onClose, onContinue }) {
  return (
    <section
      role="status"
      aria-labelledby="category-success-title"
      className="flex min-h-full flex-col justify-center px-1 py-6 sm:px-2"
    >
      <div className="rounded-3xl border border-emerald-100 bg-white px-5 py-8 shadow-sm sm:px-8">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <CheckCircle2 className="size-7" strokeWidth={2} aria-hidden="true" />
        </span>
        <h3 id="category-success-title" className="mt-5 text-xl font-bold tracking-tight text-slate-950">
          Subcategory updated
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-900">{name}</span>
          {' '}was saved. Close this drawer or continue to update another subcategory.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex flex-[1.3] cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Update another subcategory
          </button>
        </div>
      </div>
    </section>
  )
}

function SubcategoryRow({ index, row, busy, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(true)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!expanded) return
    const input = nameRef.current
    if (input && !input.value.trim()) input.focus()
  }, [expanded])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3.5 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500">
          {index + 1}
        </span>
        <input
          ref={nameRef}
          value={row.name}
          disabled={busy}
          onChange={(event) => onChange({ ...row, name: event.target.value })}
          placeholder={`Subcategory ${index + 1} name`}
          aria-label={`Subcategory ${index + 1} name`}
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          aria-label={expanded ? 'Collapse subcategory details' : 'Expand subcategory details'}
          aria-expanded={expanded}
        >
          <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onRemove}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed"
          aria-label={`Remove subcategory ${index + 1}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 px-3.5 py-3.5">
          <div className="grid min-w-0 gap-3 sm:grid-cols-[1.35fr_1fr]">
            <CategoryImageField
              id={`subcategory-${row.key}-image`}
              label="Cover image"
              hint="Cover"
              file={row.imageFile}
              onFileChange={(file) => onChange({ ...row, imageFile: file })}
              disabled={busy}
              aspectClass="aspect-[4/3]"
            />
            <CategoryImageField
              id={`subcategory-${row.key}-thumbnail`}
              label="Thumbnail"
              hint="Thumbnail"
              file={row.thumbnailFile}
              onFileChange={(file) => onChange({ ...row, thumbnailFile: file })}
              disabled={busy}
              aspectClass="aspect-square"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <SwitchField
              id={`subcategory-${row.key}-active`}
              label="Active"
              hint="Visible to shoppers"
              checked={row.isActive}
              onChange={(next) => onChange({ ...row, isActive: next })}
              disabled={busy}
            />
            <SwitchField
              id={`subcategory-${row.key}-featured`}
              label="Featured"
              hint="Highlight on storefront"
              checked={row.isFeatured}
              onChange={(next) => onChange({ ...row, isFeatured: next })}
              disabled={busy}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SubcategoriesSection({ subcategories, busy, error, onChangeSubcategories }) {
  const addRow = () => {
    onChangeSubcategories([...(subcategories ?? []), createEmptySubcategoryDraft()])
  }

  const updateRow = (key, next) => {
    onChangeSubcategories(subcategories.map((row) => (row.key === key ? next : row)))
  }

  const removeRow = (key) => {
    onChangeSubcategories(subcategories.filter((row) => row.key !== key))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">Subcategories</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Add subcategories now and they&apos;ll be created together with this department.
          </p>
        </div>
        {subcategories.length > 0 ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-slate-500">
            {subcategories.length}
          </span>
        ) : null}
      </div>

      {subcategories.length > 0 && (
        <div id="category-subcategories" className="mt-3 space-y-2.5">
          {subcategories.map((row, index) => (
            <SubcategoryRow
              key={row.key}
              index={index}
              row={row}
              busy={busy}
              onChange={(next) => updateRow(row.key, next)}
              onRemove={() => removeRow(row.key)}
            />
          ))}
        </div>
      )}

      {error ? <p className="mt-2 text-[11px] font-semibold text-rose-700">{error}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={addRow}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:bg-brand-light/30 hover:text-brand disabled:cursor-not-allowed"
      >
        <Plus className="size-4" aria-hidden="true" />
        {subcategories.length > 0 ? 'Add another subcategory' : 'Add a subcategory'}
      </button>
    </section>
  )
}

function BatchStepIcon({ status }) {
  if (status === 'saving') return <Loader2 className="size-4 animate-spin text-brand" aria-hidden="true" />
  if (status === 'done') return <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
  if (status === 'error') return <XCircle className="size-4 text-rose-600" aria-hidden="true" />
  return <Circle className="size-4 text-slate-300" aria-hidden="true" />
}

function BatchStepChecklist({ steps }) {
  const settled = steps.filter((step) => step.status === 'done' || step.status === 'error').length
  const total = steps.length
  const percent = total ? Math.round((settled / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{settled} of {total} saved</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => (
          <li
            key={step.key}
            className={`flex items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors ${
              step.status === 'error'
                ? 'border-rose-200 bg-rose-50/60'
                : step.status === 'done'
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : step.status === 'saving'
                    ? 'border-brand/30 bg-brand-light/40'
                    : 'border-slate-200 bg-white'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              <BatchStepIcon status={step.status} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{step.label || 'Untitled'}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {step.kind === 'department' ? 'Department' : 'Subcategory'}
                {' · '}
                {step.status === 'saving'
                  ? 'Saving…'
                  : step.status === 'done'
                    ? 'Saved'
                    : step.status === 'error'
                      ? 'Failed'
                      : 'Waiting'}
              </p>
              {step.status === 'error' && step.error ? (
                <p className="mt-1 text-[11px] font-medium text-rose-700">{step.error}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CategoryForm({ mode, category, parentId, tree, onClose }) {
  const isEdit = mode === 'edit'
  const queryClient = useQueryClient()
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const mutation = isEdit ? updateMutation : createMutation
  const lockedUnderParent = !isEdit && Boolean(parentId)
  const [phase, setPhase] = useState('form')
  const [activeCategory, setActiveCategory] = useState(category)
  const [savedName, setSavedName] = useState('')
  const [resumeParentId, setResumeParentId] = useState('')
  const [batchSteps, setBatchSteps] = useState([])
  const [batchDepartmentId, setBatchDepartmentId] = useState('')
  const initialValues = useMemo(
    () => getCategoryFormValues({ mode, category, parentId, tree }),
    [mode, category, parentId, tree],
  )

  useEffect(() => {
    const latest = findCategoryById(tree, activeCategory?.id)
    if (!latest) return
    setActiveCategory((current) => {
      if (!current || String(current.id) !== String(latest.id)) return current
      const currentIds = (current.imageIds ?? []).join(',')
      const latestIds = (latest.imageIds ?? []).join(',')
      if (
        current.imageUrl === latest.imageUrl
        && current.thumbnailUrl === latest.thumbnailUrl
        && currentIds === latestIds
      ) {
        return current
      }
      return {
        ...current,
        imageUrl: latest.imageUrl,
        thumbnailUrl: latest.thumbnailUrl,
        images: latest.images ?? current.images ?? [],
        imageIds: latest.imageIds ?? current.imageIds ?? [],
      }
    })
  }, [tree, activeCategory?.id])

  const updateBatchStep = (key, patch) => {
    setBatchSteps((current) => current.map((step) => (step.key === key ? { ...step, ...patch } : step)))
  }

  const runBatchSave = async (departmentPayload, subcategoryRows) => {
    const steps = [
      {
        key: 'department',
        kind: 'department',
        label: departmentPayload.name,
        status: 'pending',
        error: '',
        payload: departmentPayload,
      },
      ...subcategoryRows.map((row) => ({
        key: row.key,
        kind: 'subcategory',
        label: row.name.trim(),
        status: 'pending',
        error: '',
        payload: row,
      })),
    ]

    setBatchSteps(steps)
    setBatchDepartmentId('')
    setPhase('saving')

    updateBatchStep('department', { status: 'saving' })
    let newDepartmentId
    try {
      const result = await createAdminCategory(departmentPayload)
      newDepartmentId = result?.category?.id ?? ''
      updateBatchStep('department', { status: 'done' })
    } catch (error) {
      updateBatchStep('department', {
        status: 'error',
        error: parseApiError(error, 'Could not create this category.').message,
      })
      await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      setPhase('summary')
      return
    }

    setBatchDepartmentId(newDepartmentId)

    for (const row of subcategoryRows) {
      updateBatchStep(row.key, { status: 'saving' })
      try {
        await createAdminCategory(buildSubcategoryCreatePayload(row, newDepartmentId))
        updateBatchStep(row.key, { status: 'done' })
      } catch (error) {
        updateBatchStep(row.key, {
          status: 'error',
          error: parseApiError(error, 'Could not create this subcategory.').message,
        })
      }
    }

    await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
    setPhase('summary')
  }

  const retryFailedSubcategories = async () => {
    const failedSteps = batchSteps.filter((step) => step.kind === 'subcategory' && step.status === 'error')
    if (failedSteps.length === 0 || !batchDepartmentId) return

    setPhase('saving')
    for (const step of failedSteps) {
      updateBatchStep(step.key, { status: 'saving', error: '' })
      try {
        await createAdminCategory(buildSubcategoryCreatePayload(step.payload, batchDepartmentId))
        updateBatchStep(step.key, { status: 'done' })
      } catch (error) {
        updateBatchStep(step.key, {
          status: 'error',
          error: parseApiError(error, 'Could not create this subcategory.').message,
        })
      }
    }
    await queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
    setPhase('summary')
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={getCategoryFormSchema()}
      onSubmit={async (values, helpers) => {
        const nextName = values.name.trim()
        const parentIdValue = values.kind === 'subcategory'
          ? String(
            (lockedUnderParent ? parentId : values.parentId)
            || activeCategory?.parentId
            || findParentIdInTree(tree, activeCategory?.id)
            || '',
          )
          : null
        const payload = {
          name: nextName,
          slug: slugifyCategoryName(nextName),
          parentId: parentIdValue,
          isActive: values.isActive,
          isFeatured: values.isFeatured,
          imageFile: values.imageFile,
          thumbnailFile: values.thumbnailFile,
          imageUrl: activeCategory?.imageUrl ?? '',
          thumbnailUrl: activeCategory?.thumbnailUrl ?? '',
          images: activeCategory?.images ?? [],
        }

        const pendingSubcategories = (!isEdit && !lockedUnderParent && values.kind === 'department')
          ? (values.subcategories ?? []).filter((row) => row.name.trim())
          : []

        if (pendingSubcategories.length > 0) {
          const seenNames = new Set()
          const hasDuplicate = pendingSubcategories.some((row) => {
            const key = row.name.trim().toLowerCase()
            if (seenNames.has(key)) return true
            seenNames.add(key)
            return false
          })
          if (hasDuplicate) {
            helpers.setFieldError('subcategories', 'Give each subcategory a different name.')
            helpers.setSubmitting(false)
            return
          }
        }

        if (!CATEGORY_WRITE_ENABLED) {
          notify.info('This category cannot be saved yet. Your details stay in the form.')
          helpers.setSubmitting(false)
          return
        }

        if (pendingSubcategories.length > 0) {
          helpers.setSubmitting(false)
          runBatchSave(payload, pendingSubcategories)
          return
        }

        try {
          if (isEdit) {
            const stayOpen = values.kind === 'subcategory'
            await updateMutation.mutateAsync({
              id: activeCategory.id,
              silent: stayOpen,
              ...payload,
            })
            if (stayOpen) {
              setActiveCategory((current) => ({
                ...current,
                name: nextName,
                parentId: parentIdValue,
                isActive: values.isActive,
                isFeatured: values.isFeatured,
              }))
              setSavedName(nextName)
              setResumeParentId(parentIdValue || '')
              setPhase('success')
              helpers.resetForm({
                values: {
                  ...values,
                  name: nextName,
                  parentId: parentIdValue || '',
                  imageFile: null,
                  thumbnailFile: null,
                },
              })
              return
            }
          } else {
            await createMutation.mutateAsync(payload)
          }
          onClose()
        } catch (error) {
          applyCategoryServerErrors(error, helpers.setErrors)
        } finally {
          helpers.setSubmitting(false)
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        submitCount,
        isSubmitting,
        setFieldValue,
        resetForm,
        submitForm,
      }) => (
        phase === 'success' ? (
          <SlideDrawer
            open
            onClose={onClose}
            labelledBy="category-form-title"
            title="Category updated"
            subtitle="Choose what to do next"
            icon={CheckCircle2}
            widthClass="max-w-xl"
          >
            <CategorySuccessPanel
              name={savedName}
              onClose={onClose}
              onContinue={() => {
                setActiveCategory(null)
                setPhase('pick')
                resetForm({
                  values: {
                    ...EMPTY_CONTINUE_VALUES,
                    parentId: resumeParentId,
                  },
                })
              }}
            />
          </SlideDrawer>
        ) : phase === 'saving' ? (
          <SlideDrawer
            open
            onClose={() => {}}
            labelledBy="category-form-title"
            title="Saving your categories"
            subtitle="Hang tight — this only takes a moment"
            icon={Loader2}
            widthClass="max-w-xl"
          >
            <BatchStepChecklist steps={batchSteps} />
          </SlideDrawer>
        ) : phase === 'summary' ? (
          <SlideDrawer
            open
            onClose={onClose}
            labelledBy="category-form-title"
            title={
              batchSteps.find((step) => step.kind === 'department')?.status === 'error'
                ? 'Could not create this category'
                : 'Category batch saved'
            }
            subtitle="Here's how each item went"
            icon={CheckCircle2}
            widthClass="max-w-xl"
            footer={(() => {
              const departmentStep = batchSteps.find((step) => step.kind === 'department')
              const failedSubcategories = batchSteps.filter(
                (step) => step.kind === 'subcategory' && step.status === 'error',
              )

              if (departmentStep?.status === 'error') {
                return (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('form')}
                      className="flex-[1.4] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                )
              }

              if (failedSubcategories.length > 0) {
                return (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={retryFailedSubcategories}
                      className="flex-[1.4] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      Retry {failedSubcategories.length} failed
                    </button>
                  </div>
                )
              }

              return (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Done
                </button>
              )
            })()}
          >
            <BatchStepChecklist steps={batchSteps} />
          </SlideDrawer>
        ) : (
          <CategoryFormFields
            mode={mode}
            phase={phase}
            category={activeCategory}
            parentId={parentId}
            tree={tree}
            lockedUnderParent={lockedUnderParent}
            busy={isSubmitting || mutation.isPending}
            values={values}
            errors={errors}
            touched={touched}
            submitCount={submitCount}
            setFieldValue={setFieldValue}
            submitForm={submitForm}
            onChangeParent={(nextParentId) => {
              setFieldValue('parentId', nextParentId)
              if (phase === 'form') return
              setActiveCategory(null)
              setPhase('pick')
              setFieldValue('name', '')
              setFieldValue('isActive', true)
              setFieldValue('isFeatured', false)
              setFieldValue('imageFile', null)
              setFieldValue('thumbnailFile', null)
            }}
            onSelectSubcategory={(next) => {
              setActiveCategory(next)
              setPhase('details')
              resetForm({ values: valuesFromCategory(next, values.parentId) })
            }}
            onCancelContinue={() => {
              setActiveCategory(null)
              setPhase('pick')
              resetForm({
                values: {
                  ...EMPTY_CONTINUE_VALUES,
                  parentId: values.parentId || resumeParentId,
                },
              })
            }}
            onClose={onClose}
          />
        )
      )}
    </Formik>
  )
}

function CategoryFormFields({
  mode,
  phase,
  category,
  parentId,
  tree,
  lockedUnderParent,
  busy,
  values,
  errors,
  touched,
  submitCount,
  setFieldValue,
  submitForm,
  onChangeParent,
  onSelectSubcategory,
  onCancelContinue,
  onClose,
}) {
  const isEdit = mode === 'edit'
  const isContinue = phase === 'pick' || phase === 'details'
  const showDetails = phase === 'form' || phase === 'details'
  const errorSummaryRef = useRef(null)
  const nameRef = useRef(null)
  const parentSelectRef = useRef(null)
  const parentOptions = useMemo(
    () => getCategoryParentOptions(tree, isContinue ? null : (isEdit ? category?.id : null)),
    [tree, isContinue, isEdit, category?.id],
  )
  const siblingSubcategories = useMemo(
    () => getSubcategoriesUnderParent(tree, values.parentId || parentId),
    [tree, values.parentId, parentId],
  )
  const parent = findCategoryById(tree, values.parentId || parentId)
  const showError = (field) => (touched[field] || submitCount > 0) && errors[field]
  const errorEntries = Object.entries(errors).filter(([field, message]) => (
    message && (touched[field] || submitCount > 0)
  ))
  const previewCover = useFilePreview(values.imageFile, category?.imageUrl)
  const previewThumb = useFilePreview(values.thumbnailFile, category?.thumbnailUrl)
  const pendingSubcategoryCount = (values.subcategories ?? []).filter((row) => row.name.trim()).length

  useEffect(() => {
    if (phase === 'pick') {
      parentSelectRef.current?.focus()
      return
    }
    if (phase === 'form') nameRef.current?.focus()
  }, [phase, category?.id])

  useEffect(() => {
    if (showDetails && submitCount > 0 && errorEntries.length > 0) {
      errorSummaryRef.current?.focus()
    }
  }, [showDetails, submitCount, errorEntries.length])

  const handleKindChange = (nextKind) => {
    if (lockedUnderParent || isContinue) return
    setFieldValue('kind', nextKind)
    if (nextKind === 'department') setFieldValue('parentId', '')
  }

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const drawerTitle = isContinue
    ? 'Update another subcategory'
    : isEdit
      ? 'Edit category'
      : lockedUnderParent
        ? 'New subcategory'
        : 'New category'

  const drawerSubtitle = isContinue
    ? (parent?.name ? `Choose a subcategory under ${parent.name}` : 'Choose a department, then a subcategory')
    : isEdit
      ? category?.name
      : lockedUnderParent
        ? (parent?.name ? `Nested under ${parent.name}` : 'Nested under this department')
        : values.kind === 'subcategory'
          ? (parent?.name ? `Nested under ${parent.name}` : 'Choose a department to nest under')
          : 'A top-level shop section'

  return (
    <SlideDrawer
      open
      onClose={handleClose}
      labelledBy="category-form-title"
      title={drawerTitle}
      subtitle={drawerSubtitle}
      icon={isEdit || isContinue ? Pencil : FolderPlus}
      widthClass="max-w-xl"
      footer={
        phase === 'pick' ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={phase === 'details' ? onCancelContinue : handleClose}
              className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submitForm()}
              className="flex-[1.4] inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isContinue
                ? 'Save changes'
                : isEdit
                  ? 'Save changes'
                  : lockedUnderParent
                    ? 'Create subcategory'
                    : pendingSubcategoryCount > 0
                      ? `Create category + ${pendingSubcategoryCount} subcategor${pendingSubcategoryCount === 1 ? 'y' : 'ies'}`
                      : 'Create category'}
            </button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        {showDetails && errorEntries.length > 0 && (
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
                    href={`#category-${field === 'parentId' ? 'parent' : field === 'imageFile' ? 'image-url' : field === 'thumbnailFile' ? 'thumbnail-url' : field}`}
                    className="text-xs font-semibold text-rose-800 underline-offset-2 hover:underline"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === 'form' && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/7] bg-slate-200">
              {previewCover ? (
                <img src={previewCover} alt="" className="absolute inset-0 h-full w-full max-w-full object-contain" />
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
                {values.kind === 'subcategory' ? 'Subcategory' : 'Department'}
              </p>
              <p className="mt-1 truncate text-base font-bold text-slate-950">
                {values.name.trim() || 'Category name'}
              </p>
            </div>
          </section>
        )}

        {phase === 'form' && (
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
                    const active = values.kind === item.key
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

                {values.kind === 'subcategory' && (
                  <div className="mt-3">
                    <DrawerSelect
                      id="category-parent"
                      label="Sits under"
                      value={values.parentId}
                      disabled={busy}
                      error={showError('parentId') ? errors.parentId : ''}
                      placeholder="Select a department"
                      options={parentOptions.filter((option) => option.value)}
                      onChange={(event) => setFieldValue('parentId', event.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {isContinue && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-700">Choose a subcategory</p>
            <DrawerSelect
              id="category-parent"
              label="Sits under"
              selectRef={parentSelectRef}
              value={values.parentId}
              disabled={busy}
              placeholder="Select a department"
              options={parentOptions.filter((option) => option.value)}
              onChange={(event) => onChangeParent(event.target.value)}
            />
            <DrawerSelect
              id="category-subcategory"
              label="Subcategory to edit"
              value={phase === 'details' && category?.id ? String(category.id) : ''}
              disabled={busy || !values.parentId}
              placeholder={values.parentId ? 'Select a subcategory' : 'Select a department first'}
              options={siblingSubcategories.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
              hint={
                parent?.name
                  ? `Subcategories under ${parent.name}.`
                  : 'Pick the department first, then the subcategory.'
              }
              onChange={(event) => {
                const next = siblingSubcategories.find(
                  (item) => String(item.id) === event.target.value,
                )
                if (next) onSelectSubcategory(next)
              }}
            />
          </section>
        )}

        {phase === 'form' && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block" htmlFor="category-name">
              <span className="text-xs font-semibold text-slate-700">Name</span>
              <input
                ref={nameRef}
                id="category-name"
                value={values.name}
                disabled={busy}
                onChange={(event) => setFieldValue('name', event.target.value)}
                placeholder="Home & Kitchen"
                aria-invalid={Boolean(showError('name'))}
                aria-describedby={showError('name') ? 'category-name-error' : undefined}
                className={`${INPUT_CLASS} ${
                  showError('name') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                }`}
              />
              {showError('name') ? <FieldError id="category-name-error" message={errors.name} /> : null}
            </label>
          </section>
        )}

        {showDetails && (
          <>
            {phase === 'details' && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="block" htmlFor="category-name">
                  <span className="text-xs font-semibold text-slate-700">Name</span>
                  <input
                    id="category-name"
                    value={values.name}
                    disabled={busy}
                    onChange={(event) => setFieldValue('name', event.target.value)}
                    placeholder="Home & Kitchen"
                    aria-invalid={Boolean(showError('name'))}
                    aria-describedby={showError('name') ? 'category-name-error' : undefined}
                    className={`${INPUT_CLASS} ${
                      showError('name') ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
                    }`}
                  />
                  {showError('name') ? <FieldError id="category-name-error" message={errors.name} /> : null}
                </label>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-700">Images</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Cover shows on the storefront. Thumbnail shows in lists.
              </p>
              <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[1.35fr_1fr]">
                <CategoryImageField
                  id="category-image-url"
                  label="Cover image"
                  hint="Category cover"
                  existingUrl={category?.imageUrl}
                  file={values.imageFile}
                  onFileChange={(file) => setFieldValue('imageFile', file)}
                  disabled={busy}
                  error={showError('imageFile') || ''}
                  aspectClass="aspect-[4/3]"
                />
                <CategoryImageField
                  id="category-thumbnail-url"
                  label="Thumbnail"
                  hint="List thumbnail"
                  existingUrl={category?.thumbnailUrl}
                  file={values.thumbnailFile}
                  onFileChange={(file) => setFieldValue('thumbnailFile', file)}
                  disabled={busy}
                  error={showError('thumbnailFile') || ''}
                  aspectClass="aspect-square"
                />
              </div>
            </section>

            <section className="grid gap-2 sm:grid-cols-2">
              <SwitchField
                id="category-active"
                label="Active"
                hint="Visible to shoppers"
                checked={values.isActive}
                onChange={(next) => setFieldValue('isActive', next)}
                disabled={busy}
              />
              <SwitchField
                id="category-featured"
                label="Featured"
                hint="Highlight on the storefront"
                checked={values.isFeatured}
                onChange={(next) => setFieldValue('isFeatured', next)}
                disabled={busy}
              />
            </section>
          </>
        )}

        {phase === 'form' && !isEdit && !lockedUnderParent && values.kind === 'department' && (
          <SubcategoriesSection
            subcategories={values.subcategories ?? []}
            busy={busy}
            error={showError('subcategories') ? errors.subcategories : ''}
            onChangeSubcategories={(next) => setFieldValue('subcategories', next)}
          />
        )}
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
