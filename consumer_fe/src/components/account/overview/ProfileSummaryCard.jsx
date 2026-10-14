import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { formatJoinedDate } from '../../../utils/accountProfile'

export default function ProfileSummaryCard({
  profile,
  isUploading,
  onEdit,
  onUpload,
  onDeleteAvatar,
}) {
  const fileInputRef = useRef(null)
  const initials = profile.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUpload(file)
    event.target.value = ''
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-auth-primary via-[#df5a43] to-auth-primary/40" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-red-50/80" />
      <div className="pointer-events-none absolute -bottom-28 right-16 size-48 rounded-full bg-slate-50" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-red-50 text-xl font-bold text-auth-primary shadow-sm sm:size-24">
              <span aria-hidden>{initials}</span>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.fullName}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
              className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-auth-primary shadow-md transition-transform hover:scale-105"
            >
              <Camera className="size-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Welcome back</p>
            <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{profile.fullName}</h1>
            <div className="mt-2.5 flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:gap-4">
              <span>{profile.email}</span>
              <span className="hidden text-slate-300 sm:inline">•</span>
              <span>{profile.phone}</span>
            </div>
            <p className="mt-1.5 text-[0.6875rem] font-medium text-slate-400">
              Customer since {formatJoinedDate(profile.joined)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-auth-primary/30 hover:text-auth-primary disabled:opacity-60"
          >
            {isUploading ? 'Uploading…' : 'Upload photo'}
          </button>
          {profile.photo ? (
            <button
              type="button"
              onClick={onDeleteAvatar}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-auth-primary/30 hover:text-auth-primary"
            >
              Remove photo
            </button>
          ) : null}
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-auth-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-auth-primary-hover"
          >
            Edit profile
          </button>
        </div>
      </div>
    </section>
  )
}
