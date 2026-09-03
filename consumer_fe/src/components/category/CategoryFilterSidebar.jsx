import CategoryFilterPanelContent from './CategoryFilterPanelContent'

export default function CategoryFilterSidebar({
  parentCategories = [],
  defaultCategorySlug,
  defaultSubcategorySlug,
  isLoading = false,
  isFacetsLoading = false,
  variant = 'category',
  facetOptions,
}) {
  return (
    <aside className="hidden shrink-0 lg:sticky lg:top-16 lg:z-20 lg:block lg:w-64 lg:self-start xl:w-72">
      <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 [scrollbar-width:thin]">
        <CategoryFilterPanelContent
          parentCategories={parentCategories}
          defaultCategorySlug={defaultCategorySlug}
          defaultSubcategorySlug={defaultSubcategorySlug}
          isLoading={isLoading}
          isFacetsLoading={isFacetsLoading}
          variant={variant}
          facetOptions={facetOptions}
        />
      </div>
    </aside>
  )
}
