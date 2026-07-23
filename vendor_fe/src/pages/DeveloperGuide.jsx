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
  { id: 'add-product', label: 'Add product' },
  { id: 'edit-product', label: 'Edit product' },
  { id: 'media-upload', label: 'Media upload' },
  { id: 'integrations', label: 'API vs mock data' },
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
│   └── *Data.js            # Mock datasets (orders, finance, reviews, …)
├── hooks/
│   ├── useAuthMutations.js
│   ├── useProducts.js      # Product list + detail queries
│   ├── useProductMutations.js # Create, update, delete, duplicate, variants
│   ├── useProductMediaUpload.js # Presign → S3 upload orchestration
│   ├── useCategories.js
│   ├── useBrands.js
│   └── useBrandMutations.js
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
│   ├── authService.js
│   ├── categoriesService.js
│   ├── brandsService.js
│   ├── productService.js
│   └── productMediaService.js
├── store/
│   ├── slices/             # authSlice (+ redux-persist)
│   └── store.js
└── utils/
    ├── productPayload.js   # FormData + JSON payload builders
    ├── productMediaUploadUtils.js
    ├── productImageUtils.js / productImageEditUtils.js
    ├── mapProductToFormValues.js
    ├── normalizeProducts.js / normalizeCategories.js / normalizeBrands.js
    ├── validationSchemas.js
    ├── Config.jsx          # API base URL
    └── Images.jsx          # Static image registry`

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
            Products API live
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
              Reference for the vendor frontend stack and feature wiring. Auth, landing, dashboard
              shell, and the full product lifecycle (list, create, view, edit info, edit variants)
              are implemented. Several secondary modules still use local mock data until their
              backend endpoints are ready — see <strong>API vs mock data</strong> below.
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
                <span><strong>Signup</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/signup</code>) — API returns vendor in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data</code> with no tokens. Redux stores <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">pendingVerificationEmail</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">2</span>
                <span><strong>Verify email</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/verify-account</code>) — 6-box OTP. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">useVerifyVendorOtpMutation</code> posts <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{'{ email, otp_token, type: "registration" }'}</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">3</span>
                <span><strong>Forgot password</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/forgot-password</code>) — standalone route (not guest-only wrapped).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">4</span>
                <span><strong>Tokens</strong> — On verify/login, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">setCredentials</code> stores JWT + application token. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apiClient</code> attaches both headers on every request.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">5</span>
                <span><strong>Pending approval</strong> — <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">PendingApprovalGuard</code> blocks dashboard interaction when <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">user.status === 'pending_approval'</code>.</span>
              </li>
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
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">Sidebar</code> — nav from <code className="rounded bg-slate-100 px-1 text-xs">constants/sidebarNav.js</code> (Main / Insights / Config sections).</li>
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">PendingApprovalGuard</code> — modal when account is pending admin approval.</li>
              <li>• <code className="rounded bg-slate-100 px-1 text-xs">DashboardReveal</code> — staggered entrance animations for KPI cards and charts.</li>
              <li>• Helpers in <code className="rounded bg-slate-100 px-1 text-xs">utils/vendorAuth.js</code>.</li>
            </ul>
          </GuideSection>

          <GuideSection
            id="products"
            icon={Package}
            title="Product catalog"
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
            description="/products/new — 6-step Formik wizard. Creates products via live API with optional presigned S3 media upload."
          >
            <ol className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li><strong>1. Product Info</strong> — Name, SKU, rich-text description, category + subcategory, brand (<code className="rounded bg-slate-100 px-1 text-xs">SearchableSelect</code> + inline brand create), condition, tags, key details.</li>
              <li><strong>2. Images</strong> — Required main photo + gallery + optional descriptive (2×2 grid) images with dimension validation.</li>
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
            description="/products/:productId/edit — split into two independent flows so vendors only change what they intend."
          >
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
              <li>• <strong>Chooser</strong> — <code className="rounded bg-slate-100 px-1 text-xs">?section=info</code> or <code className="rounded bg-slate-100 px-1 text-xs">?section=variations</code>.</li>
              <li>• <strong>Edit product info</strong> — 5-step wizard. Saves via <code className="rounded bg-slate-100 px-1 text-xs">buildProductInfoJsonPayload</code> + <code className="rounded bg-slate-100 px-1 text-xs">useUpdateProductInfoMutation</code>.</li>
              <li>• <strong>Edit images</strong> — Presign new files → S3 upload → JSON update. Kept images use <code className="rounded bg-slate-100 px-1 text-xs">id</code>; new uploads use <code className="rounded bg-slate-100 px-1 text-xs">upload_id</code>. Removed images are omitted.</li>
              <li>• <strong>Edit variations</strong> — <code className="rounded bg-slate-100 px-1 text-xs">VariationsEditForm</code> manages variant CRUD via per-variant update/create/delete mutations.</li>
              <li>• <strong>View product</strong> — <code className="rounded bg-slate-100 px-1 text-xs">/products/:id/view</code> renders <code className="rounded bg-slate-100 px-1 text-xs">ProductStorefrontPreview</code> (consumer-style layout).</li>
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
            id="integrations"
            icon={Database}
            title="API vs mock data"
            description="Quick map of what is wired to the backend today vs local fixtures."
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="px-4 py-3">Auth</td><td className="px-4 py-3 text-emerald-700">Live API</td><td className="px-4 py-3">Register, login, OTP, logout</td></tr>
                  <tr><td className="px-4 py-3">Categories</td><td className="px-4 py-3 text-emerald-700">Live API</td><td className="px-4 py-3">Parent + tree queries</td></tr>
                  <tr><td className="px-4 py-3">Brands</td><td className="px-4 py-3 text-emerald-700">Live API</td><td className="px-4 py-3">Approved brands + inline create</td></tr>
                  <tr><td className="px-4 py-3">Products</td><td className="px-4 py-3 text-emerald-700">Live API</td><td className="px-4 py-3">List, create, view, edit info, variants, delete, duplicate, toggle active</td></tr>
                  <tr><td className="px-4 py-3">Product media</td><td className="px-4 py-3 text-emerald-700">Live API</td><td className="px-4 py-3">Presigned S3 upload; edit image fields ready for backend</td></tr>
                  <tr><td className="px-4 py-3">Orders</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/ordersData.js</td></tr>
                  <tr><td className="px-4 py-3">Customers</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/customersData.js</td></tr>
                  <tr><td className="px-4 py-3">Promotions</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/promotionsData.js (localStorage-backed)</td></tr>
                  <tr><td className="px-4 py-3">Finance</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/financeData.js</td></tr>
                  <tr><td className="px-4 py-3">Reviews</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/reviews.js</td></tr>
                  <tr><td className="px-4 py-3">Messages</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/messages.js</td></tr>
                  <tr><td className="px-4 py-3">Analytics</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">Empty by default; dev toggle loads sample data</td></tr>
                  <tr><td className="px-4 py-3">Inventory</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">constants/lowStockData.js</td></tr>
                  <tr><td className="px-4 py-3">Sidebar badges</td><td className="px-4 py-3 text-amber-700">Mock</td><td className="px-4 py-3">SIDEBAR_NAV_BADGES in sidebarNav.js</td></tr>
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
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">1</span>
                <span>Create a page in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/pages/</code> wrapped in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">DashboardLayout</code> for authenticated routes.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">2</span>
                <span>Register the route in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/routes/AppRoutes.jsx</code> and add a nav item in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">constants/sidebarNav.js</code> if needed.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">3</span>
                <span>Extract reusable UI into <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/components/</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">4</span>
                <span>Add TanStack Query hooks in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/hooks/</code> and API calls in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/services/</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">5</span>
                <span>Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">notify</code> for feedback and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">EMPTY_STATE_PRESETS</code> for empty views.</span>
              </li>
            </ol>
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-800">Live auth state</p>
              <p className="mt-2 text-slate-600">
                Authenticated:{' '}
                <span className="font-medium text-slate-900">{auth.isAuthenticated ? 'Yes' : 'No'}</span>
              </p>
              <p className="text-slate-600">
                User:{' '}
                <span className="font-medium text-slate-900">{auth.user?.email ?? auth.user?.business_name ?? '—'}</span>
              </p>
              <p className="text-slate-600">
                Store:{' '}
                <span className="font-medium text-slate-900">{auth.user?.store_name ?? '—'}</span>
              </p>
              <p className="text-slate-600">
                Status:{' '}
                <span className="font-medium text-slate-900">{auth.user?.status ?? '—'}</span>
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
useCreateBrandMutation()`}
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
              <button type="button" onClick={() => notify.success('Product saved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Success</button>
              <button type="button" onClick={() => notify.error('Upload failed')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Error</button>
              <button type="button" onClick={() => notify.info('New order received')} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">Info</button>
              <button type="button" onClick={() => notify.warning('Low stock alert')} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600">Warning</button>
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
              <li>• <strong>TanStack Query</strong> — all server data (products, categories, brands, future orders).</li>
              <li>• <strong>Formik + Yup</strong> — multi-step forms; schemas in <code className="rounded bg-slate-100 px-1 text-xs">validationSchemas.js</code>.</li>
              <li>• <strong>Payload builders</strong> — <code className="rounded bg-slate-100 px-1 text-xs">productPayload.js</code> for create (JSON + FormData), edit info, and variant updates.</li>
              <li>• <strong>Normalization</strong> — map API records in <code className="rounded bg-slate-100 px-1 text-xs">normalize*.js</code> / <code className="rounded bg-slate-100 px-1 text-xs">mapProductToFormValues.js</code>.</li>
              <li>• <strong>Scroll helpers</strong> — <code className="rounded bg-slate-100 px-1 text-xs">scrollToFirstError</code>, <code className="rounded bg-slate-100 px-1 text-xs">scrollDashboardPanelToTop</code> for wizard UX.</li>
              <li>• Style with Tailwind; brand color is <code className="rounded bg-slate-100 px-1 text-xs">brand</code> / auth primary red on consumer-facing previews.</li>
            </ul>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <strong>Done:</strong> auth, landing, dashboard, product catalogue API, add/edit/view product, presigned media upload, brands + categories API, promotions UI (mock data).
              <br />
              <strong>Next:</strong> wire orders, customers, finance, reviews, messages, analytics, and notifications to backend; replace sidebar badge placeholders with API counts.
            </div>
          </GuideSection>
        </main>
      </div>
    </div>
  )
}
