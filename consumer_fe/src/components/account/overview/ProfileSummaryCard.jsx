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
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#b92f23] via-auth-primary to-[#df5a43] p-5 text-white shadow-[0_18px_50px_rgba(199,59,45,0.2)] sm:p-7">
      <div className="absolute -right-16 -top-20 size-64 rounded-full border-[2rem] border-white/5" />
      <div className="absolute -bottom-24 right-24 size-52 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/25 bg-white/15 text-2xl font-bold shadow-lg sm:size-28">
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
              className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border-2 border-white bg-white text-auth-primary shadow-md transition-transform hover:scale-105"
            >
              <Camera className="size-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-white/70">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{profile.fullName}</h1>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-white/80 sm:flex-row sm:gap-5">
              <span>{profile.email}</span>
              <span className="hidden sm:inline">•</span>
              <span>{profile.phone}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-white/65">
              Customer since {formatJoinedDate(profile.joined)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-60"
          >
            {isUploading ? 'Uploading…' : 'Upload photo'}
          </button>
          {profile.photo ? (
            <button
              type="button"
              onClick={onDeleteAvatar}
              className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
            >
              Remove photo
            </button>
          ) : null}
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-auth-primary shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Edit profile
          </button>
        </div>
      </div>
    </section>
  )
}
