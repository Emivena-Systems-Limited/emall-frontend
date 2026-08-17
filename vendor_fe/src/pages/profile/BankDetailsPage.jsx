import { useState } from 'react'
import BankDetailsPanel from '../../components/profile/BankDetailsPanel'
import PayoutAccountDrawer from '../../components/finance/PayoutAccountDrawer'
import { RemovePayoutAccountModal } from '../../components/finance/PayoutAccountModal'
import { EMPTY_PAYOUT_ACCOUNTS } from '../../constants/finance'
import {
  useActivatePayoutAccountMutation,
  useDeletePayoutAccountMutation,
  usePayoutAccounts,
  useStorePayoutAccountMutation,
} from '../../hooks/useFinanceSummary'
import notify from '../../lib/notify'

export default function BankDetailsPage() {
  const {
    data: accounts = EMPTY_PAYOUT_ACCOUNTS,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePayoutAccounts()

  const storePayoutMutation = useStorePayoutAccountMutation()
  const deletePayoutMutation = useDeletePayoutAccountMutation()
  const activatePayoutMutation = useActivatePayoutAccountMutation()

  const [payoutDrawerOpen, setPayoutDrawerOpen] = useState(false)
  const [accountAction, setAccountAction] = useState(null)

  const handlePayoutSave = async (formData) => {
    try {
      await storePayoutMutation.mutateAsync(formData)
      notify.success('Payout account added. Verification may take 1–2 business days.')
    } catch (saveError) {
      notify.fromError(saveError, 'Unable to save payout account')
      throw saveError
    }
  }

  const handlePayoutAccountAction = async () => {
    if (!accountAction?.account?.id) {
      notify.error('No payout account selected.')
      return
    }

    const { account, intent } = accountAction

    try {
      if (intent === 'activate') {
        await activatePayoutMutation.mutateAsync(account.id)
        setAccountAction(null)
        notify.success(`${account.bankName} is now your active payout account.`)
        return
      }

      await deletePayoutMutation.mutateAsync(account.id)
      setAccountAction(null)
      notify.success('Account removed. Add your new payout details.')
      setPayoutDrawerOpen(true)
    } catch (actionError) {
      notify.fromError(
        actionError,
        intent === 'activate'
          ? 'Unable to activate payout account'
          : 'Unable to replace payout account',
      )
    }
  }

  return (
    <>
      <BankDetailsPanel
        accounts={accounts}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isFetching={isFetching}
        onRetry={() => refetch()}
        onAdd={() => setPayoutDrawerOpen(true)}
        onReplace={(account) => setAccountAction({ account, intent: 'replace' })}
        onActivate={(account) => {
          if (account?.isActive) {
            notify.info('This account is already active.')
            return
          }
          setAccountAction({ account, intent: 'activate' })
        }}
        activatingAccountId={
          activatePayoutMutation.isPending && accountAction?.intent === 'activate'
            ? accountAction.account?.id
            : null
        }
        replacingAccountId={
          deletePayoutMutation.isPending && accountAction?.intent === 'replace'
            ? accountAction.account?.id
            : null
        }
      />

      <PayoutAccountDrawer
        open={payoutDrawerOpen}
        mode="add"
        initialValues={null}
        onClose={() => setPayoutDrawerOpen(false)}
        onSave={handlePayoutSave}
      />

      <RemovePayoutAccountModal
        open={Boolean(accountAction)}
        account={accountAction?.account}
        intent={accountAction?.intent ?? 'replace'}
        isPending={
          accountAction?.intent === 'activate'
            ? activatePayoutMutation.isPending
            : deletePayoutMutation.isPending
        }
        onClose={() => setAccountAction(null)}
        onConfirm={handlePayoutAccountAction}
      />
    </>
  )
}
