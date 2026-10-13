import { Link } from 'react-router'
import { Headset, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import Container from '../Container'
import StoreLogo from '../StoreLogo'
import FooterColumn from './FooterColumn'
import FooterSocial from './FooterSocial'
import { SITE_NAME, footerColumns } from '../../../constants/siteNav'
import { buildNavbarCategoryLinks } from '../../../constants/navbarLinks'
import { useCategoryCatalog } from '../../../hooks/useCategoryCatalog'
import { buildNavbarCategoryMenuItems } from '../../../utils/buildNavbarCategoryMenuItems'

const trustItems = [
  {
    icon: Truck,
    title: 'Free Shipping',
    detail: 'On orders over GH₵500',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    detail: '30-day return policy',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    detail: '256-bit SSL encryption',
  },
  {
    icon: Headset,
    title: '24/7 Support',
    detail: 'Always here to help',
  },
]

function ShopColumn() {
  const { parentCategories, isLoading } = useCategoryCatalog()
  const links = buildNavbarCategoryLinks(buildNavbarCategoryMenuItems(parentCategories))

  return (
    <nav aria-label="SHOP">
      <h3 className="text-xs font-semibold tracking-[0.16em] text-white/90 uppercase">Shop</h3>
      {isLoading && !links.length ? (
        <ul className="mt-4 space-y-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-0.5">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                to={link.href}
                className="inline-flex min-h-9 cursor-pointer items-center text-sm text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <h2 className="sr-only">Site footer</h2>

      <div className="site-shell-footer">
        <section aria-label="Shopping assurances" className="border-b border-white/10">
          <Container className="grid grid-cols-2 gap-x-4 gap-y-3 py-3.5 sm:py-4 lg:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-red-300">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm leading-tight font-semibold text-white">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-tight text-white/55">{item.detail}</span>
                  </span>
                </div>
              )
            })}
          </Container>
        </section>

        <Container className="py-8 sm:py-9 lg:py-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[minmax(13rem,1.2fr)_repeat(5,minmax(0,1fr))] lg:gap-x-8">
            <section className="col-span-2 flex flex-col sm:col-span-3 lg:col-span-1">
              <StoreLogo variant="brandLight" size="md" className="self-start" />
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
                Your everyday marketplace for millions of products at unbeatable prices.
              </p>
              <div className="mt-5">
                <FooterSocial />
              </div>
            </section>

            <ShopColumn />

            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <FooterColumn title={column.title} links={column.links} />
              </nav>
            ))}
          </div>

          <p className="mt-10 border-t border-white/10 pt-5 text-xs text-white/45">
            {SITE_NAME} &copy; {year}, All Rights Reserved
          </p>
        </Container>
      </div>
    </footer>
  )
}
