import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const MiniCartContext = createContext(null)

export function MiniCartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openMiniCart = useCallback(() => setIsOpen(true), [])
  const closeMiniCart = useCallback(() => setIsOpen(false), [])
  const toggleMiniCart = useCallback(() => setIsOpen((open) => !open), [])

  const value = useMemo(
    () => ({ isOpen, openMiniCart, closeMiniCart, toggleMiniCart }),
    [isOpen, openMiniCart, closeMiniCart, toggleMiniCart],
  )

  return (
    <MiniCartContext.Provider value={value}>
      {children}
    </MiniCartContext.Provider>
  )
}

export function useMiniCart() {
  const context = useContext(MiniCartContext)
  if (!context) {
    throw new Error('useMiniCart must be used within MiniCartProvider')
  }
  return context
}

/** Safe for components that may render outside the provider (returns no-ops). */
export function useOptionalMiniCart() {
  return useContext(MiniCartContext)
}
