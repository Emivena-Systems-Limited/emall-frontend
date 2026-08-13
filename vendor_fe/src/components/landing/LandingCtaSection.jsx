import { Link } from 'react-router'
import { landingContainerClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

const highlights = [
  { value: '16', label: 'regions' },
  { value: 'Nationwide', label: 'customer reach' },
  { value: 'One', label: 'seller dashboard' },
]

export default function LandingCtaSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-14 text-white sm:py-16 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(56,189,248,0.18),transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_42%,rgba(199,59,45,0.16),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className={`${landingContainerClass} relative`}>
        <div className="grid items-center lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative z-10 max-w-xl lg:pr-2">

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Ready to start selling?
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              Join thousands of vendors who trust EZ-Mall to grow their business. Create your seller account, list your products, and start reaching customers today.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-brand px-10 text-base font-bold text-white shadow-[0_0_32px_rgba(199,59,45,0.35)] transition-all duration-200 ease-out hover:scale-105 hover:bg-brand-hover active:scale-100"
            >
              Register now
            </Link>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
              {highlights.map(({ value, label }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-lg font-bold tracking-tight text-white">{value}</dd>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/45">{label}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mt-10 lg:mt-0 lg:-ml-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.2),transparent_64%)]"
            />
            <img
              src={Images.common.ghana_map_grid}
              alt="Map showing EZ-Mall vendor reach across Ghana"
              className="relative mx-auto w-full max-h-72 object-contain mix-blend-screen sm:max-h-96 lg:max-h-[32rem] lg:[mask-image:linear-gradient(90deg,transparent,black_10%,black)] lg:[-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,black)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
