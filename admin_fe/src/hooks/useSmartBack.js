import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { resolveReturnLabel, resolveReturnTo } from '../utils/smartNavigation'

export default function useSmartBack(fallback, options = {}) {
  const {
    fallbackLabel = 'Back',
    labelStyle = 'back',
  } = options

  const navigate = useNavigate()
  const location = useLocation()

  const returnTo = useMemo(
    () => resolveReturnTo(location, fallback),
    [location, fallback],
  )

  const label = useMemo(
    () => resolveReturnLabel(location, { fallbackLabel, returnTo, labelStyle }),
    [location, fallbackLabel, returnTo, labelStyle],
  )

  const goBack = useCallback(() => {
    navigate(returnTo)
  }, [navigate, returnTo])

  return { to: returnTo, label, goBack }
}
