import LandingBenefitsSection from '../components/landing/LandingBenefitsSection'
import LandingCtaSection from '../components/landing/LandingCtaSection'
import LandingFaqSection from '../components/landing/LandingFaqSection'
import LandingFooter from '../components/landing/LandingFooter'
import LandingHeader from '../components/landing/LandingHeader'
import LandingHeroSection from '../components/landing/LandingHeroSection'
import LandingHowItWorksSection from '../components/landing/LandingHowItWorksSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <LandingHeader />

      <main>
        <LandingHeroSection />
        <LandingBenefitsSection />
        <LandingHowItWorksSection />
        <LandingFaqSection />
        <LandingCtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
