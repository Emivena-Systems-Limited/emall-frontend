import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import { AUTH_PERSIST_KEY } from '../authPersist'

export const initialAuthState = {
  user: null,
  accessToken: null,
  applicationToken: null,
  isAuthenticated: false,
}

function resolveIsAuthenticated(auth) {
  return Boolean(auth?.accessToken && auth?.applicationToken && auth?.user)
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, applicationToken } = action.payload
      state.user = user ?? null
      state.accessToken = accessToken ?? null
      state.applicationToken =
        applicationToken ??
        user?.application_token ??
        user?.applicationToken ??
        null
      state.isAuthenticated = resolveIsAuthenticated(state)
    },
    updateUser: (state, action) => {
      if (!state.user) {
        state.user = action.payload
        state.isAuthenticated = resolveIsAuthenticated(state)
        return
      }
      state.user = { ...state.user, ...action.payload }
    },
    logout: () => initialAuthState,
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      if (action.key !== AUTH_PERSIST_KEY) return

      const incoming = action.payload
      if (!incoming) return

      state.user = incoming.user ?? null
      state.accessToken = incoming.accessToken ?? null
      state.applicationToken =
        incoming.applicationToken ??
        incoming.user?.application_token ??
        incoming.user?.applicationToken ??
        null
      state.isAuthenticated = resolveIsAuthenticated(state)
    })
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
