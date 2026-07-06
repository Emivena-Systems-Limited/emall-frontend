export const CATEGORY_PAGE_GUTTER = 'px-3 sm:px-4 lg:px-6'

export default function CategoryPageContainer({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] 2xl:max-w-[1520px] ${CATEGORY_PAGE_GUTTER} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
