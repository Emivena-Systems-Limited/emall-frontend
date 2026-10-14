import StoreFilterPanelContent from './StoreFilterPanelContent'

export default function StoreFilterSidebar(props) {
  return (
    <aside className="hidden shrink-0 overflow-hidden lg:sticky lg:top-16 lg:z-20 lg:block lg:self-start">
      <div className="flex max-h-[calc(100vh-4.5rem)] w-[17rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <StoreFilterPanelContent {...props} showHeading />
      </div>
    </aside>
  )
}
