import { useLocation } from 'react-router'
import { buildNavigationState, mergeNavigationState } from '../utils/smartNavigation'

export default function useNavigationState(extra = {}) {
  const location = useLocation()
  return buildNavigationState(location, extra)
}

export function useMergedNavigationState(existingState = {}, overrides = {}) {
  const location = useLocation()
  return mergeNavigationState(
    { returnTo: buildNavigationState(location).returnTo, ...existingState },
    overrides,
  )
}
