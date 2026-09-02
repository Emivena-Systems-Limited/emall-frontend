import Images from '../../utils/Images'

export default function SessionRestore() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <img src={Images.brand.logo} alt="EZ-Mall Admin" className="h-12 w-auto object-contain" />
      <p className="mt-5 text-sm font-semibold text-slate-800">Restoring operator session</p>
      <p className="mt-1 text-xs text-slate-500">Checking this device for a signed-in admin…</p>
      <div className="dashboard-loader-bar mt-6 w-40" aria-hidden="true" />
    </div>
  )
}
