import StoreFilterPanelContent from './StoreFilterPanelContent'

export default function StoreFilterSidebar(props) {
  return (
    <aside className="hidden shrink-0 overflow-visible lg:block lg:w-64 xl:w-72">
      <div className="scrollbar-theme lg:sticky lg:top-20 lg:z-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <StoreFilterPanelContent {...props} />
        </div>
      </div>
    </aside>
  )
}
