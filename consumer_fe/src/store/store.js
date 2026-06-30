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
import cartReducer from './slices/cartSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage: persistStorage,
  whitelist: ['auth', 'cart'],
  blacklist: [],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
