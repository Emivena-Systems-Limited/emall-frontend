import LandingBenefitsSection from '../components/landing/LandingBenefitsSection'
import LandingCtaSection from '../components/landing/LandingCtaSection'
import LandingFaqSection from '../components/landing/LandingFaqSection'
import LandingFooter from '../components/landing/LandingFooter'
import LandingHeader from '../components/landing/LandingHeader'
import LandingHeroSection from '../components/landing/LandingHeroSection'
import LandingHowItWorksSection from '../components/landing/LandingHowItWorksSection'
import LandingScrollReveal from '../components/landing/LandingScrollReveal'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <LandingHeader />

      <main>
        <LandingScrollReveal delay={0}>
          <LandingHeroSection />
        </LandingScrollReveal>

        <LandingScrollReveal delay={60}>
          <LandingHowItWorksSection />
        </LandingScrollReveal>

        <LandingScrollReveal delay={80}>
          <LandingBenefitsSection />
        </LandingScrollReveal>

        <LandingScrollReveal delay={80}>
          <LandingFaqSection />
        </LandingScrollReveal>

        <LandingScrollReveal delay={100}>
          <LandingCtaSection />
        </LandingScrollReveal>
      </main>

      <LandingScrollReveal delay={60}>
        <LandingFooter />
      </LandingScrollReveal>
    </div>
  )
}
