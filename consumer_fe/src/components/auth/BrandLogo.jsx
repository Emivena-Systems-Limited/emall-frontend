import StoreLogo from '../layout/StoreLogo'

/** @deprecated Prefer StoreLogo directly. Kept for auth-era imports. */
export default function BrandLogo({ className = '' }) {
  return <StoreLogo variant="dark" size="lg" className={className} />
}
