import { motion } from 'framer-motion'
import SubcategorySpotlightCard from './SubcategorySpotlightCard'

const ease = [0.16, 1, 0.3, 1]

export default function DepartmentBentoGrid({ subcategories = [] }) {
  const [hero, ...rest] = subcategories
  const tiles = rest.slice(0, 4)

  if (!hero) return null

  return (
    <div className="mt-3 grid grid-cols-2 items-stretch gap-2.5 sm:gap-3 lg:mt-4 lg:grid-cols-4 lg:grid-rows-2 lg:gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.38, ease }}
        className="col-span-2 h-full max-lg:row-span-1 lg:row-span-2"
      >
        <SubcategorySpotlightCard
          subcategory={hero}
          featured
          className="[&_h3]:text-lg [&_h3]:sm:text-xl"
        />
      </motion.div>

      {tiles.map((subcategory, index) => (
        <motion.div
          key={subcategory.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.34, delay: index * 0.05, ease }}
          className="h-full"
        >
          <SubcategorySpotlightCard subcategory={subcategory} fill animate={false} />
        </motion.div>
      ))}
    </div>
  )
}
