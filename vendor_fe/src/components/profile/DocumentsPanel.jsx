import { useRef, useState } from 'react'
import { Eye, FileText, Loader2, Upload } from 'lucide-react'
import { PROFILE_INNER_SURFACE_CLASS } from '../../constants/profile'
import notify from '../../lib/notify'
import { formatProfileDateShort, getVerificationItemMeta } from '../../utils/profileFormUtils'
import DocumentViewerModal from './DocumentViewerModal'
import ProfileSectionCard from './ProfileSectionCard'

export default function DocumentsPanel({
  documents = [],
  onUploadDocument,
  isUploading = false,
}) {
  const fileInputRef = useRef(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [uploadTargetId, setUploadTargetId] = useState(null)

  const handleUploadClick = (documentId) => {
    setUploadTargetId(documentId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !uploadTargetId) return

    const target = documents.find((item) => item.id === uploadTargetId)
    if (!target) return

    try {
      await onUploadDocument({
        documentId: uploadTargetId,
        file,
        documentType: target.documentType,
      })
      notify.success('Document uploaded successfully.')
    } catch {
      notify.error('Unable to upload document. Please try again.')
    } finally {
      setUploadTargetId(null)
    }
  }

  if (!documents.length) {
    return (
      <ProfileSectionCard
        icon={FileText}
        title="Documents"
        subtitle="Upload the required verification documents to complete your account verification."
      >
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      </ProfileSectionCard>
    )
  }

  return (
    <>
      <ProfileSectionCard
        icon={FileText}
        title="Documents"
        subtitle="View and upload verification documents for your vendor account."
      >
        <ul className="space-y-3">
          {documents.map((doc) => {
            const statusMeta = getVerificationItemMeta(doc.verificationStatus)
            const canUpload = doc.verificationStatus === 'not_verified' || !doc.fileName

            return (
              <li
                key={doc.id}
                className={`${PROFILE_INNER_SURFACE_CLASS} px-4 py-4`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{doc.documentType}</p>
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
                    {doc.fileName && (
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
                    {canUpload && (
                      <button
                        type="button"
                        onClick={() => handleUploadClick(doc.id)}
                        disabled={isUploading && uploadTargetId === doc.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUploading && uploadTargetId === doc.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Upload className="size-3.5" />
                        )}
                        Upload Document
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
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
