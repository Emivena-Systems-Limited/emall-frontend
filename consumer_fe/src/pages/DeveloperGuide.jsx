import { useState } from 'react'
import Images from '../utils/Images'
import ApplicationDocs from '../components/guide/ApplicationDocs'
import StackReference from '../components/guide/StackReference'

const applicationNav = [
  { id: 'how-to-update', label: 'How to update' },
  { id: 'progress', label: 'Progress log' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'auth-flow', label: 'Auth flow' },
  { id: 'routes', label: 'Routes' },
  { id: 'planned-pages', label: 'Planned pages' },
  { id: 'slices', label: 'Redux slices' },
  { id: 'hooks', label: 'Query hooks' },
  { id: 'api', label: 'API' },
]

const stackNav = [
  { id: 'structure', label: 'Structure' },
  { id: 'new-page', label: 'Build a page' },
  { id: 'routing', label: 'Routing' },
  { id: 'redux', label: 'Redux & auth' },
  { id: 'query', label: 'TanStack Query' },
  { id: 'axios', label: 'Axios' },
  { id: 'notify', label: 'Notifications' },
  { id: 'images', label: 'Images' },
  { id: 'conventions', label: 'Conventions' },
]

const tabs = [
  { id: 'application', label: 'Application', nav: applicationNav },
  { id: 'stack', label: 'Stack reference', nav: stackNav },
]

export default function DeveloperGuide() {
  const [activeTab, setActiveTab] = useState('application')
  const currentTab = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={Images.brand.favicon} alt="" className="size-8" />
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-violet-600 uppercase">
                  E-Mall Consumer FE
                </p>
                <h1 className="text-lg font-semibold tracking-tight">Developer Guide</h1>
              </div>
            </div>
            <p className="max-w-sm text-right text-xs text-slate-500">
              Update <code className="rounded bg-slate-100 px-1 py-0.5">src/docs/appDocs.js</code> as you build
            </p>
          </div>

          <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-36 space-y-1">
            {currentTab?.nav.map((item) => (
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
          {activeTab === 'application' ? <ApplicationDocs /> : <StackReference />}
        </main>
      </div>
    </div>
  )
}
