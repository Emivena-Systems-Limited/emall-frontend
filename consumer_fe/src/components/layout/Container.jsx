export default function Container({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full px-[clamp(1rem,3vw,4rem)] ${className}`}
    >
      {children}
    </div>
  )
}
