import { Loader2 } from 'lucide-react'

import { PROFILE_SURFACE_CLASS } from '../../constants/profile'

export default function ProfilePageLoader({ label = 'Loading profile…' }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${PROFILE_SURFACE_CLASS} px-6 py-24 text-sm font-semibold text-slate-500`}>
      <Loader2 className="size-4 animate-spin text-brand" />
      {label}
    </div>
  )
}
