import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Database,
  FolderTree,
  Image,
  KeyRound,
  Layers,
  Package,
  Route,
  Server,
  Shield,
  Store,
} from 'lucide-react'
import CodeBlock from '../components/guide/CodeBlock'
import GuideNav from '../components/guide/GuideNav'
import GuideSection from '../components/guide/GuideSection'
import GuideStatusBadge from '../components/guide/GuideStatusBadge'
import notify from '../lib/notify'
import { landingContainerClass } from '../constants/landingLayout'
import Images from '../utils/Images'

const guideNavGroups = [
  {
    id: 'start',
    label: 'Start here',
    items: [
      { id: 'structure', label: 'Project structure' },
      { id: 'integrations', label: 'API vs mock data' },
      { id: 'new-page', label: 'Build a page' },
      { id: 'conventions', label: 'Conventions' },
    ],
  },
  {
    id: 'product',
    label: 'Product areas',
    items: [
      { id: 'auth-flow', label: 'Vendor auth flow' },
      { id: 'landing', label: 'Landing page' },
      { id: 'dashboard', label: 'Dashboard shell' },
      { id: 'analytics', label: 'Analytics & reports' },
      { id: 'products', label: 'Product catalog' },
      { id: 'add-product', label: 'Add product' },
      { id: 'edit-product', label: 'Edit product' },
      { id: 'media-upload', label: 'Media upload' },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'routing', label: 'Routing' },
      { id: 'redux', label: 'Redux & auth' },
      { id: 'query', label: 'TanStack Query' },
      { id: 'axios', label: 'Axios API client' },
      { id: 'notify', label: 'Notifications' },
      { id: 'images', label: 'Images' },
    ],
  },
]

const startHereCards = [
  {
    href: '#structure',
    step: '01',
    title: 'Learn the map',
    body: 'Where folders live, and where your next file should go.',
  },
  {
    href: '#integrations',
    step: '02',
    title: 'See what’s live',
    body: 'API vs mock, so you never debug a fixture thinking it’s the backend.',
  },
  {
    href: '#auth-flow',
    step: '03',
    title: 'Understand auth',
    body: 'Signup, OTP, tokens, and the pending-approval gate.',
  },
  {
    href: '#new-page',
    step: '04',
    title: 'Ship a screen',
    body: 'The five-step recipe every new vendor page should follow.',
  },
]

const folderStructure = `src/
├── assets/images/          # Bundled images (imported in Images.jsx)
├── components/
│   ├── auth/               # AuthLayout, OtpInput, SearchableSelect, …
│   ├── common/             # ConfirmModal, PortalMenu, …
│   ├── dashboard/          # DashboardLayout, Sidebar, charts, KPI cards, …
│   ├── finance/            # Finance tables, payout modals, …
│   ├── landing/            # Public seller landing sections
│   ├── products/           # Catalog table, uploaders, storefront preview, …
│   ├── promotions/         # Promotion catalog + form sections
│   ├── variants/           # Variant cards, drawers, edit flows
│   ├── orders/             # Order table, status badges, …
│   ├── customers/          # Customer catalog + detail sections
│   ├── reviews/            # Review cards, filters, insights
│   ├── analytics/          # Analytics charts + export
│   ├── messages/           # Inbox UI
│   ├── settings/           # Store settings panels
│   ├── users/              # Users & permissions modals
│   ├── help/               # Help & support sections
│   └── guide/              # Developer guide UI
├── constants/
│   ├── auth.js             # Auth endpoints, OTP config
│   ├── categories.js       # Category API endpoints
│   ├── products.js         # Product endpoints + image dimension limits
│   ├── productMediaUpload.js # Presigned S3 upload settings
│   ├── sidebarNav.js       # Dashboard navigation sections
│   ├── emptyStates.js      # Empty-state presets per page
│   ├── analytics.js        # Date presets, export reports, ANALYTICS_ENDPOINTS
│   ├── analytics*ApiSpec.json  # Backend contracts for each analytics widget + export
│   └── *Data.js            # Dummy datasets (analytics, messages, inventory, …)
├── hooks/
│   ├── useAuthMutations.js
│   ├── useProducts.js / useProductMutations.js / useProductMediaUpload.js
│   ├── useCategories.js / useBrands.js / useBrandMutations.js
│   ├── useVendorOrders.js / useVendorOrderMutations.js
│   ├── useCustomers.js
│   ├── useFinanceSummary.js
│   ├── useReviews.js
│   ├── useAnalyticsSummary.js
│   ├── useVendorProfile.js
│   ├── useUsers.js
│   └── usePromotions.js    # still mock-backed
├── mocks/                  # Promotion (and similar) local fixtures until APIs land
├── lib/
│   ├── apiClient.js        # Axios instance + auth interceptors
│   ├── notify.js           # Toast helper (Sonner)
│   ├── persistStorage.js
│   └── queryClient.js
├── pages/
│   ├── auth_pages/         # Login, Signup, VerifyAccount, ForgotPassword
│   ├── products/           # Products, AddProduct, EditProduct, ViewProduct
│   ├── orders/             # Orders, OrderDetails, OrderProducts
│   ├── customers/          # Customers, CustomerDetails
│   ├── promotions/         # Promotions CRUD pages
│   ├── finance/            # Finance
│   ├── reviews/            # Reviews & ratings
│   ├── analytics/          # Analytics & reports
│   ├── messages/           # Messages
│   ├── profile/            # Vendor profile
│   ├── settings/           # Store settings
│   ├── users/              # Users & permissions
│   ├── help/               # Help & support
│   ├── inventory/          # Low-stock inventory view
│   ├── notifications/      # Notifications
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   └── DeveloperGuide.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── GuestOnlyRoute.jsx
│   └── ProtectedRoute.jsx
├── services/
│   ├── authService.js / categoriesService.js / brandsService.js
│   ├── productService.js / productMediaService.js
│   ├── orderService.js / customerService.js / financeService.js
│   ├── reviewService.js / analyticsService.js / profileService.js / userService.js
│   ├── vendorMetricsService.js
│   └── promotionService.js # mock until Promotions API
├── store/
│   ├── slices/             # authSlice (+ redux-persist)
│   └── store.js
└── utils/
    ├── productPayload.js   # FormData + JSON payload builders
    ├── productMediaUploadUtils.js
    ├── productImageUtils.js / productImageEditUtils.js
    ├── mapProductToFormValues.js
    ├── normalizeProducts.js / normalizeCategories.js / normalizeBrands.js
    ├── normalizeAnalytics*.js
    ├── validationSchemas.js
    ├── analyticsUtils.js   # Date presets, CSV export, fulfilment period → dates
    ├── Config.jsx          # API base URL
    └── Images.jsx          # Static image registry`

