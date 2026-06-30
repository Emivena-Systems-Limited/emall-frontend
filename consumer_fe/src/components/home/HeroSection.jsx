import { motion } from 'framer-motion'
import Container from '../layout/Container'
import { heroBanners } from '../../constants/heroSection'
import HeroBannerCarousel from './HeroBannerCarousel'
import HeroQuickActions from './HeroQuickActions'

const revealEase = [0.16, 1, 0.3, 1]

/** Repeat slides so each page can show a fresh set on navigation */
const carouselBanners = [...heroBanners, ...heroBanners, ...heroBanners]

export default function HeroSection() {
  return (
    <section aria-label="Promotions and quick actions" className="bg-[#f2f2f2] pt-4 sm:pt-5 lg:pt-6">
      <Container className="space-y-3 sm:space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: revealEase }}
        >
          <HeroBannerCarousel banners={carouselBanners} />
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22, ease: revealEase }}
        className="w-full border-t border-slate-200 bg-[#f2f2f2]"
      >
        <HeroQuickActions />
      </motion.div>
    </section>
  )
}
