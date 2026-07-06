import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  createMigrate,
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import persistStorage from '../lib/persistStorage'
import { setAuthRehydrated } from '../lib/sessionAuth'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import {
  AUTH_PERSIST_KEY,
  AUTH_PERSIST_VERSION,
  CART_PERSIST_KEY,
  CART_PERSIST_VERSION,
} from './authPersist'

function stripAuthTokensFromUser(user) {
  if (!user || typeof user !== 'object') return null

  const nextUser = { ...user }
  delete nextUser.token
  delete nextUser.access_token
  delete nextUser.accessToken
  delete nextUser.application_token
  delete nextUser.applicationToken
  return nextUser
}

const authMigrations = {
  3: (state) => {
    if (!state) return undefined

    const user = stripAuthTokensFromUser(state.user)
    const accessToken = state.accessToken ?? state.user?.token ?? state.user?.access_token ?? null
    const applicationToken =
      state.applicationToken ??
      state.user?.application_token ??
      state.user?.applicationToken ??
      null

    return {
      user,
      accessToken,
      applicationToken,
      isAuthenticated: Boolean(accessToken && applicationToken && user),
    }
  },
}

const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  version: AUTH_PERSIST_VERSION,
  storage: persistStorage,
  whitelist: ['user', 'accessToken', 'applicationToken', 'isAuthenticated'],
  migrate: createMigrate(authMigrations, { debug: import.meta.env.DEV }),
}

const cartMigrations = {
  2: (state) => {
    if (!state) return undefined
    return {
      ...state,
      guestCartId: state.guestCartId ?? null,
    }
  },
}

const cartPersistConfig = {
  key: CART_PERSIST_KEY,
  version: CART_PERSIST_VERSION,
  storage: persistStorage,
  migrate: createMigrate(cartMigrations, { debug: import.meta.env.DEV }),
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store, null, () => {
  setAuthRehydrated(true)
})

persistor.subscribe(() => {
  if (persistor.getState().bootstrapped) {
    setAuthRehydrated(true)
  }
})
