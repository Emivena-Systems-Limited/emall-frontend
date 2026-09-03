import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router'
import { syncNavigationHistory } from '../../utils/smartNavigation'

export default function NavigationTracker() {
  const location = useLocation()

  useLayoutEffect(() => {
    syncNavigationHistory(location)
  }, [location])

  return null
}
