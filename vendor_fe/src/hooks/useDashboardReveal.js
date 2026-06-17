import { useEffect, useState } from 'react'

export function useDashboardReveal({ minDuration = 520, isFetching = false } = {}) {
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), minDuration)
    return () => window.clearTimeout(timer)
  }, [minDuration])

  return { isLoading: !minElapsed || isFetching }
}
