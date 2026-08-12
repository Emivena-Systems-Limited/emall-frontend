import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import PortalMenu from '../common/PortalMenu'
import { PROFILE_AVATAR_ACCEPT, PROFILE_AVATAR_MAX_BYTES } from '../../constants/profile'
import { getProfileInitials } from '../../utils/profileFormUtils'

export default function ProfileAvatar({
  profile,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
}) {
  const triggerRef = useRef(null)
  const fileInputRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const initials = getProfileInitials(profile)
  const displayUrl = previewUrl ?? profile?.profilePicture
  const busy = isUploading || isRemoving

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploadError('')

    if (!PROFILE_AVATAR_ACCEPT.split(',').includes(file.type)) {
      setUploadError('Use JPG, PNG, or WEBP images only.')
      return
    }

    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      setUploadError('Image must be 5MB or less.')
      return
    }

    const nextPreview = URL.createObjectURL(file)
    setPreviewUrl(nextPreview)

    try {
      await onUpload(file)
      setPreviewUrl(null)
    } catch {
      setUploadError('Unable to upload profile picture.')
      URL.revokeObjectURL(nextPreview)
      setPreviewUrl(null)
    }
  }

  const handleRemove = async () => {
    try {
      await onRemove()
      setPreviewUrl(null)
      setRemoveOpen(false)
    } catch {
      setUploadError('Unable to remove profile picture.')
    }
  }

  return (
    <div className="relative shrink-0">
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="size-24 rounded-2xl object-cover ring-4 ring-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:size-28"
          />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-2xl bg-brand text-3xl font-bold text-white shadow-[0_16px_40px_rgba(199,59,45,0.28)] ring-4 ring-white sm:size-28">
            {initials}
          </span>
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/45">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        )}
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        disabled={busy}
        className="absolute -bottom-2 -right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Manage profile photo"
      >
        <Camera className="size-4" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_AVATAR_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <PortalMenu open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} menuWidth={180}>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false)
            fileInputRef.current?.click()
          }}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Camera className="size-4" />
          Change Photo
        </button>
        {displayUrl && (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setRemoveOpen(true)
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            Remove Photo
          </button>
        )}
      </PortalMenu>

      {uploadError && (
        <p className="absolute left-0 top-full mt-2 w-48 text-[11px] font-medium text-red-600">{uploadError}</p>
      )}

      <ConfirmModal
        open={removeOpen}
        title="Remove profile picture?"
        description="Are you sure you want to remove your current profile picture?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={isRemoving}
        loadingLabel="Removing…"
        onConfirm={handleRemove}
        onClose={() => setRemoveOpen(false)}
      />
    </div>
  )
}
