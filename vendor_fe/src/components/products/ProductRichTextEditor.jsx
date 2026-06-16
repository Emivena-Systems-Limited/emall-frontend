import { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {
  ImagePlus,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  Upload,
  X,
} from 'lucide-react'
import FieldError from '../auth/FieldError'

const normalState = 'border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light'
const errorState = 'border-red-400 ring-2 ring-red-100'
const emptyHtml = '<p><br></p>'

function readImageFile(file, onLoad) {
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
  reader.readAsDataURL(file)
}

function ExpandButton({ expanded, onToggle }) {
  return (
    <button
      type="button"
      aria-label={expanded ? 'Collapse editor' : 'Expand editor'}
      title={expanded ? 'Collapse editor' : 'Expand editor'}
      onClick={onToggle}
      className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        expanded ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
    </button>
  )
}

function ImageInsertPanel({ open, imageUrl, onClose, onImageUrlChange, onInsertUrl, onUploadClick, fileInputRef, onFileChange }) {
  if (!open) return null

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-800">Add image to description</p>
        <button
          type="button"
          aria-label="Close image panel"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
          placeholder="Paste image URL"
          className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
        <button
          type="button"
          disabled={!imageUrl.trim()}
          onClick={onInsertUrl}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LinkIcon className="size-3.5" />
          Insert URL
        </button>
        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-cyan-200 hover:text-cyan-700"
        >
          <Upload className="size-3.5" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  )
}

function EditorToolbar({ toolbarRef, expanded, onToggleExpand, onOpenImagePanel }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-2 py-2">
      <div ref={toolbarRef} className="product-quill-toolbar flex flex-wrap items-center gap-1">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="2">Heading</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-bold" aria-label="Bold" />
          <button type="button" className="ql-italic" aria-label="Italic" />
          <button type="button" className="ql-underline" aria-label="Underline" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-list" value="ordered" aria-label="Numbered list" />
          <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
          <button type="button" className="ql-blockquote" aria-label="Quote" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-link" aria-label="Link" />
          <button
            type="button"
            aria-label="Image"
            onClick={onOpenImagePanel}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ImagePlus className="size-4" />
          </button>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-clean" aria-label="Clear formatting" />
        </span>
      </div>

      <ExpandButton expanded={expanded} onToggle={onToggleExpand} />
    </div>
  )
}

function useClickOutside(isOpen, panelRef, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleClick = (event) => {
      if (panelRef.current?.contains(event.target)) return
      onClose()
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose, panelRef])
}

function FieldLabel({ id, label, hint }) {
  return (
    <label htmlFor={id} className="mb-1.5 block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {hint && <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{hint}</span>}
    </label>
  )
}

function insertImage(quill, src) {
  if (!quill || !src) return
  const range = quill.getSelection(true)
  const index = range?.index ?? quill.getLength()
  quill.insertEmbed(index, 'image', src, 'user')
  quill.setSelection(index + 1, 0, 'silent')
}

export default function ProductRichTextEditor({
  id,
  name = 'description',
  label,
  hint,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Describe product benefits, compatibility, package contents, and warranty information.',
}) {
  const editorContainerRef = useRef(null)
  const toolbarRef = useRef(null)
  const fileInputRef = useRef(null)
  const panelRef = useRef(null)
  const quillRef = useRef(null)
  const initialValueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)
  const [expanded, setExpanded] = useState(false)
  const [imagePanelOpen, setImagePanelOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  useClickOutside(imagePanelOpen, panelRef, () => setImagePanelOpen(false))

  useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
  }, [onBlur, onChange])

  useEffect(() => {
    if (!editorContainerRef.current || !toolbarRef.current || quillRef.current) return undefined

    const editorNode = editorContainerRef.current
    const quill = new Quill(editorNode, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: toolbarRef.current,
        clipboard: {
          matchVisual: false,
        },
      },
    })

    quillRef.current = quill
    if (initialValueRef.current) {
      quill.clipboard.dangerouslyPasteHTML(initialValueRef.current, 'silent')
    }

    const handleTextChange = () => {
      const html = quill.root.innerHTML
      onChangeRef.current(html === emptyHtml ? '' : html)
    }

    const handleBlur = () => onBlurRef.current?.({ target: { name } })

    const handlePaste = (event) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith('image/'))
      if (!file) return
      event.preventDefault()
      readImageFile(file, (src) => insertImage(quill, src))
    }

    const handleDrop = (event) => {
      const file = Array.from(event.dataTransfer?.files ?? []).find((item) => item.type.startsWith('image/'))
      if (!file) return
      event.preventDefault()
      readImageFile(file, (src) => insertImage(quill, src))
    }

    quill.on('text-change', handleTextChange)
    quill.root.addEventListener('blur', handleBlur)
    quill.root.addEventListener('paste', handlePaste)
    quill.root.addEventListener('drop', handleDrop)

    return () => {
      quill.off('text-change', handleTextChange)
      quill.root.removeEventListener('blur', handleBlur)
      quill.root.removeEventListener('paste', handlePaste)
      quill.root.removeEventListener('drop', handleDrop)
      quillRef.current = null
      editorNode.innerHTML = ''
    }
  }, [name, placeholder])

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    const next = value || emptyHtml
    if (next !== quill.root.innerHTML) {
      quill.clipboard.dangerouslyPasteHTML(next, 'silent')
    }
  }, [value])

  const handleInsertImageUrl = () => {
    const src = imageUrl.trim()
    if (!src) return
    insertImage(quillRef.current, src)
    setImageUrl('')
    setImagePanelOpen(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    readImageFile(file, (src) => insertImage(quillRef.current, src))
    event.target.value = ''
    setImagePanelOpen(false)
  }

  return (
    <div data-field={name}>
      <FieldLabel id={id} label={label} hint={hint} />
      <div className={`rounded-xl border bg-white transition-all ${error ? errorState : normalState}`}>
        <EditorToolbar
          toolbarRef={toolbarRef}
          expanded={expanded}
          onToggleExpand={() => setExpanded((current) => !current)}
          onOpenImagePanel={() => setImagePanelOpen((current) => !current)}
        />
        <div ref={panelRef}>
          <ImageInsertPanel
            open={imagePanelOpen}
            imageUrl={imageUrl}
            onClose={() => setImagePanelOpen(false)}
            onImageUrlChange={setImageUrl}
            onInsertUrl={handleInsertImageUrl}
            onUploadClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />
        </div>
        <div
          className={`product-rich-text-body ${expanded ? 'product-rich-text-body--expanded' : ''}`}
        >
          <div ref={editorContainerRef} />
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        Drag the bottom edge to resize, or use the expand button in the toolbar.
      </p>
      {error && <FieldError message={error} />}
    </div>
  )
}
