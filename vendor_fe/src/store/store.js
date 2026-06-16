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
import authReducer from './slices/authSlice'
import { isVendorVerified } from '../utils/vendorAuth'

/** localStorage key: persist:vendor-auth */
export const AUTH_PERSIST_KEY = 'vendor-auth'
export const AUTH_PERSIST_VERSION = 2

const authMigrations = {
  2: (state) => {
    if (!state) return undefined

    const user = state.user ?? null
    const accessToken = state.accessToken ?? null
    const applicationToken = state.applicationToken ?? null
    const pendingVerificationEmail = state.pendingVerificationEmail ?? null

    return {
      user,
      accessToken,
      applicationToken,
      pendingVerificationEmail,
      isAuthenticated: Boolean(
        accessToken && applicationToken && isVendorVerified(user),
      ),
    }
  },
}

const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  version: AUTH_PERSIST_VERSION,
  storage: persistStorage,
  whitelist: [
    'user',
    'accessToken',
    'applicationToken',
    'isAuthenticated',
    'pendingVerificationEmail',
  ],
  migrate: createMigrate(authMigrations, { debug: import.meta.env.DEV }),
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
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

export const persistor = persistStore(store)
