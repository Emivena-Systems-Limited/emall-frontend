import { Link } from 'react-router'
import {
  BadgeDollarSign,
  Box,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  Megaphone,
  PackagePlus,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import Images from '../utils/Images'

const benefits = [
  {
    icon: Users,
    title: 'Reach more customers',
    description: 'Connect your products with shoppers across Ghana from one professional seller account.',
  },
  {
    icon: TrendingUp,
    title: 'Grow your business',
    description: 'Use simple tools for listings, orders, inventory, and daily selling operations.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & secure platform',
    description: 'Sell with protected account access, secure workflows, and reliable vendor support.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Increase your sales',
    description: 'Promote your products, improve visibility, and turn more visits into paid orders.',
  },
]

const steps = [
  {
    icon: CheckCircle2,
    title: 'Register',
    description: 'Create your seller account in just a few minutes.',
  },
  {
    icon: Box,
    title: 'List your products',
    description: 'Add your product listings, photos, prices, and details.',
  },
  {
    icon: Megaphone,
    title: 'Reach customers',
    description: 'Customers can discover and buy your products.',
  },
  {
    icon: Wallet,
    title: 'Get paid',
    description: 'Earn money and grow your business.',
  },
]

const footerGroups = [
  {
    title: 'About Us',
    links: ['Benefits', 'How It Works', 'Seller Stories'],
  },
  {
    title: 'Payment products',
    links: ['Vendor Wallet', 'Payment Schedule', 'Payout Support'],
  },
  {
    title: 'Help and support',
    links: ['Help', 'Account Health', 'Contact Us'],
  },
]

const faqItems = [
  {
    question: 'How do I start selling?',
    answer: 'Register your seller account, verify it, then list your first products.',
  },
  {
    question: 'Can I manage orders online?',
    answer: 'Yes. The vendor dashboard helps you manage products, orders, inventory, and notifications.',
  },
  {
    question: 'Where can I get support?',
    answer: 'Seller support is available from the help and support links in the vendor portal.',
  },
]

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 text-white">
      <span className="flex size-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
        <Store className="size-5" strokeWidth={2} />
      </span>
      <span className="text-xl font-bold tracking-tight">E-Mall Seller</span>
    </Link>
  )
}

