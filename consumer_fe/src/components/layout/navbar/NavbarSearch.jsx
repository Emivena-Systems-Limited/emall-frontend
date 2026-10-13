import { Search } from 'lucide-react'

export default function NavbarSearch({ className = '', compact = false, onFocus }) {
  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={`flex w-full ${className}`}
    >
      <div
        className={`flex w-full overflow-hidden rounded-lg border-2 border-nav-red bg-white focus-within:border-nav-red-deep ${
          compact ? 'h-10' : 'h-11'
        }`}
      >
        <input
          type="search"
          name="q"
          placeholder="Search products, suppliers, categories, MOQ..."
          aria-label="Search products, suppliers, categories, and MOQ"
          onFocus={onFocus}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:px-4 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="flex w-12 shrink-0 items-center justify-center bg-nav-red text-white transition-colors hover:bg-nav-red-deep sm:w-14"
        >
          <Search className={compact ? 'size-4.5' : 'size-5'} strokeWidth={2.25} />
        </button>
      </div>
    </form>
  )
}
