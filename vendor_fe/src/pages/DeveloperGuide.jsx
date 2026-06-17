import { useSelector } from 'react-redux'
import {
  ArrowRight,
  Bell,
  Database,
  FolderTree,
  Image,
  KeyRound,
  Layers,
  Route,
  Server,
  Shield,
} from 'lucide-react'
import CodeBlock from '../components/guide/CodeBlock'
import GuideSection from '../components/guide/GuideSection'
import notify from '../lib/notify'
import Images from '../utils/Images'

const navItems = [
  { id: 'structure', label: 'Project structure' },
  { id: 'auth-flow', label: 'Vendor auth flow' },
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
│   ├── auth/               # AuthLayout, FormInput, OtpInput, ResendTimer, …
│   └── guide/              # Developer guide UI
├── constants/
│   ├── auth.js             # Endpoints, OTP config
│   └── ghanaRegions.js     # Region/city options for signup
├── hooks/
│   └── useAuthMutations.js # TanStack Query auth mutations
├── lib/
│   ├── apiClient.js        # Axios instance + auth interceptors
│   ├── notify.js           # Toast helper (Sonner)
│   ├── persistStorage.js   # Redux persist localStorage adapter
│   └── queryClient.js      # TanStack Query defaults
├── pages/
│   ├── auth_pages/         # Login, Signup, VerifyAccount
│   ├── LandingPage.jsx     # Public vendor seller landing page
│   ├── Dashboard.jsx       # Post-auth landing (protected)
│   └── DeveloperGuide.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── GuestOnlyRoute.jsx  # Redirect authenticated users away
│   └── ProtectedRoute.jsx  # Require auth
├── services/
│   └── authService.js      # Vendor auth API calls
├── store/
│   ├── slices/             # Redux slices (auth, …)
│   └── store.js            # Store + redux-persist config
└── utils/
    ├── Config.jsx          # API base URL
    ├── Images.jsx          # Central image registry
    └── validationSchemas.js # Formik/Yup schemas`

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
              reference when building pages, hooks, slices, and API integrations. Auth pages
              (login, signup, verify) are already wired with Redux + TanStack Query.
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
            description="Signup → email OTP verification → dashboard. Login uses email + password. The public seller landing page lives at /."
          >
            <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">1</span>
                <span><strong>Signup</strong> — API returns vendor in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data</code> with no tokens. If <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">email_verified_at</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">phone_verified_at</code> are both null, user is sent to verify.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">2</span>
                <span><strong>Verify</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/verify-account</code>) — 6-box OTP input with 15s resend timer. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">useVerifyVendorOtpMutation</code> posts <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{'{ email, otp_token, type: "registration" }'}</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">3</span>
                <span><strong>Verify / Login</strong> — On success, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data.token</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data.application_token</code> are stored. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apiClient</code> sends <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Authorization: Bearer</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Application-Token</code> on every request.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">4</span>
                <span><strong>Dashboard</strong> (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/dashboard</code>) — Protected route. Public seller landing lives at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/</code> and links users to signup or login.</span>
              </li>
            </ol>

            <CodeBlock
              title="Auth mutation hooks (TanStack Query)"
              code={`import { useLoginVendorMutation, useRegisterVendorMutation } from '../hooks/useAuthMutations'

const loginMutation = useLoginVendorMutation()
const registerMutation = useRegisterVendorMutation()

// In submit handler
const data = await loginMutation.mutateAsync({ email, password })
dispatch(setCredentials({
  user: data.user,
  accessToken: data.accessToken,
  applicationToken: data.applicationToken,
}))

await registerMutation.mutateAsync(signupPayload)
dispatch(setPendingVerificationEmail(signupPayload.email))`}
            />

            <CodeBlock
              title="API base URL"
              code={`// src/utils/Config.jsx
const config = { base_url: 'https://emall-backend-main-fnfxdk.laravel.cloud' }

// src/lib/apiClient.js uses config.base_url
// Endpoints: /api/vendor/auth/register | login | verify | resend-otp`}
            />
          </GuideSection>

          <GuideSection
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
              code={`// src/pages/Products.jsx
import { useProducts } from '../hooks/useProducts'

export default function Products() {
  const { data, isLoading, error } = useProducts()

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>Failed to load products</p>

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Products</h1>
      {/* render data */}
    </div>
  )
}

// src/routes/AppRoutes.jsx
<Route path="/products" element={<Products />} />`}
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
<Route path="/" element={<LandingPage />} />            // public seller landing page
<Route path="/login" element={guestOnly(<Login />)} />
<Route path="/signup" element={guestOnly(<Signup />)} />
<Route path="/verify-account" element={guestOnly(<VerifyAccount />)} />
<Route path="/dashboard" element={protectedPage(<Dashboard />)} />

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
                <li>• <code className="rounded bg-slate-100 px-1 text-xs">user</code> — vendor profile (business, store, email, …)</li>
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
              title="Query hook pattern (for server data)"
              code={`// src/hooks/useProducts.js
import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/apiClient'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products')
      return data
    },
  })
}

// src/hooks/useAddToCart.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/apiClient'
import notify from '../lib/notify'

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => apiClient.post('/cart/items', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      notify.success('Added to cart')
    },
    onError: (error) => notify.fromError(error, 'Could not add item'),
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
const { data: vendor } = await apiClient.get('/api/vendor/products')`}
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

// Add bundled images:
// 1. Place file in src/assets/images/logo.png
// 2. Import in Images.jsx and add to the right group`}
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
              <li>• <strong>TanStack Query</strong> — API mutations (register, login, verify, resend) and future server data.</li>
              <li>• <strong>Formik + Yup</strong> — form state and validation on auth pages.</li>
              <li>• <strong>apiClient</strong> — single axios instance using <code className="rounded bg-slate-100 px-1 text-xs">Config.jsx</code> base URL.</li>
              <li>• <strong>notify</strong> — user-facing success/error feedback after actions.</li>
              <li>• <strong>Images.jsx</strong> — single source of truth for static assets.</li>
              <li>• Put query/mutation hooks in <code className="rounded bg-slate-100 px-1 text-xs">src/hooks/</code>, API logic in <code className="rounded bg-slate-100 px-1 text-xs">src/services/</code>.</li>
              <li>• Style with Tailwind utility classes; font is Instrument Sans (see index.css).</li>
            </ul>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              Auth is complete. Next build order: product catalog → order management →
              vendor profile → analytics dashboard.
            </div>
          </GuideSection>
        </main>
      </div>
    </div>
  )
}
