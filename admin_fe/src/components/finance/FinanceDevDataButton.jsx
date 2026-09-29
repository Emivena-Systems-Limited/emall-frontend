import { Database } from 'lucide-react'
import { useFinanceData } from '../../hooks/useFinanceData'

export default function FinanceDevDataButton() {
  const { showDevTools, usingDummy, loadDummyData, clearDummyData } = useFinanceData()
  if (!showDevTools) return null

  return (
    <button
      type="button"
      onClick={usingDummy ? clearDummyData : loadDummyData}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
    >
      <Database className="size-4" aria-hidden="true" />
      {usingDummy ? 'Clear dummy data' : 'Load dummy data'}
    </button>
  )
}
