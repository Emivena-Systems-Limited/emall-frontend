import { useSelector } from 'react-redux'
import {
  ArrowRight,
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
import GuideSection from '../components/guide/GuideSection'
import notify from '../lib/notify'
import Images from '../utils/Images'

const navItems = [
  { id: 'structure', label: 'Project structure' },
  { id: 'auth-flow', label: 'Vendor auth flow' },
  { id: 'landing', label: 'Landing page' },
  { id: 'dashboard', label: 'Dashboard shell' },
  { id: 'products', label: 'Product catalog' },
  { id: 'add-product', label: 'Add product form' },
  { id: 'new-page', label: 'Build a page' },
  { id: 'routing', label: 'Routing' },
  { id: 'redux', label: 'Redux & auth' },
  { id: 'query', label: 'TanStack Query' },
  { id: 'axios', label: 'Axios API client' },
  { id: 'notify', label: 'Notifications' },
  { id: 'images', label: 'Images' },
  { id: 'conventions', label: 'Conventions' },
]

const folderStructure = `src/
├── assets/images/          # Bundled images (imported in Images.jsx)
├── components/
│   ├── auth/               # AuthLayout, OtpInput, SearchableSelect, SignupSuccessState, …
│   ├── dashboard/          # DashboardLayout, Sidebar, PendingApprovalGuard, …
│   ├── landing/            # Landing page sections (Hero, Benefits, FAQ, Footer, …)
│   ├── products/           # ProductTable, ProductStepper, image uploaders, …
│   └── guide/              # Developer guide UI
├── constants/
│   ├── auth.js             # Auth endpoints, OTP config
│   ├── categories.js       # Category API endpoints
│   ├── ghanaRegions.js     # Region/city options for signup
│   ├── landingPageData.js  # Landing copy, FAQ, footer links
│   └── productCatalog.js   # Mock catalog data + summary filter keys
├── hooks/
│   ├── useAuthMutations.js # TanStack Query auth mutations
│   ├── useCategories.js    # Category tree queries
│   └── useSidebar.js       # Dashboard sidebar state
├── lib/
│   ├── apiClient.js        # Axios instance + auth interceptors
│   ├── notify.js           # Toast helper (Sonner)
│   ├── persistStorage.js   # Redux persist localStorage adapter
│   └── queryClient.js      # TanStack Query defaults
├── pages/
│   ├── auth_pages/         # Login, Signup, VerifyAccount
│   ├── products/           # Products (catalog), AddProduct (6-step form)
│   ├── orders/             # Orders list + OrderDetails
│   ├── inventory/          # Inventory
│   ├── notifications/      # Notifications
│   ├── LandingPage.jsx     # Public seller landing page
│   ├── Dashboard.jsx       # Post-auth home (protected)
│   └── DeveloperGuide.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── GuestOnlyRoute.jsx  # Redirect authenticated users away
│   └── ProtectedRoute.jsx  # Require auth
├── services/
│   ├── authService.js      # Vendor auth API calls
│   └── categoriesService.js
├── store/
│   ├── slices/             # Redux slices (auth, …)
│   └── store.js            # Store + redux-persist config
└── utils/
    ├── Config.jsx          # API base URL
    ├── Images.jsx          # Central image registry
    ├── productPayload.js   # buildProductPayload, image encoding
    ├── productPricing.js   # Discount + variant pricing helpers
    ├── validationSchemas.js # Formik/Yup schemas
    └── vendorAuth.js       # isVendorVerified, isVendorPendingApproval`

export default function DeveloperGuide() {
  const auth = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={Images.brand.favicon} alt="" className="size-8" />
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-sky-700 uppercase">
                E-Mall Vendor FE
              </p>
              <h1 className="text-lg font-semibold tracking-tight">Developer Guide</h1>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            Stack ready
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-slate-600">
              This page documents the shared setup for the vendor frontend. Use it as a
              reference when building pages, hooks, slices, and API integrations. Auth,
              landing, dashboard shell, product catalog UI, and the add-product form are
              already wired — see sections below for routes, payloads, and what is still
              mock vs API-backed.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">State</dt>
                <dd className="mt-1 text-sm font-medium">Redux Toolkit + Persist</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Server data</dt>
                <dd className="mt-1 text-sm font-medium">TanStack Query + Axios</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">UI feedback</dt>
                <dd className="mt-1 text-sm font-medium">Sonner toasts</dd>
              </div>
            </dl>
          </section>

          <GuideSection
            id="structure"
            icon={FolderTree}
            title="Project structure"
            description="Keep new code in the folders below so the app stays consistent as it grows."
          >
            <CodeBlock code={folderStructure} />
          </GuideSection>

          <GuideSection
            id="auth-flow"
            icon={KeyRound}
            title="Vendor auth flow"
            description="Signup → email OTP verification → dashboard. Account activation is done by admin after email verification (status pending_approval). Login uses email + password."
          >
            <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">1</span>
                <span><strong>Signup</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/signup</code>) — API returns vendor in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data</code> with no tokens. Redux stores <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">pendingVerificationEmail</code>. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">SignupSuccessState</code> explains email verification (not activation) and links to verify.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">2</span>
                <span><strong>Verify email</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/verify-account</code>) — 6-box OTP input with 15s resend timer. Copy: “Enter it below to verify your email address.” <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">useVerifyVendorOtpMutation</code> posts <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{'{ email, otp_token, type: "registration" }'}</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">3</span>
                <span><strong>Resend OTP</strong> — <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">useResendVendorOtpMutation</code> posts to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/api/notification/re-send/otp</code> with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{'{ email, type: "registration" }'}</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">4</span>
                <span><strong>Verify / Login</strong> — On success, tokens are stored via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">setCredentials</code>. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apiClient</code> sends <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Authorization: Bearer</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Application-Token</code> on every request.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">5</span>
                <span><strong>Pending approval</strong> — If <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">user.status === 'pending_approval'</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">PendingApprovalGuard</code> blocks the dashboard with a non-closable modal until admin activates the account.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">6</span>
                <span><strong>Dashboard</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/dashboard</code>) — Protected route inside <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">DashboardLayout</code>. Public seller landing lives at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/</code>.</span>
              </li>
            </ol>

            <CodeBlock
              title="Auth mutation hooks (TanStack Query)"
              code={`import {
  useLoginVendorMutation,
  useRegisterVendorMutation,
  useVerifyVendorOtpMutation,
  useResendVendorOtpMutation,
} from '../hooks/useAuthMutations'

const registerMutation = useRegisterVendorMutation()
const verifyMutation = useVerifyVendorOtpMutation()
const resendMutation = useResendVendorOtpMutation()

// After signup — no tokens yet
const { user, needsVerification } = await registerMutation.mutateAsync(signupPayload)
dispatch(setPendingVerificationEmail(signupPayload.email))
dispatch(setPendingVendor(user))

// After OTP verify — tokens issued
const data = await verifyMutation.mutateAsync({ email, otp_token: otp })
dispatch(setCredentials({
  user: data.user,
  accessToken: data.accessToken,
  applicationToken: data.applicationToken,
}))

// Resend (15s timer in ResendTimer.jsx)
await resendMutation.mutateAsync({ email })`}
            />

            <CodeBlock
              title="Auth endpoints (constants/auth.js)"
              code={`export const VENDOR_AUTH_ENDPOINTS = {
  REGISTER: '/api/vendor/auth/register',
  LOGIN: '/api/vendor/auth/login',
  VERIFY: '/api/vendor/auth/verify_otp',
  RESEND_OTP: '/api/notification/re-send/otp',
  LOGOUT: '/api/vendor/auth/logout',
}`}
            />
          </GuideSection>

          <GuideSection
            id="landing"
            icon={Store}
            title="Landing page"
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

