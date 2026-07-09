import Container from '../layout/Container'
import {
  CATEGORIES_PAGE_HEADER,
  FEATURED_CATEGORY_SPOTLIGHTS,
} from '../../constants/featuredCategorySpotlights'
import FeaturedDepartmentCard from './FeaturedDepartmentCard'

export default function CategoriesPageHeader() {
  const [primarySpotlight, secondarySpotlight] = FEATURED_CATEGORY_SPOTLIGHTS

  return (
    <section aria-labelledby="categories-page-heading" className="bg-white pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12 lg:pt-6">
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

        {primarySpotlight && secondarySpotlight ? (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-3">
            <FeaturedDepartmentCard
              spotlight={primarySpotlight}
              featured={primarySpotlight.featured}
              className="lg:col-span-2"
            />
            <FeaturedDepartmentCard spotlight={secondarySpotlight} />
          </div>
        ) : null}
      </Container>
    </section>
  )
}
