import { useOutletContext } from 'react-router'
import DocumentsPanel from '../../components/profile/DocumentsPanel'
import ProfileErrorState from '../../components/profile/ProfileErrorState'
import ProfilePageLoader from '../../components/profile/ProfilePageLoader'

export default function DocumentsPage() {
  const {
    documents,
    isDocumentsLoading,
    documentsError,
    refetchDocuments,
    onUploadDocument,
    isUploadingDocument,
  } = useOutletContext()

  if (isDocumentsLoading) return <ProfilePageLoader label="Loading documents…" />

  if (documentsError) {
    return (
      <ProfileErrorState
        title="Unable to load documents"
        message={documentsError?.message}
        onRetry={refetchDocuments}
      />
    )
  }

  return (
    <DocumentsPanel
      documents={documents}
      onUploadDocument={onUploadDocument}
      isUploading={isUploadingDocument}
    />
  )
}
