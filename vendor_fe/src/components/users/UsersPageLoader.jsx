import {
  CatalogLoaderBar,
  CatalogSectionSkeleton,
  CatalogTableSkeleton,
  CatalogToolbarSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  SummaryCardsGridSkeleton,
} from '../common/skeleton'

function UserTableRowSkeleton({ cellClass = 'px-5 py-4' }) {
  return (
    <tr>
      <td className={cellClass}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3.5 w-28" />
            <SkeletonBlock className="h-2.5 w-36" />
          </div>
        </div>
      </td>
      <td className={cellClass}><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
      <td className={cellClass}><SkeletonBlock className="h-6 w-24 rounded-full" /></td>
      <td className={cellClass}><SkeletonBlock className="h-6 w-20 rounded-full" /></td>
      <td className={cellClass}><SkeletonBlock className="h-3.5 w-24" /></td>
      <td className={cellClass}><SkeletonBlock className="size-8 rounded-lg" /></td>
    </tr>
  )
}

export default function UsersPageLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading team members">
      <CatalogLoaderBar label="Loading team members" />

      <PageHeaderSkeleton titleClass="h-8 w-56" subtitleClass="h-4 w-80" showMeta={false} />

      <SummaryCardsGridSkeleton count={3} />

      <CatalogSectionSkeleton toolbar={<CatalogToolbarSkeleton showFiltersButton={false} />}>
        <CatalogTableSkeleton columns={6} rows={8} rowSkeleton={UserTableRowSkeleton} />
      </CatalogSectionSkeleton>
    </div>
  )
}
