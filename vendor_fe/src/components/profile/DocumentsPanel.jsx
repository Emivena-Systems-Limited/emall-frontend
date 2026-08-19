import { useRef, useState } from 'react'
import { Eye, FileText, Loader2, Upload } from 'lucide-react'
import { DOCUMENT_CATEGORIES, PROFILE_INNER_SURFACE_CLASS } from '../../constants/profile'
import notify from '../../lib/notify'
import { formatProfileDateShort, getVerificationItemMeta } from '../../utils/profileFormUtils'
import { resolveBackendMediaUrl } from '../../utils/resolveBackendMediaUrl'
import DocumentViewerModal from './DocumentViewerModal'
import ProfileSectionCard from './ProfileSectionCard'

const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_CATEGORIES)

export default function DocumentsPanel({
  documents = [],
  onUploadDocument,
  isUploading = false,
}) {
  const fileInputRef = useRef(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(DOCUMENT_TYPE_OPTIONS[0]?.[0] ?? '')
  const [replaceDocumentId, setReplaceDocumentId] = useState(null)

  const openFilePicker = (documentId = null) => {
    setReplaceDocumentId(documentId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const target = replaceDocumentId
      ? documents.find((item) => item.id === replaceDocumentId)
      : null
    const category = target?.category || selectedCategory

    if (!category) {
      notify.error('Choose a document type before uploading.')
      return
    }

    const file_url = resolveBackendMediaUrl(
      `vendor-documents/${Date.now()}-${String(file.name).replace(/[^\w.\-]+/g, '_')}`,
    )

    try {
      await onUploadDocument({
        documentId: replaceDocumentId || undefined,
        file,
        document_type: category,
        documentType: category,
        category,
        name: target?.name || DOCUMENT_CATEGORIES[category],
        file_url,
      })
      notify.success('Document uploaded successfully.')
    } catch (error) {
      notify.fromError(error, 'Unable to upload document. Please try again.')
    } finally {
      setReplaceDocumentId(null)
    }
  }

  return (
    <>
      <ProfileSectionCard
        icon={FileText}
        title="Documents"
        subtitle="Upload verification documents for your vendor account."
      >
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
            Document type
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none ring-0 transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {DOCUMENT_TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => openFilePicker(null)}
            disabled={isUploading}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading && !replaceDocumentId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload Document
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {documents.map((doc) => {
              const statusMeta = getVerificationItemMeta(doc.verificationStatus)
              const canReplace = doc.verificationStatus !== 'verified'

              return (
                <li
                  key={doc.id}
                  className={`${PROFILE_INNER_SURFACE_CLASS} px-4 py-4`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{doc.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{doc.documentType}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusMeta.className}`}>
                          <span className={`size-1.5 rounded-full ${statusMeta.dotClass}`} />
                          {statusMeta.label}
                        </span>
                        {doc.uploadedAt && (
                          <span className="text-[11px] font-medium text-slate-500">
                            Uploaded: {formatProfileDateShort(doc.uploadedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {(doc.fileUrl || doc.fileName) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocument(doc)
                            setViewerOpen(true)
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 hover:bg-slate-50"
                        >
                          <Eye className="size-3.5" />
                          View
                        </button>
                      )}
                      {canReplace && (
                        <button
                          type="button"
                          onClick={() => openFilePicker(doc.id)}
                          disabled={isUploading && replaceDocumentId === doc.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploading && replaceDocumentId === doc.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          Replace
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </ProfileSectionCard>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <DocumentViewerModal
        open={viewerOpen}
        document={selectedDocument}
        onClose={() => {
          setViewerOpen(false)
          setSelectedDocument(null)
        }}
      />
    </>
  )
}
