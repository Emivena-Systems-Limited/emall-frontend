export default function Container({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full max-w-[100rem] px-[clamp(0.75rem,2vw,2rem)] ${className}`}
    >
      {children}
    </div>
  )
}
