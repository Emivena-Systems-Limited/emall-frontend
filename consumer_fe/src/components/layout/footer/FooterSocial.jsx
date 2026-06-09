import { socialLinks } from '../../../constants/siteNav'

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-.94-2.76V2h-2.67v11.11a2.67 2.67 0 1 1-2.67-2.67c.18 0 .35.02.52.06V8.24a5.33 5.33 0 1 0 4.74 5.28V9.03a6.73 6.73 0 0 0 3.98 1.29V7.65a4.28 4.28 0 0 1-2.96-1.83z" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.3 3H20l-6.4 7.32L21 21h-5.9l-4.6-5.98L5.4 21H2.7l6.84-7.82L3 3h6.05l4.17 5.45L17.3 3zm-2.06 16.2h1.64L8.12 4.72H6.36l9.88 14.48z" />
    </svg>
  )
}

const iconMap = {
  x: XIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
}

export default function FooterSocial() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {socialLinks.map((social) => {
        const Icon = iconMap[social.icon]

        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className="flex size-10 items-center justify-center rounded-full bg-white text-auth-primary transition-transform hover:scale-105"
          >
            <Icon className="size-4.5" />
          </a>
        )
      })}
    </div>
  )
}
