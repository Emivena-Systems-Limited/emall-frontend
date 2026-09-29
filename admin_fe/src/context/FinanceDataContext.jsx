import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FinanceDataContext } from './financeDataContext'
import {
  FINANCE_ACTIVITY,
  FINANCE_PAYOUTS,
  FINANCE_WEEKS,
  activityForAction,
  applyPayoutAction,
  canConfigureFinance,
  canManagePayouts,
} from '../constants/finance'
import {
  DUMMY_COMMISSION_CONFIG,
  DUMMY_COMMISSION_HISTORY,
  DUMMY_FINANCE_SETTINGS,
  EMPTY_COMMISSION_CONFIG,
  EMPTY_FINANCE_SETTINGS,
  FINANCE_COMMISSION_RECORDS,
  FINANCE_TRANSACTIONS,
} from '../constants/financeLedger'
import notify from '../lib/notify'
import { isLocalEnvironment } from '../utils/environment'

function clonePayout(payout) {
  const reference = payout.method === 'Bank transfer'
    ? `GTB-${payout.id.replace('PO-', '')}`
    : `MOMO-${payout.id.replace('PO-', '')}`
  return {
    ...payout,
    reference,
    transactions: payout.transactions.map((item) => ({ ...item })),
    history: payout.history.map((item) => ({ ...item })),
  }
}

export function FinanceProvider({ children }) {
  const user = useSelector((state) => state.auth.user)
  const [payouts, setPayouts] = useState([])
  const [activity, setActivity] = useState([])
  const [weeks, setWeeks] = useState([])
  const [transactions, setTransactions] = useState([])
  const [commissions, setCommissions] = useState([])
  const [commissionConfig, setCommissionConfig] = useState(EMPTY_COMMISSION_CONFIG)
  const [commissionHistory, setCommissionHistory] = useState([])
  const [settings, setSettings] = useState(EMPTY_FINANCE_SETTINGS)
  const [usingDummy, setUsingDummy] = useState(false)

  const loadDummyData = () => {
    setPayouts(FINANCE_PAYOUTS.map(clonePayout))
    setActivity(FINANCE_ACTIVITY.map((item) => ({ ...item })))
    setWeeks(FINANCE_WEEKS)
    setTransactions(FINANCE_TRANSACTIONS.map((item) => ({ ...item })))
    setCommissions(FINANCE_COMMISSION_RECORDS.map((item) => ({ ...item })))
    setCommissionConfig(structuredClone(DUMMY_COMMISSION_CONFIG))
    setCommissionHistory(DUMMY_COMMISSION_HISTORY.map((item) => ({ ...item })))
    setSettings(structuredClone(DUMMY_FINANCE_SETTINGS))
    setUsingDummy(true)
    notify.success('Dummy finance data loaded.')
  }

  const clearDummyData = () => {
    setPayouts([])
    setActivity([])
    setWeeks([])
    setTransactions([])
    setCommissions([])
    setCommissionConfig(structuredClone(EMPTY_COMMISSION_CONFIG))
    setCommissionHistory([])
    setSettings(structuredClone(EMPTY_FINANCE_SETTINGS))
    setUsingDummy(false)
    notify.success('Dummy finance data cleared.')
  }

  const applyPayout = (payout, action) => {
    const next = applyPayoutAction(payout, action)
    if (!next.reference) next.reference = payout.reference
    setPayouts((current) => current.map((item) => (item.id === next.id ? next : item)))
    setActivity((current) => [activityForAction(next, action), ...current])
    return next
  }

  const value = {
    user,
    payouts,
    setPayouts,
    activity,
    setActivity,
    weeks,
    transactions,
    commissions,
    setCommissions,
    commissionConfig,
    setCommissionConfig,
    commissionHistory,
    setCommissionHistory,
    settings,
    setSettings,
    usingDummy,
    showDevTools: isLocalEnvironment(),
    canManage: canManagePayouts(user),
    canConfigure: canConfigureFinance(user),
    loadDummyData,
    clearDummyData,
    applyPayout,
  }

  return (
    <FinanceDataContext.Provider value={value}>
      {children}
    </FinanceDataContext.Provider>
  )
}
