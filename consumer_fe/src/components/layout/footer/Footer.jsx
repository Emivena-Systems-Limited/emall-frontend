import Container from '../Container'
import StoreLogo from '../StoreLogo'
import FooterAppBadges from './FooterAppBadges'
import FooterColumn from './FooterColumn'
import FooterPayments from './FooterPayments'
import FooterSocial from './FooterSocial'
import { SITE_NAME, footerColumns } from '../../../constants/siteNav'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-shell-footer bg-auth-primary text-white">
      <h2 className="sr-only">Site footer</h2>

      <Container className="py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
          <section className="col-span-2 flex flex-col md:col-span-4 lg:col-span-4">
            <StoreLogo variant="light" size="lg" className="self-start" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
              Shop from local stores in one marketplace. Discover products, deals, and sellers near you.
            </p>
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold tracking-[0.12em] text-white/70 uppercase">
                Follow us
              </p>
              <FooterSocial />
            </div>
          </section>

          {footerColumns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="lg:col-span-2"
            >
              <FooterColumn title={column.title} links={column.links} />
            </nav>
          ))}

          <section className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-[0.12em] text-white uppercase">
              Get the app
            </h3>
            <div className="mt-4">
              <FooterAppBadges />
            </div>
          </section>
        </div>
      </Container>

      <div className="border-t border-white/15 bg-black/10">
        <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/80 sm:text-sm">
            {SITE_NAME} &copy; {year}, All Rights Reserved
          </p>
          <FooterPayments />
        </Container>
      </div>
    </footer>
  )
}
