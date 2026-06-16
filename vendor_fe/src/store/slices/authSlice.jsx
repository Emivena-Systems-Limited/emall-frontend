import { createSlice } from '@reduxjs/toolkit'
import { isVendorVerified } from '../../utils/vendorAuth'

const initialState = {
  user: null,
  accessToken: null,
  applicationToken: null,
  isAuthenticated: false,
  pendingVerificationEmail: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, applicationToken } = action.payload
      state.user = user ?? null
      state.accessToken = accessToken ?? null
      state.applicationToken = applicationToken ?? null
      state.isAuthenticated = Boolean(
        state.accessToken && state.applicationToken && isVendorVerified(state.user),
      )
      if (state.isAuthenticated) {
        state.pendingVerificationEmail = null
      }
    },
    setPendingVendor: (state, action) => {
      state.user = action.payload ?? null
      state.accessToken = null
      state.applicationToken = null
      state.isAuthenticated = false
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      state.isAuthenticated = Boolean(
        state.accessToken && state.applicationToken && isVendorVerified(state.user),
      )
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.applicationToken = null
      state.isAuthenticated = false
      state.pendingVerificationEmail = null
    },
    setPendingVerificationEmail: (state, action) => {
      state.pendingVerificationEmail = action.payload
    },
    clearPendingVerificationEmail: (state) => {
      state.pendingVerificationEmail = null
    },
  },
})

export const {
  setCredentials,
  setPendingVendor,
  updateUser,
  logout,
  setPendingVerificationEmail,
  clearPendingVerificationEmail,
} = authSlice.actions
export default authSlice.reducer
