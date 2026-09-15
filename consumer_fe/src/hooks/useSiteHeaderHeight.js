import { useLayoutEffect, useState } from 'react'

export function useSiteHeaderHeight() {
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const header = document.querySelector('[data-site-header]')
    if (!header) return undefined

    const update = () => {
      setHeight(Math.round(header.getBoundingClientRect().height))
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(header)
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return height
}
