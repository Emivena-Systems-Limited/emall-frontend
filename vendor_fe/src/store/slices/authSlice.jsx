import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },  
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
