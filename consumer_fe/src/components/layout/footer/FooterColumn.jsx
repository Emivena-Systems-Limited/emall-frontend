import { Link } from 'react-router'

export default function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-[0.12em] text-white uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-sm text-white/90 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
