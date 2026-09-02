import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { PROFILE_AVATAR_ACCEPT, PROFILE_AVATAR_MAX_BYTES } from '../../constants/profile'
import notify from '../../lib/notify'
import { getProfileInitials } from '../../utils/profileUtils'

export default function ProfileAvatar({
  user,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
}) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const initials = getProfileInitials(user)
  const displayUrl = previewUrl ?? user?.avatar_url
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

    if (!PROFILE_AVATAR_ACCEPT.split(',').includes(file.type)) {
      notify.error('Use JPG, PNG, or WEBP images only.')
      return
    }

    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      notify.error('Image must be 5MB or less.')
      return
    }

    const nextPreview = URL.createObjectURL(file)
    setPreviewUrl(nextPreview)

    try {
      await onUpload(file)
      URL.revokeObjectURL(nextPreview)
      setPreviewUrl(null)
    } catch {
      notify.error('Unable to upload profile picture.')
      URL.revokeObjectURL(nextPreview)
      setPreviewUrl(null)
    }
  }

  const handleRemove = async () => {
    try {
      await onRemove()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    } catch {
      notify.error('Unable to remove profile picture.')
    }
  }

  return (
    <div className="relative mr-1 mb-1 shrink-0">
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="size-20 rounded-2xl object-cover shadow-[0_16px_40px_rgba(15,23,42,0.18)] ring-4 ring-white sm:size-24"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-[0_16px_40px_rgba(199,59,45,0.28)] ring-4 ring-white sm:size-24">
            {initials}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/45">
            <Loader2 className="size-6 animate-spin text-white" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="absolute -right-2 -bottom-2 flex gap-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          <Camera className="size-4" aria-hidden="true" />
        </button>
        {displayUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-red-600 shadow-lg transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Remove profile photo"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_AVATAR_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
