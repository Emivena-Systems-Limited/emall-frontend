import HeroSection from '../components/home/HeroSection'
import TopCategoriesSection from '../components/home/TopCategoriesSection'
import RecommendedSection from '../components/home/RecommendedSection'
import BestSellersSection from '../components/home/BestSellersSection'
import FlashSalesSection from '../components/home/FlashSalesSection'
import ExploreInterestsSection from '../components/home/ExploreInterestsSection'
import SiteLayout from '../components/layout/SiteLayout'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'

export default function HomePage() {
  const { data: landingData } = useLandingPageData()

  const recommendedProducts = normalizeLandingProducts(landingData?.recommended_products, {
    prefix: 'recommended',
  })
  const bestSellerProducts = normalizeLandingProducts(landingData?.best_sellers, {
    prefix: 'best-seller',
  })
  const flashSaleProducts = normalizeLandingProducts(landingData?.flash_sales, {
    prefix: 'flash-sale',
    isHot: true,
  })
  const randomProducts = normalizeLandingProducts(landingData?.random_products, {
    prefix: 'random',
  })
  const bestSellerCategories = bestSellerProducts.length
    ? [
        {
          id: 'api-best-sellers',
          label: 'Best Sellers',
          href: '/products/best-sellers',
          products: bestSellerProducts,
        },
      ]
    : []

  return (
    <SiteLayout>
      <HeroSection />
      <TopCategoriesSection />
      <RecommendedSection products={recommendedProducts} />
      <BestSellersSection categories={bestSellerCategories} />
      <FlashSalesSection products={flashSaleProducts} />
      <ExploreInterestsSection products={randomProducts} />
    </SiteLayout>
  )
}
