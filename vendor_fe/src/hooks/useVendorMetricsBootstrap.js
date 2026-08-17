import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendorMetrics } from '../store/slices/vendorMetricsSlice'

export function getVendorMetricsOwnerId(user) {
  return user?.id ?? user?.vendor_id ?? user?.email ?? null
}

export function useVendorMetricsBootstrap({ enabled = true } = {}) {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const vendorId = getVendorMetricsOwnerId(user)

  useEffect(() => {
    if (!enabled || !isAuthenticated) return
    dispatch(fetchVendorMetrics({ vendorId }))
  }, [dispatch, enabled, isAuthenticated, vendorId])
}
