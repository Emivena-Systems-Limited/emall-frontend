import { useContext } from 'react'
import { FinanceDataContext } from '../context/financeDataContext'

export function useFinanceData() {
  const value = useContext(FinanceDataContext)
  if (!value) throw new Error('useFinanceData must be used inside FinanceProvider')
  return value
}
