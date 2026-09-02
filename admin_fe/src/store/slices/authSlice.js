import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  accessToken: null,
  applicationToken: null,
  isAuthenticated: false,
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
      state.isAuthenticated = Boolean(state.accessToken && state.user)
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.applicationToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
