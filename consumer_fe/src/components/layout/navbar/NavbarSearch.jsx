import { Search } from 'lucide-react'

export default function NavbarSearch({ className = '', compact = false }) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={`flex w-full items-center ${className}`}
    >
      <div className="relative flex w-full items-center">
        <input
          type="search"
          name="q"
          placeholder="Search"
          aria-label="Search products"
          className={`w-full rounded-full border-0 bg-white text-slate-900 outline-none placeholder:text-slate-400 ${
            compact
              ? 'py-2.5 pr-12 pl-4 text-sm'
              : 'py-3 pr-14 pl-5 text-sm sm:text-base'
          }`}
        />
        <button
          type="submit"
          aria-label="Submit search"
          className={`absolute right-1 flex items-center justify-center rounded-full bg-auth-primary text-white transition-colors hover:bg-auth-primary-hover ${
            compact ? 'size-8' : 'size-9 sm:size-10'
          }`}
        >
          <Search className={compact ? 'size-4' : 'size-4 sm:size-4.5'} strokeWidth={2.25} />
        </button>
      </div>
    </form>
  )
}
