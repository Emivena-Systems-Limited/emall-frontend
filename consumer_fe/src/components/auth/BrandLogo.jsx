export default function BrandLogo({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-2.5 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="size-8 shrink-0 sm:size-9"
      >
        <defs>
          <linearGradient id="emall-mark" x1="18" y1="34" x2="18" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E85D3B" />
            <stop offset="0.55" stopColor="#C73B2D" />
            <stop offset="1" stopColor="#8B2E24" />
          </linearGradient>
        </defs>
        <path
          d="M8 28V8l10 12L28 8v20h-5.5V17.5L18 27 13.5 17.5V28H8z"
          fill="url(#emall-mark)"
        />
      </svg>
      <span className="text-xl font-medium tracking-tight text-[#6b6b6b] sm:text-[1.35rem]">E-Mall</span>
    </div>
  )
}
