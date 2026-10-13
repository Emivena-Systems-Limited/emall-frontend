import { Link } from 'react-router'

const linkClass =
  'inline-flex min-h-9 cursor-pointer items-center text-sm text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export default function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.16em] text-white/90 uppercase">{title}</h3>
      <ul className="mt-4 space-y-0.5">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link to={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
