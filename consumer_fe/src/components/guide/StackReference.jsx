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
import CodeBlock from './CodeBlock'
import GuideSection from './GuideSection'
import notify from '../../lib/notify'
import Images from '../../utils/Images'

const folderStructure = `src/
├── assets/images/          # Bundled images (imported in Images.jsx)
├── components/             # Reusable UI + NotificationProvider
├── docs/                   # appDocs.js — living application documentation
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

export default function StackReference() {
  const auth = useSelector((state) => state.auth)

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-600">
          Technical reference for the shared stack. Patterns here stay stable; document what you
          build in the <strong>Application</strong> tab via{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/docs/appDocs.js</code>.
          Everything below is wired in{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">main.jsx</code>.
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
        description="Follow this flow for every new screen, then document it in appDocs.js."
      >
        <ol className="space-y-3 text-sm leading-relaxed text-slate-700">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">1</span>
            <span>Create a page in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/pages/YourPage.jsx</code>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">2</span>
            <span>Register the route in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/routes/AppRoutes.jsx</code>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">3</span>
            <span>Add hooks, slices, and API entries as needed.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">4</span>
            <span>Update <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/docs/appDocs.js</code> — routes, progress log, roadmap status.</span>
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
  return <div>{/* render data */}</div>
}

// src/routes/AppRoutes.jsx
<Route path="/products" element={<Products />} />`}
        />
      </GuideSection>

      <GuideSection id="routing" icon={Route} title="Routing" description="React Router v7 — add routes in AppRoutes.jsx.">
        <CodeBlock
          code={`import { Link, NavLink, useNavigate } from 'react-router'

<Link to="/products">Products</Link>
const navigate = useNavigate()
navigate('/checkout')`}
        />
      </GuideSection>

      <GuideSection id="redux" icon={Shield} title="Redux & auth" description="Client/session state. Auth persists via redux-persist.">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-800">Live auth state</p>
          <p className="mt-2 text-slate-600">
            Authenticated: <span className="font-medium text-slate-900">{auth.isAuthenticated ? 'Yes' : 'No'}</span>
          </p>
          <p className="text-slate-600">
            User: <span className="font-medium text-slate-900">{auth.user?.email ?? auth.user?.name ?? '—'}</span>
          </p>
        </div>
        <CodeBlock
          code={`import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, logout } from '../store/slices/authSlice'

dispatch(setCredentials({ user, accessToken }))
dispatch(logout())`}
        />
      </GuideSection>

      <GuideSection id="query" icon={Database} title="TanStack Query" description="Server data — products, orders, categories.">
        <CodeBlock
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
}`}
        />
      </GuideSection>

      <GuideSection id="axios" icon={Server} title="Axios API client" description="All HTTP via apiClient. Token attached automatically.">
        <CodeBlock code={`# .env\nVITE_API_BASE_URL=http://localhost:8000/api`} />
        <CodeBlock
          code={`import apiClient from '../lib/apiClient'
const { data } = await apiClient.get('/products')`}
        />
      </GuideSection>

      <GuideSection id="notify" icon={Bell} title="Notifications" description="Sonner toasts via notify helper.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => notify.success('Added to cart')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Success</button>
          <button type="button" onClick={() => notify.error('Payment failed')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Error</button>
          <button type="button" onClick={() => notify.info('New deals available')} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">Info</button>
          <button type="button" onClick={() => notify.warning('Only 2 left in stock')} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600">Warning</button>
        </div>
        <CodeBlock code={`import notify from '../lib/notify'\nnotify.success('Order placed')\nnotify.fromError(error)`} />
      </GuideSection>

      <GuideSection id="images" icon={Image} title="Images" description="Register static assets in Images.jsx.">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <img src={Images.brand.favicon} alt="Brand favicon" className="size-10" />
          <p className="text-sm text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Images.brand.favicon</code>
          </p>
        </div>
      </GuideSection>

      <GuideSection id="conventions" icon={ArrowRight} title="Conventions" description="Redux = client state. Query = server data. apiClient = all HTTP.">
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Document every feature in <code className="rounded bg-slate-100 px-1 text-xs">appDocs.js</code> when you ship it.</li>
          <li>• Redux — auth, cart, UI preferences.</li>
          <li>• TanStack Query — API-fetched data.</li>
          <li>• Tailwind + Instrument Sans for styling.</li>
        </ul>
      </GuideSection>
    </>
  )
}
