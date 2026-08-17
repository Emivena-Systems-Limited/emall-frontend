import { Link } from 'react-router'
import { landingContainerClass } from '../../constants/landingLayout'
import Images from '../../utils/Images'

const highlights = [
  { value: '16', label: 'regions', accent: 'text-emerald-300/90' },
  { value: 'Nationwide', label: 'customer reach', accent: 'text-red-400' },
  { value: 'One', label: 'seller dashboard', accent: 'text-sky-300/90' },
]

const routeNodes = [
  { top: '38%', left: '58%', delay: '0s' },
  { top: '52%', left: '72%', delay: '0.8s' },
  { top: '44%', left: '84%', delay: '1.4s' },
  { top: '62%', left: '66%', delay: '2s' },
]

export default function LandingCtaSection() {
  return (
    <section className="relative overflow-hidden bg-black py-14 text-white sm:py-16 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Kumasi hub — matches the glowing red store on the map */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_48%,rgba(220,38,38,0.22),transparent_42%)]" />
        {/* Gulf of Guinea coastal blue */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_88%,rgba(14,165,233,0.14),transparent_38%)]" />
        {/* Northern sage-green landmass */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_18%,rgba(134,239,172,0.08),transparent_36%)]" />
        {/* Warm terracotta mid-belt */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_72%,rgba(251,146,60,0.06),transparent_40%)]" />

        {/* Subtle network grid — echoes delivery routes, not wireframe cyan */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(248,113,113,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 72% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 72% 50%, black 20%, transparent 70%)',
          }}
        />

        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-sky-500/15 to-transparent" />
      </div>

      <div className={`${landingContainerClass} relative`}>
        <div className="grid items-center lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative z-10 max-w-xl lg:pr-2">
            
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Ready to start selling?
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">
              Join thousands of vendors who trust EZ-Mall to grow their business. Create your seller account, list your products, and start reaching customers today.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-brand px-10 text-base font-bold text-white shadow-[0_0_40px_rgba(220,38,38,0.45),0_0_80px_rgba(220,38,38,0.15)] transition-all duration-200 ease-out hover:scale-105 hover:bg-brand-hover hover:shadow-[0_0_48px_rgba(220,38,38,0.55)] active:scale-100"
            >
              Register now
            </Link>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/8 pt-6">
              {highlights.map(({ value, label, accent }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className={`text-lg font-bold tracking-tight ${accent}`}>{value}</dd>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mt-10 lg:mt-0 lg:-ml-4">
            {/* Pulsing route nodes — mirrors the red pins on the map */}
            {routeNodes.map(({ top, left, delay }) => (
              <span
                key={`${top}-${left}`}
                aria-hidden="true"
                className="cta-route-node absolute z-20 hidden size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] lg:block"
                style={{
                  top,
                  left,
                  animation: `cta-route-pulse 2.8s ease-in-out ${delay} infinite`,
                }}
              />
            ))}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[8%] rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.18),transparent_68%)] blur-2xl"
            />

            <img
              src={Images.common.ghana_map_grid}
              alt="Map showing EZ-Mall vendor reach across Ghana"
              className="relative z-10 mx-auto w-full max-h-72 object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)] sm:max-h-96 lg:max-h-[32rem] lg:drop-shadow-[0_0_60px_rgba(220,38,38,0.2),0_32px_64px_rgba(0,0,0,0.5)] lg:[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%)] lg:[-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
