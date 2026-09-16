import { Link } from 'react-router'

export default function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-[0.12em] text-white uppercase">{title}</h3>
      <ul className="mt-4 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="inline-flex min-h-10 cursor-pointer items-center text-sm text-white/90 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