const integrationRows = [
  { area: 'Auth', status: 'live', notes: 'Register, login, OTP, logout' },
  { area: 'Categories', status: 'live', notes: 'Parent + tree queries' },
  { area: 'Brands', status: 'live', notes: 'Approved brands + inline create' },
  { area: 'Products', status: 'live', notes: 'List, create, view, edit info, variants, delete, duplicate, toggle active' },
  { area: 'Product media', status: 'live', notes: 'Presigned S3 upload; edit image fields ready for backend' },
  { area: 'Orders', status: 'live', notes: 'Vendor list + detail via orderService / useVendorOrders' },
  { area: 'Customers', status: 'live', notes: 'Catalog + detail; stats hook still TODO' },
  { area: 'Finance', status: 'live', notes: 'Summary, earnings, transactions, payout accounts' },
  { area: 'Reviews', status: 'live', notes: 'List, summary, reply' },
  { area: 'Profile', status: 'live', notes: 'Personal, business, documents, avatar, password' },
  { area: 'Users & permissions', status: 'live', notes: 'Invite, roles, deactivate / reactivate' },
  { area: 'Analytics', status: 'live', notes: 'GET widgets and POST /api/vendor/analytics/reports/export' },
  { area: 'Promotions', status: 'mock', notes: 'promotionService → mocks/promotionMockData.js' },
  { area: 'Messages', status: 'mock', notes: 'constants/messagesData.js; nav marked coming soon' },
  { area: 'Inventory', status: 'mock', notes: 'constants/lowStockData.js' },
  { area: 'Notifications', status: 'mock', notes: 'constants/notificationsData.js' },
  { area: 'Sidebar badges', status: 'mock', notes: 'SIDEBAR_NAV_BADGES in sidebarNav.js' },
]

