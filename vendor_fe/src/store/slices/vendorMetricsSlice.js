import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getVendorMetrics } from '../../services/vendorMetricsService'
import { logout } from './authSlice'

export const VENDOR_METRICS_FRESH_MS = 60 * 1000

const initialState = {
  productsListed: null,
  totalOrders: null,
  averageRating: null,
  status: 'idle',
  error: null,
  hasPartialError: false,
  lastFetchedAt: null,
  vendorId: null,
}

function normalizeVendorId(value) {
  const id = String(value ?? '').trim()
  return id || 'authenticated-vendor'
}

export const fetchVendorMetrics = createAsyncThunk(
  'vendorMetrics/fetch',
  async ({ vendorId } = {}) => {
    const metrics = await getVendorMetrics()
    return {
      ...metrics,
      vendorId: normalizeVendorId(vendorId),
      fetchedAt: Date.now(),
    }
  },
  {
    condition: ({ vendorId, force = false } = {}, { getState }) => {
      const metrics = getState().vendorMetrics
      const ownerId = normalizeVendorId(vendorId)

      if (metrics.status === 'loading' && metrics.vendorId === ownerId) return false
      if (force || metrics.vendorId !== ownerId || !metrics.lastFetchedAt) return true

      return Date.now() - metrics.lastFetchedAt >= VENDOR_METRICS_FRESH_MS
    },
  },
)

const vendorMetricsSlice = createSlice({
  name: 'vendorMetrics',
  initialState,
  reducers: {
    setProductsListed: (state, action) => {
      state.productsListed = Math.max(0, Number(action.payload) || 0)
    },
    setTotalOrders: (state, action) => {
      state.totalOrders = Math.max(0, Number(action.payload) || 0)
    },
    setAverageRating: (state, action) => {
      state.averageRating = Math.max(0, Number(action.payload) || 0)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorMetrics.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.vendorId = normalizeVendorId(action.meta.arg?.vendorId)
      })
      .addCase(fetchVendorMetrics.fulfilled, (state, action) => {
        const {
          productsListed,
          totalOrders,
          averageRating,
          hasPartialError,
          fetchedAt,
          vendorId,
        } = action.payload

        if (productsListed != null) state.productsListed = productsListed
        if (totalOrders != null) state.totalOrders = totalOrders
        if (averageRating != null) state.averageRating = averageRating

        state.status = 'succeeded'
        state.error = null
        state.hasPartialError = hasPartialError
        state.lastFetchedAt = fetchedAt
        state.vendorId = vendorId
      })
      .addCase(fetchVendorMetrics.rejected, (state, action) => {
        if (action.meta.condition) return
        state.status = 'failed'
        state.error = action.error.message || 'Unable to load vendor metrics.'
      })
      .addCase(logout, () => initialState)
  },
})

export const {
  setProductsListed,
  setTotalOrders,
  setAverageRating,
} = vendorMetricsSlice.actions

export default vendorMetricsSlice.reducer
