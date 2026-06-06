import { BookOpen, ClipboardList, KeyRound, Map, PenLine, Rocket } from 'lucide-react'
import {
  apiIntegrations,
  appMeta,
  authFlow,
  plannedPages,
  progressLog,
  queryHooks,
  reduxSlices,
  roadmap,
  routes,
  updateInstructions,
} from '../../docs/appDocs'
import GuideSection from './GuideSection'
import CodeBlock from './CodeBlock'
import DocTable, { StatusBadge } from './DocTable'

const routeColumns = [
  { key: 'path', label: 'Path' },
  { key: 'name', label: 'Page' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: 'file', label: 'File' },
  { key: 'notes', label: 'Notes' },
]

const sliceColumns = [
  { key: 'name', label: 'Slice' },
  { key: 'purpose', label: 'Purpose' },
  {
    key: 'persisted',
    label: 'Persisted',
    render: (row) => (row.persisted ? 'Yes' : 'No'),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => row.actions?.join(', ') ?? '—',
  },
  { key: 'file', label: 'File' },
]

const hookColumns = [
  { key: 'name', label: 'Hook' },
  { key: 'queryKey', label: 'Query key' },
  { key: 'endpoint', label: 'Endpoint' },
  { key: 'usedBy', label: 'Used by' },
  { key: 'file', label: 'File' },
]

