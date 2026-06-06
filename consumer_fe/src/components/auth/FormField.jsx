import { motion } from 'framer-motion'
import { formFieldMotion } from './formMotion'

export default function FormField({ name, children, className = '' }) {
  return (
    <motion.div data-field={name} variants={formFieldMotion} className={className}>
      {children}
    </motion.div>
  )
}
