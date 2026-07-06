import { CATEGORY_LAYOUT_TYPES } from '../../constants/categoryPageLayouts'

function CardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-4/3 animate-pulse rounded-xl bg-slate-200/80" />
      <div className="h-3.5 w-3/5 animate-pulse rounded-md bg-slate-200/80" />
      <div className="h-3 w-2/5 animate-pulse rounded-md bg-slate-100" />
    </div>
  )
}

function CarouselSkeleton() {
  return (
    <div className="mt-3 flex gap-3 overflow-hidden sm:mt-4 sm:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-[72vw] shrink-0 sm:w-[42vw] md:w-[31vw] lg:w-[23vw]">
          <CardSkeleton />
        </div>
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

function BentoSkeleton() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 lg:mt-4 lg:grid-cols-4 lg:grid-rows-2 lg:gap-3">
      <div className="col-span-2 aspect-4/3 animate-pulse rounded-xl bg-slate-200/80 max-lg:row-span-1 lg:row-span-2 lg:aspect-auto lg:min-h-48" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="aspect-square animate-pulse rounded-xl bg-slate-200/70 sm:aspect-4/3 lg:aspect-auto lg:min-h-28" />
      ))}
    </div>
  )
}

function StackedSkeleton() {
  return (
    <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 sm:gap-4 sm:p-3"
        >
          <div className="size-16 shrink-0 animate-pulse rounded-lg bg-slate-200/80 sm:size-20" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-slate-200/80" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CompactSkeleton() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/90 p-3 sm:min-h-32"
        >
          <div className="size-12 animate-pulse rounded-full bg-slate-200/80 sm:size-14" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200/70" />
        </div>
      ))}
    </div>
  )
}

function FashionBentoSkeleton() {
  return (
    <div className="space-y-4">
      <CarouselSkeleton />
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 lg:gap-3">
        <div className="min-h-56 animate-pulse rounded-xl bg-slate-200/80 md:col-span-2 lg:col-span-4 lg:row-span-2" />
        <div className="min-h-36 animate-pulse rounded-xl bg-slate-200/70 lg:col-span-4" />
        <div className="min-h-32 animate-pulse rounded-xl bg-slate-200/70 lg:col-span-2" />
        <div className="min-h-32 animate-pulse rounded-xl bg-slate-200/70 lg:col-span-2" />
        <div className="min-h-52 animate-pulse rounded-xl bg-slate-200/80 md:col-span-2 lg:col-span-4 lg:row-span-2" />
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-slate-200/90 pb-3">
      <div className="h-7 w-36 animate-pulse rounded-lg bg-slate-200/80 sm:w-44" />
      <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
    </div>
  )
}

export function CategorySectionSkeleton({ layout = CATEGORY_LAYOUT_TYPES.GRID }) {
  return (
    <div className="animate-pulse">
      <HeaderSkeleton />
      {layout === CATEGORY_LAYOUT_TYPES.CAROUSEL && <CarouselSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.GRID && <GridSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.PHONES_TABLETS && <BentoSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.MOSAIC && <BentoSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.STACKED && <StackedSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.COMPACT && <CompactSkeleton />}
      {layout === CATEGORY_LAYOUT_TYPES.BENTO && <FashionBentoSkeleton />}
    </div>
  )
}

export function CategoriesPageSkeleton() {
  const layouts = [
    CATEGORY_LAYOUT_TYPES.GRID,
    CATEGORY_LAYOUT_TYPES.BENTO,
    CATEGORY_LAYOUT_TYPES.CAROUSEL,
    CATEGORY_LAYOUT_TYPES.PHONES_TABLETS,
    CATEGORY_LAYOUT_TYPES.MOSAIC,
    CATEGORY_LAYOUT_TYPES.STACKED,
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2.5">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-slate-200/80 sm:h-10 sm:w-64" />
        <div className="h-3.5 max-w-2xl animate-pulse rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-3">
          <div className="h-52 animate-pulse rounded-xl bg-slate-200/80 lg:col-span-2 lg:h-72 xl:h-80" />
          <div className="h-52 animate-pulse rounded-xl bg-slate-200/70 lg:h-72 xl:h-80" />
        </div>
      </div>

      {layouts.map((layout, index) => (
        <CategorySectionSkeleton key={`${layout}-${index}`} layout={layout} />
      ))}
    </div>
  )
}