function GuideStep({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand ring-1 ring-brand-muted">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

function BackToTop({ scrollRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const panel = scrollRef?.current
    if (!panel) return undefined

    const onScroll = () => setVisible(panel.scrollTop > 640)
    onScroll()
    panel.addEventListener('scroll', onScroll, { passive: true })
    return () => panel.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => scrollRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      className="absolute right-5 bottom-5 z-20 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.28)] transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light sm:right-8 sm:bottom-8"
    >
      <ArrowUp className="size-3.5" />
      Top
    </button>
  )
}

export default function DeveloperGuide() {
  const auth = useSelector((state) => state.auth)
  const mainRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState('structure')
  const sectionIds = useMemo(() => guideNavGroups.flatMap((group) => group.items.map((item) => item.id)), [])
  const liveCount = integrationRows.filter((row) => row.status === 'live').length
  const appHref = auth.isAuthenticated ? '/dashboard' : '/login'
  const appLabel = auth.isAuthenticated ? 'Open dashboard' : 'Sign in'

  const scrollToSection = (id) => {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }

  useEffect(() => {
    const root = mainRef.current
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
    if (!root || !elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      { root, rootMargin: '-12% 0px -70% 0px', threshold: [0.12, 0.28, 0.5] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionIds])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F6F6F8] text-slate-900">
      <div className="h-1 shrink-0 bg-brand" />
      <header className="z-30 shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className={`${landingContainerClass} flex h-16 items-center justify-between gap-4`}>
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90">
              <img src={Images.brand.logo} alt="EZ-Mall Vendor" className="h-10 w-auto max-w-none object-contain object-left sm:h-11" />
            </Link>
            <div className="hidden min-w-0 border-l border-slate-200 pl-4 sm:block">
              <p className="text-[10px] font-bold tracking-[0.16em] text-brand uppercase">Vendor frontend</p>
              <p className="truncate text-sm font-bold text-slate-900">Developer Guide</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200 md:inline">
              {liveCount} live areas
            </span>
            <Link
              to={appHref}
              className="inline-flex cursor-pointer items-center rounded-xl bg-brand px-3.5 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {appLabel}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-8xl flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
          <main
            ref={mainRef}
            className="h-full overflow-y-auto overscroll-contain px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
          >
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:p-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-brand uppercase">Onboarding</p>
              <h1 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Pick this project up in minutes, not days.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                This is the vendor app map: stack, live APIs, and the conventions to follow when you add a screen.
                Start with the four steps, then jump any section from the sidebar.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Vite + React', 'Redux Persist', 'TanStack Query', 'Axios', 'Tailwind + Onest'].map((item) => (
                  <span key={item} className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand-muted">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 self-end">
              {[
                { label: 'Live APIs', value: String(liveCount) },
                { label: 'Sections', value: String(sectionIds.length) },
                { label: 'Still mock', value: String(integrationRows.filter((row) => row.status === 'mock').length) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-[#F6F6F8] px-3 py-4 text-center ring-1 ring-slate-200/70">
                  <dd className="text-2xl font-bold tabular-nums text-slate-950">{stat.value}</dd>
                  <dt className="mt-1 text-[11px] font-semibold text-slate-500">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
            {startHereCards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(card.href.replace('#', ''))
                }}
                className="group cursor-pointer bg-white p-5 transition-colors hover:bg-brand-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              >
                <p className="text-[11px] font-bold tracking-[0.16em] text-brand uppercase">{card.step}</p>
                <p className="mt-2 flex items-center justify-between gap-2 text-sm font-bold text-slate-900">
                  {card.title}
                  <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{card.body}</p>
              </a>
            ))}
          </div>
        </section>

        <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-900">
            Jump to a section
          </summary>
          <div className="mt-4">
            <GuideNav groups={guideNavGroups} activeId={activeId} query={query} onQueryChange={setQuery} onSelect={scrollToSection} />
          </div>
        </details>

        <div className="mt-8 space-y-6">
            <GuideSection
              id="structure"
              icon={FolderTree}
              title="Project structure"
              description="Keep new code in the folders below so the app stays consistent as it grows."
            >
              <CodeBlock code={folderStructure} />
            </GuideSection>

            <GuideSection
              id="integrations"
              icon={Database}
              title="API vs mock data"
              badge="partial"
              description="Check this table before you start. Live means the UI talks to the backend. Mock means local fixtures until the API lands."
            >
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Area</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {integrationRows.map((row) => (
                      <tr key={row.area} className="align-top">
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.area}</td>
                        <td className="px-4 py-3"><GuideStatusBadge status={row.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GuideSection>

            <GuideSection
              id="new-page"
              icon={Layers}
              title="How to build a new page"
              description="Follow this flow for every new screen."
            >
              <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
                <GuideStep n={1}>
                  Create a page in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/pages/</code> wrapped in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">DashboardLayout</code> for authenticated routes.
                </GuideStep>
                <GuideStep n={2}>
                  Register the route in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/routes/AppRoutes.jsx</code> and add a nav item in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">constants/sidebarNav.js</code> if needed.
                </GuideStep>
                <GuideStep n={3}>
                  Extract reusable UI into <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/components/</code>.
                </GuideStep>
                <GuideStep n={4}>
                  Add TanStack Query hooks in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/hooks/</code> and API calls in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/services/</code>.
                </GuideStep>
                <GuideStep n={5}>
                  Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">notify</code> for feedback and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">EMPTY_STATE_PRESETS</code> for empty views.
                </GuideStep>
              </ol>
            </GuideSection>

            <GuideSection
              id="auth-flow"
              icon={KeyRound}
              title="Vendor auth flow"
              badge="live"
              description="Signup → email OTP verification → dashboard. Account activation is done by admin after email verification (status pending_approval). Login uses email + password."
            >
              <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
                <GuideStep n={1}>
                  <strong>Signup</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/signup</code>) — API returns vendor in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data</code> with no tokens. Redux stores <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">pendingVerificationEmail</code>.
                </GuideStep>
                <GuideStep n={2}>
                  <strong>Verify email</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/verify-account</code>) — 6-box OTP. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">useVerifyVendorOtpMutation</code> posts <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{'{ email, otp_token, type: "registration" }'}</code>.
                </GuideStep>
                <GuideStep n={3}>
                  <strong>Forgot password</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/forgot-password</code>) — standalone route (not guest-only wrapped).
                </GuideStep>
                <GuideStep n={4}>
                  <strong>Tokens</strong> — On verify/login, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">setCredentials</code> stores JWT + application token. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apiClient</code> attaches both headers on every request.
                </GuideStep>
                <GuideStep n={5}>
                  <strong>Pending approval</strong> — <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">PendingApprovalGuard</code> blocks dashboard interaction when <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">user.status === 'pending_approval'</code>.
                </GuideStep>
              </ol>

              <CodeBlock
                title="Auth mutation hooks"
                code={`import {
  useLoginVendorMutation,
  useRegisterVendorMutation,
  useVerifyVendorOtpMutation,
  useResendVendorOtpMutation,
  useLogoutVendorMutation,
} from '../hooks/useAuthMutations'`}
              />
            </GuideSection>

            <GuideSection
              id="landing"
              icon={Store}
              title="Landing page"
              badge="live"
              description="Public seller marketing page at /. Composed from section components; copy and links live in constants."
            >
              <CodeBlock
                code={`// src/pages/LandingPage.jsx
<LandingHeader />
<LandingHeroSection />
<LandingBenefitsSection />
<LandingHowItWorksSection />
<LandingFaqSection />
<LandingCtaSection />
<LandingFooter />

// Copy → src/constants/landingPageData.js`}
              />
            </GuideSection>

            <GuideSection
              id="dashboard"
              icon={Layers}
              title="Dashboard shell"
              description="All authenticated vendor pages wrap content in DashboardLayout (sidebar, navbar, scroll panel)."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">DashboardLayout</code> — sidebar + navbar + scroll panel (<code className="rounded bg-slate-100 px-1 text-xs">data-dashboard-scroll-panel</code>).</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">Navbar</code> — notifications, messages, profile. In local/dev only, a Dev guide button links to <code className="rounded bg-slate-100 px-1 text-xs">/dev-guide</code>.</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">Sidebar</code> — nav from <code className="rounded bg-slate-100 px-1 text-xs">constants/sidebarNav.js</code> (Main / Insights / Settings).</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">PendingApprovalGuard</code> — modal when account is pending admin approval.</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">DashboardReveal</code> — staggered entrance animations for KPI cards and charts.</li>
                <li>• Helpers in <code className="rounded bg-slate-100 px-1 text-xs">utils/vendorAuth.js</code>.</li>
              </ul>
            </GuideSection>

            <GuideSection
              id="analytics"
              icon={BarChart3}
              title="Analytics & Reports"
              badge="live"
              description="/analytics — GET widgets and Excel export are live. Toggle dummy data in the header to skip chart APIs; export always hits the backend."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <strong>KPI cards</strong> — five stats (revenue, orders, customers, AOV, returns) from <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsSummary()</code>. Conversion is commented out for now. Filtered by inclusive <code className="rounded bg-slate-100 px-1 text-xs">start_date</code> + <code className="rounded bg-slate-100 px-1 text-xs">end_date</code> (7d / 30d / 90d / 12m / From–To).</li>
                <li>• <strong>Charts &amp; tables</strong> — each has its own year dropdown, defaulting to the current year. They do not use the page date range. Live widgets: <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsRevenueOrders()</code>, <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsSalesByCategory()</code>, <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsCustomerGrowth()</code>, <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsSalesByRegion()</code>, <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsTopProducts()</code>, <code className="rounded bg-slate-100 px-1 text-xs">useAnalyticsFulfillment()</code>.</li>
                <li>• <strong>Export drawer</strong> — pick a report, set duration, then <code className="rounded bg-slate-100 px-1 text-xs">POST /api/vendor/analytics/reports/export</code> downloads an Excel (.xlsx) file. Order fulfilment duration uses year/month chips; those resolve to the same <code className="rounded bg-slate-100 px-1 text-xs">start_date</code> / <code className="rounded bg-slate-100 px-1 text-xs">end_date</code> payload as every other report.</li>
                <li>• <strong>Contracts</strong> — <code className="rounded bg-slate-100 px-1 text-xs">src/constants/analytics*ApiSpec.json</code>.</li>
              </ul>

              <CodeBlock
                title="Key files"
                code={`src/pages/analytics/Analytics.jsx
src/components/analytics/AnalyticsPageHeader.jsx
src/components/analytics/AnalyticsSummaryCards.jsx
src/components/analytics/AnalyticsCharts.jsx
src/components/analytics/AnalyticsExportDrawer.jsx
src/hooks/useAnalyticsSummary.js
src/services/analyticsService.js
src/utils/normalizeAnalyticsSummary.js
src/utils/normalizeAnalyticsRevenueOrders.js
src/utils/normalizeAnalyticsSalesByCategory.js
src/utils/normalizeAnalyticsCustomerGrowth.js
src/utils/normalizeAnalyticsSalesByRegion.js
src/utils/normalizeAnalyticsTopProducts.js
src/utils/normalizeAnalyticsFulfillment.js
src/constants/analytics.js              // ANALYTICS_ENDPOINTS + export report keys
src/constants/analyticsData.js          // EMPTY_ANALYTICS / DEV_ANALYTICS
src/utils/analyticsUtils.js`}
              />

              <CodeBlock
                title="GET widgets"
                code={`GET /api/vendor/analytics/summary?start_date=2026-07-26&end_date=2026-08-24  // wired
GET /api/vendor/analytics/order-revenues?year=2026                           // wired
GET /api/vendor/analytics/sales-by-category?year=2026                        // wired
GET /api/vendor/analytics/customer-growth?year=2026                          // wired
GET /api/vendor/analytics/sales-by-region?year=2026                          // wired
GET /api/vendor/analytics/top-products?year=2026                             // wired
GET /api/vendor/analytics/fulfillments?year=2026                             // wired`}
              />

              <CodeBlock
                title="Export report — same payload for every report type"
                code={`POST /api/vendor/analytics/reports/export

{
  "report": "order_fulfillment",
  "start_date": "2026-01-01",
  "end_date": "2026-08-24",
  "format": "xlsx"
}

// report: summary | sales_by_category | customer_growth
//         | sales_by_region | top_products | order_fulfillment
// Fulfilment chips (current year / specific year / month / ranges)
// are UI-only and convert to start_date + end_date before send.`}
              />
            </GuideSection>

            <GuideSection
              id="products"
              icon={Package}
              title="Product catalog"
              badge="live"
              description="/products — live vendor catalogue backed by GET /api/product/get/vendor (paginated fetch). Supports search, filters, bulk actions, export, duplicate, and activate/deactivate."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <strong>Data</strong> — <code className="rounded bg-slate-100 px-1 text-xs">useProducts()</code> loads all pages; normalized via <code className="rounded bg-slate-100 px-1 text-xs">toCatalogProduct</code>.</li>
                <li>• <strong>Mutations</strong> — delete, duplicate, toggle active (single + bulk) via <code className="rounded bg-slate-100 px-1 text-xs">useProductMutations.js</code>.</li>
                <li>• <strong>Row actions</strong> — View → <code className="rounded bg-slate-100 px-1 text-xs">/products/:id/view</code>, Edit → <code className="rounded bg-slate-100 px-1 text-xs">/products/:id/edit</code>.</li>
                <li>• <strong>Export</strong> — Excel (CSV) via <code className="rounded bg-slate-100 px-1 text-xs">exportProductCatalog.js</code>.</li>
              </ul>

              <CodeBlock
                title="Key files"
                code={`src/pages/products/Products.jsx
src/hooks/useProducts.js              // productQueryKeys.list / detail
src/hooks/useProductMutations.js
src/services/productService.js        // PRODUCT_ENDPOINTS in constants/products.js
src/utils/normalizeProducts.js        // API record → catalogue row`}
              />
            </GuideSection>

            <GuideSection
              id="add-product"
              icon={Package}
              title="Add product"
              badge="live"
              description="/products/new — 6-step Formik wizard. Creates products via live API with optional presigned S3 media upload."
            >
              <ol className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li><strong>1. Product Info</strong> — Name, SKU, rich-text description, category + subcategory, brand (<code className="rounded bg-slate-100 px-1 text-xs">SearchableSelect</code> + inline brand create), condition, tags, key details.</li>
                <li><strong>2. Images</strong> — Required main photo + gallery + optional descriptive (wide banner, one per row) images with dimension validation.</li>
                <li><strong>3. Pricing</strong> — List price, discount (amount or %), quantity, low stock, barcode.</li>
                <li><strong>4. Variations</strong> — Optional attribute groups with per-value SKU, pricing, stock, compatible models, variant images.</li>
                <li><strong>5. Shipping</strong> — Weight and dimensions.</li>
                <li><strong>6. Review</strong> — Summary + publish.</li>
              </ol>

              <CodeBlock
                title="Create flow (presigned upload enabled by default)"
                code={`// Submit in AddProduct.jsx
const usePresignedUpload = USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD

if (usePresignedUpload) {
  // 1. Request signed URLs → 2. PUT files to S3 → 3. POST JSON create
  nextMediaState = await uploadPendingMedia(mediaState)
  const payload = buildProductCreateJsonPayload(formValues, mainImage, subImages, {
    descriptiveImages, variations,
  })
  await createProductMutation.mutateAsync({ payload, context })
} else {
  // Fallback: multipart FormData via buildProductPayload
}

// Progress UI → ProductPublishProgressModal
// Dev autofill → DevProductFormTools (local env only)`}
              />

              <CodeBlock
                title="Shared step exports (reused by Edit Product info flow)"
                code={`// Exported from AddProduct.jsx for reuse:
export function InfoStep({ ... })
export function ImagesStep({ ... })
export function PricingStep({ ... })
export function ShippingStep({ ... })
export function ReviewStep({ ... })

// Validation → productListingSchema / productInfoSchema`}
              />
            </GuideSection>

            <GuideSection
              id="edit-product"
              icon={Layers}
              title="Edit product"
              badge="live"
              description="/products/:productId/edit — split into two independent flows so vendors only change what they intend."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <strong>Chooser</strong> — <code className="rounded bg-slate-100 px-1 text-xs">?section=info</code> or <code className="rounded bg-slate-100 px-1 text-xs">?section=variations</code>.</li>
                <li>• <strong>Edit product info</strong> — 5-step wizard. Saves via <code className="rounded bg-slate-100 px-1 text-xs">buildProductInfoJsonPayload</code> + <code className="rounded bg-slate-100 px-1 text-xs">useUpdateProductInfoMutation</code>.</li>
                <li>• <strong>Edit images</strong> — Presign new files → S3 upload → JSON update. Kept images use <code className="rounded bg-slate-100 px-1 text-xs">id</code>; new uploads use <code className="rounded bg-slate-100 px-1 text-xs">upload_id</code>. Removed images are omitted.</li>
                <li>• <strong>Edit variations</strong> — <code className="rounded bg-slate-100 px-1 text-xs">VariationsEditForm</code> lists extra variants only. The default shopper option is edited in product info, not here.</li>
                <li>• <strong>View product</strong> — <code className="rounded bg-slate-100 px-1 text-xs">/products/:id/view</code> renders <code className="rounded bg-slate-100 px-1 text-xs">ProductStorefrontPreview</code> with the same shopper variant rules: main option selected first, extra-variant photos (up to 3) in the gallery, Color as image tiles, and other attributes as chips unless every value has a photo.</li>
                <li>• <strong>Form hydration</strong> — <code className="rounded bg-slate-100 px-1 text-xs">mapProductRecordToFormState</code> maps API images to remote preview objects.</li>
              </ul>

              <CodeBlock
                title="Edit info image payload"
                code={`// After presign + S3 upload for any new local files
const payload = buildProductInfoJsonPayload(formValues, mainImage, subImages, {
  descriptiveImages,
})

// product_images example sent to PUT /api/product/:id
[
  { id: '01K_EXISTING_IMAGE_1', sort_order: 0, is_primary: true },
  { upload_id: '01KY54H2HGJ4SXWXY758G3583X', sort_order: 1, is_primary: false },
]
// Removed images are not included — backend deletes anything omitted.`}
              />
            </GuideSection>

            <GuideSection
              id="media-upload"
              icon={Image}
              title="Presigned media upload"
              badge="live"
              description="Product and variant images can upload to S3 before the create/update API call."
            >
              <CodeBlock
                title="Flow"
                code={`// constants/productMediaUpload.js
USE_PRESIGNED_PRODUCT_MEDIA_UPLOAD  // default true; set env false to disable

// 1. Build presign request (only pending local files)
buildProductMediaPresignRequest({ mainImage, subImages, descriptiveImages, variations })

// 2. POST /api/product/images/get-signed-urls

// 3. Parallel PUT to S3 (PRODUCT_MEDIA_UPLOAD_CONCURRENCY = 4)
useProductMediaUpload().uploadPendingMedia(mediaState)

// 4. Attach upload_id to payload
buildProductMediaSaveImagesPayload(mediaState)
buildProductCreateJsonPayload(...)  // create
buildProductInfoJsonPayload(...)      // edit info (presigned JSON update)`}
              />
            </GuideSection>

            <GuideSection
              id="routing"
              icon={Route}
              title="Routing"
              description="React Router v7 with guest-only and protected route guards."
            >
              <CodeBlock
                code={`// Public / guest
/                         LandingPage
/login, /signup, /verify-account   GuestOnlyRoute
/forgot-password

// Protected (DashboardLayout pages)
/dashboard
/products, /products/new
/products/:productId/view
/products/:productId/edit?section=info|variations
/orders, /orders/:orderId, /orders/:orderId/products
/customers, /customers/:customerId
/promotions, /promotions/new, /promotions/:promotionId, /promotions/:promotionId/edit
/inventory, /notifications
/finance, /analytics, /reviews, /messages
/profile, /settings, /users, /help

/dev-guide                 DeveloperGuide (public reference)`}
              />
            </GuideSection>

            <GuideSection
              id="redux"
              icon={Shield}
              title="Redux & auth"
              description="Auth session is persisted to localStorage and rehydrated on refresh via redux-persist + PersistGate in main.jsx."
            >
              <div className="rounded-xl border border-slate-200 bg-[#F6F6F8] p-4 text-sm">
                <p className="font-bold text-slate-800">Live auth state</p>
                <p className="mt-2 text-slate-600">
                  Authenticated:{' '}
                  <span className="font-semibold text-slate-900">{auth.isAuthenticated ? 'Yes' : 'No'}</span>
                </p>
                <p className="text-slate-600">
                  User:{' '}
                  <span className="font-semibold text-slate-900">{auth.user?.email ?? auth.user?.business_name ?? '—'}</span>
                </p>
                <p className="text-slate-600">
                  Store:{' '}
                  <span className="font-semibold text-slate-900">{auth.user?.store_name ?? '—'}</span>
                </p>
                <p className="text-slate-600">
                  Status:{' '}
                  <span className="font-semibold text-slate-900">{auth.user?.status ?? '—'}</span>
                </p>
              </div>

              <CodeBlock
                title="Auth slice usage"
                code={`import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout, updateUser } from '../store/slices/authSlice'

dispatch(setCredentials({ user, accessToken, applicationToken }))
dispatch(logout())`}
              />
            </GuideSection>

            <GuideSection
              id="query"
              icon={Database}
              title="TanStack Query"
              description="Server data lives in query hooks. Redux is for client/session state only."
            >
              <CodeBlock
                title="Product queries & mutations"
                code={`// List (paginated fetch, flattened client-side)
const { data: products, isLoading, refetch } = useProducts()

// Detail
const { data: product } = useProduct(productId)

// Mutations — useProductMutations.js
useCreateProductMutation()
useUpdateProductInfoMutation()
useUpdateProductVariantsMutation()
useCreateProductVariantMutation()
useDeleteProductVariantMutation()
useDeleteProductsMutation()
useDuplicateProductMutation()
useUpdateProductStatusMutation()

// Cache keys
productQueryKeys.list()
productQueryKeys.detail(productId)`}
              />

              <CodeBlock
                title="Other live queries"
                code={`useProductCategoryOptions()   // categories
useApprovedBrands()           // brands
useCreateBrandMutation()
useVendorOrders() / useVendorOrder(orderId)
useCustomers() / useCustomer(customerId)
useFinanceSummary() / useFinanceTransactions()
useVendorReviews() / useVendorReviewsSummary()
useVendorProfile()
useUsers()`}
              />

              <p className="text-sm text-slate-600">
                React Query Devtools open automatically in development (bottom-left).
              </p>
            </GuideSection>

            <GuideSection
              id="axios"
              icon={Server}
              title="Axios API client"
              description="All HTTP requests go through apiClient. It attaches auth tokens and handles 401 logout."
            >
              <CodeBlock
                title="Product endpoints (constants/products.js)"
                code={`PRODUCT_ENDPOINTS = {
  CREATE: '/api/product',
  LIST: '/api/product/get/vendor',
  byId: (id) => \`/api/product/\${id}\`,
  updateInfoById: (id) => \`/api/product/\${id}\`,
  updateVariantById: (id) => \`/api/product/variant/\${id}\`,
  createVariantStore: '/api/product/variant/store',
  deleteVariantById: (id) => \`/api/product/variant/trash/\${id}\`,
  deleteById: (id) => \`/api/product/trash/\${id}\`,
  bulkDelete: '/api/product/multi-trash',
  duplicateById: (id) => \`/api/product/duplicate/\${id}\`,
  toggleActiveById: (id) => \`/api/product/set/is_active/\${id}\`,
}`}
              />

              <CodeBlock
                title="Usage"
                code={`import apiClient from '../lib/apiClient'
import { getAllProducts, createProduct } from '../services/productService'

// Base URL → src/utils/Config.jsx`}
              />
            </GuideSection>

            <GuideSection
              id="notify"
              icon={Bell}
              title="Notifications"
              description="Sonner toasts are globally available via the notify helper."
            >
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => notify.success('Product saved')} className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">Success</button>
                <button type="button" onClick={() => notify.error('Upload failed')} className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">Error</button>
                <button type="button" onClick={() => notify.info('New order received')} className="cursor-pointer rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover">Info</button>
                <button type="button" onClick={() => notify.warning('Low stock alert')} className="cursor-pointer rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600">Warning</button>
              </div>

              <CodeBlock
                code={`import notify from '../lib/notify'

notify.success('Product published')
notify.fromError(error, 'Save failed')

notify.promise(saveProduct(), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Failed',
})`}
              />
            </GuideSection>

            <GuideSection
              id="images"
              icon={Image}
              title="Images"
              description="Static assets vs dynamic product uploads."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <strong>Static</strong> — register in <code className="rounded bg-slate-100 px-1 text-xs">utils/Images.jsx</code>; import as <code className="rounded bg-slate-100 px-1 text-xs">Images.brand.favicon</code>.</li>
                <li>• <strong>Product uploads</strong> — <code className="rounded bg-slate-100 px-1 text-xs">File</code> objects in form state; validated in <code className="rounded bg-slate-100 px-1 text-xs">productImageUtils.js</code>.</li>
                <li>• <strong>Presigned create</strong> — files upload to S3 first; payload references <code className="rounded bg-slate-100 px-1 text-xs">upload_id</code>.</li>
                <li>• <strong>Edit keep/remove</strong> — remote images use <code className="rounded bg-slate-100 px-1 text-xs">isRemote</code> + <code className="rounded bg-slate-100 px-1 text-xs">remoteId</code>; payload sends keep/remove ID arrays.</li>
                <li>• <strong>Dimension targets</strong> — primary, gallery, and descriptive sizes in <code className="rounded bg-slate-100 px-1 text-xs">constants/products.js</code>.</li>
              </ul>
            </GuideSection>

            <GuideSection
              id="conventions"
              icon={ArrowRight}
              title="Conventions & next steps"
              description="Quick rules to keep the codebase maintainable."
            >
              <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                <li>• <strong>Redux</strong> — auth session + pending verification email only.</li>
                <li>• <strong>TanStack Query</strong> — all server data (products, orders, customers, finance, reviews, profile, users).</li>
                <li>• <strong>Formik + Yup</strong> — multi-step forms; schemas in <code className="rounded bg-slate-100 px-1 text-xs">validationSchemas.js</code>.</li>
                <li>• <strong>Payload builders</strong> — <code className="rounded bg-slate-100 px-1 text-xs">productPayload.js</code> for create (JSON + FormData), edit info, and variant updates.</li>
                <li>• <strong>Normalization</strong> — map API records in <code className="rounded bg-slate-100 px-1 text-xs">normalize*.js</code> / <code className="rounded bg-slate-100 px-1 text-xs">mapProductToFormValues.js</code>.</li>
                <li>• <strong>Scroll helpers</strong> — <code className="rounded bg-slate-100 px-1 text-xs">scrollToFirstError</code>, <code className="rounded bg-slate-100 px-1 text-xs">scrollDashboardPanelToTop</code> for wizard UX.</li>
                <li>• Style with Tailwind; brand color is <code className="rounded bg-slate-100 px-1 text-xs">brand</code> (<code className="rounded bg-slate-100 px-1 text-xs">#c73b2d</code>).</li>
              </ul>

              <div className="rounded-xl border border-brand-muted bg-brand-light p-4 text-sm text-slate-800">
                <p><strong className="text-brand">Done:</strong> auth, landing, dashboard, products (including variants + presigned media), orders, customers, finance, reviews, profile, users &amp; permissions, analytics GET widgets and Excel export.</p>
                <p className="mt-2"><strong className="text-brand">Next:</strong> connect promotions, messages, inventory, and notifications; replace sidebar badge placeholders with API counts.</p>
              </div>
            </GuideSection>
          </div>
          </main>
          <BackToTop scrollRef={mainRef} />
        </div>

        <aside className="hidden h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
          <GuideNav
            groups={guideNavGroups}
            activeId={activeId}
            query={query}
            onQueryChange={setQuery}
            onSelect={scrollToSection}
            layout="panel"
          />
        </aside>
      </div>
    </div>
  )
}