function GhanaMapIllustration() {
  const regions = [
    {
      name: 'Upper West',
      path: 'M72 28 L178 32 L177 112 L161 126 L152 150 L119 142 L96 150 L80 193 L54 183 L45 109 L53 82 L49 55 Z',
      fill: '#c7c844',
      label: { x: 112, y: 86, size: 16 },
    },
    {
      name: 'Upper East',
      path: 'M178 32 L286 35 L309 18 L321 49 L305 86 L270 91 L238 82 L214 105 L190 96 L177 112 Z',
      fill: '#8e8e8b',
      label: { x: 244, y: 61, size: 15 },
    },
    {
      name: 'North East',
      path: 'M190 96 L214 105 L238 82 L270 91 L312 84 L334 121 L322 165 L284 157 L252 137 L216 150 L176 142 L161 126 Z',
      fill: '#cab9dc',
      label: { x: 262, y: 127, size: 15 },
    },
    {
      name: 'Northern',
      path: 'M216 150 L252 137 L284 157 L322 165 L342 195 L327 247 L350 284 L325 330 L287 315 L270 348 L238 321 L205 311 L186 283 L160 285 L149 248 L170 219 L154 198 L174 170 Z',
      fill: '#986555',
      label: { x: 274, y: 230, size: 17 },
    },
    {
      name: 'Savannah',
      path: 'M54 183 L80 193 L96 150 L119 142 L152 150 L161 126 L176 142 L216 150 L174 170 L154 198 L170 219 L149 248 L160 285 L186 283 L182 330 L145 339 L132 318 L102 326 L92 356 L65 355 L45 313 L38 249 Z',
      fill: '#efb7d2',
      label: { x: 137, y: 251, size: 17 },
    },
    {
      name: 'Bono',
      path: 'M38 249 L45 313 L65 355 L92 356 L97 393 L80 424 L48 414 L36 376 L23 350 L30 298 Z',
      fill: '#fb862c',
      label: { x: 65, y: 339, size: 15 },
    },
    {
      name: 'Bono East',
      path: 'M92 356 L102 326 L132 318 L145 339 L182 330 L186 283 L205 311 L238 321 L270 348 L262 394 L221 406 L189 390 L165 418 L121 413 L97 393 Z',
      fill: '#4fa13c',
      label: { x: 176, y: 375, size: 15 },
    },
    {
      name: 'Oti',
      path: 'M287 315 L325 330 L341 388 L323 447 L293 442 L280 392 L262 394 L270 348 Z',
      fill: '#d778bd',
      label: { x: 312, y: 377, size: 15 },
    },
    {
      name: 'Western North',
      path: 'M23 350 L36 376 L48 414 L80 424 L70 463 L77 503 L38 494 L20 440 L11 395 Z',
      fill: '#aadce3',
      label: { x: 43, y: 436, size: 13 },
    },
    {
      name: 'Ahafo',
      path: 'M80 424 L97 393 L121 413 L119 446 L94 465 L69 459 Z',
      fill: '#3f83b8',
      label: { x: 92, y: 433, size: 13 },
    },
    {
      name: 'Ashanti',
      path: 'M119 446 L121 413 L165 418 L189 390 L221 406 L262 394 L249 455 L217 487 L161 498 L120 483 L94 465 Z',
      fill: '#b9cce8',
      label: { x: 176, y: 459, size: 16 },
    },
    {
      name: 'Eastern',
      path: 'M249 455 L262 394 L280 392 L293 442 L323 447 L303 489 L313 522 L278 526 L246 505 L217 487 Z',
      fill: '#d33a32',
      label: { x: 269, y: 486, size: 15 },
    },
    {
      name: 'Volta',
      path: 'M323 447 L341 388 L354 420 L356 475 L343 516 L360 556 L332 552 L313 522 L303 489 Z',
      fill: '#dedf94',
      label: { x: 334, y: 490, size: 14 },
    },
    {
      name: 'Greater Accra',
      path: 'M246 505 L278 526 L313 522 L332 552 L284 557 L236 539 Z',
      fill: '#9571bf',
      label: { x: 288, y: 538, size: 12 },
    },
    {
      name: 'Central',
      path: 'M120 483 L161 498 L217 487 L246 505 L236 539 L193 560 L147 558 L111 535 Z',
      fill: '#aee09b',
      label: { x: 177, y: 533, size: 15 },
    },
    {
      name: 'Western',
      path: 'M77 503 L70 463 L94 465 L120 483 L111 535 L147 558 L135 589 L87 596 L47 579 L38 494 Z',
      fill: '#55bfd0',
      label: { x: 94, y: 548, size: 15 },
    },
  ]

  return (
    <div className="relative mx-auto flex h-[34rem] w-full max-w-xl items-center justify-center sm:h-[38rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.55) 1px, transparent 1.6px)',
          backgroundSize: '12px 12px',
        }}
      />
      <svg
        viewBox="0 0 370 610"
        role="img"
        aria-label="Ghana regional map illustration"
        className="relative h-[32rem] w-full max-w-[21rem] drop-shadow-[0_0_45px_rgba(37,99,235,0.28)] sm:h-[36rem] sm:max-w-[24rem]"
      >
        <defs>
          <filter id="ghanaMapShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#020617" floodOpacity="0.28" />
          </filter>
        </defs>
        <g filter="url(#ghanaMapShadow)">
          {regions.map((region) => (
            <path
              key={region.name}
              d={region.path}
              fill={region.fill}
              stroke="#1f2937"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          ))}
        </g>
        {regions.map((region) => (
          <text
            key={`${region.name}-label`}
            x={region.label.x}
            y={region.label.y}
            textAnchor="middle"
            className="select-none fill-slate-950 font-semibold"
            style={{ fontSize: region.label.size }}
          >
            {region.name}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071524] text-white shadow-lg shadow-slate-950/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-bold lg:flex">
            <a href="#benefits" className="transition-colors hover:text-amber-300">Benefits</a>
            <a href="#how-it-works" className="transition-colors hover:text-amber-300">How It Works</a>
            <a href="#faq" className="transition-colors hover:text-amber-300">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-white/50 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white hover:text-slate-950 sm:px-6"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 sm:px-6"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-linear-to-br from-white via-slate-50 to-blue-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-24">
            <div className="vendor-scroll-reveal max-w-3xl">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Start selling on E-Mall
                <span className="mt-1 block text-amber-500">Reach customers across Ghana</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
                Open your store, reach more customers, and grow your business with a trusted e-commerce marketplace built for modern sellers.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-amber-400 px-8 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-300/40 transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  Register Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-slate-400 px-8 text-sm font-extrabold text-slate-950 transition-transform hover:-translate-y-0.5 hover:border-slate-950"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="vendor-scroll-reveal relative">
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/70 ring-1 ring-slate-200">
                <img
                  src={Images.auth.signupHero}
                  alt="Customers shopping with E-Mall"
                  className="aspect-[1.18] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-[#071524] p-4 text-white shadow-xl shadow-slate-950/25 sm:left-10 sm:right-auto sm:w-72">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                    <PackagePlus className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Seller tools ready</p>
                    <p className="text-xs text-white/70">Products, orders, inventory, payouts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="vendor-scroll-reveal text-center text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Why sell with us?
            </h2>
            <div className="mt-10 grid gap-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article key={title} className="vendor-scroll-reveal border-b border-slate-200 p-8 text-center last:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <Icon className="mx-auto size-14 text-blue-600" strokeWidth={1.7} />
                  <h3 className="mt-7 text-lg font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="vendor-scroll-reveal text-center text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              How It Works
            </h2>

            <div className="mx-auto mt-12 grid max-w-6xl gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="vendor-scroll-reveal relative px-3 text-center">
                  <span className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-base font-extrabold text-blue-700">
                    {index + 1}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="absolute left-[calc(50%_+_2.25rem)] right-[calc(-50%_+_2.25rem)] top-6 hidden border-t border-dashed border-slate-300 lg:block" />
                  )}
                  <Icon className="mx-auto mt-8 size-14 text-slate-950" strokeWidth={1.7} />
                  <h3 className="mt-7 text-lg font-extrabold text-slate-950">{title}</h3>
                  <p className="mx-auto mt-4 max-w-60 text-sm leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="vendor-scroll-reveal text-center text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              FAQ
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {faqItems.map((item) => (
                <article key={item.question} className="vendor-scroll-reveal rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <HelpCircle className="size-7 text-blue-600" />
                  <h3 className="mt-4 text-base font-extrabold text-slate-950">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#071524] py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="vendor-scroll-reveal">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to start selling?
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
                Join growing sellers who use E-Mall to reach customers and build stronger businesses.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-amber-400 px-10 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
              >
                Register Now
              </Link>
            </div>

            <div className="vendor-scroll-reveal">
              <GhanaMapIllustration />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#071524] text-white">
        <div className="mx-auto max-w-7xl border-t border-white/15 px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1.2fr_2fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
                A professional marketplace for vendors ready to sell, manage, and grow online.
              </p>
            </div>
            <div className="grid gap-7 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-extrabold tracking-wide">{group.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {group.links.map((link) => (
                      <li key={link}>
                        <a href="#benefits" className="transition-colors hover:text-white">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 E-Mall. All rights reserved.</p>
            <div className="flex flex-wrap gap-5">
              <a href="#benefits" className="hover:text-white">Conditions of Use</a>
              <a href="#benefits" className="hover:text-white">Privacy Notice</a>
              <a href="#benefits" className="hover:text-white">Seller Agreement</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
