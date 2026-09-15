import { useEffect, useState } from 'react'

export function usePinnedWhenPast(targetRef, offset = 0) {
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const node = targetRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < offset
        setPinned(scrolledPast)
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${Math.max(offset, 0)}px 0px 0px 0px`,
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [targetRef, offset])

  return pinned
}
