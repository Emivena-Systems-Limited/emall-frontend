import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import persistStorage from '../lib/persistStorage'
import authReducer from './slices/authSlice'

export const AUTH_PERSIST_KEY = 'admin-auth'

function withDerivedAuth(state) {
  if (!state || typeof state !== 'object') return state
  return {
    ...state,
    isAuthenticated: Boolean(state.accessToken && state.user),
  }
}

const authSessionTransform = createTransform(withDerivedAuth, withDerivedAuth)

const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  version: 1,
  storage: persistStorage,
  whitelist: ['user', 'accessToken', 'applicationToken', 'isAuthenticated'],
  transforms: [authSessionTransform],
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
