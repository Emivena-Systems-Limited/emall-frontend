import HeroSection from '../components/home/HeroSection'
import TopCategoriesSection from '../components/home/TopCategoriesSection'
import RecommendedSection from '../components/home/RecommendedSection'
import NewArrivalsSection from '../components/home/NewArrivalsSection'
import BestSellersSection from '../components/home/BestSellersSection'
import FlashSalesSection from '../components/home/FlashSalesSection'
import ExploreInterestsSection from '../components/home/ExploreInterestsSection'
import NationwideDeliveryBanner from '../components/home/NationwideDeliveryBanner'
import ShopByCategorySection from '../components/home/ShopByCategorySection'
import FeaturedPicksSection from '../components/home/FeaturedPicksSection'
import TrendingNowSection from '../components/home/TrendingNowSection'
import SiteLayout from '../components/layout/SiteLayout'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { useLatestProducts } from '../hooks/useLatestProducts'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'

export default function HomePage() {
  const { data: landingData } = useLandingPageData()
  const { data: latestProducts } = useLatestProducts()

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
  const newArrivalProducts = normalizeLandingProducts(latestProducts, {
    prefix: 'new-arrival',
  })
  const bestsellerSource = recommendedProducts.length ? recommendedProducts : bestSellerProducts
  const bestSellerCategories = bestsellerSource.length
    ? [
        {
          id: 'api-best-sellers',
          label: 'Best Sellers',
          href: '/products/best-sellers',
          products: bestsellerSource,
        },
      ]
    : []

  return (
    <SiteLayout>
      <HeroSection />
      <RecommendedSection products={recommendedProducts} />
      <NewArrivalsSection products={newArrivalProducts} />
      <FlashSalesSection products={(recommendedProducts.length ? recommendedProducts : flashSaleProducts).slice(0, 6)} />
      <BestSellersSection categories={bestSellerCategories} />
      <NationwideDeliveryBanner />
      <ShopByCategorySection />
      <FeaturedPicksSection products={recommendedProducts} />
      <TrendingNowSection products={newArrivalProducts.length ? newArrivalProducts : recommendedProducts} />
      <ExploreInterestsSection products={randomProducts} />
    </SiteLayout>
  )
}
