import { useSelector } from 'react-redux'
import {
  ArrowRight,
  Bell,
  Database,
  FolderTree,
  Image,
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
├── components/             # Reusable UI + NotificationProvider
├── hooks/                  # Custom hooks (e.g. useProducts.js)
├── lib/
│   ├── apiClient.js        # Axios instance + auth interceptors
│   ├── notify.js           # Toast helper (Sonner)
│   ├── persistStorage.js   # Redux persist localStorage adapter
│   └── queryClient.js      # TanStack Query defaults
├── pages/                  # Route-level views
├── routes/                 # AppRoutes.jsx
├── store/
│   ├── slices/             # Redux slices (auth, cart, …)
│   └── store.js            # Store + redux-persist config
└── utils/
    └── Images.jsx          # Central image registry`

export default function DeveloperGuide() {
  const auth = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={Images.brand.favicon} alt="" className="size-8" />
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-violet-600 uppercase">
                E-Mall Consumer FE
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
              This page documents the shared setup for the consumer frontend. Use it as a
              reference when building pages, hooks, slices, and API integrations. Everything
              below is already wired in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">main.jsx</code>.
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
            description="React Router v7 is configured in main.jsx. Add routes in AppRoutes.jsx."
          >
            <CodeBlock
              code={`import { Link, NavLink, useNavigate, useParams } from 'react-router'

<Link to="/products">Products</Link>

<NavLink
  to="/cart"
  className={({ isActive }) => isActive ? 'text-violet-700' : 'text-slate-600'}
>
  Cart
</NavLink>

const navigate = useNavigate()
navigate('/checkout')`}
            />
          </GuideSection>

          <GuideSection
            id="redux"
            icon={Shield}
            title="Redux & auth"
            description="Use Redux for client/session state. Auth is persisted across refreshes via redux-persist."
          >
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
                  {auth.user?.email ?? auth.user?.name ?? '—'}
                </span>
              </p>
            </div>

            <CodeBlock
              title="Auth slice usage"
              code={`import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout, updateUser } from '../store/slices/authSlice'

const dispatch = useDispatch()
const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth)

// After a successful login API call
dispatch(setCredentials({ user, accessToken }))

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

// src/store/store.js — register reducer + add to persist whitelist if needed`}
            />
          </GuideSection>

          <GuideSection
            id="query"
            icon={Database}
            title="TanStack Query"
            description="Use for server data: products, orders, categories. Redux stays for client state only."
          >
            <CodeBlock
              title="Query hook pattern"
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
              title="Environment"
              code={`# .env
VITE_API_BASE_URL=http://localhost:8000/api`}
            />
            <CodeBlock
              title="Usage"
              code={`import apiClient from '../lib/apiClient'

const { data } = await apiClient.get('/products')
const { data: order } = await apiClient.post('/orders', { items })
const { data: profile } = await apiClient.patch('/users/me', payload)`}
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
              <li>• <strong>Redux</strong> — auth, cart, UI preferences (client state).</li>
              <li>• <strong>TanStack Query</strong> — products, orders, anything from the API.</li>
              <li>• <strong>apiClient</strong> — never use raw <code className="rounded bg-slate-100 px-1 text-xs">fetch</code> or a second axios instance.</li>
              <li>• <strong>notify</strong> — user-facing success/error feedback after actions.</li>
              <li>• <strong>Images.jsx</strong> — single source of truth for static assets.</li>
              <li>• Put query hooks in <code className="rounded bg-slate-100 px-1 text-xs">src/hooks/</code>, one concern per file.</li>
              <li>• Style with Tailwind utility classes; font is Instrument Sans (see index.css).</li>
            </ul>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
              Suggested build order: layout shell → product listing → product detail → cart slice →
              checkout flow → auth pages wired to <code className="rounded bg-violet-100 px-1 text-xs">setCredentials</code>.
            </div>
          </GuideSection>
        </main>
      </div>
    </div>
  )
}
