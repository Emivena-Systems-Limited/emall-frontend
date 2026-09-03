import { Link, useLocation } from 'react-router'
import { buildNavigationState, mergeNavigationState } from '../../utils/smartNavigation'

export default function SmartNavLink({ to, state, children, ...props }) {
  const location = useLocation()
  const navState = mergeNavigationState(state, buildNavigationState(location))

  return (
    <Link to={to} state={navState} {...props}>
      {children}
    </Link>
  )
}
