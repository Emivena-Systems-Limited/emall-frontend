import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import { topCategories } from '../constants/topCategories'
import { getParentCategories } from '../services/categoryService'

function getCategoryImage(category, index) {
  return category.image ?? topCategories[index % topCategories.length]?.image ?? null
}

function mapApiCategory(category, index) {
  return {
    id: category.id ?? category.slug,
    label: category.name,
    href: `/categories/${category.slug}`,
    image: getCategoryImage(category, index),
  }
}

export default function CategoriesPage() {
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const categories = apiCategories.length ? apiCategories.map(mapApiCategory) : topCategories

  return (
    <SiteLayout>
      <section className="bg-white py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6 sm:mb-8">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-auth-primary"
            >
              <ArrowLeft className="size-4" strokeWidth={2.2} />
              Back to home
            </Link>
            <p className="text-sm font-semibold text-auth-primary">Shop by category</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              All Categories
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className="group flex min-h-40 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center transition-shadow hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.15)]"
              >
                <span className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white p-4 shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt=""
                      className="size-full object-contain"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="mt-4 text-sm font-semibold leading-snug text-slate-800">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
