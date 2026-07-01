import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import {
  Bold,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Upload,
  X,
} from 'lucide-react'
import FieldError from '../auth/FieldError'
import { isRichTextEmpty } from '../../utils/richText'

const normalState = 'border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-light'
const errorState = 'border-red-400 ring-2 ring-red-100'

function readImageFile(file, onLoad) {
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
  reader.readAsDataURL(file)
}

function readEditorHtml(editor) {
  const html = editor.getHTML()
  return isRichTextEmpty(html) ? '' : html
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-brand text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
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

function ImageInsertPanel({
  open,
  imageUrl,
  onClose,
  onImageUrlChange,
  onInsertUrl,
  onUploadClick,
  fileInputRef,
  onFileChange,
}) {
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

function EditorToolbar({
  editor,
  expanded,
  onToggleExpand,
  onOpenImagePanel,
  tableMenuOpen,
  onToggleTableMenu,
  tableMenuRef,
}) {
  if (!editor) return null

  const inTable = editor.isActive('table')

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter link URL. Leave blank to remove the link.', previousUrl || 'https://')

    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-2 py-2">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 inline-flex items-center">
          <select
            value={
              editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                  ? 'h3'
                  : 'p'
            }
            onChange={(event) => {
              if (event.target.value === 'h2') {
                editor.chain().focus().setHeading({ level: 2 }).run()
                return
              }
              if (event.target.value === 'h3') {
                editor.chain().focus().setHeading({ level: 3 }).run()
                return
              }
              editor.chain().focus().setParagraph().run()
            }}
            className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-brand"
            aria-label="Text style"
          >
            <option value="p">Normal</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </span>

        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

        <ToolbarButton
          label="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Image" onClick={onOpenImagePanel}>
          <ImagePlus className="size-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

        <div className="relative" ref={tableMenuRef}>
          <ToolbarButton
            label="Table"
            active={inTable || tableMenuOpen}
            onClick={onToggleTableMenu}
          >
            <Table2 className="size-4" />
          </ToolbarButton>

          {tableMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              {!inTable ? (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    onToggleTableMenu()
                  }}
                  className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Insert 3×3 table
                </button>
              ) : (
                <>
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Rows
                  </p>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Add row above
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Add row below
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Delete row
                  </button>
                  <p className="mt-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Columns
                  </p>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Add column left
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Add column right
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Delete column
                  </button>
                  <p className="mt-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Cells
                  </p>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().mergeCells().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Merge selected cells
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().splitCell().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Split cell
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Toggle header row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run()
                      onToggleTableMenu()
                    }}
                    className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    Delete table
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <ToolbarButton
          label="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <span className="text-[11px] font-bold">Tx</span>
        </ToolbarButton>
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
  const fileInputRef = useRef(null)
  const panelRef = useRef(null)
  const tableMenuRef = useRef(null)
  const editorRef = useRef(null)
  const lastEmittedHtmlRef = useRef(value ?? '')
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)
  const [expanded, setExpanded] = useState(false)
  const [imagePanelOpen, setImagePanelOpen] = useState(false)
  const [tableMenuOpen, setTableMenuOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  useClickOutside(imagePanelOpen, panelRef, () => setImagePanelOpen(false))
  useClickOutside(tableMenuOpen, tableMenuRef, () => setTableMenuOpen(false))

  useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
  }, [onBlur, onChange])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand underline underline-offset-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'product-rich-text-image',
        },
      }),
      Placeholder.configure({ placeholder }),
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {
            class: 'product-rich-text-table',
          },
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: currentEditor }) => {
      const html = readEditorHtml(currentEditor)
      lastEmittedHtmlRef.current = html
      onChangeRef.current(html)
    },
    onBlur: () => onBlurRef.current?.({ target: { name } }),
    editorProps: {
      attributes: {
        id,
        class: 'product-tiptap-editor',
        'aria-label': label || 'Product description',
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
          item.type.startsWith('image/'),
        )
        if (!file) return false

        readImageFile(file, (src) => {
          editorRef.current?.chain().focus().setImage({ src }).run()
        })
        return true
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((item) =>
          item.type.startsWith('image/'),
        )
        if (!file) return false

        event.preventDefault()
        readImageFile(file, (src) => {
          editorRef.current?.chain().focus().setImage({ src }).run()
        })
        return true
      },
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const next = value ?? ''
    if (next === lastEmittedHtmlRef.current) return

    lastEmittedHtmlRef.current = next
    editor.commands.setContent(next || '', false)
  }, [editor, value])

  const insertImage = (src) => {
    if (!editor || !src) return
    editor.chain().focus().setImage({ src }).run()
  }

  const handleInsertImageUrl = () => {
    const src = imageUrl.trim()
    if (!src) return
    insertImage(src)
    setImageUrl('')
    setImagePanelOpen(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    readImageFile(file, insertImage)
    event.target.value = ''
    setImagePanelOpen(false)
  }

  return (
    <div data-field={name}>
      <FieldLabel id={id} label={label} hint={hint} />
      <div className={`rounded-xl border bg-white transition-all ${error ? errorState : normalState}`}>
        <EditorToolbar
          editor={editor}
          expanded={expanded}
          onToggleExpand={() => setExpanded((current) => !current)}
          onOpenImagePanel={() => setImagePanelOpen((current) => !current)}
          tableMenuOpen={tableMenuOpen}
          onToggleTableMenu={() => setTableMenuOpen((current) => !current)}
          tableMenuRef={tableMenuRef}
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
          <EditorContent editor={editor} />
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        Use the table button to insert or edit tables. Drag the bottom edge to resize, or expand for more space.
      </p>
      {error && <FieldError message={error} />}
    </div>
  )
}
