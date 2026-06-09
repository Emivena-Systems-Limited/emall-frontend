import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'

export default function HomePage() {
  return (
    <SiteLayout>
      <section className="border-b border-slate-100 bg-slate-50">
        <Container className="py-16 sm:py-20 lg:py-24">
          <p className="text-sm font-medium tracking-[0.14em] text-auth-primary uppercase">
            Welcome to EZ-Stores
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Shop smarter across Ghana
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Landing sections are coming next. Navbar and footer are live — hero, categories, and
            promos will build out from here.
          </p>
        </Container>
      </section>
    </SiteLayout>
  )
}