// Copy, FAQ, footer groups → src/constants/landingPageData.js
// Footer links use { label, href } — hash anchors, react-router paths, or external URLs
// Ghana map illustration → components/landing/GhanaMapIllustration.jsx`}
            />
          </GuideSection>

          <GuideSection
            id="dashboard"
            icon={Layers}
            title="Dashboard shell"
            description="All authenticated vendor pages wrap content in DashboardLayout (sidebar, navbar, scroll panel)."
          >
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">DashboardLayout</code> — sidebar + navbar + <code className="rounded bg-slate-100 px-1 text-xs">data-dashboard-scroll-panel</code> scroll container.</li>
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">PendingApprovalGuard</code> — modal when <code className="rounded bg-slate-100 px-1 text-xs">user.status === 'pending_approval'</code>; blocks interaction until admin approval.</li>
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">DashboardHeader</code> — store status badge for <code className="rounded bg-slate-100 px-1 text-xs">active</code> or <code className="rounded bg-slate-100 px-1 text-xs">pending_approval</code> only.</li>
              <li>• Helpers in <code className="rounded bg-slate-100 px-1 text-xs">utils/vendorAuth.js</code> — <code className="rounded bg-slate-100 px-1 text-xs">isVendorVerified</code>, <code className="rounded bg-slate-100 px-1 text-xs">isVendorPendingApproval</code>, <code className="rounded bg-slate-100 px-1 text-xs">getVendorAccountLabel</code>.</li>
            </ul>
          </GuideSection>

          <GuideSection
            id="products"
            icon={Package}
            title="Product catalog"
            description="/products — vendor catalogue UI with search, filters, export, and bulk actions. Currently uses local state (empty by default); wire to API when ready."
          >
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• <strong>Header</strong> — “All Products” + Add product → <code className="rounded bg-slate-100 px-1 text-xs">/products/new</code>.</li>
              <li>• <strong>Summary cards</strong> — Listed / Active / Low stock; click to filter (<code className="rounded bg-slate-100 px-1 text-xs">ProductSummaryCards</code>).</li>
              <li>• <strong>Toolbar</strong> — Search, category, brand filters; export Excel (CSV) and PDF (<code className="rounded bg-slate-100 px-1 text-xs">ProductCatalogToolbar</code>).</li>
              <li>• <strong>Table</strong> — Checkbox selection, row actions (view/edit notify, duplicate, delete). Bulk activate / deactivate / delete / export.</li>
              <li>• <strong>Empty state</strong> — Shown when catalogue is empty (<code className="rounded bg-slate-100 px-1 text-xs">EMPTY_STATE_PRESETS.products</code>).</li>
            </ul>

            <CodeBlock
              title="Key files"
              code={`src/pages/products/Products.jsx
src/components/products/ProductTable.jsx
src/components/products/ProductCatalogToolbar.jsx
src/components/products/ProductSummaryCards.jsx
src/constants/productCatalog.js          // SUMMARY_FILTERS, getCatalogSummary
src/utils/productCatalogFilters.js       // filterProductCatalog
src/utils/exportProductCatalog.js        // exportProductsToExcel, exportProductsToPdf`}
            />
          </GuideSection>

          <GuideSection
            id="add-product"
            icon={Package}
            title="Add product form"
            description="/products/new — 6-step Formik wizard. Payload builder is ready; submit currently logs formatProductPayloadSample to console (API hookup pending)."
          >
            <ol className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li><strong>1. Product Info</strong> — Name, SKU, rich description, category + sub category, brand (<code className="rounded bg-slate-100 px-1 text-xs">SearchableSelect</code> with custom entry), tags. Specs are hidden; <code className="rounded bg-slate-100 px-1 text-xs">metadata</code> submits as an empty object.</li>
              <li><strong>2. Images</strong> — Required main photo (<code className="rounded bg-slate-100 px-1 text-xs">ProductMainImageUpload</code>) + optional gallery (<code className="rounded bg-slate-100 px-1 text-xs">ProductImageUploader</code>).</li>
              <li><strong>3. Pricing</strong> — List price, discount (amount or %), quantity, low stock, barcode.</li>
              <li><strong>4. Variations</strong> — Optional groups (Size / Color / Weight presets or custom). Per-value SKU, pricing, inventory, multi-image upload (<code className="rounded bg-slate-100 px-1 text-xs">VariantImageUpload</code>).</li>
              <li><strong>5. Shipping</strong> — Weight and dimensions.</li>
              <li><strong>6. Review</strong> — Summary + publish / save draft.</li>
            </ol>

            <CodeBlock
              title="Categories (TanStack Query)"
              code={`// src/hooks/useCategories.js
const { parentCategories, categoryTree, isLoading } = useProductCategoryOptions()

// Endpoints (constants/categories.js)
GET_PARENTS: '/api/category/get_parents'
GET_WITH_CHILDREN: '/api/category/get_with_children'`}
            />

            <CodeBlock
              title="Multipart payload (utils/productPayload.js)"
              code={`const formData = buildProductPayload(values, mainImage, subImages)

// Root fields: name, description, category_slug, subcategory_slug,
// brand_slug, tags, metadata={}, quantity, primary_image File, product_images Files, shipping
// Variants flattened — one API object per value:
{
  variant_name: 'Black / Large',
  quantity: 25,
  reserved_quantity: 10,
  low_stock_threshold: 10,
  barcode: '...',
  price: 245.99,
  discount_price: 199.99,
  sku: 'SKU-001-BLK-L',
  attributes: { color: 'black' },
  images: [{ image_url: File, sort_order: 0, is_primary: true }],
}

// Dev-only fixtures + autofill → DevProductFormTools (isLocalEnvironment)
// Validation → productListingSchema in validationSchemas.js
// Stepper is clickable; intermediate steps validate before forward navigation
// Submit FormData directly with multipart/form-data. Do not JSON.stringify it.`}
            />
          </GuideSection>

          <GuideSection
            id="new-page"
            icon={Layers}
            title="How to build a new page"
            description="Follow this flow for every new screen (shop, cart, checkout, profile, etc.)."
          >
            <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">1</span>
                <span>Create a page component in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/pages/YourPage.jsx</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">2</span>
                <span>Register the route in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/routes/AppRoutes.jsx</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">3</span>
                <span>Extract reusable UI into <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/components/</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">4</span>
                <span>Fetch server data with TanStack Query hooks in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/hooks/</code> using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apiClient</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">5</span>
                <span>Store client/session state in Redux slices under <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/store/slices/</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">6</span>
                <span>Register static images in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/utils/Images.jsx</code> and use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">notify</code> for user feedback.</span>
              </li>
            </ol>

            <CodeBlock
              title="Example page + route"
              code={`// src/pages/products/Products.jsx — use DashboardLayout for authenticated pages
import DashboardLayout from '../../components/dashboard/DashboardLayout'

export default function Products() {
  return (
    <DashboardLayout pageTitle="All Products">
      {/* page content */}
    </DashboardLayout>
  )
}

// src/routes/AppRoutes.jsx
const protectedPage = (page) => <ProtectedRoute>{page}</ProtectedRoute>
<Route path="/products" element={protectedPage(<Products />)} />`}
            />
          </GuideSection>

          <GuideSection
            id="routing"
            icon={Route}
            title="Routing"
            description="React Router v7 with guest-only and protected route guards. Login is the default for unauthenticated users."
          >
            <CodeBlock
              code={`// src/routes/AppRoutes.jsx
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={guestOnly(<Login />)} />
<Route path="/signup" element={guestOnly(<Signup />)} />
<Route path="/verify-account" element={guestOnly(<VerifyAccount />)} />
<Route path="/dashboard" element={protectedPage(<Dashboard />)} />
<Route path="/products" element={protectedPage(<Products />)} />
<Route path="/products/new" element={protectedPage(<AddProduct />)} />
<Route path="/orders" element={protectedPage(<Orders />)} />
<Route path="/orders/:orderId" element={protectedPage(<OrderDetails />)} />
<Route path="/inventory" element={protectedPage(<Inventory />)} />
<Route path="/notifications" element={protectedPage(<Notifications />)} />
<Route path="/dev-guide" element={<DeveloperGuide />} />

import { Link, NavLink, useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/dashboard')`}
            />
          </GuideSection>

          <GuideSection
            id="redux"
            icon={Shield}
            title="Redux & auth"
            description="Auth session is persisted to localStorage and rehydrated on refresh via redux-persist + PersistGate in main.jsx."
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-800">Persisted auth fields</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">user</code> — vendor profile (business, store, email, status, …)</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">accessToken</code> — JWT for <code className="rounded bg-slate-100 px-1 text-xs">Authorization</code></li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">applicationToken</code> — for <code className="rounded bg-slate-100 px-1 text-xs">Application-Token</code></li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">isAuthenticated</code> — derived on rehydrate</li>
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">pendingVerificationEmail</code> — pre-verify signup flow</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Storage key: <code className="rounded bg-slate-100 px-1">persist:vendor-auth</code> (v2 migration)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-800">Live auth state</p>
              <p className="mt-2 text-slate-600">
                Authenticated:{' '}
                <span className="font-medium text-slate-900">
                  {auth.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </p>
              <p className="text-slate-600">
                User:{' '}
                <span className="font-medium text-slate-900">
                  {auth.user?.email ?? auth.user?.business_name ?? '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Business:{' '}
                <span className="font-medium text-slate-900">
                  {auth.user?.business_name ?? '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Store:{' '}
                <span className="font-medium text-slate-900">
                  {auth.user?.store_name ?? '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Status:{' '}
                <span className="font-medium text-slate-900">
                  {auth.user?.status ?? '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Token:{' '}
                <span className="font-medium text-slate-900">
                  {auth.accessToken ? 'Present' : '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Application token:{' '}
                <span className="font-medium text-slate-900">
                  {auth.applicationToken ? 'Present' : '—'}
                </span>
              </p>
              <p className="text-slate-600">
                Pending verification:{' '}
                <span className="font-medium text-slate-900">
                  {auth.pendingVerificationEmail ?? '—'}
                </span>
              </p>
            </div>

            <CodeBlock
              title="Auth slice usage"
              code={`import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout, updateUser } from '../store/slices/authSlice'

const dispatch = useDispatch()
const { user, isAuthenticated, accessToken, applicationToken } = useSelector((state) => state.auth)

// After verify or login (vendor must have email_verified_at or phone_verified_at)
dispatch(setCredentials({ user, accessToken, applicationToken }))

// Update profile fields
dispatch(updateUser({ name: 'Jane Doe' }))

// Logout
dispatch(logout())`}
            />

            <CodeBlock
              title="Add a new slice"
              code={`// src/store/slices/cartSlice.jsx
import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => { state.items.push(action.payload) },
    clearCart: (state) => { state.items = [] },
  },
})

export const { addItem, clearCart } = cartSlice.actions
export default cartSlice.reducer

// src/store/store.js — auth slice persisted under key "vendor-auth"
// Whitelist: user, accessToken, applicationToken, isAuthenticated, pendingVerificationEmail
// Logout clears Redux then persistor.persist() flushes localStorage`}
            />
          </GuideSection>

          <GuideSection
            id="query"
            icon={Database}
            title="TanStack Query"
            description="Use for server data: products, orders, inventory. Redux stays for client state only."
          >
            <CodeBlock
              title="Auth mutation pattern (already implemented)"
              code={`// src/hooks/useAuthMutations.js
import { useMutation } from '@tanstack/react-query'
import { loginVendor } from '../services/authService'
import notify from '../lib/notify'

export function useLoginVendorMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'login'],
    mutationFn: loginVendor,
    onError: (error) => notify.fromError(error, 'Invalid email or password'),
  })
}

// In a page component
const loginMutation = useLoginVendorMutation()
const data = await loginMutation.mutateAsync({ email, password })
// loginMutation.isPending for loading state`}
            />

            <CodeBlock
              title="Query hook pattern (categories — live API)"
              code={`// src/hooks/useCategories.js
import { useQuery } from '@tanstack/react-query'
import { getParentCategories } from '../services/categoriesService'

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
  })
}

// Product catalog — replace local useState with a similar hook when API is ready
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/vendor/products')
      return data
    },
  })
}`}
            />
            <p className="text-sm text-slate-600">
              React Query Devtools open automatically in development (bottom-left of the screen).
            </p>
          </GuideSection>

          <GuideSection
            id="axios"
            icon={Server}
            title="Axios API client"
            description="All HTTP requests go through apiClient. It attaches the auth token and handles 401 logout."
          >
            <CodeBlock
              title="Base URL (Config.jsx)"
              code={`// src/utils/Config.jsx
const config = { base_url: 'https://emall-backend-main-fnfxdk.laravel.cloud' }

// src/lib/apiClient.js — uses config.base_url automatically`}
            />
            <CodeBlock
              title="Usage"
              code={`import apiClient from '../lib/apiClient'

const { data } = await apiClient.post('/api/vendor/auth/login', { email, password })
const { data: categories } = await apiClient.get('/api/category/get_parents')
// Product create — wire AddProduct submit to your endpoint when ready`}
            />
          </GuideSection>

          <GuideSection
            id="notify"
            icon={Bell}
            title="Notifications"
            description="Sonner toasts are globally available via the notify helper."
          >
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => notify.success('Added to cart')}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Success
              </button>
              <button
                type="button"
                onClick={() => notify.error('Payment failed')}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Error
              </button>
              <button
                type="button"
                onClick={() => notify.info('New deals available')}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
              >
                Info
              </button>
              <button
                type="button"
                onClick={() => notify.warning('Only 2 left in stock')}
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                Warning
              </button>
            </div>

            <CodeBlock
              code={`import notify from '../lib/notify'

notify.success('Order placed')
notify.fromError(error, 'Checkout failed')

notify.promise(submitOrder(), {
  loading: 'Placing order…',
  success: 'Order confirmed',
  error: 'Order failed',
})`}
            />
          </GuideSection>

          <GuideSection
            id="images"
            icon={Image}
            title="Images"
            description="Register all static images in Images.jsx. Never hardcode scattered paths across components."
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <img src={Images.brand.favicon} alt="Brand favicon" className="size-10" />
              <p className="text-sm text-slate-600">
                Example: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Images.brand.favicon</code>
              </p>
            </div>

            <CodeBlock
              code={`import Images from '../utils/Images'

<img src={Images.brand.favicon} alt="E-Mall" />

// Static assets: place in src/assets/images/ → register in Images.jsx

// Product uploads (dynamic): keep File objects in FormData
// buildProductPayload(values, mainImage, subImages) in productPayload.js`}
            />
          </GuideSection>

          <GuideSection
            id="conventions"
            icon={ArrowRight}
            title="Conventions & next steps"
            description="Quick rules to keep the codebase maintainable."
          >
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• <strong>Redux</strong> — auth session, pending verification email (client state).</li>
              <li>• <strong>TanStack Query</strong> — auth mutations, category tree; product list/create hooks next.</li>
              <li>• <strong>Formik + Yup</strong> — auth pages + add-product wizard (<code className="rounded bg-slate-100 px-1 text-xs">productListingSchema</code>).</li>
              <li>• <strong>apiClient</strong> — single axios instance using <code className="rounded bg-slate-100 px-1 text-xs">Config.jsx</code> base URL.</li>
              <li>• <strong>notify</strong> — user-facing success/error feedback after actions.</li>
              <li>• <strong>Images.jsx</strong> — single source of truth for static assets; product uploads use <code className="rounded bg-slate-100 px-1 text-xs">File</code> objects in multipart <code className="rounded bg-slate-100 px-1 text-xs">FormData</code>.</li>
              <li>• Put query/mutation hooks in <code className="rounded bg-slate-100 px-1 text-xs">src/hooks/</code>, API logic in <code className="rounded bg-slate-100 px-1 text-xs">src/services/</code>.</li>
              <li>• Style with Tailwind utility classes; font is Instrument Sans (see index.css).</li>
              <li>• <strong>Email vs activation</strong> — OTP verifies email only; admin sets <code className="rounded bg-slate-100 px-1 text-xs">status: active</code> after review.</li>
            </ul>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <strong>Done:</strong> auth + landing + dashboard shell + product catalog UI + add-product form (payload builder).
              <br />
              <strong>Next:</strong> wire product create/list APIs, order management, vendor profile, analytics.
            </div>
          </GuideSection>
        </main>
      </div>
    </div>
  )
}
