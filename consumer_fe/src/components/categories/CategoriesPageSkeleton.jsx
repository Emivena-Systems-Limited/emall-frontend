import Container from '../layout/Container'

function CategoriesHeaderSkeleton() {
  return (
    <section aria-hidden="true" className="bg-white pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12 lg:pt-6">
      <Container>
        <div className="max-w-3xl">
          <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-slate-100 sm:h-10 lg:h-11" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 max-w-xl animate-pulse rounded bg-slate-100" />
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
          <div className="min-h-[13rem] animate-pulse rounded-2xl bg-slate-100 sm:min-h-[17rem] lg:col-span-2 lg:min-h-[22rem] xl:min-h-[24rem]" />
          <div className="min-h-[13rem] animate-pulse rounded-2xl bg-slate-100 sm:min-h-[17rem] lg:min-h-[22rem] xl:min-h-[24rem]" />
        </div>
      </Container>
    </section>
  )
}

function DepartmentCarouselSkeleton() {
  return (
    <section aria-hidden="true" className="bg-white pb-8 sm:pb-10 lg:pb-12">
      <Container>
        <div className="border-b border-slate-200 pb-4 sm:pb-5">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-100 sm:h-8" />
        </div>

        <div className="flex gap-4 overflow-hidden pt-4 sm:gap-5 sm:pt-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="w-[12rem] shrink-0 sm:w-[13.5rem] lg:w-[15rem]">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
              <div className="mt-3.5 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function BentoSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4 lg:min-h-[32rem]"
    >
      <div className="min-h-[17.5rem] animate-pulse rounded-2xl bg-slate-100 sm:col-span-2 lg:col-span-4 lg:row-span-2 lg:min-h-0" />
      <div className="min-h-[11rem] animate-pulse rounded-2xl bg-slate-100 sm:col-span-2 lg:col-span-5 lg:col-start-5 lg:row-start-1 lg:min-h-0" />
      <div className="min-h-[11rem] animate-pulse rounded-2xl bg-slate-100 lg:col-span-2 lg:col-start-5 lg:row-start-2 lg:min-h-0" />
      <div className="min-h-[11rem] animate-pulse rounded-2xl bg-slate-100 lg:col-span-3 lg:col-start-7 lg:row-start-2 lg:min-h-0" />
      <div className="min-h-[11rem] animate-pulse rounded-2xl bg-slate-100 sm:col-span-2 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:min-h-0" />
    </div>
  )
}

export default function CategoriesPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading categories">
      <CategoriesHeaderSkeleton />
      <DepartmentCarouselSkeleton />
      <DepartmentCarouselSkeleton />
      <section aria-hidden="true" className="bg-white pb-8 sm:pb-10 lg:pb-12">
        <Container>
          <BentoSkeleton />
        </Container>
      </section>
      <DepartmentCarouselSkeleton />
      <DepartmentCarouselSkeleton />
      <DepartmentCarouselSkeleton />
    </div>
  )
}
