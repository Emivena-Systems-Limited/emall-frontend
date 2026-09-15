import Container from '../layout/Container'
import {
  CATEGORIES_PAGE_HEADER,
  FEATURED_CATEGORY_SPOTLIGHTS,
} from '../../constants/featuredCategorySpotlights'
import { toCategoryListingHref } from '../../utils/listingFilterParams'
import FeaturedDepartmentCard from './FeaturedDepartmentCard'

export function CategoriesPageIntro() {
  return (
    <section aria-labelledby="categories-page-heading" className="bg-white pt-4 pb-5 sm:pt-5 sm:pb-6 lg:pt-6">
      <Container>
        <div className="max-w-3xl">
          <h1
            id="categories-page-heading"
            className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl"
          >
            {CATEGORIES_PAGE_HEADER.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:mt-3 sm:text-base lg:text-[1.0625rem]">
            {CATEGORIES_PAGE_HEADER.description}
          </p>
        </div>
      </Container>
    </section>
  )
}

export function CategoriesPageSpotlights() {
  const [primarySpotlight, secondarySpotlight] = FEATURED_CATEGORY_SPOTLIGHTS
  if (!primarySpotlight || !secondarySpotlight) return null

  return (
    <section aria-label="Featured departments" className="bg-white pt-6 pb-8 sm:pt-8 sm:pb-10 lg:pb-12">
      <Container>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
          <FeaturedDepartmentCard
            spotlight={{ ...primarySpotlight, href: toCategoryListingHref(primarySpotlight.href) }}
            featured={primarySpotlight.featured}
            imageOnly
            className="lg:col-span-2"
          />
          <FeaturedDepartmentCard
            spotlight={{ ...secondarySpotlight, href: toCategoryListingHref(secondarySpotlight.href) }}
            imageOnly
            fillHeight
          />
        </div>
      </Container>
    </section>
  )
}
