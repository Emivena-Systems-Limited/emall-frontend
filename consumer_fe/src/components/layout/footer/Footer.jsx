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
      <Container className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:gap-12 xl:gap-16">
          <StoreLogo variant="light" showText size="lg" className="self-start" />

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} title={column.title} links={column.links} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-8 sm:mt-12 lg:flex-row lg:items-center lg:justify-between">
          <FooterSocial />
          <FooterAppBadges />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/80 sm:text-sm">
            {SITE_NAME} &copy; {year}, All Rights Reserved
          </p>
          <FooterPayments />
        </div>
      </Container>
    </footer>
  )
}
