import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
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

export const AUTH_PERSIST_KEY = 'admin-auth'

const authPersistConfig = {
  key: AUTH_PERSIST_KEY,
  version: 1,
  storage: persistStorage,
  whitelist: ['user', 'accessToken', 'applicationToken', 'isAuthenticated'],
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
