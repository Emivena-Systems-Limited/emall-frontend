import HeroSection from '../components/home/HeroSection'
import TopCategoriesSection from '../components/home/TopCategoriesSection'
import RecommendedSection from '../components/home/RecommendedSection'
import BestSellersSection from '../components/home/BestSellersSection'
import FlashSalesSection from '../components/home/FlashSalesSection'
import ExploreInterestsSection from '../components/home/ExploreInterestsSection'
import SiteLayout from '../components/layout/SiteLayout'

export default function HomePage() {
  return (
    <SiteLayout>
      <HeroSection />
      <TopCategoriesSection />
      <RecommendedSection />
      <BestSellersSection />
      <FlashSalesSection />
      <ExploreInterestsSection />
    </SiteLayout>
  )
}
