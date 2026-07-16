import CategoryFilterPanelContent from './CategoryFilterPanelContent'

export default function CategoryFilterSidebar({
  parentCategories = [],
  defaultCategorySlug,
  defaultSubcategorySlug,
  isLoading = false,
  variant = 'category',
}) {
  return (
    <aside className="hidden shrink-0 lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)] lg:w-64 lg:overflow-hidden xl:w-72">
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <CategoryFilterPanelContent
          parentCategories={parentCategories}
          defaultCategorySlug={defaultCategorySlug}
          defaultSubcategorySlug={defaultSubcategorySlug}
          isLoading={isLoading}
          variant={variant}
        />
      </div>
    </aside>
  )
}