const apiColumns = [
  {
    key: 'method',
    label: 'Method',
    render: (row) => <code className="text-xs">{row.method}</code>,
  },
  { key: 'endpoint', label: 'Endpoint' },
  { key: 'purpose', label: 'Purpose' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
]

export default function ApplicationDocs() {
  return (
    <>
      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 size-5 text-violet-700" />
          <div>
            <h2 className="text-lg font-semibold text-violet-950">Living documentation</h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-900/80">
              This tab reflects what has actually been built in the app. As you ship features,
              update <code className="rounded bg-violet-100 px-1.5 py-0.5 text-xs">src/docs/appDocs.js</code>{' '}
              — the guide re-renders automatically. Keep the stack reference tab for how-to patterns.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-violet-700/70 uppercase">Last updated</dt>
                <dd className="mt-0.5 text-sm font-medium text-violet-950">{appMeta.lastUpdated}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-violet-700/70 uppercase">Current phase</dt>
                <dd className="mt-0.5 text-sm font-medium text-violet-950">{appMeta.currentPhase}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-violet-700/70 uppercase">Status</dt>
                <dd className="mt-0.5 text-sm font-medium text-violet-950">{appMeta.summary}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <GuideSection
        id="how-to-update"
        icon={PenLine}
        title="How to update this guide"
        description="Do this as part of every feature PR or when you finish a task."
      >
        <ol className="space-y-2 text-sm text-slate-700">
          {updateInstructions.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="font-semibold text-violet-700">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <CodeBlock
          title="src/docs/appDocs.js"
          code={`// After adding /products page:
routes.push({
  path: '/products',
  name: 'Products',
  status: 'done',
  file: 'src/pages/Products.jsx',
})

progressLog.unshift({
  date: '2026-06-12',
  title: 'Product listing',
  items: ['Products page', 'useProducts hook', 'GET /products'],
})`}
        />
      </GuideSection>

      <GuideSection
        id="progress"
        icon={Rocket}
        title="Progress log"
        description="Chronological record of completed work."
      >
        <div className="space-y-4">
          {progressLog.map((entry) => (
            <article
              key={`${entry.date}-${entry.title}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-xs font-medium text-slate-500">{entry.date}</time>
                <h3 className="text-base font-semibold text-slate-900">{entry.title}</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {entry.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="roadmap"
        icon={Map}
        title="Roadmap"
        description="High-level phases — update status as the app grows."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {roadmap.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{phase.phase}</h3>
                <StatusBadge status={phase.status} />
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {phase.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="auth-flow"
        icon={KeyRound}
        title="Auth flow"
        description="End-to-end login and registration paths — routes, API calls, validation, and post-auth behaviour."
      >
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          {authFlow.overview}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">OTP length</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{authFlow.constants.otpLength}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Resend cooldown</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {authFlow.constants.resendCooldownSeconds}s
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Dev mock OTP</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">
              {authFlow.constants.devMockOtp}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Methods</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {authFlow.constants.methods.join(' · ')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {authFlow.flows.map((flow) => (
            <article
              key={flow.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{flow.name} flow</h3>
                  <p className="mt-1 font-mono text-xs text-violet-700">
                    {flow.entryRoute} → {flow.verifyRoute}
                  </p>
                </div>
                <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{flow.file}</code>
              </div>

              <ol className="mt-4 space-y-3">
                {flow.steps.map((step) => (
                  <li key={step.order} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                      {step.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{step.title}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{step.route}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500 uppercase">Navigation state</p>
                <p className="mt-1 font-mono text-xs text-slate-700">
                  {flow.navigationState.join(', ')}
                </p>
              </div>

              {flow.profilePayload && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500 uppercase">Register profile payload</p>
                  <p className="mt-1 font-mono text-xs text-slate-700">
                    {flow.profilePayload.join(', ')}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-500 uppercase">API calls</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {flow.apiCalls.map((call) => (
                    <li key={`${call.step}-${call.endpoint}`} className="flex flex-wrap gap-2">
                      <code className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-800">
                        {call.method}
                      </code>
                      <code className="text-xs">{call.endpoint}</code>
                      <span className="text-slate-400">—</span>
                      <span>{call.step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <article className="rounded-xl border border-violet-200 bg-violet-50/50 p-5">
          <h3 className="text-base font-semibold text-violet-950">Shared OTP verification</h3>
          <p className="mt-1 font-mono text-xs text-violet-800">{authFlow.sharedVerify.file}</p>
          <p className="mt-2 text-sm text-violet-900/80">
            Routes: {authFlow.sharedVerify.routes.join(', ')}
          </p>
          <p className="mt-1 text-sm text-violet-900/80">
            Components: {authFlow.sharedVerify.components.join(', ')}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-violet-900/80">
            {authFlow.sharedVerify.behaviour.map((item) => (
              <li key={item} className="flex gap-2">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Validation rules</h3>
          <DocTable
            columns={[
              { key: 'field', label: 'Field' },
              { key: 'rules', label: 'Rules' },
            ]}
            rows={authFlow.validation}
          />
        </div>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
          <h3 className="text-base font-semibold text-emerald-950">Post-auth</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-emerald-700/70 uppercase">Redux action</dt>
              <dd className="mt-0.5 font-mono text-sm text-emerald-900">{authFlow.postAuth.action}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-700/70 uppercase">Redirect</dt>
              <dd className="mt-0.5 font-mono text-sm text-emerald-900">{authFlow.postAuth.redirect}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-700/70 uppercase">Slice</dt>
              <dd className="mt-0.5 font-mono text-sm text-emerald-900">{authFlow.postAuth.slice}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-700/70 uppercase">Persisted</dt>
              <dd className="mt-0.5 text-sm text-emerald-900">
                {authFlow.postAuth.persisted ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-emerald-900/80">{authFlow.postAuth.notes}</p>
        </article>
      </GuideSection>

      <GuideSection
        id="routes"
        icon={ClipboardList}
        title="Routes"
        description="Every registered route in AppRoutes.jsx."
      >
        <DocTable columns={routeColumns} rows={routes} />
      </GuideSection>

      <GuideSection
        id="planned-pages"
        title="Planned pages"
        description="Upcoming screens — move to routes[] when implemented."
      >
        <DocTable
          columns={[
            { key: 'name', label: 'Page' },
            { key: 'path', label: 'Path' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            { key: 'notes', label: 'Notes' },
          ]}
          rows={plannedPages}
        />
      </GuideSection>

      <GuideSection
        id="slices"
        title="Redux slices"
        description="Client state registered in the store."
      >
        <DocTable columns={sliceColumns} rows={reduxSlices} />
      </GuideSection>

      <GuideSection
        id="hooks"
        title="Query hooks"
        description="TanStack Query hooks for server data."
      >
        <DocTable
          columns={hookColumns}
          rows={queryHooks}
          emptyMessage="No query hooks yet. Add entries here when you create src/hooks/*."
        />
      </GuideSection>

      <GuideSection
        id="api"
        title="API integrations"
        description="Endpoints consumed through apiClient."
      >
        <DocTable columns={apiColumns} rows={apiIntegrations} />
      </GuideSection>
    </>
  )
}
